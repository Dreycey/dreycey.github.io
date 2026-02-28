document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are on the home page (look for #about)
    if (!document.getElementById('about')) return;

    fetchData();
});

async function fetchData() {
    try {
        const [profile, pubs, projects, experience, education, interests] = await Promise.all([
            fetch('data/profile.json').then(r => r.json()),
            fetch('data/publications.json').then(r => r.json()),
            fetch('data/projects.json').then(r => r.json()),
            fetch('data/experience.json').then(r => r.json()),
            fetch('data/education.json').then(r => r.json()),
            fetch('data/interests.json').then(r => r.json())
        ]);

        renderAbout(profile, education, interests);
        renderExperience(experience);
        renderFeaturedPubs(pubs);
        renderProjects(projects);
        renderContact(profile);
        
        // Scroll to hash if present (e.g., #contact)
        if (window.location.hash) {
            setTimeout(() => {
                const element = document.querySelector(window.location.hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

function renderAbout(profile, education, interests) {
    const container = document.getElementById('about');
    if (!container) return;

    // Generate links HTML
    const linksHtml = profile.links.map(l => `
        <a href="${l.href}" target="_blank" title="${l.label}" 
           style="color: var(--accent-color); font-size: 1.5rem; text-decoration: none; transition: transform 0.2s; display: inline-flex; justify-content: center; align-items: center; width: 40px; height: 40px; border-radius: 50%; background: #f8f9fa;">
            <i class="${l.icon}"></i>
        </a>
    `).join('');

    // Generate Education HTML
    const eduHtml = education.map(edu => `
        <div style="margin-bottom: 0.875rem; border-left: 1px solid var(--border-color); padding-left: 0.75rem;">
            <div style="font-size: 0.875rem; font-weight: 500; color: var(--text-color); line-height: 1.35;">${edu.degree}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${edu.school}${edu.details ? ` &middot; <span style="font-family: var(--font-mono); color: var(--code-accent); font-size: 0.7rem;">${edu.details}</span>` : ''}</div>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem;">${edu.year}</div>
        </div>
    `).join('');

    // Generate Interests HTML
    const interestsHtml = interests.map(cat => `
        <div style="margin-bottom: 0.875rem;">
            <div class="interests-container">
                ${cat.items.map(item => `<span class="badge">${item}</span>`).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="about-content">
            <div class="about-photo">
                 <img src="assets/img/me.jpg" alt="${profile.name}">
                 <h1 style="font-size: 2rem; margin: 1rem 0 0.5rem;">${profile.name}</h1>
                 <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem;">${profile.role}<br>at ${profile.org}</p>
                 <div class="about-links">
                    ${linksHtml}
                 </div>
                 ${container.dataset.publishResume === 'true' ? '<div><a href="assets/pdf/Dreycey_Albin_Resume.pdf" target="_blank" class="resume-link"><i class="bi bi-file-earmark-text"></i> resume.pdf</a><span style="color: var(--border-color); margin: 0 0.35rem;">/</span><a href="assets/pdf/Dreycey_Albin_CV.pdf" target="_blank" class="resume-link">cv.pdf</a></div>' : ''}
            </div>
            <div class="about-details">
                <h2 style="border-bottom: none; margin-bottom: 1rem; margin-top: 0; display: block; line-height: 1;">About Me</h2>
                <p class="lead">${profile.bio}</p>
                <p><i class="bi bi-geo-alt"></i> ${profile.location}</p>
                
                <div class="info-grid" style="margin-top: 3rem; margin-bottom: 0; padding-top: 0;">
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 1rem;">education</div>
                        ${eduHtml}
                    </div>
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 1rem;">interests</div>
                        ${interestsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEducation(education) {
    const container = document.getElementById('education');
    if (!container) return;

    const html = education.map(edu => `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0; font-size: 1.1rem;">${edu.degree}</h4>
            <div style="color: var(--accent-color); font-weight: 500; font-size: 0.95rem;">${edu.school}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">
                ${edu.year} ${edu.details ? `&middot; ${edu.details}` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h3>Education</h3>
        <div>
            ${html}
        </div>
    `;
}

function renderInterests(interests) {
    const container = document.getElementById('interests');
    if (!container) return;

    const html = interests.map(cat => `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${cat.category}</h4>
            <div class="interests-container">
                ${cat.items.map(item => `<span class="badge">${item}</span>`).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h3>Interests & Skills</h3>
        <div>
            ${html}
        </div>
    `;
}

function renderExperience(experience) {
    const container = document.getElementById('experience');
    if (!container) return;

    const html = experience.map(exp => {
        const isCurrent = exp.period.toLowerCase().includes('present');
        return `
        <div class="experience-item ${isCurrent ? 'current' : ''}">
            <div class="experience-card">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 0.5rem;">
                    <h3 style="margin: 0; font-size: 1.4rem;">${exp.role}</h3>
                    <span style="color: var(--text-muted); font-weight: 600;">${exp.period}</span>
                </div>
                <div style="margin-bottom: 1rem; color: var(--accent-color); font-weight: 500;">
                    ${exp.company} &middot; ${exp.location} ${exp.level ? `&middot; ${exp.level}` : ''}
                </div>
                <ul class="experience-details">
                    ${exp.details.map(d => `<li>${d}</li>`).join('')}
                </ul>
                <button class="experience-toggle" onclick="toggleExperience(this)">Show Details</button>
            </div>
        </div>
    `}).join('');

    container.innerHTML = `
        <h2>Work Experience</h2>
        <div class="experience-list">
            ${html}
        </div>
    `;
}

window.toggleExperience = function(btn) {
    const card = btn.closest('.experience-card');
    const list = card.querySelector('.experience-details');
    
    // Force toggle the class
    if (list.style.display === 'block') {
        list.style.display = '';
        list.classList.remove('expanded');
        btn.textContent = 'Show Details';
    } else {
        list.style.display = 'block';
        list.classList.add('expanded');
        btn.textContent = 'Show Less';
    }
}

function renderFeaturedPubs(pubs) {
    const container = document.getElementById('featured-pubs');
    if (!container) return;

    const featured = pubs.filter(p => p.featured).slice(0, 5);
    
    const html = featured.map(p => `
        <div class="pub-item">
            <a href="publications/${p.id}/" class="pub-title">${p.title}</a>
            <div class="pub-authors">${p.authors.join(', ')}</div>
            <div class="pub-meta">
                ${p.venue} ${p.year}
                <span class="badge badge-primary">${p.type}</span>
            </div>
            <div class="pub-links">
                ${Object.entries(p.links || {}).map(([k, v]) => `<a href="${v}" class="badge">${k}</a>`).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="section-header">
            <h2>Featured Publications</h2>
            <a href="publications/index.html" class="btn btn-sm btn-outline">View All</a>
        </div>
        ${html}
    `;
}

function renderProjects(projects) {
    const container = document.getElementById('software');
    if (!container) return;

    const html = projects.map(p => `
        <div class="card">
            ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : ''}
            <div style="flex-grow: 1;">
                <h3><a href="${p.href}" target="_blank">${p.name}</a></h3>
                <p>${p.desc}</p>
                <small class="text-muted" style="display: block; margin-top: auto;">${p.stack}</small>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h2>Software / Projects</h2>
        <div class="grid">
            ${html}
        </div>
    `;
}

function renderContact(profile) {
    const container = document.getElementById('contact');
    if (!container) return;

    const html = profile.links.map(l => `
        <a href="${l.href}" class="btn btn-outline" target="_blank">
            ${l.icon ? `<i class="${l.icon}"></i>` : ''} ${l.label}
        </a>
    `).join(' ');

    container.innerHTML = `
        <div style="text-align: center; max-width: 800px; margin: 0 auto;">
            <h2>Contact</h2>
            <p style="margin-bottom: 2rem;">Feel free to reach out for collaborations or questions.</p>
            <div class="filters" style="justify-content: center; gap: 0.75rem;">
                ${html}
            </div>
        </div>
    `;
}
