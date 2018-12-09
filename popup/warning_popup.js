var image_matrix = [];
for(var i = 0; i < 3; i++){
    image_matrix[i] = '../image/p/20' + (i+1) + ".png";
}

var image = document.createElement("IMG");
var cat_type = getRandomInt(0,3);;
image.src = image_matrix[cat_type];
document.body.appendChild(image);

function getRandomInt(min, max){
    return Math.floor(Math.random()*(max-min) + min);
}
