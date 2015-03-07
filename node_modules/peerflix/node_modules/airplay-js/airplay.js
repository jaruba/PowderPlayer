exports.Browser = require( './airplay/browser' ).Browser;
exports.Device = require( './airplay/device' ).Device;
exports.HLS = require( './airplay/hls' ).HLS;


/**
 * create a HLS Server
 * 
 * @param {Object=} options
 * @return {HLS} instance of HLS
 */
exports.createHLS = function ( options ) {
    return new exports.HLS( options );
};

/**
 * create a Browser
 * 
 * @param {Object=} options
 * @return {Browser} instance of Browser
 */
exports.createBrowser = function ( options ) {
    return new exports.Browser( options );
};

/**
 * connect a airplay device
 * 
 * @param {string} host airplay host
 * @param {number} port airplay port
 * @param {string=} pass pass
 * @param {Function=} callback callback function
 */
exports.connect = function ( host, port, pass, callback ) {
    throw 'not yet implemented';
};