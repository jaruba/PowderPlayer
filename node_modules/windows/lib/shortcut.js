var path = require('path');
var fs = require('fs');
var child_process = require('child_process');


var props = module.exports.properties =
[ 'target', 'cwd', 'style', 'args',
  'icon', 'description', 'hotkey' ];

var styles = module.exports.styles =
[ 'Hidden', 'Normal', 'Minimized', 'Maximized',
  'Normal unfocused', 'Minimized unfocused' ];

var special = module.exports.specialFolders =
[ 'AllUsersDesktop', 'AllUsersStartMenu', 'AllUsersPrograms', 'AllUsersStartup',
  'Desktop', 'Favorites', 'Fonts', 'MyDocuments', 'NetHood', 'PrintHood',
  'Programs', 'Recent','SendTo', 'StartMenu', 'Startup', 'Templates' ];


module.exports.createShortcut = function createShortcut(options){ return new Shortcut(options) }


function Shortcut(options){
  Object.keys(options).forEach(function(k){
    this[k] = options[k];
  }, this);
}

Shortcut.prototype = {
  location: '',
  target: '',
  startIn: process.cwd(),
  style: 'Normal',

  create: function(callback){
    var script = './' + Date.now() + '.js';
    fs.writeFileSync(script, this.toString());
    child_process.exec('cscript //NoLogo ' + script, function(err, out){
      fs.unlink(script);
      callback(err, out);
    });
  },

  toString: function(){
    var properties = props.map(function(p){
      if (typeof this[p] === 'undefined') return '';
      return 's.'+propMap[p]+' = '+this.format(p)+';\n';
    }, this).join('');

    return [ 'var ws = WScript.CreateObject("WScript.Shell");',
             'var s = ws.CreateShortcut(' + this.format('location') + ' + "\\\\' + this.format('title')+'");',
              properties,
             's.Save(); WScript.Echo(s);' ].join('\n');
  },

  format: function(name){
    return formatters[name].call(this, this[name]);
  }
};

Object.defineProperties(Shortcut.prototype, {
  toString: { enumerable: false },
  format: { enumerable: false },
  create: { enumerable: false }
});


var propMap = {
  target:      'TargetPath',
  cwd:         'WorkingDirectory',
  style:       'WindowStyle',
  args:        'Arguments',
  icon:        'IconLocation',
  description: 'Description',
  hotkey:      'Hotkey'
};


var q = ['"', "'"];
var qMatch = [/(')/g, /(")/g];

function quotes(s) {
  if (typeof s === 'undefined') return "''";
  s = String(s).replace(/\\/g, '\\\\');
  var qWith = +(s.match(qMatch[0]) === null);
  return q[qWith] + s.replace(qMatch[1-qWith], '\\$1') + q[qWith];
}


var formatters = {
  location: function(v){
    if (~special.indexOf(v)) {
      return 'ws.SpecialFolders("'+v+'")';
    } else {
      return quotes(path.resolve(v));
    }
  },
  style: function(v){
    var index = styles.indexOf(this.style);
    return ~index ? index : 1;
  },
  title: function(v){
    return path.basename((v || this.target).slice(0, this.target.indexOf('.') + 1) + 'lnk');
  },
  cwd: function(v){
    return quotes(path.resolve(this.target).slice(0, -path.basename(this.target).length));
  },
  target: quotes,
  args: quotes,
  description: quotes,
  hotkey: quotes
}



/*

var HIDDEN = 0x1000;
var struct = {
  labels: [ HIDDEN, 'uuid', 'flags', 'attributes',   ],
  data: [ uint32, string(16), uint32, uint32, uint32, uint32, uint32, uint32, uint32, uint32, uint32 ]
}


0x000214010000000000C0000000000046

1 Uint32 Always 0000004Ch ‘L’
16 bytes uuid
1 Uint32 Flags
1 Uint32 File attributes
1 Uint32 Time 1
1 Uint32 Time 2
1 Uint32 Time 3
1 Uint32 File length
1 Uint32 Icon number
1 Uint32 ShowWnd value
1 Uint32 Hot key
2 Uint32 Unknown, always zero
http://ithreats.files.wordpress.com/2009/05/lnk_the_windows_shortcut_file_format.pdf
*/