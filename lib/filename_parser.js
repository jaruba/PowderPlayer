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
	for (ij = 0; findParts[ij]; ij++) {
		if (isNaN(findParts[ij]) === false && findParts[ij].length == 4) {
			break;
		} else if (isNaN(findParts[ij].replace("s","").replace("e","")) === false && findParts[ij].replace("s","").replace("e","").length == 4) {
			break;
		} else if (isNaN(findParts[ij].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ij].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			break;
		} else {
			newarray.push(findParts[ij]);
		}
	}
	return newarray.join(" ");
}

function getShortSzEp(filename) {
	findParts = cleanName(getName(filename)).split(" ");
	for (ik = 0; findParts[ik]; ik++) {
		if (isNaN(findParts[ik].replace("s","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").length == 4) {
			return findParts[ik].toLowerCase();
		} else if (isNaN(findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","")) === false && findParts[ik].replace("s","").replace("e","").replace("-","").replace("e","").length == 6) {
			return findParts[ik].split("-")[0].toLowerCase();
			break;
		}
	}
	return false;
}

function cleanName(filename) {
	return filename.replace("-"," ").replace("["," ").replace("]"," ").replace("("," ").replace(")"," ").replace(","," ").replace("  "," ").replace("  "," ").replace("  "," ").toLowerCase();
}