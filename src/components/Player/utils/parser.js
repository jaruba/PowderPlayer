var parser = path => {
        
    function webize() {
        if (['http','pow:'].indexOf(path.substr(0,4)) == -1 && ['file:///','magnet:?'].indexOf(path.substr(0,8)) == -1) {
            return "file:///"+path.split("\\").join("/");
        }
        else return path;
    }
    
    function deWebize() {
        if (path.indexOf("file:///") > -1) {
            if (!isWin) return path.replace("file:///","");
            else return path.replace("file:///","").split("/").join("\\");
        } else return path;
    }
    
    function decodeURI() {
        if (path.indexOf("%") > -1) return decodeURIComponent(path);
        return path;
    }
    
    function filename() {
        if (path.indexOf("/") > -1) return path.split('/').pop();
        else if (path.indexOf("\\") > -1) return path.split('\\').pop();
        return path;
    }
    
    function extension() {
        if (path.indexOf('.') > -1) return path.split('.').pop().toLowerCase();
        else return false;
    }
    
    function name() {
        // parse filename to get title
        path = this.filename();
        if (path.indexOf(".") > -1) {
            // remove extension
            var tempName = path.replace("."+path.split('.').pop(),"");
            if (tempName.length > 3) path = tempName;
        }
        path = unescape(path);
        path = path.split('_').join(' ').split('.').join(' ').split('  ').join(' ').split('  ').join(' ').split('  ').join(' ');
        
        // capitalize first letter
        path = path.charAt(0).toUpperCase() + path.slice(1);
        
        return path;
    }
    
    function showName() {
        var path = this.filename();
        
        var clean = parser(parser(path).name());
        var findParts = clean.cleanName().split(" ");
    
        var newarray = [];
        for (var ij = 0; typeof findParts[ij] !== 'undefined'; ij++) {
            if (isNaN(findParts[ij]) === false && [3,4,5].indexOf(findParts[ij].length) > -1) {
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
    
    function shortSzEp() {
        var findParts = parser(this.name()).cleanName().split(" ");
        var lastNumber = 0;
        for (var ik = 0; typeof findParts[ik] !== 'undefined'; ik++) {
            if (isNaN(findParts[ik]) === false && [2,3,4].indexOf(findParts[ik].length) > -1) {
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
    
    function season() {
        if (this.shortSzEp() !== false) return parseInt(this.shortSzEp().split("e")[0].replace("s",""));
    }
    
    function episode() {
        if (this.shortSzEp() !== false) return parseInt(this.shortSzEp().split("e")[1]);
    }
    
    function cleanName() {
        return path.split("-").join(" ").split("[").join(" ").split("]").join(" ").split("(").join(" ").split(")").join(" ").split(",").join(" ").split("  ").join(" ").split("  ").join(" ").split("  ").join(" ").toLowerCase();
    };

    return Object.freeze({ name: name, showName: showName, shortSzEp: shortSzEp, season: season, episode: episode, cleanName: cleanName, filename: filename, extension: extension, webize: webize, deWebize: deWebize, decodeURI: decodeURI });
}

module.exports = parser;