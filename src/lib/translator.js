var translator = {
	_langNames: {
		"Romanian": "Română",
		"French": "Français",
		"Polish": "Polskie",
		"Russian": "Pусский",
		"Portuguese (Brazil)": "Português (Brasil)"
	},
	langName: function(str) {
		if (translator._langNames[str]) return translator._langNames[str];
		else return str;
	},
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


		if (window.ctxMenu) {
			window.ctxMenu.init();
			if (localStorage.pulseRule == "disabled") {
				window.ctxMenu.playerMenu.items[0].submenu.items[4].checked = false;
			}
		}
		
		return translator;
	},
	clearModule: function(obj) {
		// deletes the previous instance of the language module
		// in case it was edited
		var clearModules = [obj];
		for (var i in clearModules) {
			if (global.require.cache) {
				for (module in global.require.cache) {
					if (global.require.cache.hasOwnProperty(module) && module.indexOf(clearModules[i]) > -1) delete global.require.cache[module];
				}
			} else if (require.cache) {
				for (module in require.cache) {
					if (require.cache.hasOwnProperty(module) && module.indexOf(clearModules[i]) > -1) delete require.cache[module];
				}
			}
		}
	},
	setLocal: function(obj) {
		translator.clearModule(obj);
		translator.local = require(obj);
	},
	changeLocal: function(obj) {
		translator.clearModule(obj);
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