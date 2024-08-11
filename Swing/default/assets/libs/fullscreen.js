const fullscreenIcon = document.getElementById('fullscreen-icon');

// Function to toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
            .then(() => localStorage.setItem('fullscreen', 'true'))
            .catch(err => console.error("Error attempting to enable fullscreen mode:", err));
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
                .then(() => localStorage.removeItem('fullscreen'))
                .catch(err => console.error("Error attempting to exit fullscreen mode:", err));
        }
    }
}

// Function to load the fullscreen state
function loadFullscreen() {
    const fullscreenState = localStorage.getItem('fullscreen');
    if (fullscreenState === 'true') {
        document.documentElement.requestFullscreen().catch(err => console.error("Error attempting to enable fullscreen mode:", err));
    }
}

// Event listener for the fullscreen icon
fullscreenIcon.addEventListener('click', toggleFullscreen);

// Load the saved fullscreen state on initial load
window.addEventListener('load', loadFullscreen);

// Update localStorage on fullscreen change
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        localStorage.setItem('fullscreen', 'true');
    } else {
        localStorage.removeItem('fullscreen');
    }
});
