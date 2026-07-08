// (Code from edebu on GitHub: https://github.com/edebu/youtube-channel-id-finder)
async function fetchChannelId(url) {
    const response = await fetch('/api/get-channel-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
        // Throw error to be caught by the catch block
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data.channelId
}