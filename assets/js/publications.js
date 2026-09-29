document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('pub-list')) return;
    initPublications();
});

// Toggle publication abstracts (delegated so it works for both
// JS-rendered and pre-rendered/static list items).
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pub-abstract-btn');
    if (!btn) return;
    const item = btn.closest('.pub-item');
    const body = item && item.querySelector('.pub-abstract-body');
    if (!body) return;
    const willShow = body.hasAttribute('hidden');
    body.toggleAttribute('hidden', !willShow);
    btn.setAttribute('aria-expanded', String(willShow));
    btn.textContent = willShow ? 'Hide Abstract' : 'Abstract';
});

let allPubs = [];

async function initPublications() {
    try {
        const res = await fetch('../data/publications.json', { cache: 'no-store' });
        allPubs = await res.json();
        
        setupFilters();
        readUrlParams();
        renderPubs();
        
        // Listeners
        document.getElementById('q').addEventListener('input', handleFilterChange);
        document.getElementById('year').addEventListener('change', handleFilterChange);
        const typeSelect = document.getElementById('type');
        if (typeSelect) typeSelect.addEventListener('change', handleFilterChange);
        
    } catch (e) {
        console.error('Error loading publications:', e);
    }
}

function setupFilters() {
    const years = [...new Set(allPubs.map(p => p.year))].sort((a, b) => b - a);
    
    const yearSelect = document.getElementById('year');
    years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    });
}

function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const year = params.get('year') || '';
    
    document.getElementById('q').value = q;
    document.getElementById('year').value = year;
}

function updateUrlParams() {
    const q = document.getElementById('q').value;
    const year = document.getElementById('year').value;
    
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (year) params.set('year', year);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

function handleFilterChange() {
    updateUrlParams();
    renderPubs();
}

function renderPubs() {
    const q = document.getElementById('q').value.toLowerCase();
    const year = document.getElementById('year').value;
    
    const filtered = allPubs.filter(p => {
        const matchesQ = !q || 
            p.title.toLowerCase().includes(q) || 
            p.authors.some(a => a.toLowerCase().includes(q)) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q));
            
        const matchesYear = !year || p.year.toString() === year;
        
        return matchesQ && matchesYear;
    });
    
    // Sort by year desc
    filtered.sort((a, b) => b.year - a.year);
    
    const container = document.getElementById('pub-list');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p>No publications found.</p>';
        return;
    }
    
    container.innerHTML = filtered.map(p => `
        <div class="pub-item">
            <a href="${p.id}/" class="pub-title">${p.title}</a>
            <div class="pub-authors">${p.authors.map(a => /^Dreycey\s+(?:[A-Z]\.\s+)?Albin$/.test(a) ? `<u>${a}</u>` : a).join(', ')}</div>
            <div class="pub-meta-row">
                <span class="pub-meta">${p.venue} ${p.year}</span>
                <span class="pub-links">
                    <button type="button" class="btn btn-sm btn-outline pub-abstract-btn" aria-expanded="false">Abstract</button>
                    ${p.links && p.links.paper ? `<a href="${p.links.paper}" class="btn btn-sm btn-outline" target="_blank">Paper</a>` : ''}
                    ${p.links && p.links.code ? `<a href="${p.links.code}" class="btn btn-sm btn-outline" target="_blank">Code</a>` : ''}
                </span>
            </div>
            <div class="pub-abstract-body" hidden>${p.abstract}</div>
        </div>
    `).join('');
}
