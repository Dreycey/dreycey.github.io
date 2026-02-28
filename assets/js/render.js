// Theme init — runs immediately to prevent flash
(function () {
    try {
        var saved = localStorage.getItem('theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {}
})();

// Shared header/footer rendering
document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    updateToggleIcon();
});

function renderHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const scripts = document.getElementsByTagName('script');
    let basePath = '';
    for (let s of scripts) {
        if (s.src.includes('render.js')) {
            basePath = s.src.replace('assets/js/render.js', '');
            break;
        }
    }

    header.innerHTML = `
    <div class="container nav">
        <a href="${basePath}index.html" class="logo">D.A.</a>
        <div class="nav-right">
            <ul>
                <li><a href="${basePath}index.html">Home</a></li>
                <li><a href="${basePath}publications/index.html">Publications</a></li>
                <li><a href="${basePath}index.html#contact">Contact</a></li>
            </ul>
            <button id="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme" title="Toggle light/dark mode">
                <i class="bi bi-sun"></i>
            </button>
        </div>
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

window.toggleTheme = function () {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        try { localStorage.removeItem('theme'); } catch (e) {}
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
    updateToggleIcon();
};

function updateToggleIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btn.innerHTML = isLight
        ? '<i class="bi bi-moon"></i>'
        : '<i class="bi bi-sun"></i>';
}
