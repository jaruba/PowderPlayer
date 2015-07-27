function keepAwake() {
	var video = document.createElement('video');

	if (document.getElementById("keepAwake") === null) {
		video.src = 'lib/keep_awake/dummy.ogv';
		video.id = "keepAwake";
		video.autoplay = true;
		video.loop = true;
		video.muted = true;
		video.width = 1;
		video.height = 1;
		video.style.opacity = 0;
		video.style.display = "block";
		document.body.appendChild(video);
		video.load();
	}
}

function letSleep() {
	if (document.getElementById("keepAwake")) document.getElementById("keepAwake").remove();
}