var delaySetDownload;

function delayNewSetDownload(saveContext) {
	return function() {
		wjs().setDownloaded(saveContext);
	}
}

function delayDisable(newVideoId) {
    return function(){
		wjs().plugin.playlist.items[newVideoId].disabled = true;
    }
}

function delayLoadHistory(targetHistory) {
    return function(){
		wjs().playItem(targetHistory.currentItem);
		win.title = getName(targetHistory.playlist[wjs().currentItem()].title);
		winTitleLeft(getName(targetHistory.playlist[wjs().currentItem()].title));
    }
}

function delayFinished(kj) {
    return function(){
		if (powGlobals.files && powGlobals.files[kj]) {
			powGlobals.files[kj].finished = true;
			clearTimeout(findHashTime);
			findHash();
		}
    }
}