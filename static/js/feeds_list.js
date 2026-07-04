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

    // Add folders 
    const folderElem = document.createElement('div');
    folderElem.classList.add("accordion", "accordion-flush", "mb-1", "w-100")
    console.log(feedList.folders)
    for (let i in feedList.folders) {
        let folder = feedList.folders[i]

        folderHTML = `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#${folder.name.replace(/\W/g, "")+"_"+String(folder.id)}" aria-expanded="false" aria-controls="flush-collapseOne">
                    <div class="flex-grow-1">${folder.name}</div>
                    <a class="me-2 flew-shrink-0" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" height="1.3em" width="1.3em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><g transform="translate(0,0) scale(0.046875)"><path fill="currentColor" d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"/></g></svg>
                    </a>
                </button>
            </h2>
            <div id="${folder.name.replace(/\W/g, "")+"_"+String(folder.id)}" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                <ul class="list-group" style="width:95%; margin-left: 5%">
        `

        for (let j in folder.feeds) {
            let feed = folder.feeds[j]
            
            folderHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center border-0">
                            <img
                                src="${getFeedIcon(feed.url)}"
                                class="me-2"
                                style="width:1rem; height:auto; top:0; left:0;"
                                alt=""
                            >
                            <div class="flex-grow-1" style="text-overflow: ellipsis; overflow: hidden;display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical;">
                                <a>${feed.name}</a>
                            </div>
                            <a class="flex-shrink-0" href="#">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" height="1.3rem" width="1.3rem"  focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><g transform="translate(0,0) scale(0.046875)"><path fill="currentColor" d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"/></g></svg>
                            </a>
                            <span class="badge text-bg-primary rounded-pill ms-2">${getFeedLength(feed.url)}</span>
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
        rootElem.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center border-0">
                <img
                  src="${getFeedIcon(feed.url)}"
                  class="me-2"
                  style="width:1rem; height:auto; top:0; left:0;"
                  alt=""
                >
                <div class="flex-grow-1" style="text-overflow: ellipsis; overflow: hidden;display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical;">
                  <a>${feed.name}</a>
                </div>
                <a class="flex-shrink-0" href="#">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" height="1.3em" width="1.3em" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><g transform="translate(0,0) scale(0.046875)"><path fill="currentColor" d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"/></g></svg>
                </a>
                <span class="badge text-bg-primary rounded-pill ms-2">${getFeedLength(feed.url)}</span>
            </li>
        `
    }

    feedsMenuElem.appendChild(folderElem)
    feedsMenuElem.appendChild(rootElem)
}

// Fetches favicon of a feed URL
function getFeedIcon(feedURL) {
    return "../images/favicon_yt.png" // Not implemented
}

function getFeedLength(feedURL) {
    return 14 // Not implemented
}

// This functions will import feeds from a provided OPML file from the user's device
function importFeeds(opmlString) {
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
    localStorage.setItem("feedList", JSON.stringify(feedList)) 
    populateFeedsMenu(feedList)
    iframeElem.contentWindow.postMessage({ type: 'load-feeds' }, '*');
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


let opmlString = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Subscriptions</title>
  </head>
  <body>
    <outline title="Peak Content" text="Peak Content">
      <outline title="Benn Jordan" text="Benn Jordan" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=UCshObcm-nLhbu8MY50EZ5Ng" htmlUrl="https://www.youtube.com/channel/UCshObcm-nLhbu8MY50EZ5Ng"/>
      <outline title="KickThePj" text="KickThePj" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=UCavTVjugW1OejDAq0aDzdMw" htmlUrl="https://www.youtube.com/channel/UCavTVjugW1OejDAq0aDzdMw"/>
    </outline>
  </body>
</opml>
`

iframeElem.addEventListener('load', () => {
    populateFeedsMenu(feedList)
    iframeElem.contentWindow.postMessage({ type: 'load-feeds' }, '*');
});
