let targetFeeds;
let feedInfos = {}
localStorage.allFeedItems = JSON.stringify([])

let allFeedItems = []

function loadUrls(ids=[]) {
  let feedList = JSON.parse(localStorage.feedList)
  // console.log(feedList)
  if (feedList.folders.length === 0 && feedList.root.length === 0) return []
  let feeds = [
    ...feedList.folders.flatMap(f => f.feeds),
    ...feedList.root.map(feed => feed)
  ]

  if (ids.length > 0) {
    feeds = feeds.filter(item => ids.includes(item.id))
  }
  return feeds
}

// Source - https://stackoverflow.com/a/3177838
// Posted by Sky Sanders, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-23, License - CC BY-SA 4.0

function timeSince(date) {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (Math.floor(interval) == 1) {
    return Math.floor(interval) + " year";
  }
  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (Math.floor(interval) == 1) {
    return Math.floor(interval) + " month";
  }
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (Math.floor(interval) == 1) {
    return Math.floor(interval) + " day";
  }
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (Math.floor(interval) == 1) {
    return Math.floor(interval) + " hour";
  }
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (Math.floor(interval) == 1) {
    return Math.floor(interval) + " minute";
  }
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }

  if (Math.floor(seconds) == 1) {
    return Math.floor(seconds) + " second";
  }
  return Math.floor(seconds) + " seconds";
}

// Source - https://stackoverflow.com/a/27778372
// Posted by Per Kristian, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-23, License - CC BY-SA 4.0

function getBaseUrl(url) {
    var re = new RegExp(/^.*\//);
    return re.exec(url);
}

function removeHTML(text) {
  return text.replace(/<[^>]*>/g, ' ')
}

function shortenString(string, n){
  let splitString = string.split(" ")
  if (splitString.length <= n) return string
  return splitString.slice(0,n).join(" ") + "..."
}

function extractFirstUrl(str) {
  const match = str.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0] : '';
}

function createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,feedId, thumbnail="../images/default_thumbnail_720p.png", mobile=false) {
    const feedItem = document.createElement('div');
    if (mobile) {
      feedItem.classList.add('row');
    } else {
      feedItem.classList.add('col-12');
      feedItem.classList.add('col-md-6');
      feedItem.classList.add('col-lg-3');
      feedItem.classList.add('col-xl-3');
    }

    let DESKTOP_CARD = `
      <div class="mb-4" label="${guid}">
        <div class="text-start position-relative">
          <a href="${link}" target="_blank">
            <div class="position-relative">
              <div class="ratio ratio-16x9 mb-2">
                <img
                  src="${thumbnail}"
                  class="w-100 shadow-1-strong rounded img-fluid"
                  style="display:block; object-fit: cover"
                  alt=""
                >
              </div>

              <img
                src="${feedIcon}"
                class="position-absolute m-2 img-fluid"
                style="width:15%; height:auto; top:0; left:0;"
                alt=""
              >
            </div>

            <b>${title}</b><br>
          </a>
          <small><a onclick="initLoadFeeds(ids=[${feedId}])" style="cursor:pointer">${shortenString(feedTitle, 15)}</a><br>${timeSince(pubDate)} ago</small>
        </div>
      </div>
    `

    let PHONE_CARD = `
    <div class="row mb-3" label="${guid}">
        <div class="col-6">
          <a href="${link}" target="_blank">
            <div class="position-relative">
              <div class="ratio ratio-16x9 mb-2">
                <img
                  src="${thumbnail}"
                  class="w-100 shadow-1-strong rounded img-fluid"
                  style="display:block; object-fit: cover"
                  alt=""
                >
              </div>
              <img
                src="${feedIcon}"
                class="position-absolute m-2 img-fluid"
                style="width:15%; height:auto; top:0; left:0;"
                alt=""
              >
            </div>
          </a>
        </div>
        <div class="col-6">
          <a href="${link}" target="_blank" label="${guid}">
            <p style="text-align:left; text-overflow: ellipsis; overflow: hidden;display: -webkit-box; -webkit-line-clamp: 4; line-clamp: 4; -webkit-box-orient: vertical;">
              <b>${title}</b><br>
              <small>${description}</small>
            </p>
          </a>
        </div>
      <small class="text-body-secondary" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
        <a onclick="initLoadFeeds(ids=[${feedId}])" style="cursor:pointer">${shortenString(feedTitle, 15)}</a> • ${timeSince(pubDate)} ago
      </small>
      
    </div>
    
    ` //<hr style="padding:0px; margin:1rem;">

    feedItem.innerHTML = `
        <div>
          <div class="d-none d-md-block">
            ${DESKTOP_CARD}
          </div>
          <div class="d-block d-md-none">
            ${PHONE_CARD}
          </div>
        </div>
    `
    
    return feedItem.outerHTML
}

function handleYouTube(xmlDoc, targetFeed, nameOnly = false) {
    const feedTitle = xmlDoc.querySelector("author").querySelector("name").textContent
    if (nameOnly) {return feedTitle}

    const items = xmlDoc.querySelectorAll("entry");
    let feedItems = [];

    items.forEach(item => {
        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").attributes.href.value;
        const description = item.querySelector("description").textContent;
        const guid = item.querySelector("id").textContent;
        const pubDate = new Date(item.querySelector("published").textContent);
        const hosturl = new URL(item.querySelector("link").attributes.href.value)
        const feedIcon = "../images/favicon_yt.png"
        const thumbnail = item.querySelector("thumbnail").attributes.url.value.replace("hqdefault", "hq720")
        const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail);
        const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail, mobile=true);
        feedItems.push([pubDate, guid, feedItemDesktop, feedItemMobile]);

        // Store information for feeds list in sidebar
        feedInfos[targetFeed.id] = {
          "displayName": targetFeed.name,
          "originalName": feedTitle,
          "icon": feedIcon,
          "nItems": items.length
        }
    });


    return feedItems
}

function handleTwitch(xmlDoc, targetFeed, nameOnly = false) {
    const feedTitle = xmlDoc.querySelector("title").textContent.split("'s Twitch")[0]
    if (nameOnly) {return feedTitle}

    const items = xmlDoc.querySelectorAll("item");
    let feedItems = [];

    items.forEach(item => {
        const title = item.querySelector("title").textContent;
        const description = `New stream by ${feedTitle}`
        const guid = item.querySelector("guid").textContent;
        const pubDate = new Date(item.querySelector("pubDate").textContent);
        const hosturl = new URL(item.querySelector("link").textContent)
        const feedIcon = "../images/favicon_twitch.png";

        let thumbnail = "../images/default_thumbnail_720p.svg";
        // Extracting thumbnail
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.querySelector("description").textContent;

        // Find the first image tag
        const img = tempDiv.querySelector('img');
        let currentlyLive = false
        if (img && img.src) {
            currentlyLive = img.src.includes("404_processing")
            thumbnail = currentlyLive ? `https://static-cdn.jtvnw.net/previews-ttv/live_user_${feedTitle}.jpg` : img.src
        }
        const link = currentlyLive ? `https://www.twitch.tv/${feedTitle}` : item.querySelector("link").textContent;

        const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail);
        const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail, mobile=true);
        feedItems.push([pubDate, guid, feedItemDesktop, feedItemMobile]);

        // Store information for feeds list in sidebar
        feedInfos[targetFeed.id] = {
          "displayName": targetFeed.name,
          "originalName": feedTitle,
          "icon": feedIcon,
          "nItems": items.length
        }
        
    });
    return feedItems
}

function handleBluesky(xmlDoc, targetFeed, nameOnly = false) {
    const feedTitle = xmlDoc.querySelector("title").textContent
    if (nameOnly) {return feedTitle}

    const items = xmlDoc.querySelectorAll("item");
    let feedItems = [];

    items.forEach(item => {
        const title = "New Post on Bluesky"
        const link = item.querySelector("link").textContent;
        const description = item.querySelector("description").textContent;
        const postPreview = shortenString(description, 7)
        const guid = item.querySelector("guid").textContent;
        const pubDate = new Date(item.querySelector("pubDate").textContent);
        const feedIcon = "../images/favicon_bsky.png"
        const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id);
        const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id);
        feedItems.push([pubDate, guid, feedItemDesktop, feedItemMobile]);

        // Store information for feeds list in sidebar
        feedInfos[targetFeed.id] = {
          "displayName": targetFeed.name,
          "originalName": feedTitle,
          "icon": feedIcon,
          "nItems": items.length
        }
    });
    return feedItems
}

function handleRDF(xmlDoc, targetFeed, nameOnly = false) {
    const feedTitle = xmlDoc.querySelector("title").textContent
    if (nameOnly) {return feedTitle}
    
    const items = xmlDoc.querySelectorAll("item");
    let feedItems = [];

    items.forEach(item => {
        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").textContent;
        let description = item.querySelector("description").textContent;
        const guid = item.querySelector("link").textContent;
        const pubDate = new Date(item.querySelector("date").textContent);
        const hosturl = new URL(xmlDoc.querySelectorAll("link")[0].innerHTML || xmlDoc.querySelectorAll("link")[0].attributes.href.value);
        const feedIcon = new URL("favicon.ico",hosturl.protocol+"//"+hosturl.hostname).href ;

        let thumbnail = "../images/default_thumbnail.svg";
        // Extracting thumbnail
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;

        // Find the first image tag
        const img = tempDiv.querySelector('img');
        if (img && img.src) {
            thumbnail = img.src
        }

        description = removeHTML(description)
        const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail);
        const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail,mobile=true);

        feedItems.push([pubDate, guid, feedItemDesktop, feedItemMobile]);

        // Store information for feeds list in sidebar
        feedInfos[targetFeed.id] = {
          "displayName": targetFeed.name,
          "originalName": feedTitle,
          "icon": feedIcon,
          "nItems": items.length
        }
    });
    return feedItems
}


// Source - https://stackoverflow.com/a/78602700
// Posted by Martin Honnen
// Retrieved 2026-05-23, License - CC BY-SA 4.0

async function fetchRSS(targetFeed, nameOnly = false) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const fetchUrl = `${protocol}//${host}/api/rss-proxy?url=${encodeURIComponent(targetFeed.url)}`;
    // console.log(fetchUrl)
    try {
        // console.log('Fetching URL:', fetchUrl); // Debugging 1: Log the request URL
        const response = await fetch(fetchUrl);
        const data = await response.text();

        // console.log('Data fetched:', data); // Debugging 2: Log the raw data
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        // console.log(xmlDoc)
        // console.log('Parsed XML:', xmlDoc); // Debugging 3: Log the parsed XML

        // YouTube is weird, so we'll handle it in a separate function.
        if (targetFeed.url.includes("youtube.com/feeds")) {
            return handleYouTube(xmlDoc, targetFeed, nameOnly)
        }        
        // Twitch is weird, so we'll handle it in a separate function.
        if (targetFeed.url.includes("twitchrss")) {
            return handleTwitch(xmlDoc, targetFeed, nameOnly)
        }
        // Bluesky is weird, so we'll handle it in a separate function.
        if (targetFeed.url.includes("bsky.app")) {
            return handleBluesky(xmlDoc, targetFeed, nameOnly)
        }
        // RDF works a little differently
        if (xmlDoc.querySelector("RDF")) {
            return handleRDF(xmlDoc, targetFeed, nameOnly)
        }

        let feedTitle;
        try {
          feedTitle = xmlDoc.querySelector("channel").querySelector("title").textContent
        } catch (error) {
          feedTitle = xmlDoc.querySelector("feed").querySelector("title").textContent
        }

        if (nameOnly) {return feedTitle}
        
        let items = xmlDoc.querySelectorAll("item");
        if (items.length == 0) {
          items = xmlDoc.querySelectorAll("entry");
        }
        let feedItems = [];

        items.forEach(item => {
            const title = item.querySelector("title").textContent;
            let link = item.querySelector("link").textContent;
            if (link.length == 0) {
              link = item.querySelector("link").attributes.href.value
            }
            let description;
            try {
              description = item.querySelector("description").textContent;
            } catch (error) {
              description = item.querySelector("summary").textContent;
            }
            let guid;
            try {
              guid = item.querySelector("guid").textContent;
            } catch (error) {
              guid = item.querySelector("id").textContent;
            }
            let pubDate;
            try {
              pubDate = new Date(item.querySelector("pubDate").textContent);
            } catch (error) {
              pubDate = new Date(item.querySelector("published").textContent);
            }
            const hosturl = new URL(xmlDoc.querySelectorAll("link")[0].innerHTML || xmlDoc.querySelectorAll("link")[0].attributes.href.value);
            const feedIcon = new URL("favicon.ico",hosturl.protocol+"//"+hosturl.hostname).href ;

            let thumbnail = "../images/default_thumbnail.svg";
            // Extracting thumbnail
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;

            // Find the first image tag
            let img = tempDiv.querySelector('img');
            if (img && img.src) {
                thumbnail = img.src
            } else {
              // console.log("Last attempt to get thumbnail")
              // Find the first image tag
              let img = xmlDoc.getElementsByTagName('image')[0];
              if (img && extractFirstUrl(img.innerHTML)) {
                  thumbnail = extractFirstUrl(img.innerHTML)
              }
            }

            description = removeHTML(description)
            const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail);
            const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,targetFeed.id,thumbnail,mobile=true);

            feedItems.push([pubDate, guid, feedItemDesktop, feedItemMobile]);
            
            // Store information for feeds list in sidebar
            feedInfos[targetFeed.id] = {
              "displayName": targetFeed.name,
              "originalName": feedTitle,
              "icon": feedIcon,
              "nItems": items.length
            }
        });



        return feedItems
    } catch (error) {
        console.error(`Error fetching the RSS feed ( ${fetchUrl} ):`, error);
    }
}

// Displays items that have been previously retrieved (could have been saved)
function displayItems() {
    allFeedItems.sort(function(a,b){return new Date(b[0]) - new Date(a[0])})
    const feedContainerDesktop = document.getElementById('feed-container-desktop');
    const feedContainerMobile = document.getElementById('feed-container-mobile');
    feedContainerDesktop.innerHTML = '';
    feedContainerMobile.innerHTML = '';

    allFeedItems.forEach(item => {
        feedContainerDesktop.insertAdjacentHTML('beforeend', item[2]);
        feedContainerMobile.insertAdjacentHTML('beforeend', item[3]);
    });
}


async function loadFeeds() {
    // Display saved items
    if (allFeedItems.length > 0) {displayItems()}

    // Fetch items
    for (let i in targetFeeds) {
        let targetFeed = targetFeeds[i]
        let items = await fetchRSS(targetFeed)

        // Exclude pre-existing items
        items.forEach(item => {
          if (!allFeedItems.find((existingItem) => existingItem[1] == item[1])) { allFeedItems.push(item) } 
        })
    }
    const textEncoder = new TextEncoder();
    console.log("Feed items list size: ",textEncoder.encode(JSON.stringify(allFeedItems)).length);
    // Store info
    localStorage.feedInfos = JSON.stringify(feedInfos)

    // Display updated items
    displayItems()

    window.parent.postMessage({ type: 'populate-feeds-menu' }, '*') // Repopulate feeds menu with updated icons and feed item counts
    console.log("Finished reloading feeds!")
}


function initLoadFeeds(ids) {
    document.getElementById("feed-container-desktop").innerHTML = `
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `
    document.getElementById("feed-container-mobile").innerHTML = `
      <div class="row">
        <div class="d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    `
    targetFeeds = loadUrls(ids = ids)  // The argument 'ids' can be used to load items with only specific ids
    loadFeeds()
}

window.addEventListener('message', (e) => {
    if (e.data?.type === 'load-feeds') {
      initLoadFeeds(e.data?.ids === undefined ? [] : JSON.parse(e.data?.ids))
    }
});

