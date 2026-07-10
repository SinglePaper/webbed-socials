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

    document.getElementById("addFeedBtn").onclick = function () {
        switch (source) {
            case "youtube": addYouTubeFeed(); break
            case "dropout": addDropoutFeed(); break
            case "nebula": addNebulaFeed(); break
            case "twitch": addTwitchFeed(); break
            case "bluesky": addBlueskyFeed(); break
            case "other": addOtherFeed(); break
        }
    }

    // Enable/Disable the confirmed 'Add' button when appropriate
    const addFeedBtn = document.getElementById("addFeedBtn") 
    const inputs = document.querySelectorAll(`div.${source} .url`);
    inputs.forEach(function (input) {
        input.value = ""
    })
    
    const check = () => {
        addFeedBtn.disabled = [...inputs].some(input => input.value.trim() === "");
    };

    inputs.forEach(input => {
        input.addEventListener("keyup", check);
        input.addEventListener("change", check);
    });

    check();

    // Show form
    document.getElementById('addFeedForm').hidden = false
}

function addYouTubeFeed() {
    const channelUrl = document.querySelector(`div.youtube .url`).value;
    const includeShorts = document.querySelector(`div.youtube .form-check-input`).checked;
    const targetFolder = parseInt(document.querySelector(`#addFeedFolders`).value);
    let feed;
    if (True) { // CHECK IF IT IS A PLAYLIST BEFORE DOING THIS AND HANDLE THAT
        const channelId = fetchChannelId(channelUrl)
        let rssUrl = `` // don't forget to consider includeShorts
        // Fetch URL to get feed name

        // Assemble feed
        feed  = {
            name: "YouTube",
            url: "https://www.youtube.com",
            id: getMaxId(feedList) + 1
        }
    } else {
        let rssUrl = ``
        // Fetch URL to get feed name

        // Assemble feed
        feed  = {
            name: "YouTube",
            url: "https://www.youtube.com",
            id: getMaxId(feedList) + 1
        }
    }
    console.log("Adding YouTube")


    return addFeed(feed, targetFolder)
}

function addDropoutFeed() {
    console.log("Adding Dropout")
    let feed = {}

    return addFeed(feed, folder)
}

function addNebulaFeed() {
    console.log("Adding Nebula")
    let feed = {}

    return addFeed(feed, folder)
}

function addTwitchFeed() {
    console.log("Adding Twitch")
    let feed = {}

    return addFeed(feed, folder)
}

function addBlueskyFeed() {
    console.log("Adding Bluesky")
    let feed = {}

    return addFeed(feed, folder)
}

function addOtherFeed() {
    console.log("Adding Other")
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