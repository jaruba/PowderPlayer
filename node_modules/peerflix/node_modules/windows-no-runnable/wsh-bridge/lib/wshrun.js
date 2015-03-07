var subprocess = require('child_process'), path = require('path');

module.exports = run;

function run(file, callback, type){
	file = path.normalize(file);
	subprocess.exec('cscript //NoLogo '+file, function(s,out){
		if (!type || type === 'json') {
			try {
				out = JSON.parse(out);
			} catch (e) {}
		}
		callback(out);
	});
}

