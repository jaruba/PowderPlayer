import _ from 'lodash';

var convertFileToObj = (results) => {
    // convert from file objects to normal objects
    return _.map(results, el => {
        return {
            name: el.name,
            path: el.path,
            size: el.size,
            type: el.type
        }
    });
}

var sorter = {

    parser: require('./parser'),

    episodes: (results, logic) => {
        if (results[0] && results[0].constructor == File) {
            var newResults = convertFileToObj(results);
        } else {
            // if it's not a file, then it may the a torrent file list
            // we need to clone it otherwise it fucks up the list
            var newResults = JSON.parse(JSON.stringify(results))
        }

        logic = typeof logic !== 'undefined' ? logic : 1; // 1 - episode sort, 2 - episode sort (by .name)
        var perfect = false;

        while (!perfect) {
            perfect = true;
            _.forEach(newResults, (el, ij) => {
                if (ij > 0) {
                    if (logic == 1) {
                        var clean = sorter.parser(el);
                        var prev = sorter.parser(newResults[ij-1]);
                    } else if (logic == 2) {
                        var clean = sorter.parser(el.name);
                        var prev = sorter.parser(newResults[ij-1].name);
                    }

                    if ((clean.season() == prev.season() && clean.episode() < prev.episode()) || (clean.season() < prev.season())) {
                        newResults[ij] = newResults[ij-1];
                        newResults[ij-1] = el;
                        perfect = false;
                    }
                }
            });
        }
        return newResults;
    },

    naturalSort: (arr, logic) => {

        if (arr[0] && arr[0].constructor == File) {
            var newResults = convertFileToObj(newResults)
        } else {
            // if it's not a file, then it may the a torrent file list
            // we need to clone it otherwise it fucks up the list
            var newResults = JSON.parse(JSON.stringify(arr))
        }

        // natural sort order function for playlist and library
        logic = typeof logic !== 'undefined' ? logic : 1; // 1 - natural sort, 2 - natural sort (by .name)

        if (newResults.length > 1) {
            var perfect = false;
            while (!perfect) {
                perfect = true;
                _.forEach(newResults, (el, ij) => {
                    if (newResults[ij+1]) {
                        if (logic == 1) var difference = sorter._alphanumCase(sorter.parser(el).name(),sorter.parser(newResults[ij+1]).name());
                        else if (logic == 2) var difference = sorter._alphanumCase(sorter.parser(el.name).name(),sorter.parser(newResults[ij+1].name).name());
                        if (difference > 0) {
                            perfect = false;
                            newResults[ij] = newResults[ij+1];
                            newResults[ij+1] = el;
                        }
                    }
                });
            }
        }
        return newResults;
    },

    _alphanumCase: (a, b) => {
      var chunkify = (t) => {
        var tz = new Array();
        var x = 0, y = -1, n = 0, i, j;

        while (i = (j = t.charAt(x++)).charCodeAt(0)) {
          var m = (i == 46 || (i >=48 && i <= 57));
          if (m !== n) {
            tz[++y] = "";
            n = m;
          }
          tz[y] += j;
        }
        return tz;
      }

      var aa = chunkify(a.toLowerCase());
      var bb = chunkify(b.toLowerCase());

      for (var x = 0; aa[x] && bb[x]; x++) {
        if (aa[x] !== bb[x]) {
          var c = Number(aa[x]), d = Number(bb[x]);
          if (c == aa[x] && d == bb[x]) {
            return c - d;
          } else return (aa[x] > bb[x]) ? 1 : -1;
        }
      }
      return aa.length - bb.length;
    }

};

module.exports = sorter;
