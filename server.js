const express = require('express');
const path = require('path')
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 8080;

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

  if (url in rssCache && (Date.now() - rssCache[url].timestamp) > 300000) {
    res.send(rssCache[url].data);
    return
  }

  try {
    const response = await axios.get(url, {
      headers: { 'Accept': 'application/xml' }
    });
    res.set('Content-Type', 'application/xml');
    res.send(response.data);
    rssCache[url] = {
      timestamp: Date.now(),
      data: response.data
    }
  } catch (error) {
    console.error('Error fetching RSS feed:', error.message);
    res.status(500).send('Failed to fetch RSS feed');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`RSS Proxy running on http://localhost:${PORT}`);
});
