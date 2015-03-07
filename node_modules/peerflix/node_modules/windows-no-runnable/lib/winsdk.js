var registry = require('./registry');


module.exports.find = findWindowsSDK;

function findWindowsSDK(){
  var winSDK = registry('HKLM/Software/Microsoft/Microsoft SDKs/Windows');
  var keys = Object.keys(winSDK);
  if (keys.length) {
    return {
      path: winSDK.CurrentInstallFolder.value,
      versions: keys.filter(function(s){ return s[0] === 'v' })
    };
  } else {
    return null;
  }
};