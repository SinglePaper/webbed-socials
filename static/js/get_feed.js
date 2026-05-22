//let targetUrl = "https://www.youtube.com/feeds/videos.xml?playlist_id=UULFGaVdbSav8xWuFWTadK6loA";
let targetUrl = "https://singlepaper.github.io/dropout-rss/feeds/all.xml"

// Source - https://stackoverflow.com/a/78602700
// Posted by Martin Honnen
// Retrieved 2026-05-23, License - CC BY-SA 4.0

async function fetchRSS(targetUrl) {
    const proxyUrl = `http://192.168.0.212:8080/rss-proxy?url=`
    const fetchUrl = `${proxyUrl}${encodeURIComponent(targetUrl)}`;

    try {
        console.log('Fetching URL:', fetchUrl); // Debugging 1: Log the request URL
        const response = await fetch(fetchUrl);
        const data = await response.text();

        console.log('Data fetched:', data); // Debugging 2: Log the raw data
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");

        console.log('Parsed XML:', xmlDoc); // Debugging 3: Log the parsed XML

        const feedTitle = xmlDoc.querySelector("channel").querySelector("title").textContent
        
        const items = xmlDoc.querySelectorAll("item");
        const feedContainer = document.getElementById('feed-container');
        feedContainer.innerHTML = '';

        items.forEach(item => {
            const title = item.querySelector("title").textContent;
            const link = item.querySelector("link").textContent;
            const description = item.querySelector("description").textContent;
            const guid = item.querySelector("guid").textContent;
            const pubDate = item.querySelector("pubDate").textContent;
            let thumbnail = ""; 
            // Extracting thumbnail
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;

            // Find the first image tag
            const img = tempDiv.querySelector('img');
            if (img && img.src) {
                thumbnail = img.src
            }

            const newsItem = document.createElement('div');
            newsItem.classList.add('col');
            newsItem.classList.add('mx-auto');
            newsItem.innerHTML = `
                <a href="${link}" target="_blank" label="${guid}">
                    <div class="card" style="width: 18rem;">
                        <img src="${thumbnail ? thumbnail : ''}">
                        <div class="card-body">
                            <h5 class="card-title">${title}</h5>
                            <p class="card-text">${feedTitle} • ${pubDate}</p>
                        </div>
                    </div>
                </a>
            `;

            feedContainer.appendChild(newsItem);
        });
    } catch (error) {
        console.error('Error fetching the RSS feed:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {fetchRSS(targetUrl)});