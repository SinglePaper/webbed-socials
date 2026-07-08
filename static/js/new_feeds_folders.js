function addNewFeed(url, folder = -1) {

}

function addNewFolder(name) {
    feedList.folders.push({
        id: getMaxId(feedList)+1,
        name: name,
        feeds: []
    })
    localStorage.setItem("feedList", JSON.stringify(feedList)) 
    populateFeedsMenu(feedList)
    return true
}