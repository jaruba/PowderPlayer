var DeviceClient = require('upnp-device-client');
var util = require('util');
var debug = require('debug')('upnp-mediarenderer-client');
var et = require('elementtree');

var MEDIA_EVENTS = [
  'status',
  'loading',
  'playing',
  'paused',
  'stopped',
  'speedChanged'
];


function MediaRendererClient(url) {
  DeviceClient.call(this, url);
  this.instanceId = 0;

  // Subscribe / unsubscribe from AVTransport depending
  // on relevant registered / removed event listeners.
  var self = this;
  var refs = 0;
  var receivedState;

  this.addListener('newListener', function(eventName, listener) {
    if(MEDIA_EVENTS.indexOf(eventName) === -1) return;
    if(refs === 0) {
      receivedState = false;
      self.subscribe('AVTransport', onstatus);
    }
    refs++;
  });

  this.addListener('removeListener', function(eventName, listener) {
    if(MEDIA_EVENTS.indexOf(eventName) === -1) return;
    refs--;
    if(refs === 0) self.unsubscribe('AVTransport', onstatus);
  });

  function onstatus(e) {
    self.emit('status', e);

    if(!receivedState) {
      // Starting from here we only want state updates.
      // As the first received event is the full service state, we ignore it.
      receivedState = true;
      return;
    }

    if(e.hasOwnProperty('TransportState')) {
      switch(e.TransportState) {
        case 'TRANSITIONING':
          self.emit('loading');
          break;
        case 'PLAYING':
          self.emit('playing');
          break;
        case 'PAUSED_PLAYBACK':
          self.emit('paused');
          break;
        case 'STOPPED':
          self.emit('stopped');
          break;
      }
    }

    if(e.hasOwnProperty('TransportPlaySpeed')) {
      self.emit('speedChanged', Number(e.TransportPlaySpeed));
    }
  }

}

util.inherits(MediaRendererClient, DeviceClient);


MediaRendererClient.prototype.getSupportedProtocols = function(callback) {
  this.callAction('ConnectionManager', 'GetProtocolInfo', {}, function(err, result) {
    if(err) return callback(err);
    
    //
    // Here we leave off the `Source` field as we're hopefuly dealing with a Sink-only device.
    //
    var lines = result.Sink.split(',');

    var protocols = lines.map(function(line) {
      var tmp = line.split(':');
      return {
        protocol: tmp[0],
        network: tmp[1],
        contentFormat: tmp[2],
        additionalInfo: tmp[3]
      };
    });

    callback(null, protocols);
  });
};


MediaRendererClient.prototype.getPosition = function(callback) {
  this.callAction('AVTransport', 'GetPositionInfo', { InstanceID: this.instanceId }, function(err, result) {
    if(err) return callback(err);
    callback(null, parseTime(result.AbsTime));
  });
};


MediaRendererClient.prototype.getDuration = function(callback) {
  this.callAction('AVTransport', 'GetMediaInfo', { InstanceID: this.instanceId }, function(err, result) {
    if(err) return callback(err);
    callback(null, parseTime(result.MediaDuration));
  });
};


MediaRendererClient.prototype.load = function(url, options, callback) {
  var self = this;
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }


  var contentType = options.contentType || 'video/mpeg'; // Default to something generic

  var metadata = null;

  if(options.metadata) {
    metadata = typeof options.metadata === 'string'
      ? options.metadata
      : buildMetadata(options.metadata);
  }

  var params = {
    RemoteProtocolInfo: 'http-get:*:' + contentType + ':*',
    PeerConnectionManager: null,
    PeerConnectionID: -1,
    Direction: 'Input'
  };

  this.callAction('ConnectionManager', 'PrepareForConnection', params, function(err, result) {
    if(err) {
      if(err.code !== 'ENOACTION') {
        return callback(err);
      }
      //
      // If PrepareForConnection is not implemented, we keep the default (0) InstanceID
      //
    } else {
      self.instanceId = result.AVTransportID;    
    }

    var params = {
      InstanceID: self.instanceId,
      CurrentURI: url,
      CurrentURIMetaData: metadata
    };

    self.callAction('AVTransport', 'SetAVTransportURI', params, function(err) {
      if(err) return callback(err);
      if(options.autoplay) {
        self.play(callback);
        return;
      }
      callback();
    });
  });
};


MediaRendererClient.prototype.play = function(callback) {
  var params = {
    InstanceID: this.instanceId,
    Speed: 1,
  };
  this.callAction('AVTransport', 'Play', params, callback || noop);
};


MediaRendererClient.prototype.pause = function(callback) {
  var params = {
    InstanceID: this.instanceId
  };
  this.callAction('AVTransport', 'Pause', params, callback || noop);
};


MediaRendererClient.prototype.stop = function(callback) {
  var params = {
    InstanceID: this.instanceId
  };
  this.callAction('AVTransport', 'Stop', params, callback || noop);
};


MediaRendererClient.prototype.seek = function(seconds, callback) {
  var params = {
    InstanceID: this.instanceId,
    Unit: 'REL_TIME',
    Target: formatTime(seconds)
  };
  this.callAction('AVTransport', 'Seek', params, callback || noop);
};


function formatTime(seconds) {
  var h = 0;
  var m = 0;
  var s = 0;
  h = Math.floor((seconds - (h * 0)    - (m * 0 )) / 3600); 
  m = Math.floor((seconds - (h * 3600) - (m * 0 )) / 60);
  s =            (seconds - (h * 3600) - (m * 60));

  function pad(v) {
    return (v < 10) ? '0' + v : v;
  }

  return [pad(h), pad(m), pad(s)].join(':');
}


function parseTime(time) {
  var parts = time.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}


function buildMetadata(metadata) {
  var didl = et.Element('DIDL-Lite');
  didl.set('xmlns', 'urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/');
  didl.set('xmlns:dc', 'http://purl.org/dc/elements/1.1/');
  didl.set('xmlns:upnp', 'urn:schemas-upnp-org:metadata-1-0/upnp/');
  didl.set('xmlns:sec', 'http://www.sec.co.kr/');

  var item = et.SubElement(didl, 'item');
  item.set('id', 0);
  item.set('parentID', -1);
  item.set('restricted', false);

  var OBJECT_CLASSES = {
    'audio': 'object.item.audioItem.musicTrack',
    'video': 'object.item.videoItem.movie',
    'image': 'object.item.imageItem.photo'
  }

  if(metadata.type) {
    var klass = et.SubElement(item, 'upnp:class');
    klass.text = OBJECT_CLASSES[metadata.type];
  }

  if(metadata.title) {
    var title = et.SubElement(item, 'dc:title');
    title.text = metadata.title;
  }

  if(metadata.creator) {
    var creator = et.SubElement(item, 'dc:creator');
    creator.text = metadata.creator;
  }

  if(metadata.subtitlesUrl) {
    var captionInfo = et.SubElement(item, 'sec:CaptionInfo');
    captionInfo.set('sec:type', 'srt');
    captionInfo.text = metadata.subtitlesUrl;

    var captionInfoEx = et.SubElement(item, 'sec:CaptionInfoEx');
    captionInfoEx.set('sec:type', 'srt');
    captionInfoEx.text = metadata.subtitlesUrl;

    // Commented-out for now as it makes some TVs which don't have it
    // in their supported protocols choke.
    //var res = et.SubElement(item, 'res');
    //res.set('protocolInfo', 'http-get:*:text/srt:*');
    //res.text = metadata.subtitlesUrl;

  }

  var doc = new et.ElementTree(didl);
  var xml = doc.write({ xml_declaration: false });

  return xml;
}


function noop() {}


module.exports = MediaRendererClient;
