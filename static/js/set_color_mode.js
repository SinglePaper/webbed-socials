// Set to stored color mode on launch
const storedMode = localStorage.getItem("colorMode","")
document.documentElement.setAttribute("data-bs-theme", storedMode)

// Listen for new color modes
window.addEventListener('message', (e) => {
    if (e.data?.type === 'set-theme') {
        document.documentElement.setAttribute('data-bs-theme', e.data.theme);
        localStorage.setItem("colorMode",e.data.theme)
    }
});