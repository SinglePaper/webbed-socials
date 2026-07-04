let targetUrls;

function loadUrls() { // Not implemented
  let feedList = JSON.parse(localStorage.feedList)
  console.log(feedList)
  if (feedList.folders.length === 0 && feedList.root.length === 0) return []
  let feedUrls = [
    ...feedList.folders.flatMap(f => f.feeds.map(feed => feed.url)),
    ...feedList.root.map(feed => feed.url)
  ]
  return feedUrls
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


function createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,thumbnail="../images/default_thumbnail_720p.png", mobile=false) {
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
      <div class="mb-4">
        <div class="text-start position-relative">
          <div class="position-relative">
            <img
              src="${thumbnail}"
              class="w-100 shadow-1-strong rounded mb-2 img-fluid"
              style="display:block;"
              alt=""
            >

            <img
              src="${feedIcon}"
              class="position-absolute m-2 img-fluid"
              style="width:15%; height:auto; top:0; left:0;"
              alt=""
            >
          </div>

          <b>${title}</b><br>
          <small>${shortenString(feedTitle, 15)}<br>${timeSince(pubDate)} ago</small>
        </div>
      </div>
    `

    let PHONE_CARD = `
    <div class="row mb-3">
      <div class="col-6">
          <div class="position-relative">
            <img
              src="${thumbnail}"
              class="w-100 shadow-1-strong rounded mb-2 img-fluid"
              style="display:block;"
              alt=""
            >

            <img
              src="${feedIcon}"
              class="position-absolute m-2 img-fluid"
              style="width:15%; height:auto; top:0; left:0;"
              alt=""
            >
          </div>
      </div>
      <div class="col-6">
        <p style="text-align:left; text-overflow: ellipsis; overflow: hidden;display: -webkit-box; -webkit-line-clamp: 4; line-clamp: 4; -webkit-box-orient: vertical;">
          <b>${title}</b><br>
          <small>${description}</small>
        </p>
      </div>
      <small class="text-body-secondary" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${shortenString(feedTitle, 15)} • ${timeSince(pubDate)} ago</small>
    </div>
    
    ` //<hr style="padding:0px; margin:1rem;">

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
        const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,thumbnail);
        const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,thumbnail, mobile=true);
        feedItems.push([pubDate, feedItemDesktop, feedItemMobile]);
        
    });
    return feedItems
}

function handleTwitch(xmlDoc) {
    const feedTitle = xmlDoc.querySelector("title").textContent.split("'s Twitch")[0]

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

        const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,thumbnail);
        const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,thumbnail, mobile=true);
        feedItems.push([pubDate, feedItemDesktop, feedItemMobile]);
        
    });
    return feedItems
}

function handleBluesky(xmlDoc) {
    const feedTitle = xmlDoc.querySelector("title").textContent
    
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
        const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon);
        const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon);
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
    // console.log(fetchUrl)
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
        // Twitch is weird, so we'll handle it in a separate function.
        if (targetUrl.includes("twitchrss")) {
            return handleTwitch(xmlDoc)
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
            let description = item.querySelector("description").textContent;
            const guid = item.querySelector("guid").textContent;
            const pubDate = new Date(item.querySelector("pubDate").textContent);
            const hosturl = new URL(xmlDoc.querySelectorAll("link")[0].innerHTML)
            const feedIcon = new URL("favicon.ico",hosturl.protocol+"//"+hosturl.hostname).href;

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
            const feedItemDesktop = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,thumbnail);
            const feedItemMobile = createFeedItem(title,feedTitle,description,link,guid,pubDate,feedIcon,thumbnail,mobile=true);

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


window.addEventListener('message', (e) => {
    if (e.data?.type === 'load-feeds') {
      console.log("Fetching urls...")
      console.log("Loading feeds...")
      targetUrls = loadUrls()
      loadFeeds()
    }
});

// document.addEventListener('DOMContentLoaded', loadFeeds);

