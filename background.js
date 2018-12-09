//Content menu (Right Click) for adding url
whale.contextMenus.create({
    title: "URL 추가하기",
    contexts: ['all'],
    onclick: add_url
});

//----------------Variables----------------
var current_url;
var current_timer;
var timer_list = [];
var total_time = 0;
var is_active = false;
var blocked_urls = ["*://hello.com/*"];
var blocked_urls_temp = [];
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
            handleStartBox(message);
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
}

function handleStartBox(message){
    if(message == "start"){
        is_active = true;
        whale.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
            if(!tabs[0]) return;
            current_url = new URL(tabs[0].url).hostname;
            current_timer = findTimer(current_url, timer_list);
        });
        whale.runtime.sendMessage({msg: "start"});
    }
    else if(message == "stop"){
        is_active = false;
        current_url = undefined;
        current_timer = undefined;
        whale.runtime.sendMessage({msg: "stop"});
    }

}

function handleCheckBoxMessage(message){
    var messages = message.split(" ");
    console.log(message);
    if(messages[0] == "blocking"){
        var blocked_url = "*://" + messages[1] + "/*";
        if(messages[2] == "true"){
            var has_url = false;
            for(var i = 0; i < blocked_urls.length; i++){
                if(blocked_urls[i] == blocked_url){
                    has_url = true;
                    findTimer(messages[1], timer_list).blocked = true;
                }
            }
            if(!has_url){
                blocked_urls.push(blocked_url);
                blocked_urls_temp.push(messages[1]);
                findTimer(messages[1], timer_list).blocked = true;
            }
        }
        else if(messages[2] == "false"){
            for(var i = 0; i < blocked_urls.length; i++){
                if(blocked_urls[i] == blocked_url){
                    blocked_urls.splice(i,1);
                    blocked_urls_temp.splice(i-1,1);
                    findTimer(messages[1], timer_list).blocked = false;
                }
            }
        }
        whale.webRequest.onBeforeRequest.removeListener(block);
        whale.webRequest.onBeforeRequest.addListener(block,
            {urls: blocked_urls},
            ["blocking"]
        );
        whale.runtime.sendMessage({msg:message});
    }
    else if(messages[0] == "warning"){
        var timer = findTimer(messages[1], timer_list);
        if(timer == undefined){
            var new_timer = new Timer(messages[1]);
            timer_list.push(new_timer);
            timer = new_timer;
        }

        if(messages[2] == 'true'){
            timer.active = true;
        }
        else if(messages[2] == 'false'){
            timer.active = false;
        }
        if(current_url == messages[1])
            current_timer = timer;

        whale.runtime.sendMessage({msg: message});
        roll_back();
    }
}

function clear(){
    active_list = [];
    timer_list = [];
    total_time = 0;
    current_timer = undefined;
    blocked_urls = ["*://hello.com/*"];
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
        if(total_time > standard_time + 40){
            standard_time = total_time;
        }
    }
}

function pop_up(timer, current_url){
    var previous_url = current_url;
    switch(timer.time){
        case standard_time + 5:
            whale.sidebarAction.show({url: whale.runtime.getURL('popup/warning_sidebar.html')});
            break;
        case standard_time + 10:
            whale.sidebarAction.show({url: whale.runtime.getURL('popup/warning_sidebar.html')});
            break;
        case standard_time + 15:
            whale.sidebarAction.show({url: whale.runtime.getURL('popup/warning_sidebar.html')});
            break;
        case standard_time + 20:
            whale.windows.create({url: whale.runtime.getURL('popup/warning_popup.html'), width: 720, height: 1280});
            break;
        case standard_time + 25:
            whale.windows.create({url: whale.runtime.getURL('popup/blocking_popup.html'), width: 720, height: 700});
        break;
    }
}

function add_url(info){
    //When onclick, retrieve hostname from url
    whale.tabs.query({'active': true}, function(tabs){
        var domain = new URL(tabs[0].url).hostname;

        //Check for duplicates
        whale.storage.sync.get(null, function(results){
            var canStore = true;
            var allKeys = Object.keys(results);
            allKeys.forEach(function(entry){
                if(results[entry] == domain){
                    canStore = false;
                    console.log("Duplicate exists");
                }
            });

            if(canStore){
                //Store URL.hostname into storage under key "URL#"
                whale.storage.sync.set({[domain]: domain}, function(){
                    console.log("Value is set to "  + domain);
                });
            }
        });
        current_url = domain;
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

function block(details){
    return {cancel: true};
}

function roll_back(){
    var active_urls = [];
    for(var i = 0; i < timer_list.length; i++){
        if(timer_list[i].active){
            active_urls.push(timer_list[i].name);
        }
    }
    whale.runtime.sendMessage({
        msg: "roll_back",
        blocked_urls: blocked_urls_temp,
        start_state: is_active,
        active_urls: active_urls,
    });
}

