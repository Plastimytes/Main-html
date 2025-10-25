
const SHORTS_URL_PREFIX = '/shorts/'; 
// YouTube's main video player path

const WATCH_URL_PREFIX = '/watch'; 

// --- Redirection Logic ---
function checkForShortsRedirection() {
    // Check if the current URL is a /shorts/ URL
    if (window.location.pathname.startsWith(SHORTS_URL_PREFIX)) {
        // Option 1: Convert the Shorts URL to a standard watch URL and redirect
        // The URL is typically: /shorts/VIDEO_ID
        const videoId = window.location.pathname.substring(SHORTS_URL_PREFIX.length);
        
        // This is the ideal way: convert to a regular video link and keep the full URL
        const newUrl = `${WATCH_URL_PREFIX}?v=${videoId}${window.location.search}${window.location.hash}`;
        
        console.log(`[Shorts Filter] Redirecting from Shorts to regular video URL: ${newUrl}`);
        
        // Use window.location.replace to prevent the user from hitting the back button 
        // and landing back on the Shorts page.
        window.location.replace(newUrl);
    }
}

// --- Dynamic Content Hiding Logic (for the homepage, etc.) ---

// This function will be called whenever the DOM is mutated (content is added/removed/changed)
function handleMutations(mutations) {
    let shortsFound = false;

    // Use a CSS selector that targets Shorts sections or individual shorts thumbnails.
    // YouTube uses a combination of these over time:
    const shortsSelectors = [
        // 1. Sidebar link (ytd-guide-entry-renderer) - handled by CSS, but good to check
        'ytd-guide-entry-renderer a[title="Shorts"]', 
        // 2. Shorts shelf on homepage/subscriptions (ytd-rich-shelf-renderer)
        'ytd-rich-shelf-renderer:has(a[href*="/shorts"])', 
        // 3. Individual video cards in grids (ytd-video-renderer or ytd-grid-video-renderer)
        'ytd-video-renderer:has(a[href^="/shorts"])',
        'ytd-grid-video-renderer:has(a[href^="/shorts"])'
    ];

    shortsSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.style.display !== 'none') {
                element.style.display = 'none';
                shortsFound = true;
            }
        });
    });

    if (shortsFound) {
        console.log(`[Shorts Filter] Hidden shorts elements in the dynamically loaded content.`);
    }
}

// --- Initialization ---

// 1. Run the initial check/redirection immediately
checkForShortsRedirection();

// 2. Set up the MutationObserver to monitor for dynamically loaded content
const observer = new MutationObserver(handleMutations);

// Start observing the entire document body for changes in the subtree
observer.observe(document.body, { 
    childList: true, // Watch for new nodes being added/removed
    subtree: true    // Watch all descendants of the body
});

// 3. Re-check on history state changes (for navigation that doesn't trigger a full page load)
// This is critical for YouTube's single-page application (SPA) nature.
window.addEventListener('yt-page-data-updated', () => {
    checkForShortsRedirection();
    // A slight delay ensures the new content has been added to the DOM before trying to hide it
    setTimeout(handleMutations, 100); 
});

window.addEventListener('popstate', checkForShortsRedirection);