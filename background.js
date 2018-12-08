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

class Timer{
    constructor(name){
        this.name = name;
        this.time = 0;
        this.active = true;
    }
}

//----------------When either tab is changed or updated, set current_url----------------
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

//----------------------------------------------------------------------------------------

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
            if(messages[0] == timer_list[i].name){
                var timer = timer_list[i];
                if(messages[1] == true){
                    timer.active =true;
                }
                else{
                    timer.active = false;
                }
            }
        }
    }
});


//-------------------handles changes in the tabs-----------------------------------------
function current_url_update(){
    whale.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
        current_url = new URL(tabs[0].url).hostname;
        current_timer = findTimer(current_url, timer_list);

        if(current_timer == undefined) return;
    });
}

//Receive message from popup.js
whale.runtime.onConnect.addListener(port => {
    if(port.name == 'background'){
        port.onMessage.addListener(message => {
            handleCheckBoxMessage(message);
            console.log(message);
            whale.runtime.sendMessage({msg: message});
        });
    }
});

function handleCheckBoxMessage(message){
    var messages = message.split(" ");

    //Check if urls already have timers
    var timer = findTimer(messages[0], timer_list);

    //if current_timer doesn't exist, then create a new timer and add to the list
    if(timer == undefined){
        var new_timer = new Timer(messages[0]);
        timer_list.push(new_timer);
        timer = new_timer;
    }

    if(messages[1] == 'true'){
        timer.active = true;
    }
    else if(messages[1] == 'false'){
        timer.active = false;
    }
    if(current_url == messages[0])
        current_timer = timer;
}

function clear(){
    active_list = [];
    timer_list = [];
    total_time = 0;
    current_timer = undefined;
}

function findTimer(name, timer_list){
    for(var i = 0; i < timer_list.length; i++){
        if(timer_list[i].name == name)
            return timer_list[i];
    }
    return undefined;
}

//Run update function every 1 sec
setInterval(update, 1000);

function update(){
    console.log(timer_list[0].active);
    if(current_timer && current_timer.active){
        current_timer.time++;
        total_time++;
        console.log(total_time);
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

