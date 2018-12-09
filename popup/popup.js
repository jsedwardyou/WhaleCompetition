//------------------------------------------------------------variables
var clear = document.getElementById("clear_list");
var start = document.getElementById('myonoffswitch');
var port;
var pie_chart;
var labels; var chart_data;

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
        var url_list = document.getElementById('url_list');
        console.log(messages);
        if(request.msg == 'draw'){
            var timer_list = request.timer_list;
            var total_time = request.total_time;
            for(var i = 0; i < timer_list.length; i++){
                if(!labels.includes(timer_list[i].name)){
                    labels.push(timer_list[i].name);
                    chart_data.push(timer_list[i].time);
                }
                else{
                    var found = labels.indexOf(timer_list[i].name);
                    console.log(found);
                    chart_data[found] = timer_list[i].time;
                }

            }
            pie_chart.update();
        }
        switch(messages[0]){
            case 'initialize':
                pie_chart = draw_chart(request.total_time,request.timer_list);
                var timer_list = request.timer_list;
                start.checked = request.start_state;
                start.setAttribute('checked',start.checked);
                for(var i = 0; i < timer_list.length; i++){
                    var url = findURL(timer_list[i].name, url_list);
                    if(!url){
                        var node = create_url_li(timer_list[i].name, url_list);
                        node.childNodes[1].checked = timer_list[i].active;
                        node.childNodes[1].setAttribute('checked', node.childNodes[1].checked);
                        node.childNodes[0].checked = timer_list[i].blocked;
                        node.childNodes[0].setAttribute('checked', node.childNodes[2].checked);
                    }
                }
            break;
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
            case 'checkbox':
                handle_checkbox_message(messages);
            break;
            case 'roll_back':
                reload_page(request);
            break;
            case 'blocking':
                var url = findURL(messages[1], url_list);
                if(messages[2] == 'true'){
                    url.childNodes[0].checked = true;
                    url.childNodes[0].setAttribute('checked', url.childNodes[0].checked);
                }
                else if (messages[2] =='false'){
                    url.childNodes[0].checked = false;
                    url.childNodes[0].setAttribute('checked', url.childNodes[0].checked);
                }
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
    //initialize_URL();
    //Setup port
    port = chrome.extension.connect({
        name: 'background'
    });
    port.postMessage('initialized');
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
    warning_box.setAttribute('class', "apple-switch");
    blocking_box.setAttribute('class', "apple-switch");
  //Add new Elements to the url_list
  node.appendChild(blocking_box);
  node.appendChild(warning_box);
  node.appendChild(textnode);
  url_list.appendChild(node);
  return node;
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

function draw_chart(total_time, timer_list){
    var chart;
    labels = []; chart_data = [];
    for(var i = 0; i < timer_list.length; i++){
        if(timer_list[i].time > 0){
            labels.push(timer_list[i].name);
            chart_data.push(timer_list[i].time);
        }
    }
    chart = new Chart(document.getElementById("pie-chart"), {
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
    return chart;
}

function create_clear(){
    var clear_button = document.createElement('BUTTON');
    var t = document.createTextNode("Clear");
    clear_button.id = "clear_list";
    clear_button.appendChild(t);
    document.getElementById("url_list").appendChild(clear_button);
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

function reload_page(request){
    start.checked = request.start_state;
    start.setAttribute('checked', start.checked);

    var active_urls = request.active_urls;
    var url_list = document.getElementById('url_list');
    var urls = document.getElementsByTagName('li');
    var active_urls = request.active_urls;
    var blocked_urls = request.blocked_urls;
    for(var i = 0; i < urls.length; i++){
        urls[i].childNodes[1].checked = false;
        urls[i].childNodes[1].setAttribute('checked', urls[i].childNodes[1].checked);
        urls[i].childNodes[0].checked = false;
        urls[i].childNodes[0].setAttribute('checked', urls[i].childNodes[2].checked);
    }
    for(var i = 0; i < active_urls.length; i++){
        var url = findURL(active_urls[i], url_list);
        if(url){
            url.childNodes[1].checked = true;
            url.setAttribute('checked', url.checked);
        }
    }
    for(var i = 0; i < blocked_urls.length; i++){
        var url = findURL(blocked_urls[i], url_list);
        if(url){
            url.childNodes[0].checked = true;
            url.setAttribute('checked', url.checked);
        }
    }
}

document.addEventListener('visibilitychange',function(){
    if(document.visibilityState === 'visible'){
        console.log('visible');
    }
});
