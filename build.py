#!/usr/bin/env python3
"""
build.py — Static pre-rendering for dreyceyalbin.com

Generates per-publication pages, injects pre-rendered content into
index.html and publications/index.html, and regenerates sitemap.xml.
No external dependencies — pure Python stdlib.
"""

import argparse
import json
import os
import re
from datetime import date
from urllib.parse import quote

BASE_URL = "https://dreycey.github.io"


# ── I/O helpers ───────────────────────────────────────────────────────────────

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def read_file(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write_file(path, content):
    dirname = os.path.dirname(path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def inject_build_block(html, name, replacement):
    """Replace <!-- BUILD:name --> ... <!-- /BUILD:name --> with new content."""
    pattern = rf'<!-- BUILD:{re.escape(name)} -->.*?<!-- /BUILD:{re.escape(name)} -->'
    new_block = f'<!-- BUILD:{name} -->\n{replacement}\n<!-- /BUILD:{name} -->'
    result, count = re.subn(pattern, new_block, html, flags=re.DOTALL)
    if count == 0:
        print(f"  WARNING: BUILD:{name} marker not found")
    return result


# ── Home page section renderers ───────────────────────────────────────────────

def render_about_section(profile, education, interests, publish_resume=False):
    links_html = '\n'.join(
        f'                <a href="{l["href"]}" target="_blank" title="{l["label"]}"'
        f' style="color: var(--accent-color); font-size: 1.5rem; text-decoration: none;'
        f' transition: transform 0.2s; display: inline-flex; justify-content: center;'
        f' align-items: center; width: 40px; height: 40px; border-radius: 50%; background: #f8f9fa;">'
        f'\n                    <i class="{l["icon"]}"></i>\n                </a>'
        for l in profile['links']
    )

    edu_parts = []
    for edu in education:
        details_html = (
            f' &middot; <span style="font-family: var(--font-mono); color: var(--code-accent); font-size: 0.7rem;">{edu["details"]}</span>'
            if edu.get('details') else ''
        )
        edu_parts.append(
            '        <div style="margin-bottom: 0.875rem; border-left: 1px solid var(--border-color); padding-left: 0.75rem;">'
            f'\n            <div style="font-size: 0.875rem; font-weight: 500; color: var(--text-color); line-height: 1.35;">{edu["degree"]}</div>'
            f'\n            <div style="font-size: 0.8rem; color: var(--text-muted);">{edu["school"]}{details_html}</div>'
            f'\n            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem;">{edu["year"]}</div>'
            '\n        </div>'
        )
    edu_html = '\n'.join(edu_parts)

    interests_parts = []
    for cat in interests:
        badges = ''.join(f'<span class="badge">{item}</span>' for item in cat['items'])
        interests_parts.append(
            f'        <div style="margin-bottom: 0.875rem;">'
            f'\n            <div class="interests-container">{badges}</div>'
            '\n        </div>'
        )
    interests_html = '\n'.join(interests_parts)

    return f'''<section id="about" data-publish-resume="{'true' if publish_resume else 'false'}">
        <div class="about-content">
            <div class="about-photo">
                 <img src="assets/img/me.jpg" alt="{profile['name']}">
                 <h1 style="font-size: 2rem; margin: 1rem 0 0.5rem;">{profile['name']}</h1>
                 <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem;">{profile['role']}<br>at {profile['org']}</p>
                 <div class="about-links">
{links_html}
                 </div>
                 {'<div><a href="assets/pdf/Dreycey_Albin_Resume.pdf" target="_blank" class="resume-link"><i class="bi bi-file-earmark-text"></i> resume.pdf</a><span style="color: var(--border-color); margin: 0 0.35rem;">/</span><a href="assets/pdf/Dreycey_Albin_CV.pdf" target="_blank" class="resume-link">cv.pdf</a></div>' if publish_resume else ''}
            </div>
            <div class="about-details">
                <h2 style="border-bottom: none; margin-bottom: 1rem; margin-top: 0; display: block; line-height: 1;">About Me</h2>
                <p class="lead">{profile['bio']}</p>
                <p><i class="bi bi-geo-alt"></i> {profile['location']}</p>
                <div class="info-grid" style="margin-top: 3rem; margin-bottom: 0; padding-top: 0;">
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 1rem;">education</div>
{edu_html}
                    </div>
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 1rem;">interests</div>
{interests_html}
                    </div>
                </div>
            </div>
        </div>
    </section>'''


def render_experience_section(experience):
    items = []
    for exp in experience:
        is_current = 'present' in exp['period'].lower()
        current_class = ' current' if is_current else ''
        level_str = f' &middot; {exp["level"]}' if exp.get('level') else ''
        details = '\n'.join(f'                    <li>{d}</li>' for d in exp['details'])
        items.append(
            f'        <div class="experience-item{current_class}">\n'
            f'            <div class="experience-card">\n'
            f'                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 0.5rem;">\n'
            f'                    <h3 style="margin: 0; font-size: 1.4rem;">{exp["role"]}</h3>\n'
            f'                    <span style="color: var(--text-muted); font-weight: 600;">{exp["period"]}</span>\n'
            f'                </div>\n'
            f'                <div style="margin-bottom: 1rem; color: var(--accent-color); font-weight: 500;">\n'
            f'                    {exp["company"]} &middot; {exp["location"]}{level_str}\n'
            f'                </div>\n'
            f'                <ul class="experience-details">\n'
            f'{details}\n'
            f'                </ul>\n'
            f'                <button class="experience-toggle" onclick="toggleExperience(this)">Show Details</button>\n'
            f'            </div>\n'
            f'        </div>'
        )
    return (
        '<section id="experience">\n'
        '        <h2>Work Experience</h2>\n'
        '        <div class="experience-list">\n'
        + '\n'.join(items) + '\n'
        '        </div>\n'
        '    </section>'
    )


def render_featured_pubs_section(pubs):
    featured = [p for p in pubs if p.get('featured')][:5]
    items = []
    for p in featured:
        links = ''.join(
            f'<a href="{v}" class="badge">{k}</a>'
            for k, v in (p.get('links') or {}).items()
        )
        items.append(
            f'        <div class="pub-item">\n'
            f'            <a href="publications/{p["id"]}/" class="pub-title">{p["title"]}</a>\n'
            f'            <div class="pub-authors">{", ".join(p["authors"])}</div>\n'
            f'            <div class="pub-meta">\n'
            f'                {p["venue"]} {p["year"]}\n'
            f'                <span class="badge badge-primary">{p["type"]}</span>\n'
            f'            </div>\n'
            f'            <div class="pub-links">\n'
            f'                {links}\n'
            f'            </div>\n'
            f'        </div>'
        )
    return (
        '<section id="featured-pubs">\n'
        '        <div class="section-header">\n'
        '            <h2>Featured Publications</h2>\n'
        '            <a href="publications/index.html" class="btn btn-sm btn-outline">View All</a>\n'
        '        </div>\n'
        + '\n'.join(items) + '\n'
        '    </section>'
    )


def render_software_section(projects):
    items = []
    for p in projects:
        img = f'<img src="{p["image"]}" alt="{p["name"]}" loading="lazy">' if p.get('image') else ''
        items.append(
            f'            <div class="card">\n'
            f'                {img}\n'
            f'                <div style="flex-grow: 1;">\n'
            f'                    <h3><a href="{p["href"]}" target="_blank">{p["name"]}</a></h3>\n'
            f'                    <p>{p["desc"]}</p>\n'
            f'                    <small class="text-muted" style="display: block; margin-top: auto;">{p["stack"]}</small>\n'
            f'                </div>\n'
            f'            </div>'
        )
    return (
        '<section id="software">\n'
        '        <h2>Software / Projects</h2>\n'
        '        <div class="grid">\n'
        + '\n'.join(items) + '\n'
        '        </div>\n'
        '    </section>'
    )


def render_contact_section(profile):
    link_items = []
    for l in profile['links']:
        icon_html = f'<i class="{l["icon"]}"></i>' if l.get('icon') else ''
        link_items.append(
            f'<a href="{l["href"]}" class="btn btn-outline" target="_blank">\n'
            f'                {icon_html} {l["label"]}\n'
            f'            </a>'
        )
    links_html = ' '.join(link_items)
    return (
        '<section id="contact">\n'
        '        <div style="text-align: center; max-width: 800px; margin: 0 auto;">\n'
        '            <h2>Contact</h2>\n'
        '            <p style="margin-bottom: 2rem;">Feel free to reach out for collaborations or questions.</p>\n'
        '            <div class="filters" style="justify-content: center; gap: 0.75rem;">\n'
        f'                {links_html}\n'
        '            </div>\n'
        '        </div>\n'
        '    </section>'
    )


# ── Blog section renderer ─────────────────────────────────────────────────────

def render_blog_section(posts):
    items = []
    for post in posts:
        tags_html = ''.join(f'<span class="badge">{t}</span>' for t in post.get('tags', []))
        items.append(
            f'        <div class="pub-item">\n'
            f'            <a href="blog/{post["id"]}/" class="pub-title">{post["title"]}</a>\n'
            f'            <div class="pub-meta">{post["date"]}</div>\n'
            f'            <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0.5rem 0;">{post["summary"]}</p>\n'
            f'            <div style="margin-top: 0.5rem;">{tags_html}</div>\n'
            f'        </div>'
        )
    return (
        '<section id="blog">\n'
        '        <div class="section-header">\n'
        '            <h2>Blog</h2>\n'
        '        </div>\n'
        + '\n'.join(items) + '\n'
        '    </section>'
    )


# ── Schema.org JSON-LD ────────────────────────────────────────────────────────

def person_jsonld(profile, education):
    edu_items = [
        {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": edu["degree"],
            "recognizedBy": {"@type": "EducationalOrganization", "name": edu["school"]},
        }
        for edu in education
    ]
    schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": profile["name"],
        "jobTitle": profile["role"],
        "worksFor": {"@type": "Organization", "name": profile["org"]},
        "url": BASE_URL + "/",
        "sameAs": [l["href"] for l in profile["links"] if l["href"].startswith("http")],
        "alumniOf": edu_items,
    }
    return f'<script type="application/ld+json">\n{json.dumps(schema, indent=2)}\n</script>'


def scholarly_article_jsonld(pub):
    schema = {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "name": pub["title"],
        "headline": pub["title"],
        "author": [{"@type": "Person", "name": a} for a in pub["authors"]],
        "datePublished": str(pub["year"]),
        "isPartOf": {"@type": "Periodical", "name": pub["venue"]},
        "description": pub.get("abstract", ""),
        "url": f'{BASE_URL}/publications/{pub["id"]}/',
    }
    if pub.get("links", {}).get("paper"):
        schema["sameAs"] = pub["links"]["paper"]
    return f'<script type="application/ld+json">\n{json.dumps(schema, indent=2)}\n</script>'


# ── Publication page generator ────────────────────────────────────────────────

def generate_pub_page(pub):
    authors_html = ', '.join(
        f'<a href="/publications/?q={quote(a)}">{a}</a>'
        for a in pub['authors']
    )
    links_html = ''.join(
        f'<a href="{v}" class="btn btn-sm btn-outline" style="margin-right:0.5rem">{k}</a>'
        for k, v in (pub.get('links') or {}).items()
    )
    tags_html = ''
    if pub.get('tags'):
        tag_badges = ' '.join(
            f'<a href="/publications/?q={quote(t)}" class="badge">{t}</a>'
            for t in pub['tags']
        )
        tags_html = (
            '\n        <div class="pub-tags">\n'
            f'            <strong>Tags:</strong> {tag_badges}\n'
            '        </div>'
        )

    jsonld = scholarly_article_jsonld(pub)
    abstract = pub.get('abstract') or 'No abstract available.'

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{pub['title']} - Publications</title>
    <meta name="description" content="{pub.get('abstract', '')}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{BASE_URL}/publications/{pub['id']}/">
    <meta property="og:title" content="{pub['title']} - Dreycey Albin">
    <meta property="og:description" content="{pub.get('abstract', '')}">
    <link rel="stylesheet" href="../../assets/css/base.css">
    <link rel="stylesheet" href="../../assets/css/components.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css">
    {jsonld}
</head>
<body>
    <div id="site-header"></div>

    <main class="container">
        <div id="pub-detail" data-pub-id="{pub['id']}" style="padding-top: 2rem;">
            <h1>{pub['title']}</h1>
            <div class="pub-meta" style="font-size: 1.1rem; margin-bottom: 1rem;">
                {pub['venue']} {pub['year']} <span class="badge badge-primary">{pub['type']}</span>
            </div>

            <div class="pub-authors" style="font-size: 1.1rem; margin-bottom: 1rem;">
                <strong>Authors:</strong> {authors_html}
            </div>

            <div class="pub-links" style="margin-bottom: 2rem;">
                {links_html}
            </div>

            <div class="pub-abstract card" style="margin-bottom: 2rem;">
                <h3>Abstract</h3>
                <p>{abstract}</p>
            </div>
{tags_html}
            <div style="margin-top: 3rem;">
                <a href="/publications/">&larr; Back to Publications</a>
            </div>
        </div>
    </main>

    <div id="site-footer"></div>

    <script src="../../assets/js/render.js"></script>
    <script src="../../assets/js/publication.js"></script>
</body>
</html>'''


# ── Publications list pre-render ──────────────────────────────────────────────

def render_pub_list(pubs):
    """Pre-render all publications sorted by year desc for static crawlers."""
    sorted_pubs = sorted(pubs, key=lambda p: p['year'], reverse=True)
    items = []
    for p in sorted_pubs:
        paper_btn = (
            f'<a href="{p["links"]["paper"]}" class="btn btn-sm btn-outline"'
            f' target="_blank" style="margin-right: 0.5rem;">Paper</a>'
            if p.get('links', {}).get('paper') else ''
        )
        code_btn = (
            f'<a href="{p["links"]["code"]}" class="btn btn-sm btn-outline" target="_blank">Code</a>'
            if p.get('links', {}).get('code') else ''
        )
        items.append(
            f'        <div class="pub-item">\n'
            f'            <a href="{p["id"]}/" class="pub-title">{p["title"]}</a>\n'
            f'            <div class="pub-authors">{", ".join(p["authors"])}</div>\n'
            f'            <div class="pub-meta">\n'
            f'                {p["venue"]} {p["year"]}\n'
            f'            </div>\n'
            f'            <div class="pub-abstract" style="margin-bottom: 0.5rem; color: var(--text-color);">\n'
            f'                {p.get("abstract", "")}\n'
            f'            </div>\n'
            f'            <div class="pub-links" style="margin-top:0.5rem">\n'
            f'                {paper_btn}{code_btn}\n'
            f'            </div>\n'
            f'        </div>'
        )
    return (
        '<div id="pub-list">\n'
        + '\n'.join(items) + '\n'
        '        </div>'
    )


# ── Blog page generators ──────────────────────────────────────────────────────

def generate_blog_index_page(blog):
    name = blog.get('name', 'Blog')
    tagline = blog.get('tagline', '')
    platforms = blog.get('platforms', [])
    posts = sorted(blog.get('posts', []), key=lambda p: p['date'], reverse=True)

    # Compact platform links
    platform_links = ''
    featured_embed = ''
    for p in platforms:
        platform_links += (
            f'<a href="{p["url"]}" target="_blank" style="display: inline-flex; align-items: center; gap: 0.4rem;'
            f' color: var(--text-muted); font-size: 0.875rem; font-family: var(--font-mono);">'
            f'<i class="{p["icon"]}"></i> {p["name"]} &nearr;</a>\n            '
        )
        if p.get('featured_video_id'):
            featured_embed = (
                f'        <div style="margin-top: 2.5rem;">\n'
                f'            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 0.75rem;">featured</div>\n'
                f'            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--border-radius); border: 1px solid var(--border-color);">\n'
                f'                <iframe src="https://www.youtube.com/embed/{p["featured_video_id"]}" title="Featured video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>\n'
                f'            </div>\n'
                f'        </div>\n'
            )

    # Chronological post list
    post_rows = ''
    for post in posts:
        post_rows += (
            f'        <div style="display: flex; align-items: baseline; gap: 1.5rem; padding: 0.6rem 0; border-bottom: 1px solid var(--border-color);">\n'
            f'            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); white-space: nowrap;">{post["date"]}</span>\n'
            f'            <a href="{post["url"]}" target="_blank" style="color: var(--text-color); font-size: 0.95rem;">{post["title"]} &nearr;</a>\n'
            f'        </div>\n'
        )

    posts_section = ''
    if post_rows:
        posts_section = (
            f'        <div style="margin-top: 2.5rem;">\n'
            f'            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 0.75rem;">posts</div>\n'
            f'{post_rows}'
            f'        </div>\n'
        )

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name} - Dreycey Albin</title>
    <meta name="description" content="{tagline}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{BASE_URL}/blog/">
    <meta property="og:title" content="{name} - Dreycey Albin">
    <meta property="og:description" content="{tagline}">
    <link rel="stylesheet" href="../assets/css/base.css">
    <link rel="stylesheet" href="../assets/css/components.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css">
</head>
<body>
    <div id="site-header"></div>

    <main class="container">
        <div style="padding-top: 2rem; max-width: 700px;">
            <h1>{name}</h1>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">{tagline}</p>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
            {platform_links}</div>
{featured_embed}{posts_section}        </div>
    </main>

    <div id="site-footer"></div>

    <script src="../assets/js/render.js"></script>
</body>
</html>'''


# ── Sitemap ───────────────────────────────────────────────────────────────────

def generate_sitemap(pubs, blog_posts=None):
    today = date.today().isoformat()
    pub_urls = '\n'.join(
        f'   <url>\n'
        f'      <loc>{BASE_URL}/publications/{pub["id"]}/</loc>\n'
        f'      <lastmod>{today}</lastmod>\n'
        f'      <changefreq>yearly</changefreq>\n'
        f'      <priority>0.6</priority>\n'
        f'   </url>'
        for pub in pubs
    )
    blog_urls = ''
    if blog_posts:
        blog_urls = (
            '\n   <url>\n'
            f'      <loc>{BASE_URL}/blog/</loc>\n'
            f'      <lastmod>{today}</lastmod>\n'
            '      <changefreq>monthly</changefreq>\n'
            '      <priority>0.7</priority>\n'
            '   </url>'
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        '   <url>\n'
        f'      <loc>{BASE_URL}/</loc>\n'
        f'      <lastmod>{today}</lastmod>\n'
        '      <changefreq>monthly</changefreq>\n'
        '      <priority>1.0</priority>\n'
        '   </url>\n'
        '   <url>\n'
        f'      <loc>{BASE_URL}/publications/</loc>\n'
        f'      <lastmod>{today}</lastmod>\n'
        '      <changefreq>monthly</changefreq>\n'
        '      <priority>0.8</priority>\n'
        '   </url>\n'
        f'{pub_urls}{blog_urls}\n'
        '</urlset>\n'
    )


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    config = load_json("data/config.json")

    parser = argparse.ArgumentParser(description="Build dreycey.github.io static site.")
    parser.add_argument("--publish-blog", action=argparse.BooleanOptionalAction,
                        default=config.get("publish_blog", False),
                        help="Include the blog section in the build.")
    parser.add_argument("--publish-resume", action=argparse.BooleanOptionalAction,
                        default=config.get("publish_resume", False),
                        help="Include resume/cv links in the build.")
    args = parser.parse_args()

    print("Loading data...")
    profile = load_json("data/profile.json")
    pubs = load_json("data/publications.json")
    projects = load_json("data/projects.json")
    experience = load_json("data/experience.json")
    education = load_json("data/education.json")
    interests = load_json("data/interests.json")
    blog_posts = load_json("data/blog.json")

    print(f"Blog publishing:   {'ON' if args.publish_blog else 'OFF'}")
    print(f"Resume publishing: {'ON' if args.publish_resume else 'OFF'}")

    # 1. Generate individual publication pages
    print(f"Generating {len(pubs)} publication pages...")
    for pub in pubs:
        path = f"publications/{pub['id']}/index.html"
        write_file(path, generate_pub_page(pub))
        print(f"  -> {path}")

    # 2. Update index.html with pre-rendered sections + Person JSON-LD
    print("Updating index.html...")
    index_html = read_file("index.html")
    index_html = inject_build_block(index_html, "jsonld", person_jsonld(profile, education))
    index_html = inject_build_block(index_html, "about", render_about_section(profile, education, interests, args.publish_resume))
    index_html = inject_build_block(index_html, "experience", render_experience_section(experience))
    index_html = inject_build_block(index_html, "featured-pubs", render_featured_pubs_section(pubs))
    index_html = inject_build_block(index_html, "software", render_software_section(projects))
    if args.publish_blog:
        write_file("blog/index.html", generate_blog_index_page(blog_posts))
        print("  -> blog/index.html")
    index_html = inject_build_block(index_html, "blog", '')
    index_html = inject_build_block(index_html, "contact", render_contact_section(profile))
    write_file("index.html", index_html)
    print("  -> index.html")

    # 3. Update render.js nav to include/exclude blog link
    print("Updating assets/js/render.js...")
    render_js = read_file("assets/js/render.js")
    blog_nav_html = '<li><a href="${basePath}blog/index.html">Blog</a></li>' if args.publish_blog else ''
    render_js = inject_build_block(render_js, "blog-nav", blog_nav_html)
    write_file("assets/js/render.js", render_js)
    print("  -> assets/js/render.js")

    # 4. Update publications/index.html with pre-rendered pub list
    print("Updating publications/index.html...")
    pubs_html = read_file("publications/index.html")
    pubs_html = inject_build_block(pubs_html, "publist", render_pub_list(pubs))
    write_file("publications/index.html", pubs_html)
    print("  -> publications/index.html")

    # 5. Regenerate sitemap.xml
    print("Regenerating sitemap.xml...")
    write_file("sitemap.xml", generate_sitemap(pubs, blog_posts.get('platforms') if args.publish_blog else None))
    print("  -> sitemap.xml")

    print("Done!")


if __name__ == "__main__":
    main()
