//let targetUrl = "https://www.youtube.com/feeds/videos.xml?playlist_id=UULFGaVdbSav8xWuFWTadK6loA";
let targetUrls = [
    "https://singlepaper.github.io/dropout-rss/feeds/feed-game-changer.xml",
    "https://singlepaper.github.io/dropout-rss/feeds/feed-very-important-people.xml",
    "https://singlepaper.github.io/dropout-rss/feeds/feed-make-some-noise.xml",
    // "https://rss.nebula.app/video/channels/jetlag.rss",
    // "https://www.youtube.com/feeds/videos.xml?playlist_id=UULFGaVdbSav8xWuFWTadK6loA",
    // "https://bsky.app/profile/did:plc:hbizd4k2uhfdtph5dwtfai2v/rss"
]


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


function createFeedItem(title,feedTitle,link,guid,pubDate,feedIcon,thumbnail="../images/default_thumbnail.svg", mobile=false) {
    const feedItem = document.createElement('div');

    feedItem.classList.add(mobile?'row':'col');
    feedItem.classList.add('mx-auto');

    let DESKTOP_CARD = `
        <div class="card mx-auto" style="width: 18rem;">
            <img class="card-img-overlay w-auto p-2" src="${feedIcon}">
            <img src="${thumbnail}">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text"><small class="text-body-secondary">${feedTitle} • ${timeSince(pubDate)} ago</small></p>
            </div>
        </div>
    `

    let PHONE_CARD = `
    <div class="row mb-5 text-center">
      ${title}
    </div>
    `

    feedItem.innerHTML = `
        <a href="${link}" target="_blank" label="${guid}">
        <div>
          <div class="d-none d-md-block">
            ${DESKTOP_CARD}
          </div>
          <div class="d-block d-md-none">
            ${PHONE_CARD}
          </div>
        </div>
        </a>
    `
    return feedItem
}

function handleYouTube(xmlDoc) {
    const feedTitle = xmlDoc.querySelector("author").querySelector("name").textContent
    
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
        const feedItemDesktop = createFeedItem(title,feedTitle,link,guid,pubDate,feedIcon,thumbnail);
        const feedItemMobile = createFeedItem(title,feedTitle,link,guid,pubDate,feedIcon,thumbnail, mobile=true);
        feedItems.push([pubDate, feedItemDesktop, feedItemMobile]);
        
    });
    return feedItems
}

function handleBluesky(xmlDoc) {
    const feedTitle = xmlDoc.querySelector("title").textContent
    
    const items = xmlDoc.querySelectorAll("item");
    let feedItems = [];

    items.forEach(item => {
        const link = item.querySelector("link").textContent;
        const description = item.querySelector("description").textContent;
        const postPreview = description.split(" ").slice(0,7).join(" ") + "..."
        const guid = item.querySelector("guid").textContent;
        const pubDate = new Date(item.querySelector("pubDate").textContent);
        const feedIcon = "../images/favicon_bsky.png"
        const feedItemDesktop = createFeedItem(postPreview,feedTitle,link,guid,pubDate,feedIcon);
        const feedItemMobile = createFeedItem(postPreview,feedTitle,link,guid,pubDate,feedIcon);
        feedItems.push([pubDate, feedItemDesktop, feedItemMobile]);
    });
    return feedItems
}


// Source - https://stackoverflow.com/a/78602700
// Posted by Martin Honnen
// Retrieved 2026-05-23, License - CC BY-SA 4.0

async function fetchRSS(targetUrl) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const fetchUrl = `${protocol}//${host}/rss-proxy?url=${encodeURIComponent(targetUrl)}`;
    console.log(fetchUrl)
    try {
        // console.log('Fetching URL:', fetchUrl); // Debugging 1: Log the request URL
        const response = await fetch(fetchUrl);
        const data = await response.text();

        // console.log('Data fetched:', data); // Debugging 2: Log the raw data
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");

        // console.log('Parsed XML:', xmlDoc); // Debugging 3: Log the parsed XML

        // YouTube is weird, so we'll handle it in a separate function.
        if (targetUrl.includes("youtube.com/feeds")) {
            return handleYouTube(xmlDoc)
        }
        // Bluesky is weird, so we'll handle it in a separate function.
        if (targetUrl.includes("bsky.app")) {
            return handleBluesky(xmlDoc)
        }

        const feedTitle = xmlDoc.querySelector("channel").querySelector("title").textContent
        
        const items = xmlDoc.querySelectorAll("item");
        let feedItems = [];

        items.forEach(item => {
            const title = item.querySelector("title").textContent;
            const link = item.querySelector("link").textContent;
            const description = item.querySelector("description").textContent;
            const guid = item.querySelector("guid").textContent;
            const pubDate = new Date(item.querySelector("pubDate").textContent);
            const hosturl = new URL(xmlDoc.querySelectorAll("link")[0].innerHTML)
            const feedIcon = new URL("favicon.ico",hosturl.protocol+"//"+hosturl.hostname).href;

            let thumbnail = "images/default_thumbnail.svg";
            // Extracting thumbnail
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;

            // Find the first image tag
            const img = tempDiv.querySelector('img');
            if (img && img.src) {
                thumbnail = img.src
            }
            const feedItemDesktop = createFeedItem(title,feedTitle,link,guid,pubDate,feedIcon,thumbnail);
            const feedItemMobile = createFeedItem(title,feedTitle,link,guid,pubDate,feedIcon,thumbnail,mobile=true);

            feedItems.push([pubDate, feedItemDesktop, feedItemMobile]);
            
        });
        return feedItems
    } catch (error) {
        console.error('Error fetching the RSS feed:', error);
    }
}

async function loadFeeds() {
    all_feed_items = []
    for (let i in targetUrls) {
        let targetUrl = targetUrls[i]
        all_feed_items = all_feed_items.concat(await fetchRSS(targetUrl))
    }
    all_feed_items.sort(function(a,b){return b[0]-a[0]})
    const feedContainerDesktop = document.getElementById('feed-container-desktop');
    const feedContainerMobile = document.getElementById('feed-container-mobile');
    feedContainerDesktop.innerHTML = '';
    feedContainerMobile.innerHTML = '';

    for (let i in all_feed_items) {
        let feed_item = all_feed_items[i][1]
        feedContainerDesktop.appendChild(feed_item);
        feed_item = all_feed_items[i][2]
        feedContainerMobile.appendChild(feed_item);
    }
}

document.addEventListener('DOMContentLoaded', loadFeeds);