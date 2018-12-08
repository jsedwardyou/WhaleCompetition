whale.contextMenus.create({
    title: "URL 추가하기",
    contexts: ['all'],
    onclick: add_url
});

var index = 0;

function add_url(info){
    //When onclick, retrieve hostname from url
    whale.tabs.getSelected(null, function(tab){
        var url = new URL(tab.url);
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
                index++;
            }
        });
    });

}