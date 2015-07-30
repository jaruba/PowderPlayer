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

function updateContentStyle() {
  var content = document.getElementById("content");
  if (!content)
    return;

  var left = 0;
  var top = 0;
  var width = window.outerWidth;
  var height = window.outerHeight;

  var titlebar = document.getElementById("top-titlebar");
  if (titlebar) {
    height -= titlebar.offsetHeight;
    top += titlebar.offsetHeight;
  }
  titlebar = document.getElementById("bottom-titlebar");
  if (titlebar) {
    height -= titlebar.offsetHeight;
  }
  titlebar = document.getElementById("left-titlebar");
  if (titlebar) {
    width -= titlebar.offsetWidth;
    left += titlebar.offsetWidth;
  }
  titlebar = document.getElementById("right-titlebar");
  if (titlebar) {
    width -= titlebar.offsetWidth;
  }
  width = width -10;

  var contentStyle = "position: absolute; ";
  contentStyle += "left: " + left + "px; ";
  contentStyle += "top: " + top + "px; ";
  if (maximized) contentStyle += "width: " + (width+2) + "px; ";
  else contentStyle += "width: " + width + "px; ";
  contentStyle += "height: " + (height -1) + "px; ";
  content.setAttribute("style", contentStyle);
  document.getElementById("inner-content").style.height = (height -5);
  document.getElementById("inner-in-content").style.height = (height -7);
  document.getElementById("player_wrapper").style.height = (height -7);
}

function winTitleCenter(newtitle) {
	if ($(".top-titlebar-text").hasClass("top-text-left")) $(".top-titlebar-text").removeClass("top-text-left").addClass("top-text-center");
	$(".top-titlebar-text").html(newtitle);
}

function winTitleLeft(newtitle) {
	if ($(".top-titlebar-text").hasClass("top-text-center")) $(".top-titlebar-text").removeClass("top-text-center").addClass("top-text-left");
	$(".top-titlebar-text").html(newtitle);
}
