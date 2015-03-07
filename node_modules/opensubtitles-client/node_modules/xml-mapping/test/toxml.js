var XMLMapping = require('../');
var input;

exports['t00'] = function (test) {
	input = {};
	test.equal(XMLMapping.dump(input), '<row/>') 
	input = 'string';
	test.equal(XMLMapping.dump(input), 'string') 
	input = 1234;
	test.equal(XMLMapping.dump(input), 1234) 
	test.done();
};
exports['t01'] = function (test) {
	input = { 
		key : {}
	};
	test.equal(XMLMapping.dump(input), '<key/>');
	input = {
		key : {
			key1: 'value'
		}
	};
	test.equal(XMLMapping.dump(input), '<key key1="value"/>');
	input = {
		key : {
			key1: 'value1',
			key2: 'value2'
		}
	};
	test.equal(XMLMapping.dump(input), '<key key1="value1" key2="value2"/>');
	test.done();
};
exports['t02'] = function (test) {
	input = { 
		key1 : {},
		key2 : {}
	};
	test.equal(XMLMapping.dump(input), '<row><key1/><key2/></row>'); 
	input = {
		key1 : {
			key: 'value'
		},
		key2 : {
			key: 'value'
		}
	};
	test.equal(XMLMapping.dump(input), '<row><key1 key="value"/><key2 key="value"/></row>'); 
	input = {
		key1 : {
			keyA: 'value1',
			keyB: 'value2'
		},
		key2 : {
			keyA: 'value1',
			keyB: 'value2'
		}
	};
	test.equal(XMLMapping.dump(input), '<row><key1 keyA="value1" keyB="value2"/><key2 keyA="value1" keyB="value2"/></row>');
	test.done();
};
exports['t03a'] = function (test) {
	input = {
		key : []
	};
	test.equal(XMLMapping.dump(input), '<key/>'); 
	test.done();
}
exports['t03b'] = function (test) {
	input = {
		key : [{},{}]
	};
	test.equal(XMLMapping.dump(input), '<key/><key/>'); 
	test.done();
}
exports['t03c'] = function (test) {
	input = {
		key : [{ $t : 'value'}, { $text : 'value'}, { '#text' : 'value'}]
	};
	test.equal(XMLMapping.dump(input), '<key>value</key><key>value</key><key>value</key>');
	test.done();
};
exports['t03d'] = function (test) {
	input = {
		key : [{ $c : 'value'}, { '#comment' : 'value'}, { '$comment' : 'value'}]
	};
	test.equal(XMLMapping.dump(input), '<key><!--value--></key><key><!--value--></key><key><!--value--></key>');
	test.done();
};
exports['t03e'] = function (test) {
	input = {
		key : [{ $cd : 'value'}, { '#cdata' : 'value'}, { '$cdata' : 'value'}]
	};
	test.equal(XMLMapping.dump(input), '<key><![CDATA[value]]></key><key><![CDATA[value]]></key><key><![CDATA[value]]></key>');
	test.done();
};


exports['t04a'] = function (test) {
	input = {
		$t : 'value'
	};
	test.equal(XMLMapping.dump(input), '');
	test.done();
};
exports['t04b'] = function (test) {
	input = {
		key: ['am', 'stram', 'dram']
	};
	test.equal(XMLMapping.dump(input), '<key><![CDATA[am]]></key><key><![CDATA[stram]]></key><key><![CDATA[dram]]></key>');
	test.done();
};
exports['t05a'] = function (test) {
	input = {
		'#element' : [{ $cd : 'value'}, { '#cd' : 'value'}]
	};
	test.equal(XMLMapping.dump(input), '<![CDATA[value]]><![CDATA[value]]>'); 
	test.done();
};
exports['t05b'] = function (test) {
	input = {
		key : {
			'#element' : [{ $t : 'amstra'}, { _t : 'mdram'}]
		}
	};
	test.equal(XMLMapping.dump(input), '<key>amstramdram</key>'); 
	test.done();
};
exports['t06'] = function (test) {
	input = {
		key : {
			'$t' : 1
		}
	};
	test.equal(XMLMapping.dump(input), '<key>1</key>'); 
		input = {
		key : {
			'$t' : 0
		}
	};
	test.equal(XMLMapping.dump(input), '<key>0</key>'); 
	test.done();
};
exports['t07'] = function (test) {
	input = {
		key: {
			$t: "value",
			arg: "arg"
		}
	};
	test.equal(XMLMapping.dump(input), '<key arg="arg">value</key>');
	test.done();
};
exports['t08'] = function (test) {
	input = {
		key: {
			a: "a",
			val: {
				$t: "val"
			},
			c: "c"
		}
	};
	test.equal(XMLMapping.dump(input), '<key a="a" c="c"><val>val</val></key>');
	test.done();
};
exports['t09'] = function (test) {
	input = {
		key: {
			a: "a",
			val: {
				$t: "val"
			},
			c: "c"
		}
	};
	test.equal(XMLMapping.dump(input, { indent: true }), '<key a="a" c="c">\n    <val>val</val>\n</key>');
	test.done();
};
