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

function safeId(value) {
  return String(value).replace(/[^\w-]/g, "");
}

function populateFeedsMenu(feedList) {
  feedsMenuElem.replaceChildren();

  // Home
  const homeUl = document.createElement("ul");
  homeUl.className = "list-group";

  const homeLi = document.createElement("li");
  homeLi.className = "list-group-item d-flex justify-content-left align-items-center border-0";

  homeLi.insertAdjacentHTML(
    "beforeend",
    `<svg class="me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 1em; height: 1em;"><path fill="currentColor" d="M19.469 12.594l3.625 3.313c0.438 0.406 0.313 0.719-0.281 0.719h-2.719v8.656c0 0.594-0.5 1.125-1.094 1.125h-4.719v-6.063c0-0.594-0.531-1.125-1.125-1.125h-2.969c-0.594 0-1.125 0.531-1.125 1.125v6.063h-4.719c-0.594 0-1.125-0.531-1.125-1.125v-8.656h-2.688c-0.594 0-0.719-0.313-0.281-0.719l10.594-9.625c0.438-0.406 1.188-0.406 1.656 0l2.406 2.156v-1.719c0-0.594 0.531-1.125 1.125-1.125h2.344c0.594 0 1.094 0.531 1.094 1.125v5.875z"/></svg>`
  );

  const homeLink = document.createElement("a");
  homeLink.style.cursor = "pointer";
  homeLink.textContent = "All Feeds";
  homeLink.onclick = loadSubsetFeeds;
  homeLi.appendChild(homeLink);
  homeUl.appendChild(homeLi);
  feedsMenuElem.appendChild(homeUl);

  // Folders
  const folderElem = document.createElement("div");
  folderElem.classList.add("accordion", "accordion-flush", "mb-1", "w-100");

  for (const folder of feedList.folders) {
    const folderSafe = safeId(folder.name);
    const btnId = `${folderSafe}_btn_${folder.id}`;
    const collapseId = `${folderSafe}_${folder.id}`;

    const item = document.createElement("div");
    item.className = "accordion-item";

    const h2 = document.createElement("h2");
    h2.className = "accordion-header";

    const btn = document.createElement("button");
    btn.id = btnId;
    btn.className = "accordion-button collapsed shadow-none";
    btn.type = "button";
    btn.setAttribute("data-bs-toggle", "collapse");
    btn.setAttribute("data-bs-target", `#${collapseId}`);
    btn.setAttribute("aria-expanded", "false");

    const title = document.createElement("div");
    title.className = "flex-grow-1";
    title.textContent = folder.name;
    btn.appendChild(title);

    const editLink = document.createElement("a");
    editLink.className = "flex-shrink-0 me-2";
    editLink.style.cursor = "pointer";
    editLink.setAttribute("data-bs-toggle", "modal");
    editLink.setAttribute("data-bs-target", "#editFolderModal");
    editLink.onmouseenter = () => btn.setAttribute("data-bs-toggle", "");
    editLink.onmouseleave = () => btn.setAttribute("data-bs-toggle", "collapse");
    editLink.onclick = () => updateFolderModal(folder.id);
    editLink.insertAdjacentHTML(
      "beforeend",
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M9.5 13a1.5 1.5 0 1 1-3 0zm0-5a1.5 1.5 0 1 1-3 0zm0-5a1.5 1.5 0 1 1-3 0z"/></svg>`
    );
    btn.appendChild(editLink);

    h2.appendChild(btn);
    item.appendChild(h2);

    const collapse = document.createElement("div");
    collapse.id = collapseId;
    collapse.className = "accordion-collapse collapse";
    collapse.setAttribute("data-bs-parent", "#accordionFlushExample");

    const ul = document.createElement("ul");
    ul.className = "list-group";
    ul.style.width = "95%";
    ul.style.marginLeft = "5%";

    for (const feed of folder.feeds) {
      const feedInfo = getFeedInfo(feed.id);

      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center border-0";

      const img = document.createElement("img");
      img.src = feedInfo.icon || "";
      img.className = "me-2";
      img.style.width = "1rem";
      img.style.height = "auto";
      img.alt = "";

      const wrap = document.createElement("div");
      wrap.className = "flex-grow-1";
      wrap.style.textOverflow = "ellipsis";
      wrap.style.overflow = "hidden";
      wrap.style.display = "-webkit-box";
      wrap.style.webkitLineClamp = "1";
      wrap.style.webkitBoxOrient = "vertical";

      const a = document.createElement("a");
      a.style.cursor = "pointer";
      a.textContent = feed.name;
      a.onclick = () => loadSubsetFeeds([feed.id]);

      const badge = document.createElement("span");
      badge.className = `badge text-bg-primary rounded-pill ${!feedInfo.nItems ? "d-none" : ""}`;
      badge.textContent = String(feedInfo.nItems || "");

      const more = document.createElement("a");
      more.className = "flex-shrink-0 ms-2";
      more.style.cursor = "pointer";
      more.setAttribute("data-bs-toggle", "modal");
      more.setAttribute("data-bs-target", "#editFeedModal");
      more.onclick = () => updateFeedModal(feed.id);
      more.insertAdjacentHTML(
        "beforeend",
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M9.5 13a1.5 1.5 0 1 1-3 0zm0-5a1.5 1.5 0 1 1-3 0zm0-5a1.5 1.5 0 1 1-3 0z"/></svg>`
      );

      wrap.appendChild(a);
      li.appendChild(img);
      li.appendChild(wrap);
      li.appendChild(badge);
      li.appendChild(more);
      ul.appendChild(li);
    }

    collapse.appendChild(ul);
    item.appendChild(collapse);
    folderElem.appendChild(item);
  }

  // Root feeds
  const rootUl = document.createElement("ul");
  rootUl.className = "list-group";

  for (const feed of feedList.root) {
    const feedInfo = getFeedInfo(feed.id);

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center border-0";

    const img = document.createElement("img");
    img.src = feedInfo.icon || "";
    img.className = "me-2";
    img.style.width = "1rem";
    img.style.height = "auto";
    img.alt = "";

    const wrap = document.createElement("div");
    wrap.className = "flex-grow-1";
    wrap.style.textOverflow = "ellipsis";
    wrap.style.overflow = "hidden";
    wrap.style.display = "-webkit-box";
    wrap.style.webkitLineClamp = "1";
    wrap.style.webkitBoxOrient = "vertical";

    const a = document.createElement("a");
    a.style.cursor = "pointer";
    a.textContent = feedInfo.displayName;
    a.onclick = () => loadSubsetFeeds([feed.id]);

    const badge = document.createElement("span");
    badge.className = `badge text-bg-primary rounded-pill ${!feedInfo.nItems ? "d-none" : ""}`;
    badge.textContent = String(feedInfo.nItems || "");

    const more = document.createElement("a");
    more.className = "flex-shrink-0 ms-2";
    more.style.cursor = "pointer";
    more.setAttribute("data-bs-toggle", "modal");
    more.setAttribute("data-bs-target", "#editFeedModal");
    more.onclick = () => updateFeedModal(feed.id);
    more.insertAdjacentHTML(
      "beforeend",
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M9.5 13a1.5 1.5 0 1 1-3 0zm0-5a1.5 1.5 0 1 1-3 0zm0-5a1.5 1.5 0 1 1-3 0z"/></svg>`
    );

    wrap.appendChild(a);
    li.appendChild(img);
    li.appendChild(wrap);
    li.appendChild(badge);
    li.appendChild(more);
    rootUl.appendChild(li);
  }

  // Add feed button
  const addFeedUl = document.createElement("ul");
  addFeedUl.className = "list-group";

  const addFeedLi = document.createElement("li");
  addFeedLi.className = "list-group-item d-flex justify-content-left align-items-center border-0";
  addFeedLi.insertAdjacentHTML(
    "beforeend",
    `<svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="4 2 16 20"><path fill="currentColor" d="m19.74 7.33l-4.44-5a1 1 0 0 0-.74-.33h-8A2.53 2.53 0 0 0 4 4.5v15A2.53 2.53 0 0 0 6.56 22h10.88A2.53 2.53 0 0 0 20 19.5V8a1 1 0 0 0-.26-.67M14 15h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2m.71-7a.79.79 0 0 1-.71-.85V4l3.74 4Z"/></svg>`
  );

  const addFeedLink = document.createElement("a");
  addFeedLink.style.cursor = "pointer";
  addFeedLink.textContent = "Add Feed";
  addFeedLink.setAttribute("onclick", "document.querySelectorAll('#sourcePicker .source-btn').forEach(b => {b.classList.remove('active'); b.disabled = true; window.setTimeout(()=>{b.disabled = false},500)}); document.getElementById('addFeedForm').hidden = true;")
  addFeedLink.setAttribute("data-bs-toggle", "modal");
  addFeedLink.setAttribute("data-bs-target", "#addFeedModal");
  addFeedLi.appendChild(addFeedLink);
  addFeedUl.appendChild(addFeedLi);

  // Add folder button
  const addFolderUl = document.createElement("ul");
  addFolderUl.className = "list-group";

  const addFolderLi = document.createElement("li");
  addFolderLi.className = "list-group-item d-flex justify-content-left align-items-center border-0";
  addFolderLi.insertAdjacentHTML(
    "beforeend",
    `<svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="4 2 16 20"><path fill="currentColor" d="M19.5 7.05h-7L9.87 3.87a1 1 0 0 0-.77-.37H4.5A2.47 2.47 0 0 0 2 5.93v12.14a2.47 2.47 0 0 0 2.5 2.43h15a2.47 2.47 0 0 0 2.5-2.43V9.48a2.47 2.47 0 0 0-2.5-2.43M14 15h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"/></svg>`
  );

  const addFolderLink = document.createElement("a");
  addFolderLink.style.cursor = "pointer";
  addFolderLink.textContent = "Add Folder";
  addFolderLink.setAttribute("data-bs-toggle", "modal");
  addFolderLink.setAttribute("data-bs-target", "#addFolderModal");
  addFolderLink.onclick = () => {
    document.getElementById("newFolderNameInput").value = "";
    document.getElementById("addFolderBtn").disabled = true;
  };
  addFolderLi.appendChild(addFolderLink);
  addFolderUl.appendChild(addFolderLi);

  feedsMenuElem.appendChild(homeUl);
  feedsMenuElem.appendChild(folderElem);
  feedsMenuElem.appendChild(rootUl);
  feedsMenuElem.appendChild(addFeedUl);
  feedsMenuElem.appendChild(addFolderUl);
}


// Updates feed modal when menu is opened
function updateFeedModal(id) {
    let feedInfo = getFeedInfo(id) // displayName, originalName, icon, nItems
    // console.log(feedInfo)
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
    // console.log(folderInfo)
    let folderModalElem = document.getElementById("editFolderModal")
    let folderModalLabelElem = document.getElementById("editFolderModalLabel")
    let folderModalNameElem = document.getElementById("editFolderNameInput")
    folderModalNameElem.value = folderInfo.name
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

function createFeed(url) {
    let newFeed = {}
    return newFeed
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

function editFolder(targetId, name) {
    targetId = parseInt(targetId)
    let folder = getFolder(targetId)
    folder.name = name
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

function loadSubsetFeeds(ids=[]) {
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
