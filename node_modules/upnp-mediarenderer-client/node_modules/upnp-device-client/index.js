var http = require('http');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var et = require('elementtree');
var parseUrl = require('url').parse;
var os = require('os');
var concat = require('concat-stream');
var address = require('network-address');
var debug = require('debug')('upnp-device-client');
var pkg = require('./package.json');

var OS_VERSION = [os.platform(), os.release()].join('/');
var PACKAGE_VERSION = [pkg.name, pkg.version].join('/');

var SUBSCRIPTION_TIMEOUT = 300;


function DeviceClient(url) {
  EventEmitter.call(this);

  this.url = url;
  this.deviceDescription = null;
  this.serviceDescriptions = {};
  this.server = null;
  this.listening = false;
  this.subscriptions = {};
}

util.inherits(DeviceClient, EventEmitter);


DeviceClient.prototype.getDeviceDescription = function(callback) {
  var self = this;

  // Use cache if available
  if(this.deviceDescription) {
    process.nextTick(function() {
      callback(null, self.deviceDescription);
    });
    return;
  }

  debug('fetch device description');
  fetch(this.url, function(err, body) {
    if(err) return callback(err);
    var desc = parseDeviceDescription(body, self.url);
    self.deviceDescription = desc // Store in cache for next call
    callback(null, desc);
  });
};


DeviceClient.prototype.getServiceDescription = function(serviceId, callback) {
  var self = this;

  serviceId = resolveService(serviceId);

  this.getDeviceDescription(function(err, desc) {
    if(err) return callback(err);

    var service = desc.services[serviceId];
    if(!service) {
      var err = new Error('Service ' + serviceId + ' not provided by device');
      err.code = 'ENOSERVICE';
      return callback(err);
    }

    // Use cache if available
    if(self.serviceDescriptions[serviceId]) {
      return callback(null, self.serviceDescriptions[serviceId]);
    }

    debug('fetch service description (%s)', serviceId);
    fetch(service.SCPDURL, function(err, body) {
      if(err) return callback(err);
      var desc = parseServiceDescription(body);
      self.serviceDescriptions[serviceId] = desc; // Store in cache for next call
      callback(null, desc);
    });
  });
};


DeviceClient.prototype.callAction = function(serviceId, actionName, params, callback) {
  var self = this;
  serviceId = resolveService(serviceId);

  this.getServiceDescription(serviceId, function(err, desc) {
    if(err) return callback(err);

    if(!desc.actions[actionName]) {
      var err = new Error('Action ' + actionName + ' not implemented by service');
      err.code = 'ENOACTION';
      return callback(err);
    }

    var service = self.deviceDescription.services[serviceId];

    // Build SOAP action body
    var envelope = et.Element('s:Envelope');
    envelope.set('xmlns:s', 'http://schemas.xmlsoap.org/soap/envelope/');
    envelope.set('s:encodingStyle', 'http://schemas.xmlsoap.org/soap/encoding/');

    var body = et.SubElement(envelope, 's:Body');
    var action = et.SubElement(body, 'u:' + actionName);
    action.set('xmlns:u', service.serviceType);

    Object.keys(params).forEach(function(paramName) {
      var tmp = et.SubElement(action, paramName);
      var value = params[paramName];
      tmp.text = (value === null)
        ? '' 
        : params[paramName].toString();
    });

    var doc = new et.ElementTree(envelope);
    var xml = doc.write({ 
      xml_declaration: true,
    });

    // Send action request
    var options = parseUrl(service.controlURL);
    options.method = 'POST';
    options.headers = {
      'Content-Type': 'text/xml; charset="utf-8"',
      'Content-Length': xml.length,
      'Connection': 'close',
      'SOAPACTION': '"' + service.serviceType + '#' + actionName + '"'
    };

    debug('call action %s on service %s with params %j', actionName, serviceId, params);

    var req = http.request(options, function(res) {
      res.pipe(concat(function(buf) {
        var doc = et.parse(buf.toString());

        if(res.statusCode !== 200) {
          var errorCode = doc.findtext('.//errorCode');
          var errorDescription = doc.findtext('.//errorDescription').trim();

          var err = new Error(errorDescription + ' (' + errorCode + ')');
          err.code = 'EUPNP';
          err.statusCode = res.statusCode;
          err.errorCode = errorCode;
          return callback(err);
        }

        // Extract response outputs
        var serviceDesc = self.serviceDescriptions[serviceId];
        var actionDesc = serviceDesc.actions[actionName];
        var outputs = actionDesc.outputs.map(function(desc) {
          return desc.name;
        });

        var result = {};
        outputs.forEach(function(name) {
          result[name] = doc.findtext('.//' + name);
        });

        callback(null, result)        
      }));
    });

    req.on('error', callback);
    req.end(xml);
  });
};


DeviceClient.prototype.subscribe = function(serviceId, listener) {
  var self = this;
  serviceId = resolveService(serviceId);

  if(this.subscriptions[serviceId]) {
    // If we already have a subscription to this service,
    // add the provided callback to the listeners and return
    this.subscriptions[serviceId].listeners.push(listener);
    return;
  }

  // If there's no subscription to this service, create one
  // by first fetching the event subscription URL ...
  this.getDeviceDescription(function(err, desc) {
    if(err) return self.emit('error', err);

    var service = desc.services[serviceId];

    if(!service) {
      var err = new Error('Service ' + serviceId + ' not provided by device');
      err.code = 'ENOSERVICE';
      return self.emit('error', err);
    }

    // ... and ensuring the event server is created and listening
    self.ensureEventingServer(function() {

      var options = parseUrl(service.eventSubURL);
      var server = self.server;

      options.method = 'SUBSCRIBE';
      options.headers = {
        'HOST': options.host,
        'USER-AGENT': [OS_VERSION, 'UPnP/1.1', PACKAGE_VERSION].join(' '),
        'CALLBACK': '<http://' + server.address().address + ':' + server.address().port + '/>',
        'NT': 'upnp:event',
        'TIMEOUT': 'Second-' + SUBSCRIPTION_TIMEOUT
      };

      var req = http.request(options, function(res) {
        if(res.statusCode !== 200) {
          var err = new Error('SUBSCRIBE error');
          err.statusCode = res.statusCode;
          self.releaseEventingServer();
          self.emit('error', err);
        }

        var sid = res.headers['sid'];
        var timeout = parseTimeout(res.headers['timeout']);

        function renew() {
          debug('renew subscription to %s', serviceId);

          var options = parseUrl(service.eventSubURL);
          options.method = 'SUBSCRIBE';
          options.headers = {
            'HOST': options.host,
            'SID': sid,
            'TIMEOUT': 'Second-' + SUBSCRIPTION_TIMEOUT
          };

          var req = http.request(options, function(res) {
            if(res.statusCode !== 200) {
              var err = new Error('SUBSCRIBE renewal error');
              err.statusCode = res.statusCode;
              // XXX: should we clear the subscription and release the server here ?
              self.emit('error', err);
            }

            var timeout = parseTimeout(res.headers['timeout']);

            var renewTimeout = Math.max(timeout - 30, 30); // renew 30 seconds before expiration
            debug('renewing subscription to %s in %d seconds', serviceId, renewTimeout);
            var timer = setTimeout(renew, renewTimeout * 1000);
            self.subscriptions[serviceId].timer = timer;
          });

          req.on('error', function(err) {
            self.emit('error', err);
          });

          req.end();
        }

        var renewTimeout = Math.max(timeout - 30, 30); // renew 30 seconds before expiration
        debug('renewing subscription to %s in %d seconds', serviceId, renewTimeout);
        var timer = setTimeout(renew, renewTimeout * 1000);

        self.subscriptions[serviceId] = {
          sid: sid,
          url: service.eventSubURL,
          timer: timer,
          listeners: [listener]
        };

      });

      req.on('error', function(err) {
        self.releaseEventingServer();
        self.emit('error', err);
      });

      req.end(); 
    });

  });
};


DeviceClient.prototype.unsubscribe = function(serviceId, listener) {
  var self = this;
  serviceId = resolveService(serviceId);

  // First make sure there are subscriptions for this service ...
  var subscription = this.subscriptions[serviceId];
  if(!subscription) return;

  // ... and we know about this listener
  var idx = subscription.listeners.indexOf(listener);
  if(idx === -1) return;

  // Remove the listener from the list
  subscription.listeners.splice(idx, 1);

  if(subscription.listeners.length === 0) {
    // If there's no listener left for this service, unsubscribe from it
    debug('unsubscribe from service %s', serviceId);

    var options = parseUrl(subscription.url);

    options.method = 'UNSUBSCRIBE';
    options.headers = {
      'HOST': options.host,
      'SID': subscription.sid
    };

    var req = http.request(options, function(res) {
      if(res.statusCode !== 200) {
        var err = new Error('UNSUBSCRIBE error');
        err.statusCode = res.statusCode;
        return self.emit('error', err);
      }

      clearTimeout(self.subscriptions[serviceId].timer);
      delete self.subscriptions[serviceId];
      // Make sure the eventing server is shutdown if there is no
      // subscription left for any service
      self.releaseEventingServer();
    });

    req.on('error', function(err) {
      self.emit('error', err);
    });

    req.end(); 
  }
};


DeviceClient.prototype.ensureEventingServer = function(callback) {
  var self = this;

  if(!this.server) {
    debug('create eventing server');
    this.server = http.createServer(function(req, res) {

      req.pipe(concat(function(buf) {
        var sid = req.headers['sid'];
        var seq = req.headers['seq'];
        var events = parseEvents(buf);

        debug('received events %s %d %j', sid, seq, events);

        var keys = Object.keys(self.subscriptions);
        var sids = keys.map(function(key) {
          return self.subscriptions[key].sid;
        })

        var idx = sids.indexOf(sid);
        if(idx === -1) {
          debug('WARNING unknown SID %s', sid);
          // silently ignore unknown SIDs
          return;
        }

        var serviceId = keys[idx];
        var listeners = self.subscriptions[serviceId].listeners;

        // Dispatch each event to each listener registered for
        // this service's events
        listeners.forEach(function(listener) {
          events.forEach(function(e) {
            listener(e);
          });
        });

      }));

    });

    this.server.listen(0, address.ipv4());
  }

  if(!this.listening) {
    this.server.on('listening', function() {
      self.listening = true;
      callback();
    });
  } else {
    process.nextTick(callback);
  }
};


DeviceClient.prototype.releaseEventingServer = function() {
  if(Object.keys(this.subscriptions).length === 0) {
    debug('shutdown eventing server');
    this.server.close();
    this.server = null;
    this.listening = false;
  }
};


function parseEvents(buf) {
  var events = [];
  var doc = et.parse(buf.toString());

  var lastChange = doc.findtext('.//LastChange');
  if(lastChange) {
    // AVTransport and RenderingControl services embed event data
    // in an `<Event></Event>` element stored as an URIencoded string.
    doc = et.parse(lastChange);

    // The `<Event></Event>` element contains one `<InstanceID></InstanceID>`
    // subtree per stream instance reporting its status.
    var instances = doc.findall('./InstanceID');
    instances.forEach(function(instance) {
      var data = { 
        InstanceID: Number(instance.get('val')) 
      };
      instance.findall('./*').forEach(function(node) {
        data[node.tag] = node.get('val');
      });
      events.push(data);
    });
  } else {
    // In any other case, each variable is stored separately in a
    // `<property></property>` tag
    var data = {};
    doc.findall('./property/*').forEach(function(node) {
      data[node.tag] = node.text;
    });
    events.push(data);
  }

  return events;
}


function parseTimeout(header) {
  return Number(header.split('-')[1]);
}


function parseDeviceDescription(xml, url) {
  var doc = et.parse(xml);

  var desc = extractFields(doc.find('./device'), [
    'deviceType', 
    'friendlyName', 
    'manufacturer', 
    'manufacturerURL', 
    'modelName', 
    'modelNumber', 
    'UDN'
  ]);

  var nodes = doc.findall('./device/iconList/icon');
  desc.icons = nodes.map(function(icon) {
    return extractFields(icon, [
      'mimetype',
      'width',
      'height',
      'depth',
      'url'
    ]);
  });

  var nodes = doc.findall('./device/serviceList/service');
  desc.services = {};
  nodes.forEach(function(service) {
    var tmp = extractFields(service, [
      'serviceType',
      'serviceId',
      'SCPDURL',
      'controlURL',
      'eventSubURL'
    ]);

    var id = tmp.serviceId;
    delete tmp.serviceId;
    desc.services[id] = tmp;
  });

  // Make URLs absolute
  var baseUrl = extractBaseUrl(url);

  desc.icons.map(function(icon) {
    icon.url = buildAbsoluteUrl(baseUrl, icon.url);
    return icon;
  });

  Object.keys(desc.services).forEach(function(id) {
    var service = desc.services[id];
    service.SCPDURL = buildAbsoluteUrl(baseUrl, service.SCPDURL);
    service.controlURL = buildAbsoluteUrl(baseUrl, service.controlURL);
    service.eventSubURL = buildAbsoluteUrl(baseUrl, service.eventSubURL);
  });

  return desc;
}


function parseServiceDescription(xml) {
  var doc = et.parse(xml);
  var desc = {};

  desc.actions = {};
  var nodes = doc.findall('./actionList/action');
  nodes.forEach(function(action) {
    var name = action.findtext('./name');
    var inputs = [];
    var outputs = [];

    var nodes = action.findall('./argumentList/argument');
    nodes.forEach(function(argument) {
      var arg = extractFields(argument, [
        'name',
        'direction',
        'relatedStateVariable'
      ]);

      var direction = arg.direction;
      delete arg.direction;

      if(direction === 'in') inputs.push(arg);
      else outputs.push(arg);
    });

    desc.actions[name] = {
      inputs: inputs,
      outputs: outputs
    };
  });

  desc.stateVariables = {};
  var nodes = doc.findall('./serviceStateTable/stateVariable');
  nodes.forEach(function(stateVariable) {
    var name = stateVariable.findtext('./name');

    var nodes = stateVariable.findall('./allowedValueList/allowedValue');
    var allowedValues = nodes.map(function(allowedValue) {
      return allowedValue.text;
    });

    desc.stateVariables[name] = {
      dataType: stateVariable.findtext('./dataType'),
      sendEvents: stateVariable.get('sendEvents'),
      allowedValues: allowedValues,
      defaultValue: stateVariable.findtext('./defaultValue')
    };
  });

  return desc;
}


function fetch(url, callback) {
  var req = http.get(url, function(res) {
    if(res.statusCode !== 200) {
      var err = new Error('Request failed');
      err.statusCode = res.statusCode;
      return callback(err);
    }
    res.pipe(concat(function(buf) {
      callback(null, buf.toString())
    }));
  });

  req.on('error', callback);
  req.end();
}


function extractFields(node, fields) {
  var data = {};
  fields.forEach(function(field) {
    data[field] = node.findtext('./' + field);
  });
  return data;
}


function buildAbsoluteUrl(base, url) {
  if(url === '') return '';
  if(url.substring(0, 4) === 'http') return url;
  if(url[0] === '/') {
    var root = base.split('/').slice(0, 3).join('/'); // http://host:port
    return root + url;
  } else {
    return base + '/' + url;
  }
}


function extractBaseUrl(url) {
  return url.split('/').slice(0, -1).join('/');
}


function resolveService(serviceId) {
  return (serviceId.indexOf(':') === -1) 
    ? 'urn:upnp-org:serviceId:' + serviceId 
    : serviceId;  
}


module.exports = DeviceClient;