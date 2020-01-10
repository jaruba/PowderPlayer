
var donateMsg = '<div style="height: 13px"></div>Powder Player is open-source, please <span style="cursor: pointer; color: #1ca8ed" onclick="window.openExternalDonate()">Donate</span> to help it\'s development.'

var tipsMsg = 'Check out Powder Player\'s Tips & Tricks <span style="cursor: pointer; color: #1ca8ed" onclick="window.openExternalFAQ()">on this page</span>, it may<br />fix issues your experiencing.'

var mainMessages = [
    '<div style="height: 13px"></div><span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Use <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">T</span> to see the progress of videos while watching.',
    '<div style="height: 13px"></div><span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Use <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">N</span> in the player to skip to the next playlist item.',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Learn about <span style="cursor: pointer; color: #1ca8ed" onclick="window.openExternalPluginShortcuts()">Plugin Shortcuts</span> to discover<br />a whole new world of content!',

    donateMsg,

    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Use <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Torrent</span> > <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Stream to LAN</span> in the Right Click menu of the player to cast torrent files to your phone or tablet through LAN!',
    '<div style="height: 1px; margin-top: -13px"></div><span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: If your torrent streaming is freezing shortly after it starts, then you should try setting the Torrent Maximum Peers to a lower value. (default is 200)',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: If a lower seeded torrent video is buffering a lot, using<br /><span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Torrent</span> > <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Force Download</span> might help the download speed!',

    donateMsg,
    tipsMsg,

    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: There is a Sleep Timer in the Right Click menu of the player to pause playback!',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Use <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Help</span> > <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Hotkeys</span> in the Right Click menu of the player to discover all the player\'s hotkeys.',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: You can Drag & Drop videos in the player to add<br />them to the playlist, or subtitles to load them.',

    donateMsg,

    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: There is a setting in Powder Player that lets you choose the limit of subtitle items to be found per language. (default is 1)',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: If you\'re trying to cast to your TV and the player doesn\'t find it, you can change the DLNA Finder in the settings and try again!',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Powder Player can be Associated with<br />Magnet Links from the Settings.',

    donateMsg,
    tipsMsg,

    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: You can use any player you want and Powder Player will handle the torrent downloading for it, set <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">External Player</span> in Settings.',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Private torrent sites can block torrent downloaders by Peer ID, in Powder Player you can customize the Peer ID from the Settings.',
    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: There is a History button on the upper side of Powder Player\'s Main Menu to rewatch any of the last 20 items you\'ve seen.',

    donateMsg,

    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Use the Plugins button on the upper side of Powder Player\'s Main Menu to discover a whole world of content.',
    '<div style="height: 13px"></div>Ask us questions on <span style="cursor: pointer; color: #1ca8ed" onclick="window.openExternalReddit()">our Reddit Page</span>.',
    'Just when I discovered the meaning of life, they changed it.<br /><span style="cursor: pointer; color: #1ca8ed" onclick="window.mainmenuDrop(null, { preventDefault: () => {}, dataTransfer: { files: [], getData: function() { return \'https://www.youtube.com/watch?v=bqW8riZ7lQg\' } } })">George Carlin</span> (Comedian 1937-2008)',

    donateMsg,
    tipsMsg,

    '<span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Pro Tip</span>: Use <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Torrent</span> > <span style="color: rgba(0,0,0,0.6); font-family: \'Roboto\',sans-serif">Download All</span> in the Right Click menu of the player to pre-download all files from a multi video torrent.',
    '<div style="height: 13px"></div><span style="cursor: pointer; color: #1ca8ed" onclick="window.openPlugin(\'.imdb\')">Watch the Newest Trailers</span> with the IMDB Plugin.',
    '<div style="height: 13px"></div><span style="cursor: pointer; color: #1ca8ed" onclick="window.openPlugin(\'.bestyt\')">Check Out Cool Videos</span> with the Best of Youtube Plugin.',

    donateMsg,

    '<div style="height: 13px"></div><span style="cursor: pointer; color: #1ca8ed" onclick="window.openPlugin(\'.standup\')">Laugh a Little</span> with the Stand-Up Plugin.',
    '<div style="height: 13px"></div><span style="cursor: pointer; color: #1ca8ed" onclick="window.openPlugin(\'.badlip\')">Laugh a Little</span> with the Bad Lip Reading Plugin.',
    '<div style="height: 13px"></div>Powder Player was first released on March 7, 2015.',

    'Powder Player is the passion project of one dedicated developer:<br /><span style="cursor: pointer; color: #1ca8ed" onclick="window.openExternalMe()">Alexandru Branza</span>',

 ]

module.exports = () => {
    return mainMessages[Math.floor(Math.random()*mainMessages.length)]
}