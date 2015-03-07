var fs = require('fs');
var path = require('path');
var vm = require('vm');

var Packet = require('../packet');

var test = require('tap').test;

var fixtureDir = path.join(__dirname, 'fixtures');

var files = fs.readdirSync(fixtureDir).filter(function (f) { return /\.bin$/.test(f); });

files.forEach(function (file) {
  test('can parse ' + file, function (t) {
    var bin = fs.readFileSync(path.join(fixtureDir, file));
    var jsFile = path.join(fixtureDir, file.replace(/\.bin$/, '.js'));
    var js = 'foo = ' + fs.readFileSync(jsFile, 'utf8');
    js = vm.runInThisContext(js, jsFile);
    var ret = Packet.parse(bin);
    t.equivalent(ret, js);
    t.end();
  });
});
