/*****************************************************************************
* Copyright (c) 2014 Branza Victor-Alexandru <branza.alex[at]gmail.com>
*
* This program is free software; you can redistribute it and/or modify it
* under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation; either version 2.1 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program; if not, write to the Free Software Foundation,
* Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
*****************************************************************************/

import QtQuick 2.1
import QmlVlc 0.1
import "./" as LoadSettings
import "../../core" as JsLogic
import "components" as Loader

Rectangle {

	// load core javascript functions and settings
	property variant ui: {}
	LoadSettings.UIsettings { id: skinData }
	property var borderVisible: skinData.variables.settings.toolbar.borderVisible;
	property var buttonWidth: skinData.variables.settings.toolbar.buttonWidth;
	property var timeMargin: skinData.variables.settings.toolbar.timeMargin;
	property var goneBack: 0;
	property var torDataBut: 0;
	property var supressSubError: 0;
	property var onTop: false;
	property var savedSub: "-";
	property variant disables: [];
	JsLogic.Settings { id: settings }
	JsLogic.Functions { id: wjs }
	JsLogic.Hotkeys { id: hotkeys }
	JsLogic.Buttons { id: buttons }
	// end load core javascript functions and settings
	
    id: theview;
    color: ui.colors.videoBackground; // Set Video Background Color
	
	Loader.Fonts {
		id: fonts
		icons.source: ui.settings.iconFont
		defaultFont.source: ui.settings.defaultFont
		secondaryFont.source: ui.settings.secondaryFont
	}
	
	Loader.ArtworkLayer { id: artwork } // Load Artwork Layer (if set with .addPlaylist)

	Loader.VideoLayer { id: videoSource } // Load Video Layer

	// Start Subtitle Text Box
	Loader.SubtitleText {
		id: subtitlebox
		fontColor: ui.colors.font
		fontShadow: ui.colors.fontShadow
	}
	// End Start Subtitle Text Box

	// Start Top Center Text Box (Opening, Buffering, etc.)
	Loader.TopCenterText {
		id: buftext
		fontColor: ui.colors.font
		fontShadow: ui.colors.fontShadow
	}
	// End Top Center Text Box
			
	// Draw Play Icon (appears in center of screen when Toggle Pause)
	Loader.BigPlayIcon {
		id: playtog
		color: ui.colors.bigIconBackground
		icon: ui.icon.bigPlay
		iconColor: ui.colors.bigIcon
	}
	// End Draw Play Icon (appears in center of screen when Toggle Pause)
	
	// Draw Pause Icon (appears in center of screen when Toggle Pause)
	Loader.BigPauseIcon {
		id: pausetog
		color: ui.colors.bigIconBackground
		icon: ui.icon.bigPause
		iconColor: ui.colors.bigIcon
	}
	// End Draw Pause Icon (appears in center of screen when Toggle Pause)
		
	// Start Loading Screen
	Loader.SplashScreen {
		id: splashScreen
		color: ui.colors.videoBackground
		fontColor: ui.colors.font
		fontShadow: ui.colors.fontShadow
		onLogoEffect: wjs.fadeLogo()
	}
	// End Loading Screen
	
	// Start Top Right Text Box
	Loader.TopRightText {
		id: volumebox
		fontColor: ui.colors.font
		fontShadow: ui.colors.fontShadow
	}
	// End Top Right Text Box
			
	// Mouse Area over entire Surface (check mouse movement, toggle pause when clicked) includes Toolbar
	Loader.MouseSurface {
		id: mousesurface
		onWidthChanged: wjs.onSizeChanged();
		onHeightChanged: wjs.onSizeChanged();
		onPressed: hotkeys.mouseClick(mouse.button);
		onReleased: hotkeys.mouseRelease(mouse.button);
		onDoubleClicked: hotkeys.mouseDblClick(mouse.button);
		onPositionChanged: hotkeys.mouseMoved(mouse.x,mouse.y);
		onWheel: hotkeys.mouseScroll(wheel.angleDelta.x,wheel.angleDelta.y);
		Keys.onPressed: hotkeys.keys(event);		
		
		// Title Bar (top bar)
		Loader.TitleBar {
			id: topText
			fontColor: ui.colors.titleBar.font
			backgroundColor: ui.colors.titleBar.background
			isVisible: (vlcPlayer.state == 3 || vlcPlayer.state == 4 || vlcPlayer.state == 6) ? ui.settings.titleBar == "fullscreen" ? fullscreen ? true : false : ui.settings.titleBar == "minimized" ? fullscreen === false ? true : false : ui.settings.titleBar == "both" ? true : ui.settings.titleBar == "none" ? false : false : false
			icon: settings.glyphsLoaded ? ui.icon.back : ""
			iconSize: fullscreen ? 16 : 15
		}
		// End Title Bar (top bar)
						
		// Draw Toolbar
		Loader.Toolbar {
			id: toolbar
			height: fullscreen ? 32 : 30

			Loader.ToolbarBackground {
				id: toolbarBackground
				color: ui.colors.background
				opacity: ui.settings.toolbar.opacity
			}

			// Start Left Side Buttons in Toolbar
			Loader.ToolbarLeft {
	
				// Start Playlist Previous Button
				Loader.ToolbarButton {
					id: prevBut
					icon: settings.glyphsLoaded ? ui.icon.prev : ""
					iconSize: fullscreen ? 8 : 7
					visible: vlcPlayer.playlist.itemCount > 1 ? true : false
					glow: ui.settings.buttonGlow
					onButtonClicked: buttons.clicked("prev");
				}
				Loader.ToolbarBorder {
					color: ui.colors.toolbar.border
					anchors.left: prevBut.right
					visible: prevBut.visible ? borderVisible : false
				}
				// End Playlist Previous Button
	
				// Start Play/Pause Button
				Loader.ToolbarButton {
					id: playButton
					icon: settings.glyphsLoaded ? vlcPlayer.playing ? ui.icon.pause : vlcPlayer.state != 6 ? ui.icon.play : ui.icon.replay : ""
					iconSize: fullscreen ? 14 : 13
					anchors.left: prevBut.visible ? prevBut.right : parent.left
					anchors.leftMargin: prevBut.visible ? 1 : 0
					glow: ui.settings.buttonGlow
					onButtonClicked: buttons.clicked("play");
				}
				Loader.ToolbarBorder {
					color: ui.colors.toolbar.border
					anchors.left: playButton.right
					visible: borderVisible
				}
				// End Play/Pause Button
	
				// Start Playlist Next Button
				Loader.ToolbarButton {
					id: nextBut
					icon: settings.glyphsLoaded ? ui.icon.next : ""
					iconSize: fullscreen ? 8 : 7
					anchors.left: playButton.right
					anchors.leftMargin: 1
					visible: vlcPlayer.playlist.itemCount > 1 ? true : false
					glow: ui.settings.buttonGlow
					onButtonClicked: buttons.clicked("next");
				}
				Loader.ToolbarBorder {
					visible: nextBut.visible ? borderVisible : false
					anchors.left: nextBut.right
					color: ui.colors.toolbar.border
				}
				// End Playlist Next Button
				
				// Start Mute Button
				Loader.ToolbarButton {
					id: mutebut
					anchors.left: nextBut.visible ? nextBut.right : playButton.right
					anchors.leftMargin: 1
					icon: settings.glyphsLoaded ? vlcPlayer.state == 0 ? ui.icon.volume.medium : vlcPlayer.position == 0 && vlcPlayer.playlist.currentItem == 0 ? settings.automute == 0 ? ui.icon.volume.medium : ui.icon.mute : vlcPlayer.audio.mute ? ui.icon.mute : vlcPlayer.volume == 0 ? ui.icon.mute : vlcPlayer.volume <= 30 ? ui.icon.volume.low : vlcPlayer.volume > 30 && vlcPlayer.volume <= 134 ? ui.icon.volume.medium : ui.icon.volume.high : ""
					iconSize: fullscreen ? 17 : 16
					width: skinData.done === true ? ui.settings.toolbar.buttonMuteWidth : skinData.variables.settings.toolbar.buttonMuteWidth
					glow: ui.settings.buttonGlow
					onButtonClicked: buttons.clicked("mute");
					onButtonEntered: wjs.refreshMuteIcon();
					onButtonExited: wjs.refreshMuteIcon();

				}
				// End Mute Button
				
				// Start Volume Control
				Loader.VolumeHeat {
									
					Loader.VolumeHeatMouse {
						id: volumeMouse
						onPressAndHold: wjs.hoverVolume(mouseX,mouseY)
						onPositionChanged: wjs.clickVolume(mouseX,mouseY)
						onReleased: wjs.clickVolume(mouseX,mouseY)
					}
					Loader.VolumeHeatGraphics {
						id: volheat
						backgroundColor: ui.colors.volumeHeat.background
						volColor: ui.colors.volumeHeat.color
					}
	
				}
				// End Volume Control

				Loader.ToolbarBorder {
					id: volumeBorder
					anchors.left: mutebut.right
					anchors.leftMargin: settings.firstvolume == 1 ? 0 : mutebut.hover.containsMouse ? 130 : volumeMouse.dragger.containsMouse ? 130 : 0
					color: ui.colors.toolbar.border
					visible: borderVisible
					Behavior on anchors.leftMargin { PropertyAnimation { duration: 250 } }
				}
	
				// Start "Time / Length" Text in Toolbar
				Loader.ToolbarTimeLength {
					id: showtime
					text: wjs.getTime(vlcPlayer.time)
					color: ui.colors.toolbar.currentTime
				}
				Loader.ToolbarTimeLength {
					anchors.left: showtime.right
					anchors.leftMargin: 0
					text: settings.errorLength == 6 ? settings.customLength > 0 ? " / "+ wjs.getLengthTime() : showtime.text.length > 5 ? " / 00:00:00" : " / 00:00" : " / "+ wjs.getLengthTime()
					color: ui.colors.toolbar.lengthTime
				}
				// End "Time / Length" Text in Toolbar
			}
			// End Left Side Buttons in Toolbar
			
			// Start Right Side Buttons in Toolbar
			Loader.ToolbarRight {
				// Start Open Subtitle Menu Button
				Loader.ToolbarBorder {
					color: ui.colors.toolbar.border
					visible: subButton.visible ? borderVisible : false
				}
				Loader.ToolbarButton {
					id: subButton
					icon: settings.glyphsLoaded ? ui.icon.subtitles : ""
					iconSize: fullscreen ? 17 : 16
					anchors.right: playlistButton.visible? playlistButton.left : fullscreenButton.left
					anchors.rightMargin: 1
					visible: false
					glow: ui.settings.buttonGlow
					onButtonClicked: buttons.clicked("subtitles");
				}
				// End Open Subtitle Menu Button
				
				// Start Open Playlist Button
				Loader.ToolbarBorder {
					color: ui.colors.toolbar.border
					anchors.right: playlistButton.left
					visible: playlistButton.visible ? borderVisible : false
				}
				Loader.ToolbarButton {
					id: playlistButton
					icon: settings.glyphsLoaded ? ui.icon.playlist : ""
					iconSize: fullscreen ? 18 : 17
					visible: false
					anchors.right: fullscreenButton.left
					anchors.rightMargin: 1
					glow: ui.settings.buttonGlow
					onButtonClicked: buttons.clicked("playlist");
				}
				// End Open Playlist Button
				
				// Fullscreen Button
				Loader.ToolbarBorder {
					color: ui.colors.toolbar.border
					anchors.right: fullscreenButton.left
					visible: borderVisible
				}
				Loader.ToolbarButton {
					id: fullscreenButton
					anchors.right: parent.right
					icon: settings.glyphsLoaded ? fullscreen ? ui.icon.minimize : ui.icon.maximize : ""
					iconSize: fullscreen ? 18 : 17
					iconElem.color: settings.allowfullscreen == 1 ? hover.containsMouse ? ui.colors.toolbar.buttonHover : ui.colors.toolbar.button : ui.colors.toolbar.buttonHover
					hover.cursorShape: settings.allowfullscreen == 1 ? toolbar.opacity == 1 ? Qt.PointingHandCursor : mousesurface.cursorShape : Qt.ForbiddenCursor
					opacity: settings.allowfullscreen == 1 ? 1 : 0.2
					color: settings.allowfullscreen == 1 ? "transparent" : "#000000"
					glow: ui.settings.buttonGlow
					onButtonClicked: buttons.clicked("fullscreen");
				}
				// End Fullscreen Button
			}
			// End Right Side Buttons in Toolbar
		}
		// End Draw Toolbar
		
		// Draw Time Bubble (visible when hovering over Progress Bar)
		Loader.TimeBubble {
			id: timeBubble
			fontColor: ui.colors.timeBubble.font
			backgroundIcon: settings.glyphsLoaded ? timeBubble.srctime.length > 5 ? ui.icon.timeBubble.big : timeBubble.srctime.length == 0 ? "" : ui.icon.timeBubble.small : ""
			backgroundColor: ui.colors.timeBubble.background
			backgroundBorder: ui.colors.timeBubble.border
			backgroundOpacity: 0.9
		}
		// End Time Bubble

		// Draw Progression Bar
        Loader.ProgressBar {
			id: progressBar
			backgroundColor: ui.colors.progress.background
			viewedColor: ui.colors.progress.viewed
			positionColor: ui.colors.progress.position
			cache.visible: vlcPlayer.state > 0 ? ui.settings.caching : false // fix for non-notify issue
			cache.color: ui.colors.progress.cache
			onPressed: wjs.progressDrag(mouseX,mouseY);
			onChanged: wjs.progressChanged(mouseX,mouseY);
			onReleased: wjs.progressReleased(mouseX,mouseY);
		}
		// End Draw Progress Bar
		

		// Start Playlist Menu
		Loader.Menu {
			id: playlistblock
			background.color: ui.colors.playlistMenu.background
			height: 273
			
			// Start Playlist Menu Scroll
			Loader.MenuScroll {
				id: playlistScroll
				draggerColor: ui.colors.playlistMenu.drag
				backgroundColor: ui.colors.playlistMenu.scroller
				onDrag: wjs.movePlaylist(mouseY)
				dragger.height: (playlist.totalPlay * 40) < playlistScroll.height ? playlistScroll.height : (playlistScroll.height / (playlist.totalPlay * 40)) * playlistScroll.height
			}
			// End Playlist Menu Scroll
		
			Loader.MenuContent {
				width: playlistblock.width < 694 ? (playlistblock.width -12) : 682
				anchors.top: parent.top
				anchors.topMargin: 6
				anchors.left: parent.left
				anchors.leftMargin: 6
				height: 260
				
				Loader.PlaylistMenuItems { id: playlist } // Playlist Items Holder (This is where the Playlist Items will be loaded)
		
				// Top Holder (Title + Close Button)
				Loader.MenuHeader {
					text: "Playlist Menu"
					textColor: ui.colors.playlistMenu.headerFont
					backgroundColor: ui.colors.playlistMenu.header
										
					// Start Close Playlist Button
					Loader.MenuClose {
						id: playlistClose
						icon: settings.glyphsLoaded ? ui.icon.closePlaylist : ""
						iconSize: 9
						iconColor: playlistClose.hover.containsMouse ? ui.colors.playlistMenu.closeHover : ui.colors.playlistMenu.close
						color: playlistClose.hover.containsMouse ? ui.colors.playlistMenu.closeBackgroundHover : ui.colors.playlistMenu.closeBackground
						hover.onClicked: {
							playlistblock.visible = false;
							settings.playlistmenu = false
						}
					}
					// End Close Playlist Button
				}
				// End Top Holder (Title + Close Button)
				
				// Start Playlist Menu Footer
				Rectangle {
					color: ui.colors.playlistMenu.background
					height: 28
					anchors.bottom: parent.bottom
					anchors.bottomMargin: 0
					width: parent.width
					MouseArea { hoverEnabled: true; anchors.fill: parent; }
					Rectangle {
						anchors.top: parent.top
						anchors.topMargin: 6
						anchors.left: parent.left
						anchors.leftMargin: 76
						height: 22
						width: 80
						color: scanLibHover.containsMouse ? ui.colors.playlistMenu.closeBackgroundHover : ui.colors.playlistMenu.closeBackground
						Text {
							anchors.centerIn: parent
							text: "Scan Library"
							color: scanLibHover.containsMouse ? ui.colors.playlistMenu.closeHover : ui.colors.playlistMenu.close
							font.pointSize: 9;
						}
						MouseArea {
							id: scanLibHover
							anchors.fill: parent;
							hoverEnabled: true;
							cursorShape: Qt.PointingHandCursor;
							onClicked: {
								fireQmlMessage("[scan-library]");
							}
						}
					}
					Rectangle {
						anchors.top: parent.top
						anchors.topMargin: 6
						anchors.left: parent.left
						anchors.leftMargin: 0
						height: 22
						width: 70
						color: addVideoHover.containsMouse ? ui.colors.playlistMenu.closeBackgroundHover : ui.colors.playlistMenu.closeBackground
						Text {
							anchors.centerIn: parent
							text: "Add Video"
							color: addVideoHover.containsMouse ? ui.colors.playlistMenu.closeHover : ui.colors.playlistMenu.close
							font.pointSize: 9;
						}
						MouseArea {
							id: addVideoHover
							anchors.fill: parent;
							hoverEnabled: true;
							cursorShape: Qt.PointingHandCursor;
							onClicked: {
								fireQmlMessage("[add-video]");
							}
						}
					}
				}
				// End Playlist Menu Footer
				
			}
		}
		// End Playlist Menu

		// Start Subtitle Menu
		Loader.Menu {
			id: subMenublock
			background.color: ui.colors.playlistMenu.background
			
			// Start Subtitle Menu Scroll
			Loader.MenuScroll {
				id: subMenuScroll
				draggerColor: ui.colors.playlistMenu.drag
				backgroundColor: ui.colors.playlistMenu.scroller
				onDrag: wjs.moveSubMenu(mouseY)
				dragger.height: (settings.totalSubs * 40) < 240 ? 240 : (240 / (settings.totalSubs * 40)) * 240
				height: 240
			}
			// End Subtitle Menu Scroll
		
			Loader.MenuContent {
				width: subMenublock.width < 694 ? (subMenublock.width -12) : 682
				anchors.centerIn: parent
				
				Loader.SubtitleMenuItems { id: subMenu } // Subtitle Items Holder (This is where the Playlist Items will be loaded)
		
				// Top Holder (Title + Close Button)
				Loader.MenuHeader {
					text: "Subtitle Menu"
					textColor: ui.colors.playlistMenu.headerFont
					backgroundColor: ui.colors.playlistMenu.header
										
					// Start Close Subtitle Menu Button
					Loader.MenuClose {
						id: subMenuClose
						icon: settings.glyphsLoaded ? ui.icon.closePlaylist : ""
						iconSize: 9
						iconColor: subMenuClose.hover.containsMouse ? ui.colors.playlistMenu.closeHover : ui.colors.playlistMenu.close
						color: subMenuClose.hover.containsMouse ? ui.colors.playlistMenu.closeBackgroundHover : ui.colors.playlistMenu.closeBackground
						hover.onClicked: {
							subMenublock.visible = false;
							settings.subtitlemenu = false;
						}
					}
					// End Close Subtitle Menu Button
				}
				// End Top Holder (Title + Close Button)
				
			}
		}
		// End Subtitle Menu
		
		// Start Subtitle Notification
		Loader.SubtitleNotification {
			id: subNotif
			fontColor: ui.colors.font
			fontShadow: ui.colors.fontShadow
		}
		// End Subtitle Notification
		
		// Start Context Menu
		Loader.ContextMenu {
			id: contextblock
			color: ui.colors.playlistMenu.background
			border.color: "#979595"
		}
		// End Context Menu
	
    }
	// End Mouse Area over entire Surface (check mouse movement, toggle pause when clicked) [includes Toolbar]
		
	Component.onCompleted: wjs.onQmlLoaded()
}
