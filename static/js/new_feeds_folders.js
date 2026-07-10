// Updates add feed form when source is chosen
async function updateAddFeedForm(source, btn) {
    document.querySelectorAll('#sourcePicker .source-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll(`#addFeedFormInputs div`).forEach(b => b.hidden=true);
    document.querySelectorAll(`#addFeedFormInputs .${source}`).forEach(b => b.hidden=false);

    // Populate feed folders dropdown
    let foldersElem = document.getElementById("addFeedFolders")
    foldersElem.innerHTML = ""

    // Add root folder option
    let optionElem = document.createElement("option") // <option value="0">...</option>
    optionElem.value = -1
    optionElem.textContent = "Root folder"
    foldersElem.appendChild(optionElem)

    JSON.parse(localStorage.feedList).folders.forEach(
        folder => {
            let optionElem = document.createElement("option") // <option value="0">...</option>
            optionElem.value = folder.id
            optionElem.textContent = folder.name
            foldersElem.appendChild(optionElem)
        })


    // Populate Dropout sources
    let dropoutSourcesElem = document.getElementById("selectDropoutSources")
    dropoutSourcesElem.innerHTML = ""
    $.getJSON('https://singlepaper.github.io/dropout-rss/feeds.json', function(data) {
        // Sort the sources alphabetically (except "All Releases", which should always be first!)
        let sources = Object.entries(data)
        sources.sort(function(a, b) {
            if (a[0] === "All Releases") return -1;
            if (b[0] === "All Releases") return 1;
            return a[0].localeCompare(b[0]);
        });
        
        // Add options to dropdown menu
        for (const [name, url] of sources) {
            let optionElem = document.createElement("option") // <option value="0">...</option>
            optionElem.value = url
            optionElem.textContent = name
            dropoutSourcesElem.appendChild(optionElem)
        }
    });

    document.getElementById('addFeedForm').hidden = false
}

function addYouTubeFeed(url, folder=-1) {
    let feed = {}

    return addFeed(feed, folder)
}

function addDropoutFeed(url, folder=-1) {
    let feed = {}

    return addFeed(feed, folder)
}

function addNebulaFeed(url, folder=-1) {
    let feed = {}

    return addFeed(feed, folder)
}

function addTwitchFeed(url, folder=-1) {
    let feed = {}

    return addFeed(feed, folder)
}

function addBlueskyFeed(url, folder=-1) {
    let feed = {}

    return addFeed(feed, folder)
}

function addOtherFeed(url, folder=-1) {
    let feed = {}

    return addFeed(feed, folder)
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