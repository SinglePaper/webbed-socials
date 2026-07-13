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
            optionElem.textContent = name.replace(/\b\w/, (c) => c.toUpperCase())
            dropoutSourcesElem.appendChild(optionElem)
        }
    });

    document.getElementById("addFeedBtn").onclick = async function () {
        switch (source) {
            case "youtube": await addYouTubeFeed(); break
            case "dropout": await addDropoutFeed(); break
            case "nebula": await addNebulaFeed(); break
            case "twitch": await addTwitchFeed(); break
            case "bluesky": await addBlueskyFeed(); break
            case "other": await addOtherFeed(); break
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

async function addYouTubeFeed() {
    const formUrl = document.querySelector(`div.youtube .url`).value;
    const includeShorts = document.querySelector(`div.youtube .form-check-input`).checked;
    const targetFolder = parseInt(document.querySelector(`#addFeedFolders`).value);
    let feed;

    const isChannel = !formUrl.includes("playlist?list=")
    const isRSS = formUrl.includes("feeds/videos.xml?")
    if (isChannel && !isRSS) {
        const channelId = await fetchChannelId(formUrl)
        let rssUrlShorts = `https://www.youtube.com/feeds/videos.xml?${"channel_id"}=${channelId}`
        let rssUrlNoShorts = `https://www.youtube.com/feeds/videos.xml?${"playlist_id"}=${"UULF"+channelId.substring(2)}` 

        // Fetch URL to get feed name
        let name = await getFeedName(rssUrlNoShorts)

        // Assemble feed
        feed = {
            name: name,
            url: includeShorts ? rssUrlShorts : rssUrlNoShorts,
            urlShorts: rssUrlShorts,
            urlNoShorts: rssUrlNoShorts,
            includeShorts: includeShorts,
            id: getMaxId(feedList) + 1
        }
    } else if (!isChannel && !isRSS) {
        let rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${formUrl.split("playlist?list=")[1]}`
        console.log(rssUrl)
        // Fetch URL to get feed name
        let name = await getFeedName(rssUrl)
        // Assemble feed
        feed = {
            name: name,
            url: rssUrl,
            id: getMaxId(feedList) + 1
        }
    } else {
        // Fetch URL to get feed name
        let name = await getFeedName(formUrl)
        
        // Assemble feed
        feed  = {
            name: name,
            url: formUrl,
            id: getMaxId(feedList) + 1
        }
    }
    console.log("Adding YouTube")

    return addFeed(feed, targetFolder)
}

async function getFeedName(url) {
    return await document.getElementById("frame").contentWindow.fetchRSS({
        "url": url
    }, nameOnly=true)
}

function addDropoutFeed() {
    let rssUrl = `https://singlepaper.github.io/dropout-rss/${document.getElementById("selectDropoutSources").value}` // check this
    let feedTitle = document.getElementById("selectDropoutSources").selectedOptions[0].textContent
    const targetFolder = parseInt(document.querySelector(`#addFeedFolders`).value);
    
    console.log("Adding Dropout")
    let feed  = {
        name: feedTitle,
        url: rssUrl,
        id: getMaxId(feedList) + 1
    }

    return addFeed(feed, targetFolder)
}

async function addNebulaFeed() {
    const formUrl = document.querySelector(`div.nebula .url`).value;
    const nebulaPlusOnly = document.querySelector(`#checkPlus`).checked;
    const targetFolder = parseInt(document.querySelector(`#addFeedFolders`).value);
    let rssUrl, rssUrlAll, rssUrlPlus, name;
    let isChannel = !formUrl.includes("?category=")

    if (isChannel) {
        let channelName = formUrl.split("nebula.tv/")[1].replace("/","")
        name = channelName
        rssUrlAll = `https://rss.nebula.app/video/channels/${channelName}.rss`
        rssUrlPlus = `https://rss.nebula.app/video/channels/${channelName}.rss?plus=true`
        rssUrl = nebulaPlusOnly ? rssUrlPlus: rssUrlAll
    } else {
        let categoryName = formUrl.split("videos?category=")[1].replace("/","")
        name = categoryName
        rssUrlAll = `https://rss.nebula.app/video/categories/${categoryName}.rss}`
        rssUrlPlus = `https://rss.nebula.app/video/categories/${categoryName}.rss?plus=true}`
        rssUrl = nebulaPlusOnly ? rssUrlPlus: rssUrlAll
    }

    // Fetch URL to get feed name
    name = await getFeedName(rssUrl)

    // Assemble feed
    console.log("Adding Nebula")
    let feed  = {
        name: name,
        url: rssUrl,
        urlAll: rssUrlAll,
        urlPlus: rssUrlPlus,
        plusOnly: nebulaPlusOnly,
        id: getMaxId(feedList) + 1
    }
    console.log(feed)
    return addFeed(feed, targetFolder)
}

async function addTwitchFeed() {
    const formUrl = document.querySelector(`div.twitch .url`).value;
    const targetFolder = parseInt(document.querySelector(`#addFeedFolders`).value);
    console.log("Adding Twitch")
    const channelName = formUrl.split("twitch.tv/")[1].replace("/","")
    const rssUrl = `https://twitchrss.appspot.com/vod/${channelName}`

    // Fetch URL to get feed name (not really necessary)
    let name = await getFeedName(rssUrl)

    // Assemble feed
    let feed = {
        name: name,
        url: rssUrl,
        id: getMaxId(feedList) + 1 
    }

    return addFeed(feed, targetFolder)
}

async function addBlueskyFeed() {
    const formUrl = document.querySelector(`div.bluesky .url`).value;
    const targetFolder = parseInt(document.querySelector(`#addFeedFolders`).value);

    console.log("Adding Bluesky")
    const rssUrl = `${formUrl}/rss`

    // Fetch URL to get feed name (not really necessary)
    let name = await getFeedName(rssUrl)

    // Assemble feed
    let feed = {
        name: name,
        url: rssUrl,
        id: getMaxId(feedList) + 1 
    }

    return addFeed(feed, targetFolder)
}

async function addOtherFeed() {
    const formUrl = document.querySelector(`div.other .url`).value;
    const rssUrl = formUrl
    const targetFolder = parseInt(document.querySelector(`#addFeedFolders`).value);
    console.log("Adding Other")

    // Fetch URL to get feed name (not really necessary)
    let name = await getFeedName(rssUrl)

    // Assemble feed
    let feed = {
        name: name,
        url: rssUrl,
        id: getMaxId(feedList) + 1 
    }

    return addFeed(feed, targetFolder)
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