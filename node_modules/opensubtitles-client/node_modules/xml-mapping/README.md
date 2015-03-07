# xml2json and json2xml for NodeJS

[![Build Status](https://secure.travis-ci.org/touv/node-xml-mapping.png?branch=master)](http://travis-ci.org/touv/node-xml-mapping)

It's native javascript implementation of a bidirectional converter between XML and JS data structure (aka JSON).
You can convert any type of XML documents in an Javascript data structure.
You can also do the reverse, converting a Javascript data structure in XML String. XML is still valid.

## Contributors

  * [Nicolas Thouvenin](https://github.com/touv) 
  * [Joe Ibershoff](https://github.com/zacronos)
  * [Yura Zenevich](https://github.com/yzen)
  * [Thorsten Lorenz](https://github.com/thlorenz)

# Installation

With [npm](http://npmjs.org) do:

    $ npm install xml-mapping


# Usage
```javascript
var xm = require('xml-mapping');

var json = xm.load('<key>value</key>');
var xml  = xm.dump(json);

console.log(xml,json);
console.log(json);
```

Output:

    <key>value</key> { key: { '$t': 'value' } }

# Convention

The rules for converting XML to JSON are those used by Google in its GData protocol. More information here : http://code.google.com/apis/gdata/docs/json.html

# Tests

Use [nodeunit](https://github.com/caolan/nodeunit) to run the tests.

    $ npm install nodeunit
    $ nodeunit test

# API Documentation

## load(String xml)
Transform a string with XML in Javascript data structure (JSON). 
**Return Object.**

## dump(Object json)
Transform a Javascript data structure (JSON) in XML string. **Return String.**

## tojson(String xml)
Alias of load.

## toxml(Object json)
Alias of dump.

# Also

* https://github.com/estheban/node-json2xml
* https://github.com/buglabs/node-xml2json

# License

[MIT/X11](./LICENSE)
