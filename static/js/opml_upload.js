document.getElementById('opmlBtn').addEventListener('click', openDialog);

function openDialog() {
  document.getElementById('opmlFile').click();
}

document.getElementById('opmlFile').addEventListener('change', handleUpload);
function handleUpload() {
    const reader = new FileReader();
    reader.onload = (e) => {
        importFeeds(e.target.result)
    }
    reader.readAsText(this.files[0])
}