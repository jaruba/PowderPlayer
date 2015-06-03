// natural sort order function for playlist and library
function naturalSort(arr,logic) {
	logic = typeof logic !== 'undefined' ? logic : 1; // 1 - natural sort, 2 - natural sort (by .name)
	if (arr.length > 1) {
		perfect = false;
		while (!perfect) {
			perfect = true;
			arr.forEach(function(el,ij) {
				if (arr[ij+1]) {
					if (logic == 1) difference = alphanumCase(getName(el),getName(arr[ij+1]));
					else if (logic == 2) difference = alphanumCase(getName(el.name),getName(arr[ij+1].name));
					if (difference > 0) {
						perfect = false;
						if (logic == 3 || logic == 4) {
							powGlobals.indexes[el.index]++;
							powGlobals.indexes[arr[ij+1].index]--;
						}
						arr[ij] = arr[ij+1];
						arr[ij+1] = el;
					}
				}
			});
		}
	}
	return arr;
}
function alphanumCase(a, b) {
  function chunkify(t) {
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

  for (x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      var c = Number(aa[x]), d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else return (aa[x] > bb[x]) ? 1 : -1;
    }
  }
  return aa.length - bb.length;
}