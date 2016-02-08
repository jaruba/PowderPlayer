
var ui = {

	mechanics: {
		openPeerSelector: function() {
			if($('#max-peers').is(':visible')) $('#max-peers').hide(0,function() { $('#spinner').parent().show(0); })
		},
		
		openPeerPortSelector: function() {
			if($('#peer-port').is(':visible')) $('#peer-port').hide(0,function() { $('#peer-spinner').parent().show(0); })
		},
		
		openBufferSelector: function() {
			if($('#buffer-sel').is(':visible')) $('#buffer-sel').hide(0,function() { $('#buffer-spinner').parent().show(0); })
		},
				
		addMainButton: function(pluginId, buttonName, buttonTitle, pluginFunc, extraHtml) {
			if (!extraHtml) extraHtml = '';
			$('#main-buttons-small').append('<a class="'+buttonName+'-button easy-modal-open" href="#'+buttonName+'-powder" onClick="window.plugins[\''+pluginId+'\'][\''+pluginFunc+'\'](); return false" title="'+buttonTitle+'">'+extraHtml+'<i class="'+buttonName+'-icon"></i></a>');
			$('.'+buttonName+'-button').mouseenter(function() {
				$(this).addClass('hover');
			}).mouseleave(function() {
				$(this).removeClass('hover');
			});
			$('.'+buttonName+'-button').click(function(e) {
				var target = $(this).attr('href');
				$(target).trigger('openModal');
				e.preventDefault();
			});
		},
		
		injectFont: function(pluginId, fontName) {
			window.document.styleSheets[0].addRule('@font-face','font-family: \''+pluginId+'\'; src: url(\'file:///'+gui.App.dataPath.split('\\').join('/')+'/plugins/'+pluginId+'/'+fontName+'\');');
		},
		
		injectCSS: function(pluginId, styleName) {
			$('<link href="file:///'+gui.App.dataPath.split('\\').join('/')+'/plugins/'+pluginId+'/'+styleName+'" rel="stylesheet">').appendTo("head");
		},
		
		createModal: function(modalName,modalTitle) {
			$('#inner-in-in-content').append('<div class="'+modalName+'-easy-modal-animated modal-holder" id="'+modalName+'-powder"><h2 id="'+modalName+'-title" class="goLeft modal-title">'+modalTitle+'</h2><h2 class="change-set '+modalName+'-animated-close goRight bookmarks-close modal-close"><i class="close-icon"></i></h2><div class="clear"></div><div id="'+modalName+'-list" class="modal-list"></div></div>');
			
			modalSettings = {
				top: 200,
				overlay: 0.2,
				closeButtonClass: '.'+modalName+'-animated-close'
			};

			$('.'+modalName+'-easy-modal-animated').easyModal(modalSettings);
		},
		
		printHistory: function() {
			$("#history-list").html("");
			historyObject = JSON.parse(localStorage.history);
			oi = 0;
			if (historyObject[oi.toString()]) {
				generateHistory = "";
				for (oi = 0; historyObject[oi.toString()]; oi++) {
					generateHistory += '<div onClick="load.history(JSON.parse(localStorage.history)['+oi.toString()+']); return false" class="actionButton history-item modal-item">'+historyObject[oi.toString()].title+'</div>';
				}
				if (oi < 7) $("#history-list").css('overflowY', 'auto');
				else $("#history-list").css('overflowY', 'scroll');
				$("#history-list").html(generateHistory);
			} else {
				generateHistory = "<div class=\"history-empty modal-empty\">Your history is empty, watch something first.</span>";
				$("#history-list").css('overflowY', 'auto');
				$("#history-list").html(generateHistory);
			}
		},

		showPluginPage: function(pluginHref) {

			utils.createWindow(null, 'plugin_page.html', {
				width: 500,
				height: 500
			}, function(socket, newWindow) {

				socket.emit('href', { href: pluginHref, allPlugins: utils.availPlugins, installed: (typeof plugins[pluginHref.split('/')[1]] !== 'undefined') });
				socket.on('pluginStart', function(webData) {
					if (webData.repo) {
						plugins[webData.repo] = require(gui.App.dataPath+pathBreak+'plugins'+pathBreak+webData.repo+pathBreak+'index.js');
						if (plugins[webData.repo].init) plugins[webData.repo].init();
						if ($('#plugin-'+webData.repo).length) {
							$('#plugin-'+webData.repo).addClass('action-selected');
						}
					}
				});
				socket.on('pluginStop', function(webData) {
					if (webData.repo) {
						if (plugins[webData.repo]) {
							if (plugins[webData.repo].deInit) plugins[webData.repo].deInit();
							delete plugins[webData.repo];
						}
						if ($('#plugin-'+webData.repo).length) {
							$('#plugin-'+webData.repo).removeClass('action-selected');
						}
					}
				});
			});
		}
	},

	settings: {
		
		changeClickPause: function() {
			if (localStorage.clickPause == 'fullscreen') {
				$("#click-pause").text("Fullscreen + Windowed");
				localStorage.clickPause = "both";
			} else {
				$("#click-pause").text("only in Fullscreen");
				localStorage.clickPause = "fullscreen";
			}
		},
		
		changePulseSetting: function() {
			if (localStorage.pulseRule == 'auto') {
				$("#click-pulse").text("always");
				localStorage.pulseRule = "always";
				if ($("#menuPulsing").text() == "Disable Pulsing") $("#menuPulsing").text("Enable Pulsing");
			} else if (localStorage.pulseRule == 'always') {
				$("#click-pulse").text("disabled");
				localStorage.pulseRule = "disabled";
				if ($("#menuPulsing").text() == "Enable Pulsing") $("#menuPulsing").text("Disable Pulsing");
			} else {
				$("#click-pulse").text("auto");
				localStorage.pulseRule = "auto";
				if ($("#menuPulsing").text() == "Disable Pulsing") $("#menuPulsing").text("Enable Pulsing");
			}
		},
		
		switchPulsing: function() {
			if ($("#menuPulsing").text() == "Disable Pulsing") {
				localStorage.pulseRule = "disabled";
				$("#menuPulsing").text("Enable Pulsing");
				$("#click-pulse").text("disabled");
				ctxMenu.playerMenu.items[0].submenu.items[4].checked = false;
			} else {
				localStorage.pulseRule = "auto";
				$("#menuPulsing").text("Disable Pulsing");
				$("#click-pulse").text("auto");
				ctxMenu.playerMenu.items[0].submenu.items[4].checked = true;
			}
		},
		
		changeNoSub: function() {
			if ($("#click-no-sub").text() == "True") {
				$("#click-no-sub").text("False");
				localStorage.noSubs = "1";
			} else {
				$("#click-no-sub").text("True");
				localStorage.noSubs = "0";
			}
		},


		loadPluginList: function() {
			require('http').get('http://jaruba.github.io/powder-plugins/plugins.json', function(res){
			    var body = '';
			    res.on('data', function(chunk){ body += chunk; });
			    res.on('end', function(){
			    	try {
				        utils.availPlugins = JSON.parse(body);
						if (utils.availPlugins.length == 0) {
					    	$('#select-plugin-list').empty().html('<div onClick="ui.settings.loadPluginList(); return false" class="actionButton wrap-text"><span class="droid-bold">Couldn\'t connect. Press to try again.</span></div>');
						} else {
//					        console.log("Got a response: ", utils.availPlugins);
							$('#select-plugin-list').empty();
							utils.availPlugins.forEach(function(el) {
								if (el.repo && el.author && el.title) {
	
									generateHTML = '<div id="plugin-'+el.repo+'" onClick="ui.mechanics.showPluginPage(\''+el.author+'/'+el.repo+'\'); return false" class="actionButton wrap-text';
	
									if (plugins[el.repo]) generateHTML += ' action-selected';
	
									generateHTML += '"><span class="droid-bold">'+el.title+'</span></div>';
	
									$('#select-plugin-list').append(generateHTML);
								}
							});
						}
				    } catch(e) {
				    	$('#select-plugin-list').empty().html('<div onClick="ui.settings.loadPluginList(); return false" class="actionButton wrap-text"><span class="droid-bold">Couldn\'t connect. Press to try again.</span></div>');
				    }
			    });
			}).on('error', function(e){
			      $('#select-plugin-list').empty().html('<div onClick="ui.settings.loadPluginList(); return false" class="actionButton wrap-text"><span class="droid-bold">Couldn\'t connect. Press to try again.</span></div>');
			});
		}
		
	},

	buttons: {
		
		play: function(kj) {
			if ($("#action"+kj).hasClass("play")) {
				$("#action"+kj).removeClass("play").addClass("pause").css("background-color","#F6BC24").attr("onClick","ui.buttons.pause("+kj+")");
				powGlobals.torrent.engine.files[powGlobals.lists.files[kj].index].select();
			}
		},

		pause: function(kj) {
			if ($("#action"+kj).hasClass("pause")) {
				$("#action"+kj).removeClass("pause").addClass("play").css("background-color","#FF704A").attr("onClick","ui.buttons.play("+kj+")");
				powGlobals.torrent.engine.files[powGlobals.lists.files[kj].index].deselect();
			}
		},
		
		settings: function(kj) {
			if (parseFloat($($(".circle")[kj]).circleProgress('value')) > 0) {
				$("#openAction").attr("onClick","gui.Shell.openItem(powGlobals.torrent.engine.path+pathBreak+powGlobals.torrent.engine.files[powGlobals.lists.files["+kj+"].index].path); $('#closeAction').trigger('click'); ui.buttons.play("+kj+")");
				$("#openFolderAction").attr("onClick","gui.Shell.showItemInFolder(powGlobals.torrent.engine.path+pathBreak+powGlobals.torrent.engine.files[powGlobals.lists.files["+kj+"].index].path); $('#closeAction').trigger('click')");
				$("#openAction").show(0);
				$("#openFolderAction").show(0);
			} else {
				$("#openAction").hide(0);
				$("#openFolderAction").hide(0);
			}
			if (playerApi.supportedTypes.indexOf(utils.parser($("#file"+kj).find(".filenames").text()).extension()) > -1) {
				// if the item is a video or audio file
				powGlobals.lists.media.some(function(el,ij) {
					if (el.index == kj) {
						$("#playAction").attr("onClick","player.playItem("+ij+"); $('#closeAction').trigger('click'); $('#inner-in-content').animate({ scrollTop: 0 }, 'slow'); ui.buttons.play("+kj+"); $('#inner-in-content').css('overflow-y','hidden')");
						$("#copyStream").attr("onClick","gui.Clipboard.get().set('http://localhost:'+powGlobals.torrent.engine.server.address().port+'/"+powGlobals.lists.files[kj].index+"','text'); $('#closeAction').trigger('click')");
						$("#playAction").show(0);
						$("#copyStream").show(0);
						return false;
					}
				});
			} else {
				$("#playAction").hide(0);
				$("#copyStream").hide(0);
			}
			$("#open-file-settings").trigger("click");
		},

		urlFormAction: function() {
			if ($('#main').css("display") == "table") utils.resetPowGlobals();
			load.url(document.getElementById('magnetLink').value);
			$('.easy-modal-animated').trigger('closeModal');
		}
		
	},
	
	modals: {

		init: function() {
			$('.easy-modal').easyModal({
				top: 200,
				overlay: 0.2
			});
		
			$('.easy-modal-open').click(function(e) {
				var target = $(this).attr('href');
				$(target).trigger('openModal');
				e.preventDefault();
			});
			
			$('.main-add-url').click(ui.modals.openUrlModal);
		
			$('.easy-modal-close').click(function(e) {
				$('.easy-modal').trigger('closeModal');
			});
		
			modalSettings = {
				top: 200,
				overlay: 0.2
			};
		
			modalSettings.closeButtonClass = '.animated-close';
			$('.easy-modal-animated').easyModal(modalSettings);
			
			modalSettings.closeButtonClass = '.second-animated-close';
			$('.second-easy-modal-animated').easyModal(modalSettings);
			
			modalSettings.closeButtonClass = '.third-animated-close';
			$('.third-easy-modal-animated').easyModal(modalSettings);
			
			modalSettings.closeButtonClass = '.forth-animated-close';
			$('.forth-easy-modal-animated').easyModal(modalSettings);
			
			modalSettings.closeButtonClass = '.forth-animated-close';
			$('.ask-remove-files').easyModal(modalSettings);

			modalSettings.closeButtonClass = '.fifth-animated-close';
			$('.fifth-easy-modal-animated').easyModal(modalSettings);
			
			modalSettings.closeButtonClass = '.history-animated-close';
			$('.history-easy-modal-animated').easyModal(modalSettings);
			
			modalSettings.closeButtonClass = '.unsupported-animated-close';
			$('.unsupported-easy-modal-animated').easyModal(modalSettings);

			modalSettings.closeButtonClass = '.sub-animated-close';
			$('.sub-easy-modal-animated').easyModal(modalSettings);

		},
		
		openUrlModal: function(e) {
			var target = $(this).attr('href');
			$(target).trigger('openModal');
			$("#open-url").trigger('openModal');
			e.preventDefault();
			utils.checkInternet(function(isConnected) {
				if (isConnected) {
					$('#internet-error').hide();
					$('#internet-ok').show(1);
					$('#magnetLink').focus();
				} else {
					$('#internet-ok').hide();
					$('#internet-error').show(1);
				}
			});
			$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');
		}

	},
	
	goto: {

		mainMenu: function(nextTorrent) {
			if (dlna.instance.initiated) dlna.stop();
			if (torrent.timers.peers) clearInterval(torrent.timers.peers);
			if (torrent.timers.setDownload) clearTimeout(torrent.timers.setDownload);
			playerApi.savedHistory = false;
			if (typeof nextTorrent === 'undefined') {
				correctPlaylist = {};
				ctxMenu.disable();
				$("#inner-in-content").animate({ scrollTop: 0 }, 0);
				player.setOpeningText("Stopping");
				player.fullscreen(false);
				$("#header_container").css("display","none");
				$("#inner-in-content").css("overflow-y","hidden");
				if (parseInt($("#main").css("opacity")) == 0) $("#main").css("opacity","1");
				$('#main').css("display","table");	
				document.getElementById('magnetLink').value = "";
				$('#player_wrapper').css("min-height","1px").css("height","1px").css("width","1px");
				if ($("#open-url").hasClass("dark-add-url")) {
					$("#magnetSubmit").text("Stream");
					$("#open-url").removeClass("dark-add-url");
				}
				win.gui.setMinimumSize(530, 440);
			
				if ((win.gui.width < 530 && win.gui.height < 440) || (win.gui.width < 530 || win.gui.height < 440)) {
					win.gui.width = 530;
					win.gui.height = 440;
				}
			
				if (win.onTop) {
					win.onTop = false;
					win.gui.setAlwaysOnTop(false);
				}
		
				if ($(window).height() < $("#main").height() && !$("body").hasClass("mini")) {
					$("body").addClass("mini");
				} else if ($(window).width() < $("#main").width() && !$("body").hasClass("mini")) {
					$("body").addClass("mini");
				} else if ($(window).width() > 730 && $(window).height() > 650 && $("body").hasClass("mini")) {
					 $("body").removeClass("mini");
				}
				$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');
				player.clearPlaylist();
			} else {
				player.setOpeningText("Loading resource");
				$("#header_container").show();
			}
			player.setDownloaded(0);
			if (powGlobals.torrent.engine) {
				clearTimeout(torrent.timers.down);
				powGlobals.torrent.engine.swarm.removeListener('wire', onmagnet);
				if (dlna.params.nextStartDlna) { dlna.instance.controls.stop(); }
				if (torrent.isReady) {
					torrent.isReady = false;
					if (powGlobals.torrent.serverReady) {
						torrent.engine.kill(powGlobals.torrent.engine);
						powGlobals = {
							current: {},
							torrent: {},
							subtitles: {},
							file: {},
							lists: {}
						};
						if (typeof nextTorrent !== 'undefined') {
							utils.resetPowGlobals();
							load.torrent(nextTorrent);
						}
					} else {
						powGlobals.torrent.engine.destroy();
						powGlobals = {
							current: {},
							torrent: {},
							subtitles: {},
							file: {},
							lists: {}
						};
						if (typeof nextTorrent !== 'undefined') {
							utils.resetPowGlobals();
							load.torrent(nextTorrent);
						}
					}
				} else {
					if (powGlobals.torrent.engine) powGlobals.torrent.engine.destroy();
					powGlobals = {
						current: {},
						torrent: {},
						subtitles: {},
						file: {},
						lists: {}
					};
					if (typeof nextTorrent !== 'undefined') {
						utils.resetPowGlobals();
						load.torrent(nextTorrent);
					}
				}
			} else {
				torrent.isReady = false;
				clearTimeout(torrent.timers.down);
				if (typeof nextTorrent !== 'undefined') {
					utils.resetPowGlobals();
					load.torrent(nextTorrent);
				}
			}
			
			playerApi.firstTime = false;
			if (typeof nextTorrent === 'undefined') {
				playerApi.firstTimeEver = true;
				playerApi.firstSize = true;
				win.title.center("Powder Player");
			}
		},
		
		torrentData: function() {
			allowScrollHotkeys = false;
			if (player.fullscreen()) player.fullscreen(false);
			if (player.playing()) player.pause();
			win.gui.setMinimumSize(448, 370);
			if ((win.gui.width < 448 && win.gui.height < 370) || (win.gui.width < 448 || win.gui.height < 370)) {
				win.gui.width = 448;
				win.gui.height = 370;
				$("#filesList").css("min-height",448);
				$("#inner-in-content").animate({ scrollTop: 448 }, "slow");
			} else {
				$("#filesList").css("min-height",$("#player_wrapper").height());
				$("#inner-in-content").animate({ scrollTop: $("#player_wrapper").height() }, "slow");
			}
			if (powGlobals.lists.media.length > 1) {
				setTimeout(function() {
					win.title.left(powGlobals.torrent.engine.torrent.name);
				},600);
			}
			$("#inner-in-content").css("overflow-y","visible");
			if ($("#all-download").find(".progressbar-front-text").css("width") == "0px") $(window).trigger('resize');
		}

	}

};

$("#max-peers").text(localStorage.maxPeers);
$("#spinner").val(localStorage.maxPeers);
$("#peer-port").text(localStorage.peerPort);
$("#peer-spinner").val(localStorage.peerPort);
$("#def-folder").text(localStorage.tmpDir);
if (localStorage.libDir == "Temp") {
	$("#lib-folder").text("same as Download Folder");
} else $("#lib-folder").text(localStorage.libDir);
if (localStorage.clickPause == 'fullscreen') {
	$("#click-pause").text("only in Fullscreen");
} else $("#click-pause").text("Fullscreen + Windowed");
$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');

if (localStorage.pulseRule == "disabled") {
	$("#menuPulsing").text("Enable Pulsing");
	ctxMenu.playerMenu.items[0].submenu.items[4].checked = false;
}

if (localStorage.noSubs == "1") {
	$("#click-no-sub").text("False");
}

$("#click-pulse").text(localStorage.pulseRule);

$('#magnetLink').mousedown(function(event) {
    if (event.which == 3) {
		var clipboard = gui.Clipboard.get();
		$('#magnetLink').val(clipboard.get('text')).select();
    }
});

$(document).ready(function() {
	// initiate progress bars
    $('.progress .progress-bar').progressbar({display_text: 'center'});
	
	// initiate max peers selector (settings)
	$('#spinner').spinner({
		min: 10,
		max: 10000,
		step: 10
	});
	$('#spinner').parent().css("display","none");
	
	// initiate peer port selector (settings)
	$('#peer-spinner').spinner({
		min: 1,
		max: 65535,
		step: 1
	});
	$('#peer-spinner').parent().css("display","none");
	
	// initiate buffer size selector (settings)
	$('#buffer-spinner').spinner({
		min: 0,
		max: 60,
		step: 0.5
	});
	$('#buffer-spinner').parent().css("display","none");

});

$('#max-peers-hov').hover(function() { }, function() {
	if ($('#spinner').parent().is(":hover") === false && $('#spinner').parent().is(':visible')) {
		$('#spinner').parent().hide(0,function() {
			$('#max-peers').text($('#spinner').val()).show(0);
			localStorage.maxPeers = parseInt($('#spinner').val());
		})
	}
});

$('#peer-port-hov').hover(function() { }, function() {
	if ($('#peer-spinner').parent().is(":hover") === false && $('#peer-spinner').parent().is(':visible')) {
		$('#peer-spinner').parent().hide(0,function() {
			$('#peer-port').text($('#peer-spinner').val()).show(0);
			localStorage.peerPort = parseInt($('#peer-spinner').val());
		})
	}
});

$('#buffer-sel-hov').hover(function() { }, function() {
	if ($('#buffer-spinner').parent().is(":hover") === false && $('#buffer-spinner').parent().is(':visible')) {
		$('#buffer-spinner').parent().hide(0,function() {
			$('#buffer-sel').text($('#buffer-spinner').val()).show(0);
			localStorage.bufferSize = parseFloat($('#buffer-spinner').val());
		})
	}
});

$('#use-player').on('change', function() {
	if (this.value == "VLC") {
		localStorage.useVLC = "1";
		$(".internal-opt").hide(0);
	} else if (this.value == "Internal") {
		localStorage.useVLC = "0";
		$(".internal-opt").show(0);
	}
});

$("#sub-default-size").on('change', function() {
	localStorage.subSizeDefault = parseInt(this.value)/100;
	player.setSubSize(parseInt(this.value)/100);
});

$("#sub-default-color").on('change', function() {
	if (this.value == "White") {
		localStorage.subColor = '#fff';
	} else if (this.value == "Yellow") {
		localStorage.subColor = '#ebcb00';
	} else if (this.value == "Green") {
		localStorage.subColor = '#00e78f';
	} else if (this.value == "Cyan") {
		localStorage.subColor = '#00ffff';
	} else if (this.value == "Blue") {
		localStorage.subColor = '#00b6ea';
	}
	$('.wcp-subtitle-text').css('color', localStorage.subColor);
});

if (localStorage.useVLC == "1") {
	$('#use-player').val('VLC');
	$(".internal-opt").hide(0);
}

if (localStorage.subColor == '#fff') {
	$("#sub-default-color").val('White');
} else if (localStorage.subColor == '#ebcb00') {
	$("#sub-default-color").val('Yellow');
} else if (localStorage.subColor == '#00e78f') {
	$("#sub-default-color").val('Green');
} else if (localStorage.subColor == '#00ffff') {
	$("#sub-default-color").val('Cyan');
} else if (localStorage.subColor == '#00b6ea') {
	$("#sub-default-color").val('Blue');
}

$('.wcp-subtitle-text').css('color', localStorage.subColor);

$("#sub-default-size").val((parseFloat(localStorage.subSizeDefault)*100)+'%');

if (localStorage.bufferSize) {
	$('#buffer-spinner').val(localStorage.bufferSize);
	$('#buffer-sel').html(localStorage.bufferSize);
}