const express = require('express');
const path = require('path')
const cors = require('cors');
const axios = require('axios');

const fetch = require('node-fetch');
const { fileURLToPath } = require('url');

const app = express();
const PORT = 8080;
const CACHINGTIME = 300 // time between cache updates in seconds

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.static('static'));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, 'static', 'html', 'index.html'))
})

const rssCache = {};

// RSS/Atom feed proxy
app.get('/api/rss-proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing "url" query parameter');
  }

  
  if (url in rssCache && (Date.now() - rssCache[url].timestamp) < (CACHINGTIME * 1000)) {
    res.send(rssCache[url].data);
    return
  }
  try {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Content-Disposition', 'inline');
    const response = await axios.get(url, {
      responseType: 'text',
      headers: { Accept: 'application/xml,text/xml,*/*' }
    });
    console.log(url)
    res.send(response.data);
    rssCache[url] = {
      timestamp: Date.now(),
      data: response.data
    }
    // console.log(`Updating cache for ${url}`)
  } catch (error) { 
    console.error('Error fetching RSS feed:', error.message);
    res.status(500).send('Failed to fetch RSS feed');
  }
});

// API Endpoint to get Channel ID (Code from edebu on GitHub: https://github.com/edebu/youtube-channel-id-finder)
app.post('/api/get-channel-id', async (req, res) => {
    const youtubeUrl = req.body.url;
    if (!youtubeUrl) {
        return res.status(400).json({ error: 'YouTube URL is required.' });
    }

    try {
        // console.log(`Fetching URL: ${youtubeUrl}`);
        // Fetch the HTML content of the YouTube channel page
        const response = await fetch(youtubeUrl, {
            headers: {
                // Mimic a browser user agent to avoid simple blocks
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();

        // Look for the channel ID using a regular expression
        // Common patterns: "externalId":"UC..." or <meta itemprop="channelId" content="UC...">
        const match = html.match(/"externalId":"(UC[\w-]{22})"/) || html.match(/<meta\s+itemprop="channelId"\s+content="(UC[\w-]{22})"/);

        if (match && match[1]) {
            const channelId = match[1];
            // console.log(`Found Channel ID: ${channelId}`);
            res.json({ channelId });
        } else {
            console.error('Could not find Channel ID in the page source.');
            res.status(404).json({ error: 'Could not find Channel ID. The URL might be incorrect, private, or the page structure might have changed.' });
        }
    } catch (error) {
        console.error('Error fetching or parsing YouTube URL:', error);
        res.status(500).json({ error: 'An error occurred while processing the URL.' });
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`RSS Proxy running on http://localhost:${PORT}`);
});
