whale.storage.sync.get(null, function(results){
    var allKeys = Object.keys(results);
    allKeys.forEach(function(entry){
        console.log(results[entry]);
    });
});