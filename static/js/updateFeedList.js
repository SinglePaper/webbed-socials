function upgradeFeedList() {

    for (let i of [...Array(getMaxId(feedList)+1).keys()]) {
        let feed = getFeed(i)
        if (!feed || feed.source) continue
        console.log(feed.url)
        if (feed.url.includes("youtube.com/feeds")) {
            let isChannel = ( feed.url.includes("=UC") || feed.url.includes("=UULF") )
            feed.source = "YouTube"
            feed.type = isChannel ? "channel" : "playlist"
            if (isChannel) {
                feed.includeShorts = feed.url.includes("=UC")
                feed.urlShorts = feed.includeShorts ? feed.url : feed.url.replace("playlist_id=UULF", "channel_id=UC")
                feed.urlNoShorts = !feed.includeShorts ? feed.url : feed.url.replace("channel_id=UC", "playlist_id=UULF")
            }
        }

        else if (feed.url.includes("github.io/dropout-rss/")) feed.source = "Dropout";
        else if (feed.url.includes("twitchrss.appspot.com")) feed.source = "Twitch";
        else if (feed.url.includes("bsky.app")) feed.source = "Bluesky";
        else feed.source = "Other";
        console.log(feed)
    }
    return feedList
}
upgradeFeedList()