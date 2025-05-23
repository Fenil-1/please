// typical-pages.js
// Handles fetching, parsing, and rendering of typical (custom) pages from the WebPages sheet
// This file is only included in page.html and does not affect the main site logic

// --- CONFIG ---
const WEBPAGES_SHEET_ID = SHEET_ID; // <-- Replace with your actual sheet ID
const WEBPAGES_SHEET_NAME = 'WebPages';

// --- HELPERS ---
function getSheetUrl(sheetId, sheetName) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
}

function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-');
}

// --- FETCH & PARSE ---
async function fetchWebPagesData() {
    const url = getSheetUrl(WEBPAGES_SHEET_ID, WEBPAGES_SHEET_NAME);
    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substring(47, text.length - 2));
        console.log('Fetched WebPages sheet:', json);
        return json;
    } catch (e) {
        console.error('Failed to fetch WebPages sheet:', e);
        throw e;
    }
}

function processWebPagesData(json) {
    const pages = {};
    const cols = json.table.cols;
    const rows = json.table.rows;
    for (let colIdx = 1; colIdx < cols.length; colIdx++) { // skip col 0 (A)
        let pageNameRaw = (rows[0] && rows[0].c[colIdx] && rows[0].c[colIdx].v) ? rows[0].c[colIdx].v.trim() : '';
        if (!pageNameRaw) continue;
        // Split page name and icon (e.g. Salsa/fa-music)
        let [pageName] = pageNameRaw.split('/');
        pageName = pageName ? pageName.trim() : '';
        if (!pageName) continue;
        const slug = slugify(pageName);
        const sections = [];
        for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
            const row = rows[rowIdx];
            let cell = null;
            if (row && row.c) {
                // Defensive: Google Sheets may omit trailing empty cells, so .c may be sparse
                cell = (colIdx < row.c.length) ? row.c[colIdx] : null;
            }
            if (cell && cell.v && String(cell.v).trim()) {
                sections.push(cell.v);
            }
        }
        pages[slug] = { title: pageName, sections };
    }
    return pages;
}

// --- RENDER ---
function parseBlock(block) {
    block = block.trim();
    // Heading
    if (block.startsWith('<h1>')) return `<h1 class="glow section-title">${block.replace('<h1>', '').trim()}</h1>`;
    if (block.startsWith('<h2>')) return `<h2 class="card-title">${block.replace('<h2>', '').trim()}</h2>`;
    if (block.startsWith('<h3>')) return `<h3 class="card-title">${block.replace('<h3>', '').trim()}</h3>`;
    // Image
    if (block.startsWith('<image>')) {
        const url = block.replace('<image>', '').trim();
        return `<img src="${url}" class="w-full rounded-xl mb-4" loading="lazy" />`;
    }
    // Button (format: <button> Go here: url)
    if (block.startsWith('<button>')) {
        const btnText = block.replace('<button>', '').trim();
        // Try to extract URL if present
        const match = btnText.match(/(.+):\s*(https?:\/\/[^\s]+)/i);
        if (match) {
            return `<a class="btn btn-neon-pink mt-2" href="${match[2]}" target="_blank">${match[1].trim()}</a>`;
        } else {
            return `<button class="btn btn-neon-pink mt-2">${btnText}</button>`;
        }
    }
    // Paragraph fallback
    return `<p>${block}</p>`;
}

function renderSections(sections) {
    const container = document.createElement('div');
    // No grid-container class here
    sections.forEach((section, i) => {
        // Split by | for horizontal grid sections
        const gridBlocks = section.split('|');
        // Create a flex row for this section
        const row = document.createElement('div');
        row.className = 'flex-row-section';
        row.style.display = 'flex';
        row.style.justifyContent = 'center';
        row.style.alignItems = 'stretch';
        row.style.gap = '2rem';
        row.style.marginBottom = '2rem';
        row.style.width = '100%';
        row.style.minHeight = '100%'; // Make row at least full height
        gridBlocks.forEach((block, j) => {
            let url = null;
            let blockContent = block.trim();
            // Check for <url> at the start
            if (blockContent.startsWith('<url>')) {
                let urlMatch = blockContent.match(/^<url>\s*([^\s-]+)(?:\s*-|\s*$)/i);
                if (urlMatch) {
                    url = urlMatch[1].trim();
                    // Normalize URL
                    if (url.startsWith('/')) {
                        // Internal link
                    } else if (!/^https?:\/\//i.test(url)) {
                        if (url.startsWith('www.')) {
                            url = 'https://' + url;
                        } else {
                            url = 'https://' + url;
                        }
                    }
                    // Remove <url>... from blockContent
                    blockContent = blockContent.replace(/^<url>\s*[^\s-]+\s*-?\s*/i, '');
                }
            }
            const card = document.createElement(url ? 'a' : 'div');
            card.className = `card flex-1 flex-col items-center reveal-element`;
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'flex-start';
            card.style.alignItems = 'center';
            card.style.minWidth = '0';
            card.style.flex = '1 1 0';
            // card.style.height = '100%';
            card.style.alignSelf = 'stretch';
            if (url) {
                card.href = url;
                card.target = url.startsWith('/') ? '_self' : '_blank';
                card.style.cursor = 'pointer';
                card.style.textDecoration = 'none';
            }
            // Split by - for vertical blocks
            const verticalBlocks = blockContent.split(/\s*-\s*/);
            card.innerHTML = verticalBlocks.map(parseBlock).join('');
            row.appendChild(card);
        });
        container.appendChild(row);
    });
    return container;
}

// --- MAIN ---
document.addEventListener('DOMContentLoaded', async () => {
    // Get slug from URL
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('page');
    const mainPage = document.getElementById('typical-page');
    const loading = document.getElementById('loading');
    const errorContainer = document.getElementById('error-container');
    if (!slug) {
        mainPage.innerHTML = '';
        errorContainer.style.display = '';
        errorContainer.textContent = 'No page specified.';
        return;
    }
    // Show loading spinner
    loading.style.display = '';
    errorContainer.style.display = 'none';
    mainPage.innerHTML = '';
    try {
        const json = await fetchWebPagesData();
        const pages = processWebPagesData(json);
        if (!pages[slug]) {
            loading.style.display = 'none';
            errorContainer.style.display = '';
            errorContainer.textContent = 'Page not found.';
            return;
        }
        // Hide loading, show content
        loading.style.display = 'none';
        errorContainer.style.display = 'none';
        // Render title and sections as bento boxes
        // const h1 = document.createElement('h1');
        // h1.className = 'glow section-title';
        // h1.textContent = pages[slug].title;
        // mainPage.appendChild(h1);
        const grid = renderSections(pages[slug].sections);
        mainPage.appendChild(grid);
    } catch (e) {
        loading.style.display = 'none';
        errorContainer.style.display = '';
        errorContainer.textContent = 'Failed to load page.';
    }
    if (typeof renderSocialLinks === 'function') {
        renderSocialLinks('footer-social-links');
    }
});
