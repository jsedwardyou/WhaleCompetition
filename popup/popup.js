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
        if(changes[key].newValue){
            create_url_li(changes[key].newValue, url_list);
            port.postMessage(changes[key].newValue + " true");
        }
    }
});

whale.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
        var messages = request.msg.split(" ");
        if(request.msg == 'clear'){
            clear_list();
        }
        else if(messages[0] == "chart"){
            for(var i = 0; i < labels.length; i++){
                if(messages[2] == labels[i]){
                    chart_data[i] = Number(messages[3]);
                    draw_chart();
                    return;
                }
            }
            labels.push(messages[2]);
            chart_data.push(Number(messages[3]));
            draw_chart();
            console.log(labels);
            console.log(chart_data);
        }
        else{
            handle_checkbox_message(request.msg);
        }
    }
);

//Send info to background.js
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
  check_button.name = url;
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

function handle_checkbox_message(message){
    messages = message.split(" ");
    var url_list = document.getElementById('url_list');
    if(messages[1] == 'true'){
        update_checkbox(messages[0], url_list, true);
    }
    else if(messages[1] == 'false'){
        update_checkbox(messages[0], url_list, false);
    }
}

function findURL(url, list){
    var urls = list.getElementsByTagName('li');
    for(var i = 0; i < urls.length; i++){
        if(urls[i].innerText == url){
            return urls[i];
        }

    }
    return undefined;
}

function update_checkbox(url, url_list, bool){
    var checkbox = findURL(url, url_list).lastChild;
    checkbox.checked = bool;
    checkbox.setAttribute('checked', checkbox.checked);
}

var labels = [];
var chart_data = [];
function draw_chart(){
    new Chart(document.getElementById("pie-chart"), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: "Time (sec)",
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: chart_data
          }]
        },
        options: {
          title: {
            display: true,
            text: '방해사이트'
          }
        }
    });
}

