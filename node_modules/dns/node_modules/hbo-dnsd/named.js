// Copyright 2012 Iris Couch, all rights reserved.
//
// The dnsd package API

var Message = require('./message')
var createServer  = require('./server')

module.exports = { 'parse': parse
                 , 'binify'   : stringify
                 , 'stringify': stringify
                 , 'createServer': createServer
                 }

function parse(packet) {
  return new Message(packet)
}

function stringify(message) {
  if(! (message instanceof Message))
    message = new Message(message)
  return message.toBinary()
}
