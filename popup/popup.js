initialize();

//Clear button
var clear = document.getElementById("clear_list");
clear.onclick = function(){
    clear_list();
};

//Storage update
whale.storage.onChanged.addListener(function(changes){
    var url_list = document.getElementById('url_list');
    for(key in changes){
        console.log(changes[key]);
        if(changes[key].newValue){
            create_url_li(changes[key].newValue, url_list);
            port.postMessage(changes[key].newValue + " true");
        }

    }
});

//Send info to background.js
var selected = [];
function checkbox_onChange(button){
    var message_to_send = "";
    if(button.checked == true){
        message_to_send = (button.id + " true");
    }else{
        message_to_send = (button.id + " false");
    }
    port.postMessage(message_to_send);
}

var port;
function initialize(){
    var clear_button = document.createElement('BUTTON');
    var t = document.createTextNode("Clear");
    clear_button.id = "clear_list";
    clear_button.appendChild(t);
    document.body.appendChild(clear_button);

    Display_URL();

    //Setup port
    port = chrome.extension.connect({
        name: 'background'
    });
}

function Display_URL(){
    var url_list = document.getElementById('url_list');

    //Check if url_list already has elements
    var urls = url_list.getElementsByTagName('li');

    whale.storage.sync.get(null, function(storage_urls){
        var allKeys = Object.keys(storage_urls);
        allKeys.forEach(function(entry){
            var has_url = false;
            var storage_url = storage_urls[entry];

            for (var i = 0; i < urls.length; i++){
                if(urls[i] == storage_url){
                    has_url = true;
                }
            }

            //If url_list does not have urls from storage, add each url to the list
            if(!has_url){
                create_url_li(storage_url, url_list);
                port.postMessage(storage_url + " true");
            }

        });
    });
}

function create_url_li(url, url_list){
  var node = document.createElement('LI');
  var textnode = document.createTextNode(url);

  //Create Check Button
  var check_button = document.createElement("input");
  check_button.type = 'checkbox';
  check_button.id = url;
  check_button.checked = true;
  check_button.onchange = function(){
    checkbox_onChange(check_button);
  };

  //Add new Elements to the url_list
  node.appendChild(textnode);
  node.appendChild(check_button);
  url_list.appendChild(node);
}

function clear_list(){
    //Clear Storage
    whale.storage.sync.clear();

    //Clear List
    var url_list = document.getElementById("url_list");
    while(url_list.firstChild){
        url_list.removeChild(url_list.firstChild);
    }
}


