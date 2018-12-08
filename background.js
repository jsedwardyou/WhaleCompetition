
//Content menu (Right Click) for adding url
whale.contextMenus.create({
    title: "URL 추가하기",
    contexts: ['all'],
    onclick: add_url
});


var current_url;
var current_timer;

//When either tab is changed or updated, set current_url
whale.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.status == "complete"){
        current_url_update();
    }
});

whale.tabs.onActivated.addListener(function(activeInfo){
    current_url_update();
});

function current_url_update(){
    whale.tabs.query({'active': true}, function(tabs){
        var url = new URL(tabs[0].url);
        var domain = url.hostname;
        current_url = domain;

        if(active_list.length == 0)
            return;
        if(active_list.includes(current_url)){
            //Check if timer exists
            for(var i = 0; i < timer_list.length; i++){
                if(timer_list[i].name == current_url){
                    current_timer = timer_list[i];
                    current_timer.active = true;
                    return;
                }
            }

            var new_timer = new Timer(current_url);
            current_timer = new_timer;
            timer_list.push(new_timer);
        }
        else{
            current_timer.active = false;
        }
    });
}

//Receive message from popup.js
whale.runtime.onConnect.addListener(port => {
    if(port.name == 'background'){
        port.onMessage.addListener(message => {
            var messages = message.split(" ");
            if(messages[1] == 'true'){
                active_list.push(messages[0]);
                if(current_url == messages[0]){
                    current_timer.active = true;
                }
            }
            else{
                if(current_url == messages[0]){
                    current_timer.active = false;
                }
                if(active_list.includes(messages[0])){
                    var index = -1;
                    var to_remove = active_list.find(function(element){
                        return element;
                    });
                    if(to_remove){
                        for(var i = 0; i < active_list.length; i++){
                            if(active_list[i] == messages[0]){
                                active_list.splice(i, 1);
                                break;
                            }

                        }
                    }
                }
            }
        });
    }
});





//Run update function every 1 sec
setInterval(update, 1000);








class Timer{
    constructor(name){
        this.name = name;
        this.time = 0;
        this.active = true;
    }
}

var timer_list = [];
var total_time = 0;
function update(){
    if(current_timer && current_timer.active){
        current_timer.time++;
        total_time++;
        console.log(total_time);
    }
}

var active_list = [];


function add_url(info){
    //When onclick, retrieve hostname from url
    whale.tabs.query({'active': true}, function(tabs){
        var url = new URL(tabs[0].url);
        var domain = url.hostname;

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

