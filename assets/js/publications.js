document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('pub-list')) return;
    initPublications();
});

let allPubs = [];

async function initPublications() {
    try {
        const res = await fetch('../data/publications.json');
        allPubs = await res.json();
        
        setupFilters();
        readUrlParams();
        renderPubs();
        
        // Listeners
        document.getElementById('q').addEventListener('input', handleFilterChange);
        document.getElementById('year').addEventListener('change', handleFilterChange);
        document.getElementById('type').addEventListener('change', handleFilterChange);
        
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
            p.authors.some(a => a.toLowerCase().includes(q));
            
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
            <div class="pub-authors">${p.authors.join(', ')}</div>
            <div class="pub-meta">
                ${p.venue} ${p.year}
            </div>
            <div class="pub-abstract" style="margin-bottom: 0.5rem; color: var(--text-color);">
                ${p.abstract}
            </div>
            <div class="pub-links" style="margin-top:0.5rem">
                ${p.links && p.links.paper ? `<a href="${p.links.paper}" class="btn btn-sm btn-outline" target="_blank" style="margin-right: 0.5rem;">Paper</a>` : ''}
                ${p.links && p.links.code ? `<a href="${p.links.code}" class="btn btn-sm btn-outline" target="_blank">Code</a>` : ''}
            </div>
        </div>
    `).join('');
}
