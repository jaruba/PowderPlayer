const ArgParser= require('../ArgParser');
const test = require('./shinout.test');

var parser = ArgParser.create();
parser.vals(['m', 'mmm', 'set-hoge']);
parser.nonvals(['h', 'hhh', 'non-val']);
parser.parse(['-h', 'aa', 'hoge', 'fuga', '--mmm', 'piyo']);
var options = parser.opt();
var args = parser.arg();

test('equal', options.h, true, 'invalid : options.h');
test('deepEqual', options['non-val'], false, 'invalid : options[non-val]');
test('deepEqual', options['non-option'], undefined, 'invalid : options[non-option]');
test('equal', args[0], 'aa', 'invalid : args[0]');
test('equal', args[1], 'hoge', 'invalid : args[1]');
test('equal', args[2], 'fuga', 'invalid : args[2]');

test('equal', parser.opt('hhh'), false, 'invalid : opt(hhh)');
test('equal', parser.opt('h'), true, 'invalid : opt(h)');
test('equal', parser.opt('h', 'hhh'), true, 'invalid : opt(h, hhh)');
test('equal', parser.opt('hhh', 'h'), true, 'invalid : opt(hhh, h)');
test('deepEqual', parser.opt('non-val'), false, 'invalid : opt(non-val)');
test('deepEqual', parser.opt('non-option'), undefined, 'invalid : opt(non-option)');
test('deepEqual', parser.opt('mmm'), 'piyo', 'invalid : opt(mmm)');
test('deepEqual', parser.opt('m'), false, 'invalid : opt(m)');
test('deepEqual', parser.opt('m', 'mmm'), 'piyo', 'invalid : opt(m, mmm)');
test('deepEqual', parser.opt('mmm', 'm'), 'piyo', 'invalid : opt(mmm, m)');

test('equal', parser.arg(0), 'aa', 'invalid : arg(0)');
test('equal', parser.arg(1), 'hoge', 'invalid : arg(1)');
test('equal', parser.arg(2), 'fuga', 'invalid : arg(2)');
test('result', 'simple option test');


parser.parse(['--set-hoge', 'foo', 'bar', '-m', '23', '-h']);
var options = parser.opt();
var args = parser.arg();
test('equal', options.h, true, 'invalid : options.h');
test('equal', options.m, '23', 'invalid : options.m');
test('equal', options['set-hoge'], 'foo', 'invalid : options[set-hoge]');
test('equal', args[0], 'bar', 'invalid : args[0]');
test('result', 'option with val test');


parser.parse(['--not-option', 'foo', 'bar', '-h']);
var options = parser.opt();
var args = parser.arg();
test('equal', options.h, true, 'invalid : options.h');
test('equal', options['not-option'], true, 'invalid : options[not-option]');
test('equal', args[0], 'foo', 'invalid : args[0]');
test('equal', args[1], 'bar', 'invalid : args[1]');
test('equal', parser.getInvalids()[0], 'not-option');

test('equal', parser.getInvalids(0), 'not-option', 'invalid : getInvalids(0)');
test('result', 'invalid option test');



parser.parse(['-this-is-not-option', 'foo', 'bar', '-h']);
var options = parser.opt();
var args = parser.arg();
test('equal', options.h, true, 'invalid : options.h');
test('equal', options['this-is-not-option'], null, 'invalid : options[this-is-not-option]');
test('equal', args[0], '-this-is-not-option', 'invalid : args[0]');
test('equal', args[1], 'foo', 'invalid : args[1]');
test('equal', args[2], 'bar', 'invalid : args[2]');
test('result', '-long-name test');


parser.parse();
test('ok', process.argv[0], 'process.argv[0] is deleted');
test('ok', process.argv[1], 'process.argv[1] is deleted');
test('result', 'argv test');

// getOptionString
var opts = {s: "shortval", looong: "longval", innt: 1, nullval: null, floaat: 0.222, falseval: false};
test('equal', ArgParser.getOptionString(opts), '-s shortval --looong longval --innt 1 --floaat 0.222');
test('result', 'getOptionString test');



// file
parser = ArgParser.create().files(0, "hoge", "f");
try {
  parser.parse([__filename, '-f', __filename, "--hoge", "notexistfile"]);
}
catch (e) {
  test('ok', e.message.match("notexistfile"));
}

test('result', 'file test');


// dir
parser = ArgParser.dirs(0, "hoge", "f");
try {
  parser.parse([__dirname, '-f', __dirname, "--hoge", __filename]);
}
catch (e) {
  test('ok', e.message.match(__filename));
}

// num
parser = ArgParser.nums(0, "hoge", "f");
parser.parse(["3", '-f', "43.3", "--hoge", "-22.2"]);
test("strictEqual", parser.arg(0), 3);
test("strictEqual", parser.opt("f"), 43.3);
test("strictEqual", parser.opt("hoge"), -22.2);

test('result', 'num test');


//default
parser = ArgParser.defaults({ "hoge" : 14 });
parser.parse(["eeeee"]);
test("strictEqual", parser.opt("hoge"), 14);
parser.parse(["--hoge", "13"]);
test("strictEqual", parser.opt("hoge"), 13);
test('result', 'default test');
try {
  parser = ArgParser.nonvals("s").defaults({ "s" : 14 });
  test("ng");
}
catch (e) {
  test("ok", e.message.match("cannot have default"));
}


// ap shortcut creating
var parsed = ArgParser.parse(['ageage']);
test("strictEqual", parsed.arg(0), "ageage");
test('result', 'shortcut test');
