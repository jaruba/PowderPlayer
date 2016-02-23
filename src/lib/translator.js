var translator = {
	local: { 'NoLocal': true },
	i18n: function(str) {
		if (translator.local[str]) return translator.local[str];
		else return str;
	},
	revertLocal: function() {
		var new_obj = {};
		
		for (var prop in translator.local)
			if(translator.local.hasOwnProperty(prop))
			 	new_obj[translator.local[prop]] = prop;
		
		translator.local = new_obj;
		
		return translator;
	},
	refresh: function() {
		var t = document.getElementsByTagName('i18n');
		var c = document.getElementsByClassName('i18n');
		for (var i = 0; i < t.length; i++) {
		  t[i].innerText = translator.i18n(t[i].innerText);
		}
		for (var i = 0; i < c.length; i++) {
		  if (c[i].innerText) c[i].innerText = translator.i18n(c[i].innerText);
		  if (c[i].title) c[i].title = translator.i18n(c[i].title);
		  if (c[i].placeholder) c[i].placeholder = translator.i18n(c[i].placeholder);
		}
		
		return translator;
	},
	setLocal: function(obj) {
		translator.local = require(obj);
	},
	changeLocal: function(obj) {
		if (translator.local.NoLocal) {
			translator.local = require(obj);
			translator.refresh();
		} else {
			var dummy = translator.revertLocal().refresh();
			translator.local = require(obj);
			dummy = null;
			translator.refresh();
		}
	}
};