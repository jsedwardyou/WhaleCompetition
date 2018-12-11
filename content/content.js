var img = document.createElement("IMG");
var div = document.createElement("DIV");


img.src = whale.extension.getURL('../image/Nyang/2_1.png');

img.setAttribute("margin-left", "70vw");
img.setAttribute("position", "fixed ");
div.setAttribute("position", "fixed");
div.setAttribute("width", "100%");
div.setAttribute("margin-top", "-2em");
div.setAttribute("z-index", "10");
div.setAttribute("left", "100");
div.setAttribute("top", "100");
div.setAttribute("float", "top");
div.appendChild(img);


document.body.appendChild(div);