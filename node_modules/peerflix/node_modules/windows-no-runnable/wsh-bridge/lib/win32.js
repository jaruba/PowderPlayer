var inspect = require("inspect"),
	parser = new (require("xml2js").Parser),
	path = require("path"),
	child_process = require("child_process");

function between(min, max){
	return function(val){ val = Number(val); return val < min ? min : (val > max ? max : val); }
}

function Sint8(val){ return between(-1 << 7, 1 << 7)(val); }
function Uint8(val){ return between(0, 1 << 8)(val); }
function Sint16(val){ return between(-1 << 15, 1 << 15)(val); }
function Uint16(val){ return between(0, 1 << 16)(val); }
function Sint32(val){ return between(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)(val); }
function Uint32(val){ return between(0, Number.POSITIVE_INFINITY)(val); }
function Sint64(val){ return Sint32(val); }
function Uint64(val){ return Uint32(val); }
function Float32(val){ return Number(val); }
function Float64(val){ return Number(val); }

var types = {
	sint8:    Sint8,
	uint8:    Uint8,
	sint16:   Sint16,
	uint16:   Uint16,
	sint32:   Sint32,
	uint32:   Uint32,
	sint64:   Sint64,
	uint64:   Uint64,
	float32:  Float32,
	float64:  Float64,
	string:   String,
	boolean:  Boolean,
	datetime: Date
}

var typesArray = {
	sint8:    function Sint8Array(vals)   { return vals.map(Sint8); },
	uint8:    function Uint8Array(vals)   { return vals.map(Uint8); },
	sint16:   function Sint16Array(vals)  { return vals.map(Sint16); },
	uint16:   function Uint16Array(vals)  { return vals.map(Uint16); },
	sint32:   function Sint32Array(vals)  { return vals.map(Sint32); },
	uint32:   function Uint32Array(vals)  { return vals.map(Uint32); },
	sint64:   function Sint64Array(vals)  { return vals.map(Sint64); },
	uint64:   function Uint64Array(vals)  { return vals.map(Uint64); },
	float32:  function Float32Array(vals) { return vals.map(Float32); },
	float64:  function Float64Array(vals) { return vals.map(Float64); },
	string:   function StringArray(vals)  { return vals.map(String); },
	boolean:  function BooleanArray(vals) { return vals.map(Boolean); },
	datetime: function DateArray(vals)    { return vals.map(Date); }
}
var Win32 = {};

function makeConstructor(type, prop){
	switch(type){
		case "PROPERTY":
			return types[prop.TYPE] || prop.TYPE;
		case "PROPERTY.ARRAY":
			//return typesArray[prop.TYPE] || prop.TYPE;
			return prop.TYPE;
		case "PROPERTY.REFERENCE":
			return eval("(function(){return function "+prop.REFERENCECLASS+"(val){return new Win32["+prop.REFERENCECLASS+"]; }})()");
	}
}

function makeDefault(type, prop){
	switch(type){
		case "PROPERTY":
			if(prop.VALUE) return prop.VALUE;
			break;
		case "PROPERTY.ARRAY":
			if(prop["VALUE.ARRAY"]) return prop["VALUE.ARRAY"].VALUE;
			break;
		case "PROPERTY.REFERENCE":
			break;
	}
}


function done(set){
	//inspect(set);
	Win32 = set.reduce(function(ret, item){
		var newItem = ret[item["@"].NAME] = {}, set, def, _super = item["@"].SUPERCLASS;

		_super && ret[_super] && (newItem.__proto__ = ret[_super]);

		["PROPERTY", "PROPERTY.ARRAY", "PROPERTY.REFERENCE"].forEach(function(type){
			if(set = item[type]){
				(Array.isArray(set) ? set : [set]).forEach(function(prop){
					var val = { type: makeConstructor(type, prop["@"]) };
					if(def = makeDefault(type, prop)){
						if(typeof val.type == "function"){
							val = val.type(def);
							def = val;
						} else {
							val.default = def;
						}
						if(typeof def == "string" && def in Win32){
							val = Win32[def];
						}
					}
					if(newItem[prop["@"].NAME] != val) {
						newItem[prop["@"].NAME] = val;
					}
				});
			}
		});
		//item.QUALIFIER.forEach(function(prop){
		//	newItem._qualifiers[prop["@"].NAME] = prop.VALUE;
		//});
		return ret;
	}, {});
	console.log("Win32 [" + Object.keys(Win32).length + "]");
	var repl =  global.module.exports.repl || require("repl").start();
	repl.context.Win32 = Win32;
}


module.exports = function(){
	var data = "", cscript = child_process.spawn("cscript", [path.normalize(__dirname + "/wsh-bridge.js")]);
	cscript.stdout.on("data", function(out){ data = data + out; });
	cscript.on("exit", function(){
		var parsed = JSON.parse(data), remaining = parsed.length, complete = [];
		parser.parseString(parsed.join(""), function(e, json){
			complete.push(json);
			if(--remaining == 0) done(complete);
		});
	});
}