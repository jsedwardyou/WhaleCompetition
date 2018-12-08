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
        var keyname = "URL"+index;

        //Store URL.hostname into storage under key "URL#"
        whale.storage.sync.set({[keyname]: domain}, function(){
            console.log("Value is set to "  + keyname + " "+ domain);
        });
        index++;

        whale.storage.sync.get(null, function(results){
            var allKeys = Object.keys(results);
            console.log(results);
            allKeys.forEach(function(entry){
                console.log(results[entry]);
            });
        });
    });

}