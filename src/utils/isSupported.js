
var supported = {
    ext: {
        video: ['.mkv', '.avi', '.mp4', '.m4v', '.mpg', '.mpeg', '.webm', '.flv', '.ogg', '.ogv', '.mov', '.wmv', '.3gp', '.3g2', '.m2v', '.real', '.m2ts'],
        audio: ['.m4a', '.mp3', '.flac', '.wma', '.wav'],
        subs: ['.sub', '.srt', '.vtt'],
        torrent: ['.torrent', '.magnet']
    },
    is: (file, type) => {
        if (!supported.ext[type]) return false;
        return supported.ext[type].some( el => {
            if (file.toLowerCase().endsWith(el)) return true;
        });
    }
};

supported.ext.allMedia = supported.ext.video.concat(supported.ext.audio);

module.exports = supported;
