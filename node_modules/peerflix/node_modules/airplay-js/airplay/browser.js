/**
 * node-airplay
 *
 * @file bojour server
 * @author zfkun(zfkun@msn.com)
 * @thanks https://github.com/benvanik/node-airplay/blob/master/lib/airplay/browser.js
 */

var util = require( 'util' );
var events = require( 'events' );
//var mdns = require( 'mdns' );

var mdns = require( 'mdns-js' );

var Device = require( './device' ).Device;

var Browser = function( options ) {
    events.EventEmitter.call( this );
    this.init( options );
};

util.inherits( Browser, events.EventEmitter );

exports.Browser = Browser;




Browser.prototype.init = function ( options ) {
    var self = this;
    var nextDeviceId = 0;

    this.devices = {};
    this.addresses = []

    //var mdnsBrowser = new mdns.Mdns(mdns.tcp('airport'));
    var browser = new mdns.createBrowser(mdns.tcp('airplay'));
    //var legacyMdnsBrowser = new mdns.Mdns(mdns.tcp('airplay'));

    var mdnsOnUpdate = function(data) {
        if(data.port && data.port == 7000 && self.addresses.indexOf(data.addresses[0]) < 0){
            var info = data.addresses
            var name = data.fullname
            self.addresses.push(data.addresses[0])
            /*
            if ( !self.isValid( info ) ) {
                return;
            }

            var device = self.getDevice( info );
            if ( device ) {
                return;
            }
            */
            //if(info.length && name){
                device = new Device( nextDeviceId++, info , name );
                device.on( 'ready', function( d ) {
                    self.emit( 'deviceOn', d );
                });
                device.on( 'close', function( d ) {
                    delete self.devices[ d.id ];
                    self.emit( 'deviceOff', d );
                });

                self.devices[ device.id ] = device;
            //}else{
            //    console.log("Error adding device: "+JSON.stringify(data))
            //}
        }
    };

    //mdnsBrowser.on('ready', function () {
    //        mdnsBrowser.discover();
    //});

    browser.on('ready', function () {
            browser.discover();
            setInterval(function(){
                browser.discover();
            },3000)
    });

    //mdnsBrowser.on('update', mdnsOnUpdate);
    browser.on('update', mdnsOnUpdate);
    /*
    this.browser.on( 'serviceDown', function( info ) {
        if ( !self.isValid( info ) ) {
            return;
        }

        var device = self.getDevice( info );
        if ( device ) {
            device.close();
        }
    });*/
};

Browser.prototype.start = function () {
    //this.browser.start();
    this.emit( 'start' );
    return this;
};

Browser.prototype.stop = function() {
    this.browser.stop();
    this.emit( 'stop' );
    return this;
};

Browser.prototype.isValid = function ( info ) {
    if ( !info || !/^en\d+$/.test( info.networkInterface ) ) {
        return !1;
    }
    return !0;
};

Browser.prototype.getDevice = function ( info ) {
    for ( var deviceId in this.devices ) {
        var device = this.devices[ deviceId ];
        if ( device.match( info ) ) {
            return device;
        }
    }
};

Browser.prototype.getDeviceById = function ( deviceId, skipCheck ) {
    var device = this.devices[ deviceId ];
    if ( device && ( skipCheck || device.isReady() ) ) {
        return device;
    }
};

Browser.prototype.getDevices = function ( skipCheck ) {
    var devices = [];
    for ( var deviceId in this.devices ) {
        var device = this.devices[ deviceId ];
        if ( skipCheck || device.isReady() ) {
            devices.push( device );
        }
    }
    return devices;
};
