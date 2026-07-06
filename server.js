const express = require('express');
const path = require('path')
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 8080;
const CACHINGTIME = 300 // time between cache updates in seconds

// Enable CORS for all routes
app.use(cors());

// Middleware to serve static files from a directory
app.use(express.static('static'));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, 'static', 'html', 'index.html'))
})

const rssCache = {};

// Generic RSS/Atom feed proxy
app.get('/rss-proxy', async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`RSS Proxy running on http://localhost:${PORT}`);
});
