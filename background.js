chrome.commands.onCommand.addListener(function(command) {
    if (command == "store-current-tab") {
        saveCurrentTab();
    }
});

function saveTab(tab) {
    chrome.storage.sync.get({"tabs": []}, function(data){
        data.tabs.push(tab)
        chrome.storage.sync.set(data)
    })
}

function saveCurrentTab(){
    chrome.tabs.query({"active": true, "lastFocusedWindow": true},
        function(result){
            saveTab(result[0])
            chrome.tabs.remove(result[0].id)
        }
    )
}