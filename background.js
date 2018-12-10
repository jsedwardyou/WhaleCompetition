//Content menu (Right Click) for adding url
whale.contextMenus.create({
    title: "방해사이트 추가하기",
    contexts: ['all'],
    onclick: add_url
});

whale.sidebarAction.setTitle({title: "집중하라냥"});

//----------------Variables----------------
var current_url;
var current_timer;
var timer_list = [];
var total_time = 0;
var is_active = false;
var blocked_urls = ["*://hello.com/*"];
var standard_time = 0;


class Timer{
    constructor(name){
        this.name = name;
        this.time = 0;
        this.active = true;
        this.blocked = false;
    }
}

initialize();

//Run update function every 1 sec
setInterval(update, 1000);

//---------------------------------------------------------------------whale
whale.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.status == "complete"){
        current_url_update();
    }
});

whale.tabs.onActivated.addListener(function(activeInfo){
    current_url_update();
});

whale.windows.onFocusChanged.addListener(function(){
    current_url_update();
});

whale.storage.onChanged.addListener(function(changes){
    whale.storage.sync.get(null, function(results){
        var allKeys = Object.keys(results);
        if(allKeys.length == 0){
            clear();
            whale.runtime.sendMessage({
                msg: "clear"
            });
        }
    });
});

whale.runtime.onMessage.addListener({
    function(request,sender,sendResponse){
        var messages = request.msg.split(" ");
        for(var i = 0; i < timer_list.length; i++){
            if(messages[1] == timer_list[i].name){
                var timer = timer_list[i];
                if(messages[1] == true){
                    timer.active = true;
                }
                else{
                    timer.active = false;
                }
            }
        }
    }
});

whale.runtime.onConnect.addListener(port => {
    if(port.name == 'background'){
        port.onMessage.addListener(message => {
            console.log(message);
            if(message == 'initialized'){
                whale.runtime.sendMessage({msg: 'initialize',
                    timer_list: timer_list,
                    start_state: is_active,
                    total_time: total_time
                });
            }
            handleCheckBoxMessage(message);
        });
    }
});

whale.sidebarAction.onClicked.addListener(result =>{
    if(result.opened){
        whale.sidebarAction.show({url: whale.runtime.getURL('popup/popup.html')});
        whale.runtime.sendMessage({
            msg: 'draw',
            total_time: total_time,
            timer_list: timer_list
        });
    }
    else if(result.opened == false){
        whale.sidebarAction.hide();
    }
});

//-------------------------------------------------------functions
function current_url_update(){
    whale.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
        if(!tabs[0]){
            current_url = undefined;
            current_timer = undefined;
            return;
        }
        current_url = new URL(tabs[0].url).hostname;
        current_timer = findTimer(current_url, timer_list);

        if(current_timer == undefined) return;
    });

    whale.runtime.sendMessage({msg: 'draw', timer_list: timer_list, total_time: total_time});
}

function handleCheckBoxMessage(message){
    console.log(message);
    if(message.msg != 'checkbox') return;

    if(message.id == 'start_box'){
        is_active = message.state;
        whale.runtime.sendMessage(message);
        return;
    }

    var temp = message.id.split(" ");
    var checkbox_type = temp[0];
    var checkbox_name = temp[1];

    var checkbox_state = message.state;

    var timer = findTimer(checkbox_name, timer_list);
    if(timer == undefined){ console.log("WARNING: no such value"); return; }

    if(checkbox_type == "warning"){
        timer.active = checkbox_state;
    }
    else if(checkbox_type == "blocking"){
        timer.blocked = checkbox_state;

        var blocked_urls = ["*://hello.com/*"];
        for(var i = 0; i < timer_list.length; i++){
            if(timer_list[i].blocked){
                var blocked_url = "*://" + timer_list[i].name + "/*";
                blocked_urls.push(blocked_url);
            }
        }
        console.log(blocked_urls);
        whale.webRequest.onBeforeRequest.removeListener(block);
        whale.webRequest.onBeforeRequest.addListener(block,
            {urls: blocked_urls},
            ["blocking"]
        );
    }
    whale.runtime.sendMessage(message);
}

function unblock_all(){
    var blocked_urls = ["*://hello.com/*"];
    whale.webRequest.onBeforeRequest.removeListener(block);
    whale.webRequest.onBeforeRequest.addListener(block,
        {urls: blocked_urls},
        ["blocking"]
    );
}

function clear(){
    timer_list = [];
    total_time = 0;
    current_timer = undefined;
    blocked_urls = ["*://hello.com/*"];
    unblock_all();
}

function findTimer(name, timer_list){
    for(var i = 0; i < timer_list.length; i++){
        if(timer_list[i].name == name)
            return timer_list[i];
    }
    return undefined;
}

function update(){
    if(current_timer && current_timer.active && is_active){
        current_timer.time++;
        total_time++;
        console.log(total_time);
        pop_up(current_timer,current_url);
        if(total_time > standard_time + 1800){
            standard_time = total_time;
        }
    }
}

function pop_up(timer){
    switch(timer.time + standard_time){
        case standard_time + 15:
            whale.sidebarAction.show({url: whale.runtime.getURL('popup/warning_sidebar.html'), reload: true});
            break;
        case standard_time + 30:
            whale.sidebarAction.show({url: whale.runtime.getURL('popup/warning_sidebar.html'), reload: true});
            break;
        case standard_time + 45:
            whale.sidebarAction.show({url: whale.runtime.getURL('popup/warning_sidebar.html'), reload: true});
            break;
        case standard_time + 300:
            whale.windows.create({url: whale.runtime.getURL('popup/warning_popup.html'), width: 780, height: 650});
            break;
        case standard_time + 600:
            whale.windows.create({url: whale.runtime.getURL('popup/blocking_popup.html'), width: 720, height: 700});
            handleCheckBoxMessage({msg: "checkbox", id: "blocking " + timer.name, state: true});
        break;
    }
}

function add_url(info){
    //When onclick, retrieve hostname from url
    whale.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
        var domain = new URL(tabs[0].url).hostname;

        //Check for duplicates
        whale.storage.sync.get(null, function(results){
            var canStore = true;
            var allKeys = Object.keys(results);
            allKeys.forEach(function(entry){
                if(results[entry] == domain){
                    canStore = false;
                    console.log("Duplicate exists");
                    canSore = false;
                    return;
                }
            });
            //Store URL.hostname into storage under key "URL#"
            if(canStore){
                whale.storage.sync.set({[domain]: domain}, function(){
                    console.log("Value is set to "  + domain);
                });
            }
        });
        current_url = domain;
        new_timer = new Timer(current_url);
        timer_list.push(new_timer);
        current_timer = new_timer;
        update_view();
    });
}

function initialize(){
    whale.storage.sync.get(null, function(results){
        var allKeys = Object.keys(results);
        allKeys.forEach(function(entry){
            var url = results[entry];
            var new_timer = new Timer(url);
            new_timer.active = false;
            timer_list.push(new_timer);
        });
    });
    current_url_update();
    console.log(timer_list);
}

function update_view(){
    //Send message to popup.js to update
    console.log(timer_list);
    console.log(timer_list.length);
    console.log(timer_list[timer_list.length-1]);
    whale.runtime.sendMessage({msg: "initialize", timer_list: timer_list, start_state: is_active, total_time: total_time});
}

function block(details){
    return {cancel: true};
}


