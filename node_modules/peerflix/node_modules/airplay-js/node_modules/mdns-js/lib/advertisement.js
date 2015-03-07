
var debug = require('debug')('mdns:advertisement');
var dgram = require('dgram');
var os = require('os');

var dns = require('mdns-js-packet');
var DNSPacket = dns.DNSPacket;
var DNSRecord = dns.DNSRecord;
var ServiceType = require('./service_type').ServiceType;
var pf = require('./packetfactory');

var internal = {};

internal.sendDNSPacket = function (packet, cb) {
  debug('sending %d question, %d answer', packet.question.length, packet.answer.length);
  debug('packet', packet);
  var buf = DNSPacket.toBuffer(packet);

  // send packet
  var sock = dgram.createSocket('udp4');
  sock.bind(5353, function (err) {
    if (err) {
      debug('there was an error binding %s', err);
      return;
    }
    sock.addMembership('224.0.0.251');
    sock.setMulticastTTL(255);
    sock.setMulticastLoopback(true);
    sock.send(buf, 0, buf.length, 5353, '224.0.0.251', function (err, bytes) {
      debug('sent %d bytes with err:%s', bytes, err);
      sock.close();
      typeof cb === 'function' && cb();
    });
  });
};

// Array of published services.
internal.services = [];
// Array of pending probes.
internal.probes = [];
// Array of open sockets
internal.connections = [];

internal.haveResponder = function () {
  return (internal.services.length !== 0 || internal.probes.length !== 0);
};

internal.startResponder = function () {
  var interfaces = os.networkInterfaces();
  var ifaceFilter = this.options.networkInterface;
  var index = 0;
  for (var key in interfaces) {
    if (typeof ifaceFilter === 'undefined' || key === ifaceFilter) {
      if (interfaces.hasOwnProperty(key)) {
        for (var i = 0; i < interfaces[key].length; i++) {
          var address = interfaces[key][i].address;
          debug('interface', key, interfaces[key]);
          //no IPv6 addresses
          if (address.indexOf(':') !== -1) {
            continue;
          }
          // these are for unicast queries ?
          createSocket(index++, key, address, 0, bindToAddress.bind(this));
        }
      }
    }
  }
  // this is for multicast queries ?
  createSocket(index++, '(multicast)', '224.0.0.251', 5353,
               bindToAddress.bind(this));

  function createSocket(interfaceIndex, networkInterface, address, port, cb) {
    var sock = dgram.createSocket('udp4');
    debug('creating socket for interface %s: %s:%d',
          networkInterface, address, port);
    sock.bind(port, address, function (err) {
      if (port === 5353) {
        sock.addMembership(address);
        sock.setMulticastTTL(255);
        sock.setMulticastLoopback(true);
      }
      cb(err, interfaceIndex, networkInterface, sock);
    });
  }

  function bindToAddress (err, interfaceIndex, networkInterface, sock) {
    if (err) {
      debug('there was an error binding %s', err);
      return;
    }
    debug('bindToAddress');
    internal.connections.push(sock);

    sock.on('message', function (message, remote) {
      debug('got packet from remote', remote);
      var packet;
      try {
        packet = DNSPacket.parse(message);
      } catch (err) {
        debug('got packet truncated package, ignoring');
        return;
      }

      // check if it is a query where we are the authority for
      packet.question.forEach(handleQuery.bind(this));
      packet.answer.forEach(handleAnswer.bind(this));
    }.bind(this));

    sock.on('error', function (err) {
      debug('socket error', err);
    });
  }

  function handleQuery(rec) {
    if (rec.type !== DNSRecord.Type.PTR &&
      rec.type !== DNSRecord.Type.SRV &&
      rec.type !== DNSRecord.Type.ANY) {
      debug('skipping query: type not PTR/SRV/ANY');
      return;
    }
    // check if we should reply via multi or unicast
    // TODO: handle the is_qu === true case and reply directly to remote
    // var is_qu = (rec.cl & DNSRecord.Class.IS_QM) === DNSRecord.Class.IS_QM;
    rec.class &= ~DNSRecord.Class.IS_OM;
    if (rec.class !== DNSRecord.Class.IN && rec.type !== DNSRecord.Class.ANY) {
      debug('skipping query: class not IN/ANY: %d', rec.class);
      return;
    }
    try {
      var type = new ServiceType(rec.name);
      internal.services.forEach(function (service) {
        if (type.isWildcard() || type.matches(service.serviceType)) {
          debug('answering query');
          // TODO: should we only send PTR records if the query was for PTR
          // records?
          internal.sendDNSPacket(
            pf.buildANPacket.apply(service, [DNSRecord.TTL]));
        } else {
          debug('skipping query; type %s not * or %s', type,
              service.serviceType);
        }
      });
    } catch (err) {
      // invalid service type
    }
  }

  function handleAnswer(rec) {
    try {
      internal.probes.forEach(function (service) {
        if (service.status < 3) {
          var conflict = false;
          // parse answers and check if they match a probe
          debug('check names: %s and %s', rec.name, service.alias);
          switch (rec.type) {
            case DNSRecord.Type.PTR:
              if (rec.asName() === service.alias) {
                conflict = true;
                debug('name conflict in PTR');
              }
              break;
            case DNSRecord.Type.SRV:
            case DNSRecord.Type.TXT:
              if (rec.name === service.alias) {
                conflict = true;
                debug('name conflict in SRV/TXT');
              }
              break;
          }
          if (conflict) {
            // no more probes
            service.status = 4;
          }
        }
      });
    } catch (err) {
      // invalid service type
    }
  }
};

internal.stopResponder = function () {
  debug('stopping %d sockets', internal.connections.length);
  for (var i = 0; i < internal.connections.length; i++) {
    var sock = internal.connections[i];
    sock.close();
    sock.unref();
  }
  internal.connections = [];
};

internal.probeAndAdvertise = function () {
  switch (this.status) {
    case 0:
    case 1:
    case 2:
      debug('probing service %d', this.status + 1);
      internal.sendDNSPacket(pf.buildQDPacket.apply(this, []));
      break;
    case 3:
      debug('publishing service, suffix=%s', this.nameSuffix);
      internal.sendDNSPacket(
        pf.buildANPacket.apply(this, [DNSRecord.TTL]));
      // Repost announcement after 1sec (see rfc6762: 8.3)
      setTimeout(function onTimeout() {
        internal.sendDNSPacket(
          pf.buildANPacket.apply(this, [DNSRecord.TTL]));
      }.bind(this), 1000);
      // Service has been registered, respond to matching queries
      internal.services.push(this);
      internal.probes =
        internal.probes.filter(function (service) { return service === this; });
      break;
    case 4:
      // we had a conflict
      if (this.nameSuffix === '') {
        this.nameSuffix = '1';
      } else {
        this.nameSuffix = (parseInt(this.nameSuffix) + 1) + '';
      }
      this.status = -1;
      break;
  }
  if (this.status < 3) {
    this.status++;
    setTimeout(internal.probeAndAdvertise.bind(this), 250);
  }
};

/**
 * mDNS Advertisement class
 * @class
 * @param {string|ServiceType} serviceType - The service type to register
 * @param {number} [port] - The port number for the service
 * @param {object} [options] - ...
 */
var Advertisement = module.exports = function (serviceType, port, options) {
  if (!(this instanceof Advertisement)) {
    return new Advertisement(serviceType, port, options);
  }

  // TODO: check more parameters
  if (!('name' in options)) {
    throw new Error('options must contain the name field.');
  }
  this.serviceType = serviceType;
  this.port = port;
  this.options = options;
  this.nameSuffix = '';
  this.alias = '';
  this.status = 0; // inactive
  debug('created new service');
}; //--Advertisement constructor

Advertisement.prototype.start = function () {
  if (!internal.haveResponder()) {
    internal.startResponder.apply(this, []);
  }
  internal.probes.push(this);
  internal.probeAndAdvertise.apply(this, []);
};

Advertisement.prototype.stop = function () {
  debug('unpublishing service');
  internal.services =
    internal.services.filter(function (service) { return service === this; });
  if (!internal.haveResponder()) {
    internal.stopResponder.apply(this, []);
  }
  internal.sendDNSPacket(pf.buildANPacket.apply(this, [0]));
  this.nameSuffix = '';
  this.alias = '';
  this.status = 0; // inactive
};
