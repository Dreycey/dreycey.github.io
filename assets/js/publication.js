document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        document.getElementById('pub-detail').innerHTML = '<p>Publication ID not specified.</p>';
        return;
    }
    
    loadPublication(id);
});

async function loadPublication(id) {
    try {
        const res = await fetch('../data/publications.json');
        const pubs = await res.json();
        const pub = pubs.find(p => p.id === id);
        
        if (!pub) {
            document.getElementById('pub-detail').innerHTML = '<p>Publication not found.</p>';
            return;
        }
        
        renderPublication(pub);
    } catch (e) {
        console.error('Error loading publication:', e);
        document.getElementById('pub-detail').innerHTML = '<p>Error loading content.</p>';
    }
}

function renderPublication(pub) {
    const container = document.getElementById('pub-detail');
    
    document.title = `${pub.title} - Publications`;
    
    container.innerHTML = `
        <h1>${pub.title}</h1>
        <div class="pub-meta" style="font-size: 1.1rem; margin-bottom: 1rem;">
            ${pub.venue} ${pub.year} <span class="badge badge-primary">${pub.type}</span>
        </div>
        
        <div class="pub-authors" style="font-size: 1.1rem; margin-bottom: 1rem;">
            <strong>Authors:</strong> ${pub.authors.map(a => `<a href="index.html?q=${encodeURIComponent(a)}">${a}</a>`).join(', ')}
        </div>
        
        <div class="pub-links" style="margin-bottom: 2rem;">
            ${Object.entries(pub.links || {}).map(([k, v]) => `<a href="${v}" class="btn btn-sm btn-outline" style="margin-right:0.5rem">${k}</a>`).join('')}
        </div>
        
        <div class="pub-abstract card" style="margin-bottom: 2rem;">
            <h3>Abstract</h3>
            <p>${pub.abstract || 'No abstract available.'}</p>
        </div>
        
        ${pub.tags ? `
        <div class="pub-tags">
            <strong>Tags:</strong> 
            ${pub.tags.map(t => `<a href="index.html?q=${encodeURIComponent(t)}" class="badge">${t}</a>`).join(' ')}
        </div>
        ` : ''}
        
        <div style="margin-top: 3rem;">
            <a href="index.html">&larr; Back to Publications</a>
        </div>
    `;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}
