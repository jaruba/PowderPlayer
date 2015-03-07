var core = require('dns'),
    mine = require('../dns');

var sorter = function(a, b) {
  var cmpa, cmpb;

  if (a.priority) {
    if (a.priority > b.priority) {
      return 1;
    } else if (a.priority < b.priority) {
      return -1;
    } else {
      if (a.exchange) {
        cmpa = a.exchange;
        cmpb = b.exchange;
      } else if (a.name) {
        cmpa = a.name;
        cmpb = b.name;
      }

      if (cmpb > cmpa) {
        return 1;
      } else if (cmpa < cmpb) {
        return -1;
      } else {
        return 0;
      }
    }
  } else {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }
}

var resolve = function(domain, type, test) {
  //var their_err, theirs, our_err, ours;
  mine.resolve(domain, type, function(our_err, ours) {
    core.resolve(domain, type, function(their_err, theirs) {
      //try {
        test.deepEqual(our_err, their_err, "Error mismatch");
        test.deepEqual(ours.length, theirs.length, "Expected length mismatch");

        ours.sort(sorter);
        theirs.sort(sorter);

        test.deepEqual(ours, theirs, "Mismatch");
      //} catch (e) {
      //  console.log('error resolving', domain, type);
      //  console.log('our error', our_err);
      //  console.log('their error', their_err);
      //  console.log('ours', ours)
      //  console.log('theirs', theirs);
      //  throw e;
      //} finally {
        test.done();
      //}
    });
  });
};

var lookup = function(domain, type, test) {
  if (!test) {
    test = type;
    type = undefined;
  }
  mine.lookup(domain, type, function(our_err, our_ip, our_family) {
    core.lookup(domain, type, function(their_err, their_ip, their_family) {
      //try {
        test.deepEqual(our_err, their_err, "Error mismatch");
        test.deepEqual(our_ip, their_ip, "IP mismatch");
        test.deepEqual(our_family, their_family, "Family mismatch");
      //} catch (e) {
      //  console.log('error looking up', domain, type);
      //  console.log('our err', our_err);
      //  console.log('our ip', our_ip);
      //  console.log('our family', our_family);
      //  console.log('their err', their_err);
      //  console.log('their ip', their_ip);
      //  console.log('their family', their_family);
      //  throw e;
      //} finally {
        test.done();
      //}
    });
  });
};

exports.resolve4 = resolve.bind(null, 'irc6.geo.oftc.net', 'A');
exports.resolve6 = resolve.bind(null, 'irc6.geo.oftc.net', 'AAAA');
exports.resolveMx = resolve.bind(null, 'gmail.com', 'MX');
exports.resolveNs = resolve.bind(null, 'google.com', 'NS');
exports.resolveSrv = resolve.bind(null, '_jabber._tcp.google.com', 'SRV');
exports.resolveCname = resolve.bind(null, 'www.google.com', 'CNAME');
//exports.resolveDne = resolve.bind(null, 'does.not.exist', 'A');
// TODO this probably shouldn't even transit?
//resolve('should be a formerr', 'A');

exports.lookup4 = lookup.bind(null, 'www.atxconsulting.com', 4);
exports.lookup6 = lookup.bind(null, 'www.atxconsulting.com', 6);
exports.lookupImplicit = lookup.bind(null, 'www.atxconsulting.com');
exports.lookupDne = lookup.bind(null, 'does.not.exist', 4);
exports.lookupNull = lookup.bind(null, null);
exports.lookupLocalIP = lookup.bind(null, '127.0.0.1');
exports.lookupLocalIP6 = lookup.bind(null, '::1');
exports.lookupLocalhost4 = lookup.bind(null, 'localhost', 4);
exports.lookupLocalhost6 = lookup.bind(null, 'localhost', 6);
//work on search path example
//exports.lookupPath = lookup.bind(null, 'fatman', 4);
