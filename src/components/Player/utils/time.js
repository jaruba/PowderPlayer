module.exports = {
    handleTime(millis, length) {
        if (millis < 0) millis = 0;
        if (millis > length && length > 0) millis = length;
        var seconds = Math.floor((millis / 1000) % 60);
        var minutes = Math.floor((millis / (1000 * 60)) % 60);
        var hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
        if (hours < 10 && hours > 0) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        if (!hours && length && length > 3600000) hours = '00';
        if (hours) {
            return hours + ':' + minutes + ':' + seconds;
        }
        return minutes + ':' + seconds;
    }
}