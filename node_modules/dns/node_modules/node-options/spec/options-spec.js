var libpath  = '../lib',
    options  = require(libpath + '/options');

console.log('Loading ' + libpath + ' libraries');

describe('Testing isType()', function () {

    it('Expect undefined to be undefined', function () {
        var undefinedVariable;
        expect(options.isType(undefinedVariable)).toBe('undefined');
    });

    it('Expect "A String" to be string', function () {
        expect(options.isType("A String")).toBe('string');
    });

    it('Expect 42 to be number', function () {
        expect(options.isType(42)).toBe('number');
    });

    it('Expect 3.1416 to be number', function () {
        expect(options.isType(3.1416)).toBe('number');
    });

    it('Expect true to be boolean', function () {
        expect(options.isType(true)).toBe('boolean');
    });

    it('Expect new Boolean(false) to be boolean', function () {
        expect(options.isType(new Boolean(false))).toBe('boolean');
    });

    it('Expect [1,2,3] to be array', function () {
        expect(options.isType([1,2,3])).toBe('array');
    });

    it('Expect new Array() to be array', function () {
        expect(options.isType(new Array())).toBe('array');
    });

    it('Expect {} to be object', function () {
        expect(options.isType({})).toBe('object');
    });

    it('Expect new Object() to be object', function () {
        expect(options.isType(new Object())).toBe('object');
    });

    it('Expect /^$/ to be regexp', function () {
        expect(options.isType(/^$/)).toBe('regexp');
    });

    it('Expect new RegExp("e") to be regex', function () {
        expect(options.isType(new RegExp("e"))).toBe('regexp');
    });

    it('Expect function () {} to be function', function () {
        expect(options.isType(function (){})).toBe('function');
    });
});

describe('Testing merge()', function () {

    it('Expect {one:1}, {two:2} to be {one:1, two:2}', function () {
        expect(options.merge({one:1}, {two:2})).toEqual({one:1, two:2});
    });

    it('Expect {one:1}, {one:2} to be {one:1}', function () {
        expect(options.merge({one:1}, {one:2})).toEqual({one:1});
    });

});

describe('Testing mergeEnvironment()', function () {
    process.env.UNITTEST = "Yeah!";
    it('Expect {unittest:"boohoo", one:1} to be {one:1, unittest:"Yeah!"}', function () {
        expect(options.mergeEnvironment({unittest:"boohoo", one:1})).toEqual({one:1, unittest:"Yeah!"});
    });
});

describe('Testing overlayConfig()', function () {
    it('Expect {"OriginalKey":"original","name":"Bob"} to be {"UnexistingKey":"added","OriginalKey":"replaced", "name":"Bob"}', function () {
        expect(options.overlayConfig("./overlayConfig.json", {UnexistingKey : 'added', OriginalKey:"replaced",name:"Bob"}, ".dotfile")).toEqual({UnexistingKey:"added",OriginalKey:"replaced",name:"Bob"});
        expect(options.overlayConfig(process.cwd() + "/overlayConfig.json", {UnexistingKey : 'added', OriginalKey:"replaced",name:"Bob"}, ".dotfile")).toEqual({UnexistingKey:"added",OriginalKey:"replaced",name:"Bob"});
    });
});

describe('Testing parse()', function () {
    var config = {"switch":false, file:"file.ext", unittest:"none", one:1, headers:[]};
    it('Expect parse to be {"switch":true, file:"readme.txt", unittest:"none", one:1}', function () {
        expect(options.parse(["--switch", "--file=readme.txt", '--headers=["content-type: application/json; charset=utf-8"]', "--yikes", "boby", "--", "one", "two"], config)).toEqual(
          {errors:null, args : ["--yikes", "boby"], end:["one", "two"]});
        expect(config).toEqual({"switch":true, file:"readme.txt", unittest:"none", headers:["content-type: application/json; charset=utf-8"], one:1});
    });
});

describe('Testing usage()', function () {
    var config = {name: "test", "switch":false, file:"file.ext"};
    it('Expect usage to be "USAGE: test -name=test --switch --file=file.ext"', function () {
        expect(options.usage(config)).toBe("USAGE: test --name=test --switch --file=file.ext");
    });
});

describe('Testing error()', function () {
    var config = {file:"file.ext"};
    it('Expect error to be UNKNOWN ARGUMENTS: "--boby", "was", "here"', function () {
        expect(options.parse(["--boby", "was", "here", "--file=readme.txt"], config)).toEqual(
          {errors:["--boby", "was", "here"], args : [], end:null});
        expect(options.error(["--boby", "was", "here"])).toBe('       UNKNOWN ARGUMENTS: "--boby", "was", "here"');
    });
});

describe('Testing readPackageConfig()', function () {
    var fs = require('fs');
    it('Expect readPackageConfig to be usage to be {version:x.x.x, unittest:default_value}', function () {
        expect(options.readPackageConfig(__dirname + "/../package.json")).not.toBeNull();
        expect(options.readPackageConfig(__dirname + "/../package.json").version).toBe(JSON.parse(fs.readFileSync(__dirname + "/../package.json")).version);
        expect(options.readPackageConfig(__dirname + "/../package.json").unittest).toBe("default_value");
    });
});

describe('Testing all()', function () {
    var config = {"switch":false, file:"file.ext", unittest:"none", unittestoverwrite:'nothging', one:1};
    process.env.UNITTEST = "Yeah!";
    process.env.UNITTESTOVERWRITE="Youpi";
    it('Expect parse to be {"switch":true, file:"readme.txt", unittest:"Yeah!", unittestoverwrite:"bob from command line", one:1}', function () {
        expect(options.mergeEnvironment(config)).toEqual(
          {"switch":false, file:"file.ext", unittest:"Yeah!", unittestoverwrite:'Youpi', one:1});
        expect(options.parse(["--switch", "--file=readme.txt", "--unittestoverwrite=bob from command line"], config)).toEqual(
          {errors:null, args : [], end:null});
        expect(config).toEqual({"switch":true, file:"readme.txt", unittest:"Yeah!", unittestoverwrite:'bob from command line', one:1});
    });
});
