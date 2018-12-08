var image_matrix = [];
for(var i = 0; i < 3; i++){
    image_matrix[i] = new Array(3);
}

for(var i = 0; i < 3; i++){
    for(var j = 0; j < 3; j++){
        image_matrix[i][j] = '../image/Nyang/1_' + (i+1)+"."+(j+1)+".png";
    }
}

var image = document.createElement("IMG");
var cat_type = getRandomInt(0,3);;
var cat_state = getRandomInt(0,3);;
image.src = image_matrix[cat_type][cat_state];
image.width = "380";
image.height = "708";

document.body.appendChild(image);

function getRandomInt(min, max){
    return Math.floor(Math.random()*(max-min) + min);
}

whale.sidebarAction.onClicked.addListener(function(bar){
    if(bar.opened){
        console.log("hello");
    }
});
