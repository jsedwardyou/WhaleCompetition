//------------------------------------------------------------variables
var clear = document.getElementById("clear_list");
var start = document.getElementById('start');
var port;
var labels = [];
var chart_data = [];

initialize();


//------------------------------------------------------------whale
whale.storage.onChanged.addListener(function(changes){
    var url_list = document.getElementById('url_list');

    //---------------------------Add new url to the list
    for(key in changes){
        if(changes[key].newValue){
            create_url_li(changes[key].newValue, url_list);
            port.postMessage("warning " + changes[key].newValue + " true");
        }
    }
});

whale.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
        var messages = request.msg.split(" ");
        console.log(messages);
        switch(messages[0]){
            case 'start':
                start.checked = true;
                start.setAttribute('checked', true);
            break;
            case 'stop':
                start.checked = false;
                start.setAttribute('checked', false);
            break;
            case 'clear':
                clear_list();
            break;

            case 'chart':
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
            break;

            case 'checkbox':
                handle_checkbox_message(messages);
            break;
        }
    }
);

//-------------------------------------------------------------button
clear.onclick = function(){
    clear_list();
};

start.onchange = function(){
    if(start.checked == true){
        port.postMessage("start");
    }
    else{
        port.postMessage("stop");
    }
};

//------------------------------------------------------------function
function checkbox_onChange(button){
    var message_to_send = "";
    if(button.checked == true){
        message_to_send = (button.id + " true");
    }else{
        message_to_send = (button.id + " false");
    }
    port.postMessage(message_to_send);
}

function initialize(){
    console.log(start.checked);
    initialize_URL();
    //Setup port
    port = chrome.extension.connect({
        name: 'background'
    });
}

function initialize_URL(){
    var url_list = document.getElementById('url_list');

    //Check if url_list already has elements
    var urls = url_list.getElementsByTagName('li');

    whale.storage.sync.get(null, function(storage_urls){
        var allKeys = Object.keys(storage_urls);
        allKeys.forEach(function(entry){
            var url = storage_urls[entry];
            create_url_li(url, url_list);
            port.postMessage("warning " + url + " true");
        });
    });
}

function create_url_li(url, url_list){
  var node = document.createElement('LI');
  var textnode = document.createTextNode(url);

  //Create Check Button
  var warning_box = create_warning_box(url);
  var blocking_box = create_block_box(url);

  //Add new Elements to the url_list
  node.appendChild(textnode);
  node.appendChild(warning_box);
  node.appendChild(blocking_box);
  url_list.appendChild(node);
}

function handle_checkbox_message(messages){
    var url_list = document.getElementById('url_list');
    if(messages[2] == 'true'){
        update_checkbox(messages[1], url_list, true);
    }
    else if(messages[2] == 'false'){
        update_checkbox(messages[1], url_list, false);
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

function create_clear(){
    var clear_button = document.createElement('BUTTON');
    var t = document.createTextNode("Clear");
    clear_button.id = "clear_list";
    clear_button.appendChild(t);
    document.body.appendChild(clear_button);
}

function create_warning_box(url){
  var warning_button = document.createElement("input");
  warning_button.type = 'checkbox';
  warning_button.id = "warning " + url;
  warning_button.checked = true;
  warning_button.onchange = function(){
    checkbox_onChange(warning_button);
  };
  return warning_button;
}

function create_block_box(url){
  var blocking_button = document.createElement("input");
  blocking_button.type = 'checkbox';
  blocking_button.id = "blocking " + url;
  blocking_button.checked = false;
  blocking_button.onchange = function(){
    checkbox_onChange(blocking_button);
  }
  return blocking_button;
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

