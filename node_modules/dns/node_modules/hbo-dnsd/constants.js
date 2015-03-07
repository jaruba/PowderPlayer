// Copyright 2012 Iris Couch, all rights reserved.
//
// Looking up and converting between various constants

var util = require('util')

module.exports = { 'type'           : swap_type
                 , 'class'          : swap_class
                 , 'type_to_label'  : type_to_label
                 , 'type_to_number' : type_to_number
                 , 'class_to_label' : class_to_label
                 , 'class_to_number': class_to_number

                 // For testing
                 , 'transpose'     : transpose
                 , 'mk_type_labels': mk_type_labels
                 }

var TYPE_LABELS   = mk_type_labels()
  , CLASS_LABELS  = mk_class_labels()
  , TYPE_NUMBERS  = transpose(TYPE_LABELS)
  , CLASS_NUMBERS = transpose(CLASS_LABELS)

function swap_type(obj) {
  return (typeof obj == 'string') ? type_to_number(obj) : type_to_label(obj)
}

function swap_class(obj) {
  return (typeof obj == 'string') ? class_to_number(obj) : class_to_label(obj)
}

function type_to_label(type) {
  if(isNaN(type) || typeof type != 'number' || type < 1 || type > 65535)
    throw new Error('Invalid record type: ' + type)
  return TYPE_LABELS[type]
}

function type_to_number(type) {
  if(typeof type != 'string')
    throw new Error('Type must be string: ' + type)

  var num = TYPE_NUMBERS[type]
  if(!num)
    throw new Error('No such type label: ' + type)
  else
    return num
}

function class_to_label(clas) {
  if(isNaN(clas) || typeof clas != 'number' || clas < 1 || clas > 65535)
    throw new Error('Invalid record class: ' + clas)
  return CLASS_LABELS[clas]
}

function class_to_number(clas) {
  if(typeof clas != 'string')
    throw new Error('Type must be string: ' + clas)

  var num = CLASS_NUMBERS[clas]
  if(!num)
    throw new Error('No such clas label: ' + clas)
  else
    return num
}

//
// Utilities
//

function transpose(obj) {
  var result = {}
  Object.keys(obj).forEach(function(key) {
    var val = obj[key]
    if(typeof val == 'string')
      result[val] = +key
  })

  return result
}

function mk_class_labels() {
  var classes =
    { 0: 'reserved'
    , 1: 'IN'
    , 2: null
    , 3: 'CH'
    , 4: 'HS'
    // 5 - 127 unassigned classes
    // 128 - 253 unassigned qclasses
    , 254: 'NONE'
    , 255: '*'
    // 256 - 32767 unassigned
    // 32768 - 57343 unassigned
    // 57344 - 65279 unassigned qclasses and metaclasses
    // 65280 - 65534 Private use
    , 65535: 'reserved'
    }

  var unassigned = [ [5,253], [256,65279] ]
  unassigned.forEach(function(pair) {
    var start = pair[0], stop = pair[1]
    for(var i = start; i <= stop; i++)
      classes[i] = null
  })

  for(var i = 65280; i <= 65534; i++)
    classes[i] = 'Private use'

  return classes
}

function mk_type_labels() {
  var types =
    { 0: null
    , 1: 'A'
    , 2: 'NS'
    , 3: 'MD'
    , 4: 'MF'
    , 5: 'CNAME'
    , 6: 'SOA'
    , 7: 'MB'
    , 8: 'MG'
    , 9: 'MR'
    , 10: 'NULL'
    , 11: 'WKS'
    , 12: 'PTR'
    , 13: 'HINFO'
    , 14: 'MINFO'
    , 15: 'MX'
    , 16: 'TXT'
    , 17: 'RP'
    , 18: 'AFSDB'
    , 19: 'X25'
    , 20: 'ISDN'
    , 21: 'RT'
    , 22: 'NSAP'
    , 23: 'NSAP-PTR'
    , 24: 'SIG'
    , 25: 'KEY'
    , 26: 'PX'
    , 27: 'GPOS'
    , 28: 'AAAA'
    , 29: 'LOC'
    , 30: 'NXT'
    , 31: 'EID'
    , 32: 'NIMLOC'
    , 33: 'SRV'
    , 34: 'ATMA'
    , 35: 'NAPTR'
    , 36: 'KX'
    , 37: 'CERT'
    , 38: 'A6'
    , 39: 'DNAME'
    , 40: 'SINK'
    , 41: 'OPT'
    , 42: 'APL'
    , 43: 'DS'
    , 44: 'SSHFP'
    , 45: 'IPSECKEY'
    , 46: 'RRSIG'
    , 47: 'NSEC'
    , 48: 'DNSKEY'
    , 49: 'DHCID'
    , 50: 'NSEC3'
    , 51: 'NSEC3PARAM'
    , 52: 'TLSA'
    // 53 - 54 unassigned
    , 55: 'HIP'
    , 56: 'NINFO'
    , 57: 'RKEY'
    , 58: 'TALINK'
    , 59: 'CDS'
    // 60 - 98 unassigned
    , 99: 'SPF'
    , 100: 'UINFO'
    , 101: 'UID'
    , 102: 'GID'
    , 103: 'UNSPEC'
    , 104: 'NID'
    , 105: 'L32'
    , 106: 'L64'
    , 107: 'LP'
    // 108 - 248 unassigned
    , 249: 'TKEY'
    , 250: 'TSIG'
    , 251: 'IXFR'
    , 252: 'AXFR'
    , 253: 'MAILB'
    , 254: 'MAILA'
    , 255: '*'
    , 256: 'URI'
    , 257: 'CAA'
    // 258 - 32767 unassigned
    , 32768: 'TA'
    , 32769: 'DLV'
    // 32770 - 65279 unassigned
    // 65280 - 65534 Private use
    , 65535: 'Reserved'
    }

  var unassigned = [ [53,54], [60,98], [108,248], [258,32767], [32770,65279] ]
  unassigned.forEach(function(pair) {
    var start = pair[0], stop = pair[1]
    for(var i = start; i <= stop; i++)
      types[i] = null
  })

  for(var i = 65280; i <= 65534; i++)
    types[i] = 'Private use'

  return types
}
