function getName(filename) {
	// parse filename to get title
	if (filename.indexOf("/") > -1) filename = filename.split('/').pop();
	if (filename.indexOf("\\") > -1) filename = filename.split('\\').pop();
	if (filename.indexOf(".") > -1) {
		// remove extension
		var tempName = filename.replace("."+filename.split('.').pop(),"");
		if (tempName.length > 3) filename = tempName;
		delete tempName;
	}
	filename = unescape(filename);
	filename = filename.split('_').join(' ');
	filename = filename.split('.').join(' ');
	filename = filename.split('  ').join(' ');
	filename = filename.split('  ').join(' ');
	filename = filename.split('  ').join(' ');
	
	// capitalize first letter
	filename = filename.charAt(0).toUpperCase() + filename.slice(1);
	
	return filename;
}

function getShowName(filename) {
	if (filename.indexOf("/") > -1) filename = filename.split('/').pop();
	if (filename.indexOf("\\") > -1) filename = filename.split('\\').pop();
	
	findParts = cleanName(getName(filename)).split(" ");
	newarray = [];
	for (ij = 0; typeof findParts[ij] !== 'undefined'; ij++) {
		if (isNaN(findParts[ij]) === false && (findParts[ij].length == 3 || findParts[ij].length == 4 || findParts[ij].length == 5)) {
			// stop at last number
			break;
		} else if (isNaN(findParts[ij].replace("s","").replace("e","")) === false && findParts[ij].replace("s","").replace("e","").length == 4) {
			// stop at "S01E01"
			break;
		} else if (isNaN(findParts[ij].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ij].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			// stop at "S01E01-E02"
			break;
		} else if (findParts[ij].toLowerCase().indexOf("x") > -1 && isNaN(findParts[ij].toLowerCase().replace("x","")) === false) {
			// stop at "01x01"
			var tempWorker = findParts[ij].toLowerCase().split("x");
			if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0]) === false && isNaN(tempWorker[1]) === false) break;
		} else if (findParts[ij].toLowerCase().indexOf("x") && findParts[ij].indexOf("[") == 0 && findParts[ij].indexOf("]") == findParts[ik].length && isNaN(findParts[ij].toLowerCase().replace("[","").replace("]","").replace("x","")) === false) {
			// stop at "[01x01]"
			var tempWorker = findParts[ij].toLowerCase().split("x");
			if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0].replace("[","")) === false && isNaN(tempWorker[1].replace("]","")) === false) return "s"+tempWorker[0].replace("[","")+"e"+tempWorker[1].replace("]","");
		} else if (findParts[ij].indexOf("[") == 0 && findParts[ij+1].indexOf("]") == findParts[ij+1].length && isNaN(findParts[ij].replace("[","")) === false && isNaN(findParts[ij+1].replace("]","")) === false) {
			// stop at "[01 01]"
			return "s"+findParts[ij].replace("[","")+"e"+findParts[ij+1].replace("]","");
		} else if (findParts[ij].toLowerCase() == "season") {
			// stop at "season 1 episode 5"
			if (findParts[ij+1] && findParts[ij+2] && findParts[ij+3] && isNaN(findParts[ij+1]) === false && isNaN(findParts[ij+3]) === false && findParts[ij+2].toLowerCase() == "episode") break;
		} else {
			newarray.push(findParts[ij]);
		}
	}
	
	return newarray.join(" ");
}

function getShortSzEp(filename) {
	findParts = cleanName(getName(filename)).split(" ");
	var lastNumber = 0;
	for (ik = 0; typeof findParts[ik] !== 'undefined'; ik++) {
		if (isNaN(findParts[ik]) === false && (findParts[ik].length == 2 || findParts[ik].length == 3 || findParts[ik].length == 5)) {
			lastNumber = findParts[ik];
		} else if (findParts[ik].toLowerCase().indexOf("s") > -1 && findParts[ik].toLowerCase().indexOf("e") > -1 && isNaN(findParts[ik].toLowerCase().replace("s","").replace("e","")) === false && findParts[ik].toLowerCase().replace("s","").replace("e","").length == 4) {
			// find type "S01E01"
			return findParts[ik].toLowerCase();
		} else if (findParts[ik].toLowerCase().indexOf("s") > -1 && findParts[ik].toLowerCase().indexOf("e") > -1 && isNaN(findParts[ik].toLowerCase().replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ik].toLowerCase().replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			// find type "S01E01-E02"
			return findParts[ik].split("-")[0].toLowerCase();
		} else if (findParts[ik].toLowerCase().indexOf("x") > -1 && isNaN(findParts[ik].toLowerCase().replace("x","")) === false) {
			// find type "01x01"
			var tempWorker = findParts[ik].toLowerCase().split("x");
			if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0]) === false && isNaN(tempWorker[1]) === false) return "s"+tempWorker[0]+"e"+tempWorker[1];
		} else if (findParts[ik].toLowerCase().indexOf("x") && findParts[ik].indexOf("[") == 0 && findParts[ik].indexOf("]") == findParts[ik].length && isNaN(findParts[ik].toLowerCase().replace("[","").replace("]","").replace("x","")) === false) {
			// find type "[01x01]"
			var tempWorker = findParts[ik].toLowerCase().split("x");
			if (tempWorker[0] && tempWorker[1]) if (isNaN(tempWorker[0].replace("[","")) === false && isNaN(tempWorker[1].replace("]","")) === false) return "s"+tempWorker[0].replace("[","")+"e"+tempWorker[1].replace("]","");
		} else if (findParts[ik].indexOf("[") == 0 && findParts[ik+1].indexOf("]") == findParts[ik+1].length && isNaN(findParts[ik].replace("[","")) === false && isNaN(findParts[ik+1].replace("]","")) === false) {
			// find type "[01 01]"
			return "s"+findParts[ik].replace("[","")+"e"+findParts[ik+1].replace("]","");
		} else if (findParts[ik].toLowerCase() == "season") {
			// find type "season 1 episode 5"
			if (findParts[ik+1] && findParts[ik+2] && findParts[ik+3] && isNaN(findParts[ik+1]) === false && isNaN(findParts[ik+3]) === false && findParts[ik+2].toLowerCase() == "episode") return "s"+findParts[ik+1]+"e"+findParts[ik+3];
		}
	}
	if (lastNumber != 0) {
		if (lastNumber.length == 3) return "s"+lastNumber.substr(0,1)+"e"+lastNumber.substr(1,2);
		else if (lastNumber.length == 4) return "s"+lastNumber.substr(0,2)+"e"+lastNumber.substr(2,2);
		else if (lastNumber.length == 5) return "s"+lastNumber.substr(0,2)+"e"+lastNumber.substr(2,3);
	}
	return false;
}

function getSeason(filename) {
	if (getShortSzEp(filename) !== false) return parseInt(getShortSzEp(filename).split("e")[0].replace("s",""));
}

function getEpisode(filename) {
	if (getShortSzEp(filename) !== false) return parseInt(getShortSzEp(filename).split("e")[1]);
}

function cleanName(filename) {
	return filename.replace("-"," ").replace("["," ").replace("]"," ").replace("("," ").replace(")"," ").replace(","," ").replace("  "," ").replace("  "," ").replace("  "," ").toLowerCase();
}

function sortEpisodes(results,logic) {
	logic = typeof logic !== 'undefined' ? logic : 1; // 1 - episode sort, 2 - episode sort (by .name)
	var perfect = false;
	while (!perfect) {
		perfect = true;
		results.forEach(function(el,ij) {
			if (ij > 0) {
				if (logic == 1) {
					if (getSeason(el) == getSeason(results[ij-1]) && getEpisode(el) < getEpisode(results[ij-1])) {
						results[ij] = results[ij-1];
						results[ij-1] = el;
						perfect = false;
					} else if (getSeason(el) < getSeason(results[ij-1])) {
						results[ij] = results[ij-1];
						results[ij-1] = el;
						perfect = false;
					}
				} else if (logic == 2) {
					if (getSeason(el.name) == getSeason(results[ij-1].name) && getEpisode(el.name) < getEpisode(results[ij-1].name)) {
						results[ij] = results[ij-1];
						results[ij-1] = el;
						perfect = false;
					} else if (getSeason(el.name) < getSeason(results[ij-1].name)) {
						results[ij] = results[ij-1];
						results[ij-1] = el;
						perfect = false;
					}
				}
			}
		});
	}
	return results;
}