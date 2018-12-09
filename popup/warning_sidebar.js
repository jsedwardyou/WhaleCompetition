var message_matrix = [];
var image_matrix = [];

for(var i = 0; i < 3; i++){
    image_matrix[i] = new Array(3);
    message_matrix[i] = new Array(3);
}

for(var i = 0; i < 3; i++){
    for(var j = 0; j < 3; j++){
        message_matrix[i][j] = '../image/m/m' + (i+1) + "." + (j+1) + ".png";
        image_matrix[i][j] = '../image/Nyang/1_' + (i+1)+"."+(j+1)+".png";
    }
}

var message = document.createElement("IMG");
var image = document.createElement("IMG");
var cat_type = getRandomInt(0,3);
var cat_state = getRandomInt(0,3);
message.src = message_matrix[cat_type][cat_state];
image.src = image_matrix[cat_type][cat_state];
image.width = "360";
image.height = "360";
message.align = "bottom";
image.align = "bottom";

document.body.appendChild(message);
document.body.appendChild(image);

function getRandomInt(min, max){
    return Math.floor(Math.random()*(max-min) + min);
}

whale.sidebarAction.onClicked.addListener(function(bar){
    if(bar.opened){
        console.log("hello");
    }
});