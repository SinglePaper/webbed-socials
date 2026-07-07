const feedsMenuElem = document.getElementById("feedsMenu")
const iframeElem = document.getElementById("frame")
let feedList = {
    "folders": [],
    "root": []
}

if (localStorage.getItem("feedList") === null) { localStorage.setItem("feedList", JSON.stringify(feedList)) }
feedList = JSON.parse(localStorage.getItem("feedList"))

// Find the maximum ID used in the feedList
function getMaxId(feedList) {
  if (feedList.folders.length === 0 && feedList.root.length === 0) return -1
  return Math.max(
    ...feedList.folders.map(f => f.id),
    ...feedList.folders.flatMap(f => f.feeds.map(feed => feed.id)),
    ...feedList.root.map(feed => feed.id)
  );
}

// This function will lookup the feeds stored on the device and populate the sidebar with feeds and folders
function populateFeedsMenu(feedList) {
    feedsMenuElem.innerHTML = ""

    // Add 'Home' button (show all feeds)
    const homeBtnElem = document.createElement('ul');
    homeBtnElem.classList.add("list-group")

    homeBtnElem.innerHTML += `
        <li class="list-group-item d-flex justify-content-left align-items-center border-0">
                <svg class="me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 1em; height: 1em;"><path fill="currentColor" d="M19.469 12.594l3.625 3.313c0.438 0.406 0.313 0.719-0.281 0.719h-2.719v8.656c0 0.594-0.5 1.125-1.094 1.125h-4.719v-6.063c0-0.594-0.531-1.125-1.125-1.125h-2.969c-0.594 0-1.125 0.531-1.125 1.125v6.063h-4.719c-0.594 0-1.125-0.531-1.125-1.125v-8.656h-2.688c-0.594 0-0.719-0.313-0.281-0.719l10.594-9.625c0.438-0.406 1.188-0.406 1.656 0l2.406 2.156v-1.719c0-0.594 0.531-1.125 1.125-1.125h2.344c0.594 0 1.094 0.531 1.094 1.125v5.875z"/></svg>
                <a onclick="loadSubsetFeeds()" style="cursor:pointer">All Feeds</a>
        </li>
    `

    // Add folders 
    const folderElem = document.createElement('div');
    folderElem.classList.add("accordion", "accordion-flush", "mb-1", "w-100")

    for (let i in feedList.folders) {
        let folder = feedList.folders[i]

        folderHTML = `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button id="${folder.name.replace(/\W/g, "")+"_btn_"+String(folder.id)}" class="accordion-button collapsed shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#${folder.name.replace(/\W/g, "")+"_"+String(folder.id)}" aria-expanded="false" aria-controls="flush-collapseOne">
                    <div class="flex-grow-1">${folder.name}</div>
                    <a class="flex-shrink-0 me-2" 
                        onclick="updateFolderModal(${folder.id}); console.log('Edit folder!')" 
                        onmouseenter="document.getElementById('${folder.name.replace(/\W/g, "")+"_btn_"+String(folder.id)}').setAttribute('data-bs-toggle', '')"
                        onmouseleave="document.getElementById('${folder.name.replace(/\W/g, "")+"_btn_"+String(folder.id)}').setAttribute('data-bs-toggle', 'collapse')"
                    data-bs-toggle="modal" data-bs-target="#editFolderModal" style="cursor:pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                    </a>
                </button>
            </h2>
            <div id="${folder.name.replace(/\W/g, "")+"_"+String(folder.id)}" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                <ul class="list-group" style="width:95%; margin-left: 5%">
        `

        for (let j in folder.feeds) {
            let feed = folder.feeds[j]
            let feedInfo = getFeedInfo(feed.id)
            
            folderHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center border-0">
                            <img
                                src="${feedInfo.icon}"
                                class="me-2"
                                style="width:1rem; height:auto; top:0; left:0;"
                                alt=""
                            >
                            <div class="flex-grow-1" style="text-overflow: ellipsis; overflow: hidden;display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical;">
                                <a onclick="loadSubsetFeeds([${feed.id}])" style="cursor:pointer">${feed.name}</a>
                            </div>
                            <span class="badge text-bg-primary rounded-pill  ${feedInfo.nItems == 0 || !feedInfo.nItems ? "d-none" : ""}">${feedInfo.nItems}</span>
                            <a class="flex-shrink-0 ms-2" onclick="updateFeedModal(${feed.id})" data-bs-toggle="modal" data-bs-target="#editFeedModal" style="cursor:pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                            </a>
                        </li>
            `
        }
        folderHTML += `
                </ul>
            </div>
        </div>
        `
        folderElem.innerHTML += folderHTML
        
    }

    // Add feeds in root (not in folder)
    const rootElem = document.createElement('ul');
    rootElem.classList.add("list-group")
    for (let i in feedList.root) {
        let feed = feedList.root[i]
        let feedInfo = getFeedInfo(feed.id)

        rootElem.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center border-0">
                <img
                  src="${feedInfo.icon}"
                  class="me-2"
                  style="width:1rem; height:auto; top:0; left:0;"
                  alt=""
                >
                <div class="flex-grow-1" style="text-overflow: ellipsis; overflow: hidden;display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical;">
                  <a onclick="loadSubsetFeeds([${feed.id}])" style="cursor:pointer">${feedInfo.displayName}</a>
                </div>
                <span class="badge text-bg-primary rounded-pill ${feedInfo.nItems == 0 ? "d-none" : ""}">${feedInfo.nItems}</span>
                <a onclick="updateFeedModal(${feed.id})" class="flex-shrink-0 ms-2" data-bs-toggle="modal" data-bs-target="#editFeedModal" style="cursor:pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                </a>
            </li>
        `
    }

    // Add 'add feed' button
    const addFeedBtnElem = document.createElement('ul');
    addFeedBtnElem.classList.add("list-group")

    addFeedBtnElem.innerHTML += `
        <li class="list-group-item d-flex justify-content-left align-items-center border-0">
                <svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="4 2 16 20"><path fill="currentColor" d="m19.74 7.33l-4.44-5a1 1 0 0 0-.74-.33h-8A2.53 2.53 0 0 0 4 4.5v15A2.53 2.53 0 0 0 6.56 22h10.88A2.53 2.53 0 0 0 20 19.5V8a1 1 0 0 0-.26-.67M14 15h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2m.71-7a.79.79 0 0 1-.71-.85V4l3.74 4Z"/></svg>
                <a  data-bs-toggle="modal" data-bs-target="#addFeedModal" style="cursor:pointer">Add Feed</a>
        </li>
    `

    // Add 'add folder' button
    const addFolderBtnElem = document.createElement('ul');
    addFolderBtnElem.classList.add("list-group")

    addFolderBtnElem.innerHTML += `
        <li class="list-group-item d-flex justify-content-left align-items-center border-0">
                <svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="4 2 16 20"><path fill="currentColor" d="M19.5 7.05h-7L9.87 3.87a1 1 0 0 0-.77-.37H4.5A2.47 2.47 0 0 0 2 5.93v12.14a2.47 2.47 0 0 0 2.5 2.43h15a2.47 2.47 0 0 0 2.5-2.43V9.48a2.47 2.47 0 0 0-2.5-2.43M14 15h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"/></svg>
                <a  data-bs-toggle="modal" data-bs-target="#addFolderModal" style="cursor:pointer">Add Folder</a>
        </li>
    `

    feedsMenuElem.appendChild(homeBtnElem)
    feedsMenuElem.appendChild(folderElem)
    feedsMenuElem.appendChild(rootElem)
    feedsMenuElem.appendChild(addFeedBtnElem)
    feedsMenuElem.appendChild(addFolderBtnElem)
}

// Updates feed modal when menu is opened
function updateFeedModal(id) {
    let feedInfo = getFeedInfo(id) // displayName, originalName, icon, nItems
    console.log(feedInfo)
    let feedModalElem = document.getElementById("editFeedModal")
    let feedModalLabelElem = document.getElementById("editFeedModalLabel")
    let feedModalBodyElem = document.getElementById("editFeedModalBody")
    feedModalLabelElem.textContent = feedInfo.originalName
    feedModalElem.setAttribute("label", id)
    console.log("Opened modal for feed", id)
}

// Updates feed modal when menu is opened
function updateFolderModal(id) {
    let folderInfo = getFolder(id) // id, name, feeds
    console.log(folderInfo)
    let folderModalElem = document.getElementById("editFolderModal")
    let folderModalLabelElem = document.getElementById("editFolderModalLabel")
    let folderModalBodyElem = document.getElementById("editFolderModalBody")
    folderModalLabelElem.textContent = folderInfo.name
    folderModalElem.setAttribute("label", id)
    console.log("Opened modal for folder", id)
}

function getFeed(targetId, copy = false) {
  const feed =
    feedList.root.find(f => f.id === targetId) ??
    feedList.folders.flatMap(folder => folder.feeds).find(f => f.id === targetId);

  if (!feed) return null;
  return copy ? { ...feed } : feed;
}

function getFolder(targetId, copy = false) {
  const folder =
    feedList.folders.find(f => f.id === targetId);

  if (!folder) return null;
  return copy ? { ...folder } : folder;
}

function deleteFeed(targetId) {
    targetId = parseInt(targetId)
    console.log("Deleting feed", targetId)
    let deletedFeed = getFeed(targetId, copy=true)
    feedList.root = feedList.root.filter(feed => feed.id !== targetId);
    feedList.folders = feedList.folders.map(folder => ({
    ...folder, feeds: folder.feeds.filter(feed => feed.id !== targetId)
    }));

    refreshFeeds()
    return deletedFeed
}

function addFeed(feed, folder = -1) { // Feed is a dictionary containing name, url, and id)
    if (folder === -1) {
        feedList.root.push(feed);
    } else {
        const selectedFolder = feedList.folders.find(f => f.id === folder);
        console.log("Failed to add feed to non-existent folder.")
        if (!selectedFolder) return false;

        selectedFolder.feeds.push(feed);
    }

    // Refresh feeds and menu
    refreshFeeds()
    return true
}

function moveFeed(targetId, folder = -1) {
    if (folder !== -1) {
        const selectedFolder = feedList.folders.find(f => f.id === folder);
        console.log("Failed to move feed to non-existent folder.")
        if (!selectedFolder) return false;
    }
    let deletedFeed = deleteFeed(targetId)
    addFeed(deletedFeed, folder)
    return true
}

function addNewFeed(url, folder = -1) {

}

function addNewFolder(name) {
    feedList.folders.push({
        id: getMaxId(feedList),
        name: name,
        feeds: []
    })
    localStorage.setItem("feedList", JSON.stringify(feedList)) 
    populateFeedsMenu(feedList)
    return true
}

function deleteFolder(targetId) {
    targetId = parseInt(targetId)
    console.log("Deleting folder", targetId)
    let deletedFolder = getFolder(targetId, copy=true)
    feedList.folders = feedList.folders.filter(folder => folder.id !== targetId)

    refreshFeeds()
    return deletedFolder
}

function refreshFeeds() {
    localStorage.setItem("feedList", JSON.stringify(feedList)) 
    populateFeedsMenu(feedList)
    iframeElem.contentWindow.postMessage({ type: 'load-feeds' }, '*');
}

// Fetches favicon of a feed URL
function getFeedInfo(feedId) {
    if (localStorage.feedInfos === undefined || !(feedId in JSON.parse(localStorage.feedInfos))) {
        return ["", 0]
    }
    let feedInfo = JSON.parse(localStorage.feedInfos) 
    return feedInfo[feedId] // Not implemented
}

// This functions will import feeds from a provided OPML file from the user's device
function importOPML(opmlString) {
    // Parse OPML string
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(opmlString, "application/xml");
    const items = xmlDoc.querySelector("body").children
    let nextId = getMaxId(feedList)+1

    // Loop over main Elements (either folders or root feeds)
    for (let i in items) {
        let item = items[i]
        if (!(item instanceof Element)) continue

        // Root feeds
        if (item.attributes.getNamedItem("type") && item.attributes.getNamedItem("type").value == "rss") {
            // Add feeds to root
            feedList.root.push(
                {
                    name: item.attributes.title.value,
                    id: nextId,
                    url: item.attributes.xmlUrl.value
                }
            )
            nextId++

        } else { // Folders
            // Create new folder
            let folder = {
                name: item.attributes.title.value,
                id: nextId,
                feeds: []
            }
            nextId++
            
            // Add feeds to folder
            let feeds = item.querySelectorAll("outline")
            feeds.forEach(feed => {
                let feedInfo = {
                    name: feed.attributes.title.value,
                    id: nextId,
                    url: feed.attributes.xmlUrl.value
                }
                folder.feeds.push(feedInfo)
                nextId++
            })

            // Add folder to list
            feedList.folders.push(folder)
        }
    }
    refreshFeeds()
}


// This function will link feeds from two devices
function linkFeeds() {

}

// This function will retrieve the OPML file that matches an user ID from the server
function fetchOPML(userID) {

}

// This function will save the user's feeds to an OPML file that matches the user ID on the server
function saveOPML(userID) {

}

function loadSubsetFeeds(ids) {
    iframeElem.contentWindow.postMessage({ type: 'load-feeds', ids: JSON.stringify(ids) }, '*');
    document.getElementById("menu-btn-close").click()
}

iframeElem.addEventListener('load', () => {
    refreshFeeds()
});

window.addEventListener('message', (e) => {
    if (e.data?.type === 'populate-feeds-menu') {
      populateFeedsMenu(feedList)
    }
});
