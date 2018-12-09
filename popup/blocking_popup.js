var previous_url;
whale.runtime.onMessage.addListener({
    function(request,sender,sendResponse){
        console.log(request.msg);
        if(request.msg == 'block_popup')
            previous_url = request.previous_url;
    }
});
var image_path = '../image/Nyang/nyang-gun.gif';

var image = document.createElement("IMG");
image.src = image_path;
image.alt = "animated";
document.body.appendChild(image);

var block = document.createElement("BUTTON");
block.id = "block";
var block_text = document.createTextNode("차단하기");
block.appendChild(block_text);

var exit = document.createElement("BUTTON");
exit.id = "exit";
var exit_text = document.createTextNode("종료하기");
exit.appendChild(exit_text);

document.body.appendChild(block);
document.body.appendChild(exit);

block.onclick = function(){
    console.log(previous_url);
    whale.runtime.sendMessage({
        msg: "block",
        block_url: previous_url
    });
};

exit.onclick = function(){
    whale.tabs.query({'active': true, "currentWindow": true}, function(tabs){
        whale.tabs.remove(tabs[0].id);
    });
}
