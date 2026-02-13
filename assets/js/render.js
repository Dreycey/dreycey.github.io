// Shared header/footer rendering
document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
});

function renderHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    // Determine active link
    const path = window.location.pathname;
    const isHome = path.endsWith('/') || path.endsWith('index.html');
    const isPubs = path.includes('/publications/');
    
    // Adjust paths for assets if deep in subdir
    const root = path.includes('/publications/') || path.includes('/tags/') || path.includes('/authors/') ? '../../' : './';
    // Actually, simple relative check: count depth
    // Or use absolute path '/v2/' if hosted at root. But user said "Prefer absolute paths /assets/... when possible" but also "support relative paths".
    // Since this is static on GitHub pages, it might be at /repo-name/. 
    // Safest is to rely on simple relative links for nav if we know structure.
    // For now I'll use relative links based on depth.
    
    const getLink = (href) => {
        // If we are in root, href is just href.
        // If we are in publications/, href is ../href
        // If we are in publications/slug/, href is ../../href
        const depth = path.split('/').length - 2; // approximation. 
        // Better:
        if (href.startsWith('http')) return href;
        if (href.startsWith('/')) return href; // Absolute
        
        // Simple hack: assume we are either in root or 1 level deep (publications/) or 2 (publications/slug/)
        // But let's just use absolute paths assuming /v2 root if we can, OR simply hardcode navigation based on current location.
        // Let's use the provided requirement: "support relative paths"
        
        // Let's assume the script is included via relative path, so we can't easily guess 'root' unless we look at script src.
        // But easier: The HTML structure is flat mostly.
        
        // Let's check if we are in a subdirectory
        const segments = window.location.pathname.split('/').filter(Boolean);
        const last = segments[segments.length-1];
        
        // If we are serving from a subdir 'v2', let's find relative path back to 'v2' root
        // But locally it might be different.
        // Let's stick to absolute paths if possible, but user said "GitHub Pages - Deploy from branch -> /root".
        // So if it's user.github.io, root is /. If user.github.io/repo, root is /repo/.
        // I will use a base path variable.
    };

    const nav = `
    <div class="container nav">
        <a href="index.html" class="logo">D.A.</a>
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="publications/index.html">Publications</a></li>
        </ul>
    </div>
    `;
    
    // Use relative paths fixing
    // This is a naive implementation. For robust static sites, usually absolute paths / are best if we know the base URL.
    // I'll try to detect if we need "../"
    
    // Better approach: Since we are using "ONLY HTML/CSS/vanilla JS", we can just use absolute paths if we assume the site is at root or we use <base>.
    // But let's try to be smart.
    
    const depth = document.location.pathname.split('/').length; 
    // This is tricky without knowing the deploy path. 
    // Let's look at the script src to find the base.
    const scripts = document.getElementsByTagName('script');
    let basePath = '';
    for(let s of scripts) {
        if(s.src.includes('render.js')) {
            basePath = s.src.replace('assets/js/render.js', '');
            break;
        }
    }

    header.innerHTML = `
    <div class="container nav">
        <a href="${basePath}index.html" class="logo">D.A.</a>
        <ul>
            <li><a href="${basePath}index.html">Home</a></li>
            <li><a href="${basePath}publications/index.html">Publications</a></li>
            <li><a href="${basePath}index.html#contact">Contact</a></li>
        </ul>
    </div>
    `;
}

function renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    
    const year = new Date().getFullYear();
    footer.innerHTML = `
    <div class="container">
        <p>&copy; ${year} Dreycey Albin.</p>
    </div>
    `;
}
