import QtQuick 2.1
import QmlVlc 0.1

Rectangle {
	property var mouseClicked: 0; // Fix for Missing Clicks
	
	// START HOTKEYS
	function keys(event) {
	
		// send data back to On Page JavaScript for .onKeyPressed
		if (event.modifiers) {
			if (event.modifiers == Qt.ControlModifier && event.key == Qt.Key_Control) {
				fireQmlMessage("[pressed-"+event.key+"]");
			} else if (event.modifiers == Qt.MetaModifier && event.key == Qt.Key_Meta) {
				fireQmlMessage("[pressed-"+event.key+"]");
			} else if (event.modifiers == Qt.ShiftModifier && event.key == Qt.Key_Shift) {
				fireQmlMessage("[pressed-"+event.key+"]");
			} else if (event.modifiers == Qt.AltModifier && event.key == Qt.Key_Alt) {
				fireQmlMessage("[pressed-"+event.key+"]");
			} else {
				fireQmlMessage("[pressed-"+event.modifiers+"+"+event.key+"]");
			}
		} else {
			fireQmlMessage("[pressed-"+event.key+"]");
		}
		// end send data back to On Page JavaScript for .onKeyPressed

		if (contextblock.visible === true) contextblock.close();
		if (event.key == Qt.Key_Space) {
			if (typeof settings.preventKey[Qt.Key_Space] === "undefined") {
				wjs.togPause();
			}
		}
		if (event.key == Qt.Key_Escape) {
			if (typeof settings.preventKey[Qt.Key_Escape] === "undefined") {
				if (fullscreen) {
					fullscreen = false;
					if (settings.multiscreen == 1) if (vlcPlayer.audio.mute === false) vlcPlayer.toggleMute(); // Multiscreen - Mute on Playback Start
				}
			}
		}
		if (event.key == Qt.Key_F || event.key == Qt.Key_F11) {
			if (typeof settings.preventKey[Qt.Key_F] === "undefined" && typeof settings.preventKey[Qt.Key_F11] === "undefined") {
				fireQmlMessage("[check-fullscreen]");
			}
		}
		if (event.key == Qt.Key_E) {
			if (typeof settings.preventKey[Qt.Key_E] === "undefined") {
				wjs.nextFrame(500);
			}
		}
		if (event.key == Qt.Key_N) {
			if (typeof settings.preventKey[Qt.Key_N] === "undefined") {
				vlcPlayer.playlist.next();
			}
		}
		if(event.modifiers == Qt.ControlModifier) {
			if (event.key == Qt.Key_Right) {
				if (typeof settings.preventKey[Qt.ControlModifier+"+"+Qt.Key_Right] === "undefined") {
					wjs.jumpTo(60000,"forward");
				}
			} else if (event.key == Qt.Key_Left) {
				if (typeof settings.preventKey[Qt.ControlModifier+"+"+Qt.Key_Left] === "undefined") {
					wjs.jumpTo(60000,"backward");
				}
			} else if (event.key == Qt.Key_Up) {
				if (typeof settings.preventKey[Qt.ControlModifier+"+"+Qt.Key_Up] === "undefined") {
					wjs.volumeTo(8,"increase");
				}
			} else if (event.key == Qt.Key_Down) {
				if (typeof settings.preventKey[Qt.ControlModifier+"+"+Qt.Key_Down] === "undefined") {
					wjs.volumeTo(8,"decrease");
				}
			} else if (event.key == Qt.Key_L) {
				if (typeof settings.preventKey[Qt.ControlModifier+"+"+Qt.Key_L] === "undefined") {
					wjs.togglePlaylist();
				}
			}
		}
		if(event.modifiers == Qt.AltModifier) {
			if (event.key == Qt.Key_Right) {
				if (typeof settings.preventKey[Qt.AltModifier+"+"+Qt.Key_Right] === "undefined") {
					wjs.jumpTo(10000,"forward");
				}
			} else if (event.key == Qt.Key_Left) {
				if (typeof settings.preventKey[Qt.AltModifier+"+"+Qt.Key_Left] === "undefined") {
					wjs.jumpTo(10000,"backward");
				}
			}
		}
		if(event.modifiers == Qt.ShiftModifier) {
			if (event.key == Qt.Key_Right) {
				if (typeof settings.preventKey[Qt.ShiftModifier+"+"+Qt.Key_Right] === "undefined") {
					wjs.jumpTo(3000,"forward");
				}
			} else if (event.key == Qt.Key_Left) {
				if (typeof settings.preventKey[Qt.ShiftModifier+"+"+Qt.Key_Left] === "undefined") {
					wjs.jumpTo(3000,"backward");
				}
			}
		}
		if (event.key == Qt.Key_M) {
			if (typeof settings.preventKey[Qt.Key_M] === "undefined") {
				wjs.toggleMute();
				if (vlcPlayer.audio.mute) {
					wjs.setText("Muted");
				} else {
					wjs.setText("Volume " + (Math.round((250 * (vlcPlayer.volume /200))/10) *5) + "%");
				}
				wjs.refreshMuteIcon();
			}
		}
		if (event.key == Qt.Key_P) {
			if (typeof settings.preventKey[Qt.Key_P] === "undefined") {
				vlcPlayer.time = 0;
			}
		}
		if (event.key == Qt.Key_Plus || event.key == Qt.Key_BracketRight) {
			if (typeof settings.preventKey[Qt.Key_Plus] === "undefined" && typeof settings.preventKey[Qt.Key_BracketRight] === "undefined") {
				wjs.rateTo("increase");
			}
		}
		if (event.key == Qt.Key_Minus || event.key == Qt.Key_BracketLeft) {
			if (typeof settings.preventKey[Qt.Key_Minus] === "undefined" && typeof settings.preventKey[Qt.Key_BracketLeft] === "undefined") {
				wjs.rateTo("decrease");
			}
		}
		if (event.key == Qt.Key_Equal) {
			if (typeof settings.preventKey[Qt.Key_Equal] === "undefined") {
				wjs.rateTo("normal");
			}
		}
		if (event.key == Qt.Key_A) {
			if (typeof settings.preventKey[Qt.Key_A] === "undefined") {
				var kl = 0;
				for (kl = 0; typeof settings.aspectRatios[kl] !== 'undefined'; kl++) if (settings.aspectRatios[kl] == settings.curAspect) {
					if (typeof settings.aspectRatios[kl+1] !== 'undefined') {
						settings.curAspect = settings.aspectRatios[kl+1];
					} else settings.curAspect = settings.aspectRatios[0];
					
					if (settings.curAspect == "Default") {
						wjs.resetAspect();
					} else {
						wjs.changeAspect(settings.curAspect,"ratio");
					}
					
					wjs.setText("Aspect Ratio: " + settings.curAspect);
					break;
				}
			}
		}
		if (event.key == Qt.Key_C) {
			if (typeof settings.preventKey[Qt.Key_C] === "undefined") {
				var kl = 0;
				for (kl = 0; typeof settings.crops[kl] !== 'undefined'; kl++) if (settings.crops[kl] == settings.curCrop) {
					if (typeof settings.crops[kl+1] !== 'undefined') {
						settings.curCrop = settings.crops[kl+1];
					} else settings.curCrop = settings.crops[0];
					if (settings.curCrop == "Default") {
						wjs.resetAspect();
					} else {
						wjs.changeAspect(settings.curCrop,"crop");
					}
					
					wjs.setText("Crop: " + settings.curCrop);
					break;
				}
			}
		}
		if (event.key == Qt.Key_Z) {
			if (typeof settings.preventKey[Qt.Key_Z] === "undefined") {
				var kl = 0;
				for (kl = 0; typeof settings.zooms[kl] !== 'undefined'; kl++) if (settings.curZoom == kl) {
					if (typeof settings.zooms[kl+1] !== 'undefined') {
						settings.curZoom = kl +1;
					} else settings.curZoom = 0;
					
					wjs.changeZoom(settings.zooms[settings.curZoom][0]);
					
					wjs.setText("Zoom Mode: " + settings.zooms[settings.curZoom][1]);
					break;
				}
			}
		}
		if (event.key == Qt.Key_T) {
			if (typeof settings.preventKey[Qt.Key_T] === "undefined") {
				wjs.setText(showtime.text.trim());
			}
		}
	}
	// END HOTKEYS
	
	
	// MOUSE ACTIONS
	function mouseScroll(mouseX,mouseY) {
		// Change Volume on Mouse Scroll
		if (mouseY > 0) wjs.volumeTo(8,"increase");
		if (mouseY < 0) wjs.volumeTo(8,"decrease");
		// End Change Volume on Mouse Scroll
	}
	function mouseMoved(mouseX,mouseY) {
		settings.ismoving = 1;  // Reset Idle Mouse Movement if mouse position has changed
		
		if (settings.mouseevents == 1) {
			// JavaScript Mouse Events Demo
			var sendjsdata = {};
			sendjsdata["type"] = "mouseMove";
			sendjsdata["x"] = mouseX;
			sendjsdata["y"] = mouseY;
			
			fireQmlMessage(JSON.stringify(sendjsdata));
		}
	
		settings.cursorX = mouseX;
		settings.cursorY = mouseY;
	}
	function mouseDblClick(clicked) {
		if (settings.multiscreen == 0) {
			if (settings.mouseevents == 1) {
				// JavaScript Mouse Events Demo
				if (vlcPlayer.state != 1) if (toolbarBackground.bottomtab.containsMouse === false) if (clicked == Qt.LeftButton) {
					var sendjsdata = {};
					sendjsdata["type"] = "mouseDoubleClick";
					
					fireQmlMessage(JSON.stringify(sendjsdata));
				}
			}
			var doit = 0;
			if (clicked == Qt.LeftButton) {
				if (settings.multiscreen == 0) doit = 1;
				if (fullscreen) if (settings.multiscreen == 1) doit = 1;
			}
			if (doit == 1) {
						
				if (vlcPlayer.state == 4) wjs.togPause();
					
				settings.gobigpause = false;
				settings.gobigplay = false;
				pausetog.visible = false;
				playtog.visible = false;
				if (!fullscreen) mouseClicked = 1; // Fix for Missing Clicks
				fireQmlMessage("[check-fullscreen]");
				mousesurface.focus = true;
			}
		}
		if (settings.multiscreen == 1) MouseClicked(clicked); // Multiscreen does not support Fullscreen Toggle on Double Click
	}
	function mouseClick(clicked) {
		mouseClicked = 1; // Fix for Missing Clicks
		if (toolbarBackground.bottomtab.containsMouse === false) {
			var sendjsdata = {};
	
			if (clicked == Qt.RightButton) {
				// JavaScript Mouse Events Demo
				if (settings.mouseevents == 1) {
					sendjsdata["type"] = "mouseRightClick";
					fireQmlMessage(JSON.stringify(sendjsdata));
				}
				if (settings.cursorX == 0 && settings.cursorY == 0) { } else {
					if (settings.multiscreen == 1 && fullscreen === false) { } else {
						contextblock.addContextItems();
						contextblock.open();
					}
				}
			} else {
				if (contextblock.visible === true) {
					contextblock.close();
				} else {
					if (settings.multiscreen == 0) {
						// Toggle Pause if clicked on Surface
						if (vlcPlayer.state != 1) {
							if (fullscreen) {
								wjs.isbig();
							} else if (ui.settings.pausePolicy == "both") wjs.isbig();
						}
						if (settings.mouseevents == 1) {
							// JavaScript Mouse Events Demo
							sendjsdata["type"] = "mouseLeftClick";
							fireQmlMessage(JSON.stringify(sendjsdata));
						}
					} else {
						if (fullscreen) {
							wjs.isbig();
						} else {
							wjs.gobig();
						}
					}
				}
			}
		}
	}
	function mouseRelease(clicked) {
		// Start Fix for Missing Clicks
		if (mouseClicked == 1) {
			mouseClicked = 0;
		} else {
			if (toolbarBackground.bottomtab.containsMouse === false) {
				var sendjsdata = {};
		
				if (clicked == Qt.RightButton) {
					// JavaScript Mouse Events Demo
					if (settings.mouseevents == 1) {
						sendjsdata["type"] = "mouseRightClick";
						fireQmlMessage(JSON.stringify(sendjsdata));
					}
					contextblock.addContextItems();
					contextblock.open();
				} else {
					if (settings.multiscreen == 0) {
						// Toggle Pause if clicked on Surface
						if (vlcPlayer.state != 1) {
							if (fullscreen) {
								wjs.isbig();
							} else if (ui.settings.pausePolicy == "both") wjs.isbig();
						}
						if (settings.mouseevents == 1) {
							// JavaScript Mouse Events Demo
							sendjsdata["type"] = "mouseLeftClick";
							fireQmlMessage(JSON.stringify(sendjsdata));
						}
					} else {
						if (fullscreen) {
							wjs.isbig();
						} else {
							wjs.gobig();
						}
					}
				}
			}
		}
		// End Fix for Missing Clicks
	}
	// END MOUSE ACTIONS
}