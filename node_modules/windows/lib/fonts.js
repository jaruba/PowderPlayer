var registry = require('./registry');
module.exports = {
  getList: getList,
  getNames: getNames
};


function getList(){
  return registry('HKLM/SOFTWARE/Microsoft/Windows NT/CurrentVersion/Fonts');
}


function getNames(){
  return Object.keys(getList()).sort().reduce(function(r, font){
    var type = font.match(/((?:True|Open)Type)/);
    type = type ? type[1] : 'unknown';
    r[type].push(font.replace(/\s*\((?:True|Open)Type\)/g, ''));
    return r;
  }, { TrueType: [], OpenType: [], unknown: [] });
}


