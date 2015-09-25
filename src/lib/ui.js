
var ui = {

	mechanics: {
		openPeerSelector: function() {
			if($('#max-peers').is(':visible')) $('#max-peers').hide(0,function() { $('.ui-spinner').show(0); })
		},
		
		printHistory: function() {
			$("#history-list").html("");
			historyObject = JSON.parse(localStorage.history);
			oi = 0;
			if (historyObject[oi.toString()]) {
				generateHistory = "";
				for (oi = 0; historyObject[oi.toString()]; oi++) {
					generateHistory += '<div onClick="load.history(JSON.parse(localStorage.history)['+oi.toString()+']); return false" class="actionButton history-item">'+historyObject[oi.toString()].title+'</div>';
				}
				if (oi < 7) $("#history-list").css('overflowY', 'auto');
				else $("#history-list").css('overflowY', 'scroll');
				$("#history-list").html(generateHistory);
			} else {
				generateHistory = "<div class=\"history-empty\">Your history is empty, watch something first.</span>";
				$("#history-list").css('overflowY', 'auto');
				$("#history-list").html(generateHistory);
			}
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
				overlay: 0.2,
				transitionIn: 'animated bounceInLeft',
				transitionOut: 'animated bounceOutRight'
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
			
			modalSettings.closeButtonClass = '.history-animated-close';
			$('.history-easy-modal-animated').easyModal(modalSettings);
			
			modalSettings.closeButtonClass = '.unsupported-animated-close';
			$('.unsupported-easy-modal-animated').easyModal(modalSettings);

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
	$('.ui-spinner').css("display","none");

});

$('#max-peers-hov').hover(function() { }, function() {
	if ($('.ui-spinner').is(":hover") === false) if ($('.ui-spinner').is(':visible')) $('.ui-spinner').hide(0,function() {
		$('#max-peers').text($('#spinner').val()).show(0);
		localStorage.maxPeers = parseInt($('#spinner').val());
	})
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

if (localStorage.useVLC == "1") {
	$('#use-player').val('VLC');
	$(".internal-opt").hide(0);
}
