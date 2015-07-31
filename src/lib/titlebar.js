function updateImageUrl(image_id, new_image_url) {
  var image = document.getElementById(image_id);
  if (image)
    image.src = new_image_url;
}

function addButtonHandlers(button_id, normal_image_url, hover_image_url, click_func) {
  var button = $("#"+button_id)[0];
  button.onmouseover = function() {
    updateImageUrl(button_id, "images/"+hover_image_url);
  }
  button.onmouseout = function() {
    updateImageUrl(button_id, "images/"+normal_image_url);
  }
  button.onclick = click_func;
}


function closeWindow() { window.close(); }

function winMin() { win.minimize(); }

function winRestore() { win.restore(); }

function winMax() { win.maximize(); }

function winTitleCenter(newtitle) {
	if ($(".top-titlebar-text").hasClass("top-text-left")) $(".top-titlebar-text").removeClass("top-text-left").addClass("top-text-center");
	$(".top-titlebar-text").html(newtitle);
}

function winTitleLeft(newtitle) {
	if ($(".top-titlebar-text").hasClass("top-text-center")) $(".top-titlebar-text").removeClass("top-text-center").addClass("top-text-left");
	$(".top-titlebar-text").html(newtitle);
}
