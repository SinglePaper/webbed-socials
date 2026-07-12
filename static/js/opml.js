document.getElementById('opmlBtn').addEventListener('click', openDialog);

function openDialog() {
  document.getElementById('opmlFile').click();
}

document.getElementById('opmlFile').addEventListener('change', handleUpload);
function handleUpload() {
  const reader = new FileReader();
  reader.onload = (e) => {
      importOPML(e.target.result)
  }
  reader.readAsText(this.files[0])
}

function downloadOPML () {
  console.log("Downloading OPML...")
  console.log(feedList)
  let opmlString = `\
<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Subscriptions</title>
  </head>
  <body>  
  `

  feedList.folders.forEach(folder => {
    opmlString += `\
      <outline title="${folder.name}" text="${folder.name}">
    `

    folder.feeds.forEach(feed => {
      opmlString += `\
        <outline title="${feed.name}" text="${feed.name}" type="rss" xmlUrl="${feed.url}" htmlUrl="${feed.url}"/>
      `
    });

    opmlString += `\
      </outline>
    `
  });

  feedList.root.forEach(feed => {
    opmlString += `\
      <outline title="${feed.name}" text="${feed.name}" type="rss" xmlUrl="${feed.url}" htmlUrl="${feed.url}"/>
    `
  });
  
  
  opmlString += `\
  </body>
</opml>
  `

  const blob = new Blob([opmlString], { type: "text/plain" });
  
  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create an <a> element
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.opml`; // Filename
  
  // Append to the DOM (required for older browsers)
  document.body.appendChild(a);
  
  // Trigger the download
  a.click();
  
  // Cleanup: Revoke the temporary URL and remove the element
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function downloadLocalStorage() {
  const blob = new Blob([localStorage], { type: "text/plain" });
  
  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create an <a> element
  const a = document.createElement("a");
  a.href = url;
  a.download = `localStorage-${Date.now()}.opml`; // Filename
  
  // Append to the DOM (required for older browsers)
  document.body.appendChild(a);
  
  // Trigger the download
  a.click();
  
  // Cleanup: Revoke the temporary URL and remove the element
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}