module.exports = {
    ext: {
        allMedia: ['.mkv', '.avi', '.mp4', 'm4v', '.mpg', '.mpeg', '.webm', '.flv', '.ogg', '.ogv', '.ogm', '.mov', '.wmv', '.3gp', '.3g2', '.m4a', '.mp3', '.flac', '.m2v', '.real', '.asf'],
        video: ['.mkv', '.avi', '.mp4', '.m4v', '.mpg', '.mpeg', '.webm', '.flv', '.ogg', '.ogv', '.mov', '.wmv', '.3gp', '.3g2', '.m2v', '.real'],
        audio: ['.m4a', '.mp3', '.flac', '.wma', '.wav'],
        subs: ['.sub', '.srt', '.vtt'],
        torrent: ['.torrent', '.magnet']
    },
    is: (file, type) => {
        if (!this.ext[type]) return false;
        return this.ext[type].some( el => {
            if (file.toLowerCase().endsWith(el)) return true;
        });
    }
}