
//Content menu (Right Click) for adding url
whale.contextMenus.create({
    title: "URL 추가하기",
    contexts: ['all'],
    onclick: add_url
});


var current_url;

//When either tab is changed or updated, set current_url
whale.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.status == "complete"){
        whale.tabs.query({'active': true}, function(tabs){
            var url = new URL(tabs[0].url);
            var domain = url.hostname;
            current_url = domain;
        });
    }
});

whale.tabs.onActivated.addListener(function(activeInfo){
    whale.tabs.query({'active': true}, function(tabs){
        var url = new URL(tabs[0].url);
        var domain = url.hostname;
        current_url = domain;
    });
});

//Receive message from popup.js
whale.runtime.onConnect.addListener(port => {
    if(port.name == 'background'){
        port.onMessage.addListener(message => {
            console.log(message);
        });
    }
});

//Run update function every 1 sec
setInterval(update, 1000);










function update(){
    whale.tabs.query({'active': true}, function(tabs){
        console.log(current_url);
    });
}

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
    });
}

