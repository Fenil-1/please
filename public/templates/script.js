console.log("Current sheet ID:", SHEET_ID);
console.log("Current username:", USER_NAME);
console.log("Is paid user:", IS_PAID);

// Configuration
const CONFIG = {
    SPREADSHEET_ID: SHEET_ID,
    SHEETS: {
        EVENTS: 'Events/Products',
        SETTINGS: 'Brand'
    },
    MAX_FEATURED_EVENTS: 4,
    CURRENCY: '₹'
};

// Initialize locomotiveScroll for smooth scrolling
let locoScroll;

// State variables
let appData = {
    events: [],
    settings: {},
    currentEvent: null,
    currentFilter: 'all',
    currentSlide: 0,
    featuredEvents: [],
    // uniqueTags: new Set(['all']),
    uniqueLabels: new Set(['all'])
};

// Initial loading
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await fetchAndProcessData();
        
        // Initialize luxury features after data is loaded
        initLuxuryFeatures();
        
        // Add letter-by-letter animation to logo
        initLogoAnimation();
        
        // Initialize custom cursor
        // initCustomCursor();
        
        // Apply 3D tilt effect to cards
        initTiltEffect();

        // Initialize reveal animations
        initRevealAnimations();
        
        // Render social links
        renderSocialLinks('contact-social-links');
        renderSocialLinks('footer-social-links');
        
    } catch (error) {
        showError(`Failed to load data: ${error.message}`);
        console.error('Error loading data:', error);
    }
});

// Initialize custom cursor
// function initCustomCursor() {
//     const cursor = document.getElementById('cursor');
//     const cursorFollower = document.getElementById('cursor-follower');
    
//     document.addEventListener('mousemove', (e) => {
//         // Update custom cursor position
//         gsap.to(cursor, {
//             x: e.clientX,
//             y: e.clientY,
//             duration: 0.1
//         });
        
//         // Update follower with slight delay
//         gsap.to(cursorFollower, {
//             x: e.clientX,
//             y: e.clientY,
//             duration: 0.3
//         });
//     });
    
//     // Add clickable class to all buttons and links
//     document.querySelectorAll('button, a, .btn, .nav-tab, .ticket-option label, .indicator').forEach(el => {
//         el.classList.add('clickable');
        
//         el.addEventListener('mouseenter', () => {
//             cursor.style.transform = 'scale(1.5)';
//             cursorFollower.style.transform = 'scale(0.8)';
//             cursorFollower.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
//         });
        
//         el.addEventListener('mouseleave', () => {
//             cursor.style.transform = 'scale(1)';
//             cursorFollower.style.transform = 'scale(1)';
//             cursorFollower.style.backgroundColor = 'transparent';
//         });
//     });
    
//     // Handle cursor leaving window
//     document.addEventListener('mouseout', () => {
//         cursor.style.opacity = '0';
//         cursorFollower.style.opacity = '0';
//     });
    
//     document.addEventListener('mouseover', () => {
//         cursor.style.opacity = '1';
//         cursorFollower.style.opacity = '1';
//     });
    
//     // Handle click effect
//     document.addEventListener('mousedown', () => {
//         cursor.style.transform = 'scale(0.8)';
//         cursorFollower.style.transform = 'scale(0.6)';
//     });
    
//     document.addEventListener('mouseup', () => {
//         cursor.style.transform = 'scale(1)';
//         cursorFollower.style.transform = 'scale(1)';
//     });
// }


// Dynamic Styles from Google Sheets (now from Visuals sheet)
function applyDynamicCSSFromVisuals() {
    if (!appData.visuals) return;
    const root = document.documentElement;
    Object.entries(appData.visuals).forEach(([key, value]) => {
        // Convert snake_case to CSS custom property format
        const cssVar = '--' + key.replace(/_/g, '-');
        root.style.setProperty(cssVar, value);
    });
}

// Initialize luxury UI features
function initLuxuryFeatures() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    // Robust FAQ toggles
    initFAQToggles();
    // Enhance FAQ functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // Toggle this FAQ
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
    
    // Initialize first slide as active
    if (document.querySelector('.slide')) {
        document.querySelector('.slide').classList.add('active');
    }
    
    // Add loading animation
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-dots">
                <span></span>
                <span></span>
            </div>
            <p class="ml-3">Loading your luxurious experience...</p>
        `;
    }
}

// Initialize logo animation
function initLogoAnimation() {
    const logo = document.querySelector('.logo');
    if (!logo) return;
    
    const text = "Togetherness";
    let newContent = '';
    
    // Create spans for each letter with sophisticated animation
    for (let i = 0; i < text.length; i++) {
        newContent += `<span style="transition-delay: ${i * 0.02}s">${text[i]}</span>`;
    }
    
    logo.innerHTML = newContent;
}

// Initialize 3D tilt effect
function initTiltEffect() {
    const boxes = document.querySelectorAll('.bento-box');
    
    boxes.forEach(box => {
        box.addEventListener('mousemove', function(e) {
            // Light tilt effect only
            const boxRect = box.getBoundingClientRect();
            const boxCenterX = boxRect.left + boxRect.width / 2;
            const boxCenterY = boxRect.top + boxRect.height / 2;
            
            const mouseX = e.clientX - boxCenterX;
            const mouseY = e.clientY - boxCenterY;
            
            // Very subtle tilt (reduced from 0.05 to 0.015)
            const rotateX = mouseY * -0.007;
            const rotateY = mouseX * 0.007;
            
            // Apply subtle shadow shifting instead of heavy rotation
            box.style.transform = `translateY(-10px)`;
            box.style.boxShadow = `${mouseX * .05}px ${mouseY * 0.05}px 30px rgba(0, 0, 0, 0.08)`;
        });
        
        box.addEventListener('mouseleave', function() {
            box.style.transform = '';
            box.style.boxShadow = '';
            setTimeout(() => {
                box.style.transition = 'var(--transition-smooth)';
            }, 100);
        });
        
        box.addEventListener('mouseenter', function() {
            box.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
        });
    });
}

// Data fetching and processing
async function fetchAndProcessData() {
    showLoading(true);
    
    try {
        // Fetch events data
        const eventsResponse = await fetch(`https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEETS.EVENTS}`);
        const eventsText = await eventsResponse.text();
        const eventsJson = JSON.parse(eventsText.match(/google\.visualization\.Query\.setResponse\((.*)\);/)[1]);
        
        // Process events data
        appData.events = processEventsData(eventsJson);
        
        // Extract unique tags for filtering
        // appData.events.forEach(event => {
        //     if (event.tags && event.tags.length) {
        //         event.tags.forEach(tag => appData.uniqueTags.add(tag));
        //     }
        // });

        appData.events.forEach(event => {
            if (event.label) {
                appData.uniqueLabels.add(event.label);
            }
        });
        
        // Get featured events
        appData.featuredEvents = appData.events.filter(event => event.featured).slice(0, CONFIG.MAX_FEATURED_EVENTS);
        
        // Fetch settings data
        const settingsResponse = await fetch(`https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Settings`);
        const settingsText = await settingsResponse.text();
        let settingsJson;
        try {
            settingsJson = JSON.parse(settingsText.match(/google\.visualization\.Query\.setResponse\((.*)\);/)[1]);
            console.log('[DEBUG] Raw Settings JSON:', settingsJson);
            if (settingsJson && settingsJson.table) {
                console.log('[DEBUG] Settings columns:', settingsJson.table.cols.map(c => c.label));
                console.log('[DEBUG] Settings first row:', settingsJson.table.rows[1]);
            }
        } catch (e) {
            console.error('[ERROR] Failed to parse Settings sheet JSON:', e, settingsText);
            showError('Failed to parse Settings sheet.');
            appData.settings = {};
        }
        if (settingsJson) {
            // Use key-value parser for Settings (since it's key-value, not table)
            appData.settings = processVisualsData(settingsJson);
            console.log('[DEBUG] Parsed settings:', appData.settings);
        }

        // Fetch visuals data
        const visualsResponse = await fetch(`https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Visuals`);
        const visualsText = await visualsResponse.text();
        let visualsJson;
        try {
            visualsJson = JSON.parse(visualsText.match(/google\.visualization\.Query\.setResponse\((.*)\);/)[1]);
        } catch (e) {
            console.error('[ERROR] Failed to parse Visuals sheet JSON:', e, visualsText);
            showError('Failed to parse Visuals sheet.');
            appData.visuals = {};
        }
        if (visualsJson) {
            appData.visuals = processVisualsData(visualsJson); // Use key-value parser for Visuals
            console.log('[DEBUG] Parsed visuals:', appData.visuals);
        }

        // After appData.settings is set:
        const BYPASS_VISUALS = true; // set to false to enable Visuals
        if (!BYPASS_VISUALS) applyDynamicCSSFromVisuals();
        
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showError(`Failed to fetch or process data: ${error.message}`);
        console.error('Error in fetchAndProcessData:', error);
        throw error;
    }
}

// Process events data from Google Sheets response
function processEventsData(json) {
    try {
        const columns = json.table.cols.map(col => col.label);
        const rows = json.table.rows;
        
        return rows.map(row => {
            const event = {};
            
            // Map each column to its value
            row.c.forEach((cell, index) => {
                const columnName = columns[index];
                const value = cell ? cell.v : null;
                
                switch(columnName) {
                    case 'Featured':
                        event.featured = value === true || value === 'TRUE' || value === 'true';
                        break;
                    case 'Label':
                        event.label = value;
                        break;
                    case 'Cover Photo':
                        // Support multiple media links (comma or newline separated)
                        if (value && (value.includes(',') || value.includes('\n'))) {
                            event.coverMedia = value.split(/,|\n/).map(s => s.trim()).filter(Boolean);
                            event.coverPhoto = event.coverMedia[0]; // For backward compatibility
                        } else {
                            event.coverMedia = value ? [value] : [];
                            event.coverPhoto = value;
                        }
                        break;
                    case 'Event Name':
                        event.name = value;
                        break;
                    case 'TAGS (comma separated)':
                        event.tags = value ? value.split(',').map(tag => tag.trim()) : [];
                        break;
                    case 'Start Date':
                        event.dateRaw = value; // Always store the original value
                        if (value) {
                            let dateObj;
                            if (typeof value === 'number') {
                                // Google Sheets serial date number
                                dateObj = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
                            } else if (typeof value === 'string') {
                                // Handle Date(YYYY,MM,DD,HH,mm,ss) format
                                const dateFnMatch = value.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2})\)$/);
                                if (dateFnMatch) {
                                    const [, yyyy, mm, dd, hh, min, ss] = dateFnMatch.map(Number);
                                    dateObj = new Date(yyyy, mm, dd, hh, min, ss);
                                } else {
                                    // Try to parse MM/DD/YYYY HH:mm:ss
                                    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
                                    if (match) {
                                        const [, mm, dd, yyyy, hh = '0', min = '0', ss = '0'] = match;
                                        dateObj = new Date(
                                            Number(yyyy),
                                            Number(mm) - 1,
                                            Number(dd),
                                            Number(hh),
                                            Number(min),
                                            Number(ss)
                                        );
                                    } else {
                                        dateObj = new Date(value);
                                    }
                                }
                            } else {
                                dateObj = new Date(value);
                            }
                            event.startDate = dateObj;
                            event.formattedDate = !isNaN(dateObj.getTime()) ? formatDate(dateObj) : '';
                        } else {
                            event.startDate = null;
                            event.formattedDate = '';
                        }
                        break;
                    case 'Ticket Types':
                        event.ticketTypes = parseTicketTypes(value);
                        break;
                    case 'Schedule (If Any)':
                        event.schedule = parseSchedule(value);
                        break;
                    case 'Description':
                        event.description = value;
                        break;
                    case 'FAQs':
                        event.faqs = parseFAQs(value);
                        break;
                    case 'Venue':
                        event.venue = value;
                        break;
                    case 'IsProduct?':
                        event.isProduct = value === true || value === 'TRUE' || value === 'true';
                        break;
                    default:
                        // For any other columns, just store as is
                        event[camelCase(columnName)] = value;
                }
            });
            
            return event;
        }).filter(event => event.name); // Filter out rows without an event name
    } catch (error) {
        console.error('Error processing events data:', error);
        showError('Failed to process events data');
        return [];
    }
}

// Process settings data from Google Sheets response
function processSettingsData(json, rowIndex = 0) {
    // Pure function: returns parsed object, does not mutate appData or log
    const result = {};
    if (json && json.table && json.table.cols && json.table.rows && json.table.rows.length > rowIndex) {
        const cols = json.table.cols;
        const row = json.table.rows[rowIndex].c;
        cols.forEach((col, idx) => {
            const key = col.label && col.label.trim();
            const cell = row[idx];
            const value = cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim() : '';
            if (key) {
                // Normalize key: lowercase, replace spaces and special chars with underscores
                const normKey = key.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                result[normKey] = value;
            }
        });
    }
    return result;
}

// Process visuals data from Google Sheets response (key-value pairs, no header)
function processVisualsData(json) {
    const result = {};
    if (json && json.table && json.table.rows) {
        json.table.rows.forEach(row => {
            const cells = row.c;
            if (cells && cells[0] && cells[1]) {
                // Normalize key: lowercase, replace spaces and special chars with underscores
                const key = String(cells[0].v).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                const value = String(cells[1].v).trim();
                result[key] = value;
            }
        });
    }
    return result;
}

function parseDescription(text) {
    if (!text) return '';

    // Convert links to clickable
    // text = text.replace(
    //     /(https?:\/\/[^\s]+)/g,
    //     '<a href="$1" target="_blank" rel="noopener" class="desc-link">$1</a>'
    // );

    text = text.replace(
        /(\b(https?:\/\/|www\.)[^\s<>]+|\b[a-z0-9.-]+\.[a-z]{2,}\b[^\s<>]*)/gi,
        (match) => {
            // ensure href has a protocol
            let url = match;
            if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
            }
            return `<a href="${url}" target="_blank" rel="noopener" class="desc-link">${match}</a>`;
        }
    );

    // Highlight hashtags
    text = text.replace(
        /(^|\s)(#[\w\d_]+)/g,
        '$1<span class="desc-hashtag">$2</span>'
    );

    // Highlight time (e.g., 10:00 AM, 10am, 11:30pm)
    text = text.replace(
        /(\b\d{1,2}(:\d{2})?\s*[ap]m\b)/gi,
        '<span class="desc-time">$1</span>'
    );

    // Highlight price/currency (₹, $, €, £, etc.)
    text = text.replace(
        /([₹$€£]\s?\d+(?:,\d{3})*(?:\.\d{1,2})?)/g,
        '<span class="desc-currency">$1</span>'
    );

    // Wrap emoji in a span for animation (covers most emoji)
    text = text.replace(
        /([\u231A-\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD-\u25FE\u2600-\u27BF\u2934-\u2935\u2B05-\u2B07\u2B1B-\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299\uD83C-\uDBFF\uDC00-\uDFFF]+)/g,
        '<span class="desc-emoji">$1</span>'
    );

    return text;
}

function animateVisibleEmojis() {
    document.querySelectorAll('.desc-emoji').forEach(emoji => {
        if (emoji.getBoundingClientRect().top < window.innerHeight - 40) {
            emoji.classList.add('animated');
            setTimeout(() => emoji.classList.remove('animated'), 700);
        }
    });
}
window.addEventListener('scroll', animateVisibleEmojis, { passive: true });

// Parse ticket types from text
function parseTicketTypes(text) {
    if (!text) return [];
    const ticketTypes = [];
    const lines = text.split('\n');
    let currentType = null;

    // Helper to get current IST date/time
    function nowIST() {
        const now = new Date();
        // Convert to IST by adding 5.5 hours (19800000 ms)
        return new Date(now.getTime() + (330 - now.getTimezoneOffset()) * 60000);
    }

    lines.forEach(line => {
        // Match: Name | Price | (optional status or date)
        const typeMatch = line.match(/^(.+?)\s*\|\s*(\d+)(?:\s*\|\s*([^\|]+))?$/);
        if (typeMatch) {
            const name = typeMatch[1].trim();
            const price = parseInt(typeMatch[2], 10);
            let status = 'active';
            let expiry = null;
            const extra = typeMatch[3] ? typeMatch[3].trim().toLowerCase() : '';

            if (extra === 'soldout' || extra === 'sold out') {
                status = 'soldout';
            } else if (extra && /^\d{4,8}$/.test(extra)) {
                // Parse DDMM or DDMMYYYY
                let day = parseInt(extra.slice(0, 2), 10);
                let month = parseInt(extra.slice(2, 4), 10) - 1;
                let year = extra.length === 8
                    ? parseInt(extra.slice(4, 8), 10)
                    : new Date().getFullYear();
                // Set expiry to 23:59:59 IST
                expiry = new Date(Date.UTC(year, month, day, 18, 29, 59)); // 23:59:59 IST = 18:29:59 UTC
                // Compare with IST now
                if (expiry < nowIST()) status = 'expired';
            }

            currentType = {
                name,
                price,
                status,
                expiry,
                options: []
            };
            ticketTypes.push(currentType);
        } else if (currentType && line.trim()) {
            // Optionally handle sub-options if you use them
            // (extend this block if needed)
        }
    });

    return ticketTypes;
}

function parseVenue(venueStr) {
    if (!venueStr) return { name: '', address: '', map: '' };
    // Split by comma for name/address
    const [name, ...rest] = venueStr.split(',');
    const addressPart = rest.join(',').trim();

    // Find map link (http(s) or maps.google.com)
    const urlRegex = /(https?:\/\/[^\s]+|maps\.google\.com[^\s]*)/i;
    const urlMatch = venueStr.match(urlRegex);
    const map = urlMatch ? (urlMatch[0].startsWith('http') ? urlMatch[0] : 'https://' + urlMatch[0]) : '';

    // Remove map link from address if present
    let address = addressPart.replace(urlRegex, '').replace(/^\s*[-–]\s*/, '').trim();

    return {
        name: name.trim(),
        address,
        map
    };
}

// Parse schedule from text
function parseSchedule(text) {
    if (!text) return [];
    const schedule = [];
    const lines = text.split('\n');
    let currentSection = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Section header: any line that doesn't contain a "|" and is not just a time/activity
        const isSectionHeader = !trimmedLine.includes('|') && !/^(\d{1,2}(:\d{2})?\s*[ap]m?)/i.test(trimmedLine);

        if (isSectionHeader) {
            currentSection = {
                name: trimmedLine,
                activities: []
            };
            schedule.push(currentSection);
        } else {
            // If no section yet, create default one (title will be set in render)
            if (!currentSection) {
                currentSection = {
                    name: '',
                    activities: []
                };
                schedule.push(currentSection);
            }
            // Split by | for left/right columns
            const [left, right] = trimmedLine.split('|').map(s => s.trim());
            currentSection.activities.push({
                left: left || '',
                right: right || ''
            });
        }
    });

    // Filter out any sections with no activities
    return schedule.filter(section => section.activities.length > 0);
}

// Parse FAQs from text
function parseFAQs(text) {
    if (!text) return [];
    
    const faqs = [];
    const faqRegex = /(.+\?)\s*(.*)/g;
    
    let match;
    while (match = faqRegex.exec(text)) {
        faqs.push({
            question: match[1].trim(),
            answer: match[2].trim()
        });
    }
    
    return faqs;
}

// Render all UI components
function renderUI() {
    try {
        // Set up home page
        renderFeaturedEventsSlider();
        renderAboutSection();
        renderContactSection();
        
        // Set up events page
        appData.currentFilter = 'all';
        renderEventFilters();
        renderAllEvents();
        
        // Set up footer
        renderFooter();
        
    } catch (error) {
        console.error('Error rendering UI:', error);
        showError('Failed to render the user interface');
    }
}

// Render featured events slider
function renderFeaturedEventsSlider() {
    const sliderContainer = document.getElementById('featured-events-slider');
    
    if (appData.featuredEvents.length === 0) {
        sliderContainer.innerHTML = `
            <div class="bento-box featured">
                <div class="text-center py-16">
                    <i class="fas fa-star text-5xl text-gold-medium mb-6 animate__animated animate__pulse animate__infinite"></i>
                    <h2 class="text-2xl mb-4">No Featured Events</h2>
                    <p class="text-gray-600">Check back soon for exciting featured events.</p>
                </div>
            </div>
        `;
        return;
    }
    
    let sliderHTML = `
        <div class="slider-container">
    `;

    
    
    appData.featuredEvents.forEach((event, index) => {
        // const dateObj = event.startDate ? new Date(event.startDate) : null;
        // const day = dateObj ? dateObj.getDate() : '';
        // const monthShort = dateObj ? dateObj.toLocaleString('en-US', { month: 'short' }) : '';
        // const year = dateObj ? dateObj.getFullYear() : '';

        const hasDate = event.startDate && !isNaN(new Date(event.startDate).getTime());
        const hasTickets = event.ticketTypes && event.ticketTypes.length > 0;

        // const timeout = setTimeout(() => {
        //     const eventBox = document.createElement('div');
        //     eventBox.className = 'card-3d animate__animated animate__fadeInUp';
        //     eventBox.style.animationDelay = `${index * 0.1}s`;

            let day = '', monthShort = '', year = '', dateBadgeHtml = '';
            if (event.isProduct) {
                // Product logic
                if (hasTickets) {
                    const lowestPrice = Math.min(...event.ticketTypes.map(ticket => ticket.price));
                    dateBadgeHtml = `<span class="date-year">Starting</span><span class="date-day">${getCurrency()}${lowestPrice}</span>`;
                } else {
                    // No price info: don't show the price/date badge at all
                    dateBadgeHtml = '';
                }
            } else if (hasDate) {
                // Event with date
                const dateObj = new Date(event.startDate);
                day = dateObj.getDate();
                monthShort = dateObj.toLocaleString('en-US', { month: 'short' });
                year = dateObj.getFullYear();
                dateBadgeHtml = `
                    <span class="date-day">${day}</span>
                    <span class="date-month">${monthShort}</span>
                    <span class="date-year">${year}</span>
                `;
            } else {
                // Event without date
                // Show TBA or comment out to show nothing
                // dateBadgeHtml = `<span class="date-month">tba</span>`;
                // Or, to show nothing at all, use:
                dateBadgeHtml = '';
            }

        sliderHTML += `
            <div class="slide" id="slide-${index}" onclick="window.location='event-details.html?event=${encodeURIComponent(event.name)}'" style="cursor: pointer;">
                <img src="${event.coverPhoto}" alt="${event.name}" class="slide-image">
                <div class="slide-content">
                    <div class="event-date-badge-modern">
                        ${dateBadgeHtml}
                    </div>
                    <h2 class="event-title text-shine">${event.name}</h2>
                </div>
            </div>
        `;
    });
    
    sliderHTML += `
        </div>
        <div class="slide-indicators">
    `;
    
    for (let i = 0; i < appData.featuredEvents.length; i++) {
        sliderHTML += `
            <div class="indicator ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
        `;
    }
    
    sliderHTML += `
        </div>
    `;
    
    sliderContainer.innerHTML = sliderHTML;
    
    // Make the first slide active
    if (document.querySelector('.slide')) {
        document.querySelector('.slide').classList.add('active');
    }
    
    // --- Swipe/drag support for slider ---
    const slider = sliderContainer.querySelector('.slider-container');
    let startX = 0, currentX = 0, isDragging = false, hasMoved = false;
    let dragThreshold = 50; // px

    // Touch events
    slider.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        isDragging = true;
        hasMoved = false;
    }, { passive: true });
    slider.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        if (Math.abs(currentX - startX) > 10) hasMoved = true;
    }, { passive: true });
    slider.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        if (!hasMoved) return;
        let diff = currentX - startX;
        if (Math.abs(diff) > dragThreshold) {
            if (diff < 0) {
                // Swipe left: next slide
                goToSlide((appData.currentSlide + 1) % appData.featuredEvents.length);
            } else {
                // Swipe right: prev slide
                goToSlide((appData.currentSlide - 1 + appData.featuredEvents.length) % appData.featuredEvents.length);
            }
        }
    });

    // Mouse drag events (desktop)
    slider.addEventListener('mousedown', function(e) {
        startX = e.clientX;
        isDragging = true;
        hasMoved = false;
    });
    slider.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        currentX = e.clientX;
        if (Math.abs(currentX - startX) > 10) hasMoved = true;
    });
    slider.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        isDragging = false;
        if (!hasMoved) return;
        let diff = currentX - startX;
        if (Math.abs(diff) > dragThreshold) {
            if (diff < 0) {
                goToSlide((appData.currentSlide + 1) % appData.featuredEvents.length);
            } else {
                goToSlide((appData.currentSlide - 1 + appData.featuredEvents.length) % appData.featuredEvents.length);
            }
        }
    });
    // Prevent unwanted click after drag
    slider.addEventListener('mouseleave', function() { isDragging = false; });
    
    // Auto-advance slides with smoother transitions
    if (appData.featuredEvents.length > 1) {
        if (autoSlideIntervalId) clearInterval(autoSlideIntervalId);
        autoSlideIntervalId = setInterval(() => {
            appData.currentSlide = (appData.currentSlide + 1) % appData.featuredEvents.length;
            goToSlide(appData.currentSlide);
        }, 7000);
        
        // Pause slider on hover
        sliderContainer.addEventListener('mouseenter', () => {
            if (autoSlideIntervalId) clearInterval(autoSlideIntervalId);
        });
        
        // Resume slider on mouse leave
        sliderContainer.addEventListener('mouseleave', () => {
            if (autoSlideIntervalId) clearInterval(autoSlideIntervalId);
            autoSlideIntervalId = setInterval(() => {
                appData.currentSlide = (appData.currentSlide + 1) % appData.featuredEvents.length;
                goToSlide(appData.currentSlide);
            }, 7000);
        });
    }
}

// Render about section
function renderAboutSection() {
    const aboutContent = document.getElementById('about-content');
    // Use normalized key for about section, allow HTML from settings
    const aboutText = appData.settings.about || `<h4>We sit in a chair. We stare at a screen.<h5>The modern world forces us to not move - to not meet anyone real. The hate, the anger, the pain - is often caused by the lack of true human connection. With Ai now in the picture, it is going to become rarer to meet real humans or actually have to move our body to do anything.<br> <br> This is where social dance comes in. Every Sunday, as a ritual, you show up to a cafe, meet real people (friends and strangers) and just social dance. You move your body to the music, you laugh, you cry, you connect. You get reminded that you are not alone. You get reminded that you are human.</h4><br><br><p>Founder of Togetherness.<br><b>Vivek Advani`;
    aboutContent.innerHTML = aboutText;
}

// Render contact section
function renderContactSection() {
    const contactContent = document.getElementById('contact-content');
    const contactText = appData.settings.contact || '';
    
    if (contactText) {
        const contactLines = contactText.split(',');
        let contactHTML = '';
        
        contactLines.forEach(line => {
            contactHTML += `<p class="mb-2">${line.trim()}</p>`;
        });
        
        contactContent.innerHTML = contactHTML;
    } else {
        contactContent.innerHTML = '<p>Contact information not available.</p>';
    }
}

// Render footer
function renderFooter() {
    const footerContact = document.getElementById('footer-contact');
    const contactText = appData.settings.contact || '';
    
    if (contactText) {
        const contactLines = contactText.split(',');
        let contactHTML = '';
        
        contactLines.forEach(line => {
            contactHTML += `<p class="mb-2">${line.trim()}</p>`;
        });
        
        footerContact.innerHTML = contactHTML;
    }
}

// Render event filters
function renderEventFilters() {
    const filtersContainer = document.getElementById('event-filters');
    filtersContainer.innerHTML = '';

    // "All" tab
    filtersContainer.innerHTML += `
        <div class="nav-tab${appData.currentFilter === 'all' ? ' active' : ''}" onclick="filterEvents('all')">All</div>
    `;

    Array.from(appData.uniqueLabels)
        .filter(label => label && label !== 'all')
        .sort()
        .forEach(label => {
            filtersContainer.innerHTML += `
                <div class="nav-tab${appData.currentFilter === label ? ' active' : ''}" onclick="filterEvents('${label}')">${label}</div>
            `;
        });
}

function filterEvents(label) {
    appData.currentFilter = label;
    renderEventFilters();
    renderAllEvents();
}

// Render all events
let eventRenderTimeouts = [];

function renderAllEvents() {
    // alert('Rendering events:', appData.events, 'Current filter:', appData.currentFilter);
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = '';

    // Clear any previous timeouts to prevent duplicate rendering
    eventRenderTimeouts.forEach(timeout => clearTimeout(timeout));
    eventRenderTimeouts = [];

    let filteredEvents = appData.currentFilter === 'all'
        ? appData.events
        : appData.events.filter(event =>
            event.label === appData.currentFilter
        );

    // Apply search filter
    if (currentSearchQuery) {
        filteredEvents = filteredEvents.filter(event => {
            const haystack = [
                event.name,
                event.label,
                (event.tags || []).join(' '),
                event.description
            ].join(' ').toLowerCase();
            return haystack.includes(currentSearchQuery);
        });
    }

    // Show count in search bar
    const countEl = document.getElementById('events-search-count');
    if (countEl) {
        countEl.textContent = `${filteredEvents.length} found`;
    }

    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="col-span-full text-center py-10 bento-box">
                <div class="text-center py-12">
                    <i class="fas fa-calendar-times text-4xl text-gold-medium mb-4"></i>
                    <h3 class="mb-2">No Events Found</h3>
                    <p>No events found with the selected filter.</p>
                    <a class="btn btn-primary mt-4" href="events.html">View All Events</a>
                </div>
            </div>
        `;
        return;
    }

    // Delayed rendering for staggered appearance
    filteredEvents.forEach((event, index) => {
        const hasDate = event.startDate && !isNaN(new Date(event.startDate).getTime());
        const hasTickets = event.ticketTypes && event.ticketTypes.length > 0;

        const timeout = setTimeout(() => {
            const eventBox = document.createElement('div');
            eventBox.className = 'card-3d animate__animated animate__fadeInUp';
            eventBox.style.animationDelay = `${index * 0.1}s`;

            let day = '', monthShort = '', year = '', dateBadgeHtml = '';
            if (event.isProduct) {
                // Product logic
                if (hasTickets) {
                    const lowestPrice = Math.min(...event.ticketTypes.map(ticket => ticket.price));
                    dateBadgeHtml = `<span class="date-year">Starting</span><span class="date-day">${getCurrency()}${lowestPrice}</span>`;
                } else {
                    // No price info: don't show the price/date badge at all
                    dateBadgeHtml = '';
                }
            } else if (hasDate) {
                // Event with date
                const dateObj = new Date(event.startDate);
                day = dateObj.getDate();
                monthShort = dateObj.toLocaleString('en-US', { month: 'short' });
                year = dateObj.getFullYear();
                dateBadgeHtml = `
                    <span class="date-day">${day}</span>
                    <span class="date-month">${monthShort}</span>
                    <span class="date-year">${year}</span>
                `;
            } else {
                // Event without date
                // Show TBA or comment out to show nothing
                // dateBadgeHtml = `<span class="date-month">tba</span>`;
                // Or, to show nothing at all, use:
                dateBadgeHtml = '';
            }

            eventBox.innerHTML = `
                <div class="event-card" onclick="window.location='event-details.html?event=${encodeURIComponent(event.name)}'">
                    <div class="event-image-container">
                        <img src="${event.coverPhoto}" alt="${event.name}" class="event-image">
                        <div class="event-image-overlay"></div>
                    </div>
                    <div class="card-content">
                        <div class="card-text">
                            <div>
                                <span class="label">${event.label || 'Uncategorized'}</span>
                            </div>
                            <h3 class="event-title mb-0">${event.name}</h3>
                        </div>
                        <div class="self-start">
                            ${dateBadgeHtml ? `<div class="event-date-badge-modern">${dateBadgeHtml}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;

            eventsContainer.appendChild(eventBox);

            // Apply 3D tilt effect to newly added cards
            initTiltEffect();
        }, index * 100);
        eventRenderTimeouts.push(timeout);
    });
}

// Show event details
function showEventDetails(eventName) {
    const event = appData.events.find(e => e.name === eventName);
    
    if (!event) {
        showError('Event not found');
        return;
    }
    
    appData.currentEvent = event;
    
    const container = document.getElementById('event-details-container');
    const dateObj = event.startDate ? new Date(event.startDate) : null;
    // const day = dateObj ? dateObj.getDate() : '';
    // const monthShort = dateObj ? dateObj.toLocaleString('en-US', { month: 'short' }) : '';
    // const year = dateObj ? dateObj.getFullYear() : '';
    const venueParsed = parseVenue(event.venue);

    const hasDate = event.startDate && !isNaN(new Date(event.startDate).getTime());
    const hasTickets = event.ticketTypes && event.ticketTypes.length > 0;

    let day = '', monthShort = '', year = '', dateBadgeHtml = '';
        if (event.isProduct) {
            // Product logic
            if (hasTickets) {
                const lowestPrice = Math.min(...event.ticketTypes.map(ticket => ticket.price));
                dateBadgeHtml = `<span class="date-year">Staring</span><span class="date-day">${getCurrency()}${lowestPrice}</span>`;
            } else {
                // No price info: don't show the price/date badge at all
                dateBadgeHtml = '';
            }
        } else if (hasDate) {
            // Event with date
            const dateObj = new Date(event.startDate);
            day = dateObj.getDate();
            monthShort = dateObj.toLocaleString('en-US', { month: 'short' });
            year = dateObj.getFullYear();
            dateBadgeHtml = `
                <span class="date-day">${day}</span>
                <span class="date-month">${monthShort}</span>
                <span class="date-year">${year}</span>
            `;
        } else {
            // Event without date
            // Show TBA or comment out to show nothing
            // dateBadgeHtml = `<span class="date-month">tba</span>`;
            // Or, to show nothing at all, use:
            dateBadgeHtml = '';
        }

    // Gallery section (if multiple media)
    let galleryHtml = '';
    if (event.coverMedia && event.coverMedia.length > 1) {
        galleryHtml = `
            <div class="event-gallery-strip mb-8 reveal-text">
                <div class="event-gallery-strip-inner">
                ${event.coverMedia.map((url, idx) => {
                    const isYT = /youtube\.com|youtu\.be/.test(url);
                    const isVideo = /\.mp4$|\.webm$|\.mov$|youtube\.com|youtu\.be|vimeo\.com/i.test(url);
                    let thumb = '';
                    if (isYT) {
                        const ytId = (url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([\w-]+)/) || [])[1];
                        thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
                    } else if (/\.mp4$|\.webm$|\.mov$/i.test(url)) {
                        // No poster, show video icon overlay
                        thumb = '';
                    }
                    return `
                            <div class="gallery-thumb" data-idx="${idx}" tabindex="0">
                                ${(isVideo || isYT)
                                    ? `<div class='gallery-thumb-video'>${thumb ? `<img src="${thumb}" class="gallery-thumb-media" alt="Gallery Media ${idx+1}" loading="lazy" />` : ''}<i class='fas fa-play'></i></div>`
                                    : `<img src="${url}" class="gallery-thumb-media" alt="Gallery Media ${idx+1}" loading="lazy" />`}
                            </div>
                    `;
                }).join('')}
                </div>
            </div>
        `;
    }

    let html = `
        <div class="event-banner relative overflow-hidden">
            <img src="${event.coverPhoto}" alt="${event.name}" class="w-full h-80 md:h-96 object-cover transition-transform duration-10000 hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-100"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <div class="flex flex-wrap gap-2 mb-2">
                            ${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <h1 class="text-4xl md:text-5xl font-bold mb-0 text-white">${event.name}</h1>
                    </div>
                        <div class="self-end md:self-center">
                            ${dateBadgeHtml ? `<div class="event-date-badge-modern">${dateBadgeHtml}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-2 pr-6">
                    ${galleryHtml} 
                    <div class="mb-8 reveal-text">
                        <!--<h2 class="section-title text-2xl">About This Event</h2>-->
                        <p class="whitespace-pre-line bitBigger">${parseDescription(event.description)}</p>
                    </div>

                    <!-- Venue -->
                    ${event.venue && venueParsed.map ? `
                        <a href="${venueParsed.map}" target="_blank" rel="noopener"
                           class="venue-info mb-6 block rounded-lg bg-white/80 hover:bg-white/95 transition-all duration-200 cursor-pointer shadow hover:shadow-lg p-5">
                            <h4 class="font-bold mb-1 text-xl text-gold-dark">
                                <i class="fas fa-map-marker-alt mr-2"></i>
                                <span>${venueParsed.name}</span>
                            </h4>
                            <div class="text-gray-500">${venueParsed.address}</div>
                        </a>
                    ` : event.venue ? `
                        <div class="venue-info mb-6 p-5 rounded-lg bg-white/80">
                            <h4 class="font-bold mb-1 text-xl text-gold-dark">
                                <i class="fas fa-map-marker-alt mr-2"></i>
                                <span>${venueParsed.name}</h4>                   
                            <div class="text-gray-500">${venueParsed.address}</div>
                        </div>
                    ` : ''}
                    
                    <!-- Schedule -->
                    ${event.schedule && event.schedule.length > 0 ? `
                        <div class="mb-8 reveal-text">
                            ${renderSchedule(event.schedule, event.isProduct)}
                        </div>
                    ` : ''}
                    
                    <!-- FAQs -->
                    ${event.faqs && event.faqs.length > 0 ? `
                        <div class="mb-8 reveal-text">
                            <h2 class="section-title text-2xl">Got Questions</h2>
                            ${renderFAQs(event.faqs)}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Sidebar -->
                <div class="md:col-span-1">
                    <div class="bento-box stickO reveal-text">
                        <!-- Ticket types -->
                    ${event.ticketTypes && event.ticketTypes.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="text-xl mb-4 text-gold-dark text-center">${event.isProduct ? 'Options' : 'Tickets'}</h3>
                            ${renderTicketTypes(event.ticketTypes)}
                        </div>
                    ` : ''}
                    <button class="btn btn-primary w-full pulse" onclick="${event.isProduct ? 'buyProduct()' : 'bookTickets()'}">
                        <i class="fas ${event.isProduct ? 'fa-shopping-cart' : 'fa-ticket-alt'} mr-2"></i> ${event.isProduct ? 'Buy Now' : 'Book Tickets'}
                    </button>
                        
                        <div class="mt-6 text-center">
                            <p class="text-sm text-gray-500">Share this event</p>
                            <div class="flex justify-center mt-2 space-x-3">
                                <a href="#" class="text-gold-medium hover:text-gold-dark"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="text-gold-medium hover:text-gold-dark"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="text-gold-medium hover:text-gold-dark"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="text-gold-medium hover:text-gold-dark"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.faq-question').forEach(question => {
        question.onclick = function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('active'));
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            }
        };
    });
    
    container.innerHTML = html;

    // Add this after rendering event details:
    if (!document.getElementById('tickets-container')) {
        const ticketsDiv = document.createElement('div');
        ticketsDiv.id = 'tickets-container';
        // Optionally, add a class for styling:
        // ticketsDiv.className = 'mt-8';
        container.parentNode.appendChild(ticketsDiv);
    }
    
    // Initialize animations for newly added elements
    setTimeout(() => {
        initRevealAnimations();
        
        // Fade in sections with staggered delay
        gsap.utils.toArray('.reveal-text').forEach((el, i) => {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: 0.2 + (i * 0.1),
                ease: 'power2.out'
            });
        });
    }, 500);

    // Add this line to activate the live highlighter!
    // initLiveHighlighter();

    const existingBtn = document.querySelector('.book-tickets-mobile');
    if (existingBtn) existingBtn.remove(); // Remove any previous button

    // Create the button element
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'book-tickets-mobile pulse';
    mobileBtn.innerHTML = `
        <i class="fas ${event.isProduct ? 'fa-shopping-cart' : 'fa-ticket-alt'} mr-2"></i>
        ${event.isProduct ? 'Buy Now' : 'Book Tickets'}
    `;
    mobileBtn.onclick = event.isProduct ? buyProduct : bookTickets;

    // Append to body (or .app-container if you prefer)
    const fixedBtnDiv = document.querySelector('.app-container');
    if (fixedBtnDiv) {
        // fixedBtnDiv.innerHTML = ''; // Clear any previous button
        fixedBtnDiv.appendChild(mobileBtn);
    }

    // --- Gallery Modal Logic ---
    if (event.coverMedia && event.coverMedia.length > 1) {
        // Insert modal HTML if not present
        if (!document.getElementById('gallery-modal')) {
            const modalDiv = document.createElement('div');
            modalDiv.id = 'gallery-modal';
            modalDiv.className = 'modal-overlay';
            modalDiv.style.display = 'none';
            modalDiv.innerHTML = `
                <div class="modal-content gallery-modal-content" style="max-width:900px;max-height:90vh;padding:0;overflow:hidden;position:relative;">
                    <button class="modal-close gallery-modal-close" aria-label="Close">&times;</button>
                    <div class="gallery-modal-media"></div>
                    <button class="gallery-modal-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
                    <button class="gallery-modal-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
                </div>
            `;
            document.body.appendChild(modalDiv);
        }
        const modal = document.getElementById('gallery-modal');
        const modalMedia = modal.querySelector('.gallery-modal-media');
        const closeBtn = modal.querySelector('.gallery-modal-close');
        const prevBtn = modal.querySelector('.gallery-modal-prev');
        const nextBtn = modal.querySelector('.gallery-modal-next');
        let currentIdx = 0;

        function isYouTube(url) {
            return /youtube\.com|youtu\.be/.test(url);
        }
        function getYouTubeId(url) {
            const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([\w-]+)/);
            return match ? match[1] : null;
        }
        function isVideo(url) {
            return /\.mp4$|\.webm$|\.mov$|youtube\.com|youtu\.be|vimeo\.com/i.test(url);
        }
        function getVideoThumb(url) {
            if (isYouTube(url)) {
                const id = getYouTubeId(url);
                return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
            } else if (/\.mp4$|\.webm$|\.mov$/i.test(url)) {
                // Try to use a poster frame (first frame) using video element
                // We'll use a blank video element and grab a frame if possible, fallback to a video icon
                return '';
            } else if (/vimeo\.com/.test(url)) {
                // Vimeo thumbnail fetch requires API, fallback to icon
                return '';
            }
            return '';
        }

        function showModal(idx) {
            currentIdx = idx;
            const url = event.coverMedia[idx];
            let html = '';
            if (isYouTube(url)) {
                const id = getYouTubeId(url);
                html = id ? `<iframe width="800" height="450" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="max-width:100%;max-height:80vh;display:block;margin:auto;background:#000;"></iframe>` : '<div>Invalid YouTube Link</div>';
            } else if (/vimeo\.com/.test(url)) {
                // Basic Vimeo embed
                const vimeoId = url.split('/').pop();
                html = `<iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1" width="800" height="450" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="max-width:100%;max-height:80vh;display:block;margin:auto;background:#000;"></iframe>`;
            } else if (/\.mp4$|\.webm$|\.mov$/i.test(url)) {
                html = `<video src="${url}" controls autoplay class="gallery-modal-media-el" style="max-width:100%;max-height:80vh;display:block;margin:auto;background:#000;"></video>`;
            } else {
                html = `<img src="${url}" class="gallery-modal-media-el" alt="Gallery Media ${idx+1}" style="max-width:100%;max-height:80vh;display:block;margin:auto;background:#000;" />`;
            }
            modalMedia.innerHTML = html;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        function closeModal() {
            modal.style.display = 'none';
            // Remove video/iframe to stop playback
            modalMedia.innerHTML = '';
            document.body.style.overflow = '';
        }
        function showNext() {
            showModal((currentIdx + 1) % event.coverMedia.length);
        }
        function showPrev() {
            showModal((currentIdx - 1 + event.coverMedia.length) % event.coverMedia.length);
        }
        // Thumbnail click
        container.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.onclick = () => showModal(Number(thumb.dataset.idx));
            thumb.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { showModal(Number(thumb.dataset.idx)); } };
        });
        // Modal controls
        closeBtn.onclick = closeModal;
        nextBtn.onclick = showNext;
        prevBtn.onclick = showPrev;
        // Click outside modal-content closes
        modal.onclick = e => { if (e.target === modal) closeModal(); };
        // Keyboard navigation
        function galleryKeyHandler(e) {
            if (modal.style.display !== 'flex') return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
        // Remove any previous handler to avoid stacking
        document.removeEventListener('keydown', galleryKeyHandler);
        document.addEventListener('keydown', galleryKeyHandler);
    }
}

function buyProduct() {
    // You can call bookTickets() or implement custom logic here
    bookTickets();
}

// Unified validation function
function validateBookingForm({ name, phone, email, totalTickets, extraNamesArr }) {
    if (!name || !/^[a-zA-Z ]{2,}/.test(name)) {
        showFormError('Please enter your name.');
        return false;
    }
    if (!/^((\+)?[0-9]{10,15})$/.test(phone)) {
        showFormError('Please enter a valid phone number (with or without country code).');
        return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormError('Please enter a valid email address.');
        return false;
    }
    if (typeof totalTickets === 'number' && totalTickets > 1) {
        if (!extraNamesArr || extraNamesArr.length < totalTickets - 1 || extraNamesArr.some(name => !name)) {
            showFormError(`Enter ${totalTickets-1-(extraNamesArr.filter(Boolean).length)} remaining name(s).`);
            return false;
        }
    }
    showFormError('');
    return true;
}

// --- Unified Google Form background submit for interest/booking tracking ---
/**
 * Submits booking/interest data as a single text block to a Google Form entry.
 * Always submits whatever data is available, never throws or shows errors to the user.
 * @param {Object} booking - Booking details (may be partial)
 * @param {string} formUrl - Google Form formResponse URL
 * @param {string} entryId - Google Form entry ID to submit to
 */
function submitBookingToGoogleForm(booking, formUrl, entryId) {
    try {
        if (!formUrl || !entryId) {
            console.warn('[GoogleForm] Missing formUrl or entryId, skipping submission.', {formUrl, entryId});
            return;
        }
        let text = '';
        if (booking.eventName) text += `Event: ${booking.eventName}\n`;
        if (booking.eventId) text += `Event ID/URL: ${booking.eventId}\n`;
        if (booking.bookingId) text += `Booking ID: ${booking.bookingId}\n`;
        if (booking.email) text += `Email: ${booking.email}\n`;
        if (booking.phone) text += `Phone: ${booking.phone}\n`;
        if (booking.totalAmount != null) text += `Total Amount: ${booking.totalAmount}\n`;
        if (booking.ticketTypes && booking.ticketTypes.length) {
            text += 'Ticket Types: ' + booking.ticketTypes.map(t => `${t.name}: ${t.price}`).join(', ') + '\n';
        }
        if (booking.attendees && booking.attendees.length) {
            text += 'Attendees:\n';
            booking.attendees.forEach((a, i) => {
                text += `  ${i+1}. ${a.type ? a.type + ' - ' : ''}${a.name || ''}`;
                if (a.phone) text += ` (${a.phone})`;
                text += '\n';
            });
            text += `Total People: ${booking.attendees.length}\n`;
        } else if (booking.totalTickets) {
            text += `Total People: ${booking.totalTickets}\n`;
        }
        // Always include at least event name and number of people if possible
        if (!text.includes('Event:') && booking.eventName) text += `Event: ${booking.eventName}\n`;
        if (!text.includes('Total People:')) {
            let n = 1;
            if (booking.attendees && booking.attendees.length) n = booking.attendees.length;
            else if (booking.totalTickets) n = booking.totalTickets;
            text += `Total People: ${n}\n`;
        }
        text += `Submitted: ${new Date().toLocaleString()}`;
        const data = new URLSearchParams();
        data.append(entryId, text);
        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: data
        }).catch(() => {});
    } catch (e) {
        // Never show error to user
        console.warn('[GoogleForm] Exception during submission', e);
    }
}

// --- Google Form background submit for interest tracking ---
/**
 * Submit full booking data as a single text block to Google Form (interest flow)
 * @param {Object} booking - Booking details
 */
function submitInterestGoogleForm(booking) {
    console.log('Submitting interest to Google Form:', booking);
    const formUrl = appData.settings.googleform_url;
    const entryId = appData.settings.googleform_interest_entryid;
    submitBookingToGoogleForm(booking, formUrl, entryId);
}

/**
 * Submit booking data as a single text block to a custom Google Form entry ID (booking flow)
 * @param {Object} booking - Booking details
 * @param {string} [entryIdOverride] - Optional: override entry ID
 */
function submitBookingToCustomEntry(booking, entryIdOverride) {
    console.log('Submitting booking to custom entry:', entryIdOverride);
    const formUrl = appData.settings.googleform_url;
    const entryId = entryIdOverride || appData.settings.googleform_booking_entryid;
    submitBookingToGoogleForm(booking, formUrl, entryId);
}
// ...existing code...

// Book tickets
function bookTickets(options = {}) {
    const event = appData.currentEvent;
    if (!event) return;

    // Load saved user info (name, phone, email)
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem('tgs_userinfo') || '{}');
    } catch (err) {
        saved = {};
    }

    // Load global ticket/guest info
    let savedCustom = {};
    try {
        savedCustom = JSON.parse(localStorage.getItem('tgs_ticketcustom') || '{}');
    } catch (err) {
        savedCustom = {};
    }
    if (options.reset) {
        saved = {};
        savedCustom = {};
    }

    // Show user-details form if info missing or forced
    let showForm = !saved.name || !saved.phone || !saved.email;
    if (options.forceShowForm) showForm = true;
    const rememberChecked = Boolean(saved.name && saved.phone && saved.email);

    // Prefill ticket count and guest names from global save
    let previousTickets = savedCustom.ticketCount || 1;
    let previousNames = savedCustom.extraNames || '';
    let guestNamesArr = previousNames ? previousNames.split(/\n|,/).map(s => s.trim()).filter(Boolean) : [];
    let cheapestIdx = getCheapestTicketIdx(event);

    // Build guestNamesText for display
    let guestNamesText = '';
    if (previousTickets > 1 && guestNamesArr.length) {
        if (guestNamesArr.length === 1) {
            guestNamesText = ` & <span class="additional-name">${guestNamesArr[0]}</span>`;
        } else {
            const nameSpans = guestNamesArr.map(name => `<span class="additional-name">${name}</span>`);
            let namesDisplay = '';
            if (nameSpans.length === 2) {
                namesDisplay = `${nameSpans[0]} & ${nameSpans[1]}`;
            } else {
                namesDisplay = nameSpans.slice(0, -1).join(', ') + ' & ' + nameSpans.slice(-1);
            }
            guestNamesText = `, ${namesDisplay}`;
        }
    }

    // Render modal HTML (unchanged, but ticket pills and guest fields will be set below)
    const html = `
        <button class="modal-close" onclick="closeTicketModal()">&times;</button>
        <h3 class="text-xl font-bold mb-2 pr-2 text-gold-dark">${event.name}</h3>
        <p class="text-gray-600 mb-4" style="background: rgba(253,255,50,0.4); width: fit-content">${event.formattedDate}</p>
        <form id="ticket-purchase-form" autocomplete="on">
            <div id="user-details-section">
                ${showForm ? `
                    <div class="mb-2 flex gap-2">
                        <div class="flex-1">
                            <label for="booking-name" class="block mb-0.5 text-xs font-semibold">Name <span style="color:#e53e3e">*</span></label>
                            <input type="text" id="booking-name" name="booking_name" placeholder="Your Name" required
                                class="w-full p-2 rounded border border-gray-200 text-xs mb-1"
                                autocomplete="name" value="${saved.name || ''}" />
                        </div>
                        <div class="flex-1">
                            <label for="booking-phone" class="block mb-0.5 text-xs font-semibold">Phone <span style="color:#e53e3e">*</span></label>
                            <input type="tel" id="booking-phone" name="booking_phone" placeholder="10-digit Mobile" required"
                                class="w-full p-2 rounded border border-gray-200 text-xs mb-1"
                                autocomplete="tel" value="${saved.phone || ''}" />
                        </div>
                    </div>
                    <div class="mb-2 flex-1">
                        <label for="booking-email" class="block mb-0.5 text-xs font-semibold">Email <span style="color:#e53e3e">*</span></label>
                        <input type="email" id="booking-email" name="booking_email" placeholder="you@email.com" required
                            class="w-full p-2 rounded border border-gray-200 text-xs mb-1"
                            autocomplete="email" value="${saved.email || ''}" />
                    </div>
                    <div class="mb-2 flex items-center">
                        <input type="checkbox" id="remember-me" class="mr-2" ${rememberChecked ? 'checked' : ''} />
                        <label for="remember-me" class="text-xs select-none cursor-pointer">Remember me on this device</label>
                    </div>
                ` : `
                    <div class="mb-2 flex items-center justify-between">
                        <span class="text-base font-semibold">Welcome, ${saved.name}!</span>
                        <button type="button" id="edit-user-details" class="text-xs underline text-gold-dark ml-2">Edit</button>
                    </div>
                    <div class="text-xs text-gray-500 mb-2">${saved.email} &bull; ${saved.phone}</div>
                `}
            </div>

            <div id="ticket-section">
                <div id="default-ticket-section">
                    <button type="button" class="btn btn-primary w-full mt-2 flex items-center justify-between" id="proceed-best-price">
                        <span>${previousTickets > 1 ? `${previousTickets} Tickets` : 'Buy 1 Ticket'}</span>
                        <span class="font-semibold text-gold-dark">
                            ${getCurrency()}${
                                event.ticketTypes && event.ticketTypes.length
                                    ? (event.ticketTypes[getCheapestTicketIdx(event)].price * previousTickets)
                                    : 0
                            }
                        </span>
                    </button>
                    <div class="text-xs text-gray-500 mt-1 text-center">
                        ${previousTickets > 1
                            ? `Best Tickets pre-selected for <span class="additional-name">You</span>${guestNamesText}`
                            : 'Best ticket pre-selected for you'}
                    </div>
                    <button type="button" class="text-xs underline text-gold-dark mt-4 w-full" id="customise-tickets">Edit Tickets</button>
                </div>

                <div id="custom-ticket-section" style="display:none">
                    <div class="flex flex-col gap-1 mb-2">
                        ${event.ticketTypes.map((type, idx) => {
                            const isDisabled = type.status === 'soldout' || type.status === 'expired';
                            let qty = 0;
                            if (Array.isArray(savedCustom.ticketCounts)) {
                                qty = savedCustom.ticketCounts[idx] || 0;
                            } else if (!savedCustom.ticketCounts && idx === getCheapestTicketIdx(event)) {
                                qty = 1;
                            }
                            const highlightClass = qty > 0 ? 'activeTicket' : 'bg-white border-gray-200';
                            return `
                                <div class="ticket-pill flex items-center justify-between rounded px-2 py-1 ${highlightClass} ${isDisabled ? 'opacity-40' : ''}" style="min-width:0; font-size:13px;">
                                    <div class="flex-1 min-w-0 truncate">
                                        <span class="font-semibold ${isDisabled ? 'text-gray-400' : ''}">${type.name}</span>
                                        <span class="ml-1 text-gold-dark font-bold">${getCurrency()}${type.price}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <button type="button" class="ticket-minus rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 bg-gray-100 text-xs font-bold" data-type-idx="${idx}" ${isDisabled ? 'disabled' : ''}>-</button>
                                        <span class="ticket-qty-num w-4 text-center font-semibold" data-type-idx="${idx}">${qty}</span>
                                        <button type="button" class="ticket-plus rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 bg-gray-100 text-xs font-bold" data-type-idx="${idx}" ${isDisabled ? 'disabled' : ''}>+</button>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                    <div id="ticket-summary" class="mt-1 text-xs text-gray-700 font-medium"></div>
                    <div id="attendee-fields" class="mt-4" style="max-height:70px;"></div>
                    <button type="submit" class="btn btn-primary w-full mt-3"><span>Proceed to Pay</span></button>
                    <button type="button" id="back-to-default" class="text-xs underline text-gold-dark mt-2 w-full">Back</button>
                </div>
            </div>
        </form>
    `;

    // Inject HTML and show modal
    const container = document.getElementById('ticket-modal-content');
    container.innerHTML = html;
    document.getElementById('ticket-modal').style.display = 'flex';

    // --- Event bindings ---

    // Edit user details
    const editBtn = document.getElementById('edit-user-details');
    if (editBtn) {
        editBtn.addEventListener('click', () => bookTickets({ forceShowForm: true }));
    }

    // Remember me toggle
    const rememberMe = document.getElementById('remember-me');
    if (rememberMe) {
        rememberMe.addEventListener('change', function() {
            if (this.checked) {
                const name = document.getElementById('booking-name').value.trim();
                const phone = document.getElementById('booking-phone').value.trim();
                const email = document.getElementById('booking-email').value.trim();
                localStorage.setItem('tgs_userinfo', JSON.stringify({ name, phone, email }));
            } else {
                localStorage.removeItem('tgs_userinfo');
                localStorage.removeItem('tgs_ticketcustom'); // Remove global ticket/guest memory
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('tgs_ticketcustom_')) {
                        localStorage.removeItem(key);
                    }
                });
                bookTickets({ forceShowForm: true, reset: true });
            }
        });
    }

    // Live-save user inputs if "remember me" is checked
    ['booking-name', 'booking-phone', 'booking-email'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (document.getElementById('remember-me')?.checked) {
                    const name = document.getElementById('booking-name').value.trim();
                    const phone = document.getElementById('booking-phone').value.trim();
                    const email = document.getElementById('booking-email').value.trim();
                    localStorage.setItem('tgs_userinfo', JSON.stringify({ name, phone, email }));
                }
            });
        }
    });

    // Best-price flow
    const proceedBtn = document.getElementById('proceed-best-price');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            // Always get the latest saved info or DOM values
            let mainName = saved.name, mainPhone = saved.phone, mainEmail = saved.email;
            if (showForm) {
                mainName = document.getElementById('booking-name').value.trim();
                mainPhone = document.getElementById('booking-phone').value.trim();
                mainEmail = document.getElementById('booking-email').value.trim();
            }
            // Get ticket count and guest names from localStorage (or defaults)
            let ticketCount = 1;
            let extraNamesArr = [];
            try {
                const savedCustom = JSON.parse(localStorage.getItem('tgs_ticketcustom') || '{}');
                ticketCount = savedCustom.ticketCount || 1;
                extraNamesArr = savedCustom.extraNames ? savedCustom.extraNames.split(/\n|,/).map(s => s.trim()).filter(Boolean) : [];
            } catch (err) {
                ticketCount = 1;
                extraNamesArr = [];
            }
            // Validate form
            if (!validateBookingForm({ name: mainName, phone: mainPhone, email: mainEmail, totalTickets: ticketCount, extraNamesArr })) {
               
                return;
            }
            // Set selectedTickets (all on cheapest type)
            const cheapestIdx = getCheapestTicketIdx(event);
            appData.selectedTickets = event.ticketTypes.map((t, idx) => idx === cheapestIdx ? ticketCount : 0);
            // Set attendees
            const attendees = [{ type: 'Main', name: mainName, phone: mainPhone }];
            for (let i = 0; i < ticketCount - 1; i++) {
                attendees.push({ type: 'Guest', name: extraNamesArr[i] || '', phone: '' });
            }
            appData.attendees = attendees;
            appData.totalAmount = event.ticketTypes[cheapestIdx].price * ticketCount;
            appData.bookingEmail = mainEmail;
            appData.bookingId = generateBookingID();
            // Save to localStorage if remember me is checked
            if (document.getElementById('remember-me')?.checked || (!showForm && saved.name)) {
                localStorage.setItem('tgs_ticketcustom', JSON.stringify({
                    ticketCount: appData.selectedTickets.reduce((a, b) => a + b, 0),
                    extraNames: extraNamesArr.join('\n')
                }));
            }
            // Google Form submission
            const allNames = [mainName, ...extraNamesArr].filter(Boolean).join(', ');
            submitInterestGoogleForm({
                eventId: window.location.href,
                names: allNames,
                eventName: appData.currentEvent.name,
                bookingId: appData.bookingId,
                email: appData.bookingEmail,
                attendees: appData.attendees,
                totalAmount: appData.totalAmount
            });
            closeTicketModal();
            showPaymentModal();
        });
    }

    // Edit/customize tickets
    const customiseBtn = document.getElementById('customise-tickets');
    if (customiseBtn) {
        customiseBtn.addEventListener('click', () => {
            document.getElementById('default-ticket-section').style.display = 'none';
            document.getElementById('custom-ticket-section').style.display = '';

            // --- Begin robust prefill logic ---
            // Load saved global ticket/guest info again (in case changed)
            let savedCustom = {};
            try {
                savedCustom = JSON.parse(localStorage.getItem('tgs_ticketcustom') || '{}');
            } catch (err) {
                savedCustom = {};
            }
            let ticketCount = savedCustom.ticketCount || 1;
            let extraNamesArr = savedCustom.extraNames ? savedCustom.extraNames.split(/\n|,/).map(s => s.trim()).filter(Boolean) : [];
            let cheapestIdx = getCheapestTicketIdx(event);

            // Set ticket pills: all on cheapest type, others 0
            document.querySelectorAll('.ticket-qty-num').forEach((el, idx) => {
                el.textContent = idx === cheapestIdx ? ticketCount : 0;
            });
            updateActiveTicketClasses();

            // Prefill guest fields
            updateAttendeeFieldsCompact({ extraNames: extraNamesArr.join('\n') }, true);
            updateTicketSummary();
            // --- End robust prefill logic ---
        });
    }

    // Back to default
    const backBtn = document.getElementById('back-to-default');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('custom-ticket-section').style.display = 'none';
            document.getElementById('default-ticket-section').style.display = '';
        });
    }

    // Plus/minus buttons
    document.querySelectorAll('.ticket-plus, .ticket-minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-type-idx'), 10);
            const numEl = document.querySelector(`.ticket-qty-num[data-type-idx="${idx}"]`);
            let val = parseInt(numEl.textContent, 10) || 0;
            if (this.classList.contains('ticket-plus')) {
                if (val < 10) numEl.textContent = val + 1;
                animateTicketPill(numEl, 'plus');
            } else {
                if (val > 0) numEl.textContent = val - 1;
                animateTicketPill(numEl, 'minus');
            }
            updateActiveTicketClasses();
            updateAttendeeFieldsCompact();
            updateTicketSummary();
        });
    });

    // Form submit for custom section
    document.getElementById('ticket-purchase-form').addEventListener('submit', function(e) {
        if (document.getElementById('custom-ticket-section').style.display === 'none') {
            e.preventDefault();
            return false;
        }
        e.preventDefault();

        const ticketCounts = [];
        let totalTickets = 0;
        let totalAmount = 0;
        event.ticketTypes.forEach((type, idx) => {
            const qty = parseInt(document.querySelector(`.ticket-qty-num[data-type-idx="${idx}"]`).textContent, 10) || 0;
            ticketCounts[idx] = qty;
            totalTickets += qty;
            totalAmount += qty * type.price;
        });

        let mainName = saved.name, mainPhone = saved.phone, mainEmail = saved.email;
        if (showForm) {
            mainName = document.getElementById('booking-name').value.trim();
            mainPhone = document.getElementById('booking-phone').value.trim();
            mainEmail = document.getElementById('booking-email').value.trim();
        }

        const extraNamesArr = totalTickets > 1
            ? Array.from(document.querySelectorAll('.guest-name-input')).map(input => input.value.trim())
            : [];

        if (!validateBookingForm({ name: mainName, phone: mainPhone, email: mainEmail, totalTickets, extraNamesArr })) {
            return;
        }

        const attendees = [{ type: 'Main', name: mainName, phone: mainPhone }];
        for (let i = 0; i < totalTickets - 1; i++) {
            attendees.push({ type: 'Guest', name: extraNamesArr[i], phone: '' });
        }

        appData.selectedTickets = ticketCounts;
        appData.attendees = attendees;
        appData.totalAmount = totalAmount;
        appData.bookingEmail = mainEmail;
        appData.bookingId = generateBookingID();

        if (document.getElementById('remember-me')?.checked || (!showForm && saved.name)) {
            localStorage.setItem('tgs_ticketcustom', JSON.stringify({
                ticketCount: appData.selectedTickets.reduce((a, b) => a + b, 0),
                extraNames: extraNamesArr.join('\n')
            }));
        }

        // Prepare names for Google Form
        const allNames = [mainName, ...extraNamesArr].filter(Boolean).join(', ');
        submitInterestGoogleForm({
            eventId: window.location.href,
            names: allNames
        });

        closeTicketModal();
        showPaymentModal();
    });

    // Initialize custom section fields & summary
    updateAttendeeFieldsCompact(savedCustom, true);
    updateTicketSummary(savedCustom);
}

function getCheapestTicketIdx(event) {
    let minIdx = -1;
    event.ticketTypes.forEach((t, idx) => {
        if (t.status === 'active') {
            if (minIdx === -1 || t.price < event.ticketTypes[minIdx].price) {
                minIdx = idx;
            }
        }
    });
    return minIdx === -1 ? 0 : minIdx; // fallback to 0 if none active
}

function updateAttendeeFieldsCompact(savedCustom, alwaysShow) {
    const event = appData.currentEvent;
    const container = document.getElementById('attendee-fields');
    let totalTickets = 0;
    event.ticketTypes.forEach((type, idx) => {
        const numEl = document.querySelectorAll('.ticket-qty-num')[idx];
        const qty = parseInt(numEl.textContent) || 0;
        totalTickets += qty;
    });
    let count = totalTickets > 1 ? totalTickets - 1 : 0;

    // Preserve names from DOM if possible
    let extraNamesArr = [];
    if (container && container.querySelectorAll('.guest-name-input').length) {
        extraNamesArr = Array.from(document.querySelectorAll('.guest-name-input')).map(input => input.value.trim());
    } else if (savedCustom && savedCustom.extraNames) {
        extraNamesArr = savedCustom.extraNames.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    }
    // Pad or trim to correct length
    while (extraNamesArr.length < count) extraNamesArr.push('');
    if (extraNamesArr.length > count) extraNamesArr = extraNamesArr.slice(0, count);

    let label = count === 0
        ? '0 guest'
        : `Names of ${count} guests joining you`;

    let fields = '';
    for (let i = 0; i < count; i++) {
        fields += `
            <div class="guest-name-input-wrapper">
                <input type="text" class="guest-name-input"
                    placeholder="Guest ${i + 2}"
                    value="${extraNamesArr[i] || ''}"
                    data-guest-idx="${i}" autocomplete="off" spellcheck="false" />
                <button type="button" class="clear-guest-name-btn" data-guest-idx="${i}" tabindex="-1" aria-label="Clear">&times;</button>
            </div>
        `;
    }

    container.innerHTML = count === 0 ? '' : `
        <div class="mb-2">
            <!-- <label class="block mb-0.5 text-xs font-semibold">${label}</label> -->
            <div class="additionalNames"> 
            ${fields}
            </div>
        </div>
    `;

    // Save on input (optional: update localStorage if remember me is checked)
    container.querySelectorAll('.guest-name-input').forEach(input => {
        autoResizeInput(input);
    
        input.addEventListener('input', function() {
            autoResizeInput(this);
            const wrapper = this.parentElement;
            const clearBtn = wrapper.querySelector('.clear-guest-name-btn');
            if (clearBtn) clearBtn.style.display = this.value ? 'block' : 'none';
            extraNamesArr[parseInt(this.dataset.guestIdx)] = this.value;
            // if (document.getElementById('remember-me')?.checked) {
            //     localStorage.setItem('tgs_ticketcustom', JSON.stringify({
            //         ticketCounts: Array.from(document.querySelectorAll('.ticket-qty-num')).map(el => parseInt(el.textContent) || 0),
            //         extraNames: extraNamesArr.join('\n')
            //     }));
            // }
        });
    
        input.addEventListener('focus', function() {
            autoResizeInput(this);
        });
    
        // Ensure text selection works
        input.style.userSelect = 'auto';
        input.addEventListener('dblclick', function(e) {
            this.select();
        });
    });
    
    // Clear button logic
    container.querySelectorAll('.clear-guest-name-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const idx = parseInt(this.dataset.guestIdx);
            const input = container.querySelector(`.guest-name-input[data-guest-idx="${idx}"]`);
            if (input) {
                input.value = '';
                input.dispatchEvent(new Event('input'));
                input.focus();
            }
        });
    });
    
    // Helper for auto-resizing input width
    function autoResizeInput(input) {
        let span = input._mirrorSpan;
        if (!span) {
            span = document.createElement('span');
            span.style.visibility = 'hidden';
            span.style.position = 'absolute';
            span.style.whiteSpace = 'pre';
            span.style.font = window.getComputedStyle(input).font;
            document.body.appendChild(span);
            input._mirrorSpan = span;
        }
        span.textContent = input.value || input.placeholder || '';
        input.style.width = (span.offsetWidth + 24) + 'px';
    }
}

function updateTicketSummary(savedCustom) {
    const event = appData.currentEvent;
    let totalTickets = 0;
    let totalAmount = 0;
    event.ticketTypes.forEach((type, idx) => {
        const numEl = document.querySelectorAll('.ticket-qty-num')[idx];
        const qty = parseInt(numEl.textContent) || 0;
        totalTickets += qty;
        totalAmount += qty * type.price;
    });
    const summary = document.getElementById('ticket-summary');
    if (totalTickets > 0) {
        summary.innerHTML = `<span class='text-gold-dark font-bold'>${totalTickets} ticket${totalTickets>1?'s':''}</span> | <span>Total: <span class='font-bold'>${getCurrency()}${totalAmount}</span></span>`;
    } else {
        summary.innerHTML = '';
    }
}

function saveCustomTicketData() {
    const rememberMe = document.getElementById('remember-me');
    if (rememberMe && !rememberMe.checked) return;
    const ticketCounts = Array.from(document.querySelectorAll('.ticket-qty-num')).map(el => parseInt(el.textContent) || 0);
    const extraNames = Array.from(document.querySelectorAll('.guest-name-input')).map(input => input.value.trim()).join('\n');
    localStorage.setItem('tgs_ticketcustom', JSON.stringify({ ticketCounts, extraNames }));
}

function handleTicketFormSubmit(e) {
    e.preventDefault();
    const event = appData.currentEvent;
    const name = form['booking_name'].value.trim();
    const phone = form['booking_phone'].value.trim();
    const email = form['booking_email'].value.trim();
    if (!validateBookingForm({ name, phone, email })) return;
    let ticketCounts = [];
    let totalTickets = 0;
    let totalAmount = 0;
    event.ticketTypes.forEach((type, idx) => {
        const numEl = document.querySelectorAll('.ticket-qty-num')[idx];
        const qty = parseInt(numEl.textContent) || 0;
        ticketCounts[idx] = qty;
        totalTickets += qty;
        totalAmount += qty * type.price;
    });
    if (totalTickets === 0) {
        showFormError('Please select at least one ticket.');
        return;
    }
    // Collect attendee names
    let attendees = [{ type: 'Main', name, phone }];
    if (totalTickets > 1) {
        const extraNamesRaw = document.getElementById('other-names')?.value || '';
        let extraNames = extraNamesRaw.split(/\n|,/).map(s => s.trim()).filter(Boolean);
        if (extraNames.length < totalTickets - 1) {
            showFormError(`Enter ${totalTickets-1-(extraNames.length)} remaining name(s).`);
            return;
        }
        for (let i = 0; i < totalTickets - 1; i++) {
            attendees.push({ type: 'Guest', name: extraNames[i], phone: '' });
        }
    }
    appData.selectedTickets = ticketCounts;
    appData.attendees = attendees;
    appData.totalAmount = totalAmount;
    appData.bookingEmail = email;
    appData.bookingId = generateBookingID();
    closeTicketModal();
    showPaymentModal();
}

function closeTicketModal() {
    document.getElementById('ticket-modal').style.display = 'none';
}

function handleTicketFormSubmit(e) {
    e.preventDefault();
    const event = appData.currentEvent;
    const form = document.getElementById('tickets-form');
    const email = form['booking_email'].value.trim();
    const ticketCounts = [];
    let totalTickets = 0;
    let totalAmount = 0;
    let attendees = [];
    let phoneError = false;

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormError('Please enter a valid email address.');
        return;
    }

    event.ticketTypes.forEach((type, idx) => {
        const qty = parseInt(form.querySelector(`.ticket-qty-input[data-type-idx="${idx}"]`).value) || 0;
        ticketCounts[idx] = qty;
        totalTickets += qty;
        totalAmount += qty * type.price;
        for (let i = 0; i < qty; i++) {
            const name = form[`attendee_name_${idx}_${i}`].value.trim();
            const phone = form[`attendee_phone_${idx}_${i}`].value.trim();
            if (!/^((\+)?[0-9]{10,15})$/.test(phone)) {
                showFormError('Please enter a valid phone number (with or without country code).');
                return;
            }
            attendees.push({ type: type.name, name, phone });
        }
    });

    // Hide error if all is good
    showFormError('');

    if (totalTickets === 0) {
        showFormError('Please select at least one ticket.');
        return;
    }
    if (phoneError) {
        showFormError('Please enter a valid 10-digit phone number for each attendee.');
        return;
    }

    appData.selectedTickets = ticketCounts;
    appData.attendees = attendees;
    appData.totalAmount = totalAmount;
    appData.bookingEmail = email;
    appData.bookingId = generateBookingID(); // <-- Add this line

    closeTicketModal();
    showPaymentModal();
}

let errorTimer = null;

function showFormError(msg) {
    let errorDiv = document.getElementById('form-error');
    if (!errorDiv) {
        // Always place after the submit button
        const form = document.getElementById('ticket-purchase-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        errorDiv = document.createElement('div');
        errorDiv.id = 'form-error';
        errorDiv.className = 'form-error-message';
        submitBtn.insertAdjacentElement('afterend', errorDiv);
    }
    if (msg) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
        errorDiv.classList.remove('nudge'); // Reset animation
        // Force reflow for animation restart
        void errorDiv.offsetWidth;
        errorDiv.classList.add('nudge');
        // Auto-hide after 2 seconds
        if (errorTimer) clearTimeout(errorTimer);
        errorTimer = setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 2000);
    } else {
        errorDiv.style.display = 'none';
    }
}

// Utility to get UPI info from settings
function getUPIInfo() {
    const settings = appData.settings || {};
    return {
        upiId: settings.upi_id || '',
        payeeName: settings.upi_name || settings.upi_payee || settings.payee_name || '',
        currency: settings.currency || 'INR'
    };
}

function showPaymentModal() {
    const event = appData.currentEvent;
    const { upiId, payeeName, currency } = getUPIInfo();
    const amount = appData.totalAmount;
    const note = appData.attendees && appData.attendees.length ? appData.attendees[0].name : '';
    // GPay UPI link
    const gpayUrl = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=${encodeURIComponent(currency)}&tn=${encodeURIComponent(note)}`;
    let html = `
        <button class="modal-close" onclick="closeTicketModal()">&times;</button>
        <h3 class="font-semibold mb-0">Payment</h3>
        <h3 class="modal-text mb-6">Total: <span class="font-bold text-gold-dark">${currency}${amount}</span></h3>
        <div class="mb-4 text-center">
            <img id="upi-qr-jpg" src="" alt="UPI QR" width="200" height="200" class="mx-auto rounded shadow mb-2" style="background:#fff;"/>
            <div class="flex items-baseline justify-center gap-2 mb-2">
                <span class="font-bold text-base">UPI ID</span>
                <span class="label" id="upi-id" style="cursor:pointer;" onclick="copyUPIID()">${upiId}</span>
            </div>
        </div>
        <div class="mb-4 flex justify-center gap-4">
            <button class="btn btn-neon-blue" title="Pay with GPay" style="font-size:1.5em; background:white; border:none; padding:0.5em 1em;" id="gpay-btn">
                <span style="display:inline-flex;align-items:center;justify-content:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><g><path fill="#4285f4" d="M43.611 20.083H42V20H24v8h11.303C33.978 32.833 29.422 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.73 0 5.237.936 7.217 2.482l6.084-6.084C33.527 6.053 28.973 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c10.998 0 19.837-7.998 19.837-20 0-1.341-.138-2.357-.226-3.917z"/><path fill="#34a853" d="M6.306 14.691l6.571 4.819C14.655 16.084 19.001 12 24 12c2.73 0 5.237.936 7.217 2.482l6.084-6.084C33.527 6.053 28.973 4 24 4c-7.732 0-14.41 4.41-17.694 10.691z"/><path fill="#fbbc05" d="M24 44c5.356 0 10.13-1.789 13.857-4.872l-6.406-5.238C29.422 36 24 36 24 36c-5.422 0-9.978-3.167-11.303-8.083l-6.571 5.081C9.59 39.59 16.268 44 24 44z"/><path fill="#ea4335" d="M43.611 20.083H42V20H24v8h11.303c-1.022 3.917-5.578 7.084-11.303 7.084-4.999 0-9.345-4.084-10.123-9.49l-6.571 5.081C8.022 39.59 15.268 44 24 44c10.998 0 19.837-7.998 19.837-20 0-1.341-.138-2.357-.226-3.917z"/></g></svg>
                    <span style="margin-left:0.5em;font-weight:600;color:#222;font-size:1.1em;">GPay</span>
                </span>
            </button>
            <button class="btn btn-primary whatsapp-circular-btn whatsapp-share-btn" title="Share via WhatsApp">
              <i class="fab fa-whatsapp" style="font-size: 3.2rem;padding:8px"></i>
            </button>
        </div>
        <div class="text-lg font-bold text-center mb-4" style="color:black; letter-spacing:0.5px;">
            ① Transfer  →  ② Whatsapp Screenshot.
        </div>
        <button id="confirm-btn" class="btn btn-primary w-full mt-2" onclick="confirmPayment()">Confirm & Finish</button>
        <div id="form-error" class="form-error-message" style="display:none;"></div>
    `;
    document.getElementById('ticket-modal-content').innerHTML = html;
    document.getElementById('ticket-modal').style.display = 'flex';

    // Generate QR as canvas, then convert to JPG and set as img src
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;
    new QRious({ element: tempCanvas, value: `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`, size: 200, background: 'white' });
    const qrJpgUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
    document.getElementById('upi-qr-jpg').src = qrJpgUrl;
    // document.getElementById('download-qr-btn').href = qrJpgUrl;

    // WhatsApp share button logic
    document.querySelectorAll('.whatsapp-share-btn').forEach(whatsappBtn => {
    if (whatsappBtn) {
        whatsappBtn.onclick = function() {
            // Use the same booking data as the main form
            const booking = {
                eventName: appData.currentEvent?.name,
                eventId: window.location.href,
                bookingId: appData.bookingId,
                email: appData.bookingEmail,
                phone: appData.bookingPhone,
                attendees: appData.attendees,
                ticketTypes: appData.ticketTypes,
                totalAmount: appData.totalAmount
            };
            // Submit to the booking entry ID from settings (no hardcoded ID)
            submitBookingToCustomEntry(booking);
            // ...existing WhatsApp logic (if any)...
            const event = appData.currentEvent;
            const ticketId = appData.bookingId;
            const eventName = event?.name || '';
            const attendeeNames = (appData.attendees || []).map(a => a.name).join(', ');
            const { currency } = getUPIInfo();
            const amount = appData.totalAmount;
            const totalAmount = `${currency}${amount}`;
            const msg =
                `Hi! I have paid for my ticket.\n` +
                `Event: ${eventName}\n` +
                `Ticket ID: ${ticketId}\n` +
                `Attendees: ${attendeeNames}\n` +
                `Total Amount Paid: ${totalAmount}\n` +
                `\n(Attaching screenshot below)`;
            const url = `https://wa.me/919313046640?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        };
    }
});
    // GPay button logic
    const gpayBtn = document.getElementById('gpay-btn');
    if (gpayBtn) {
        gpayBtn.onclick = function() {
            window.open(gpayUrl, '_blank');
        };
    }
}

function generateUPIQRCode({ upiId, payeeName, amount, note }) {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    new QRious({
        element: document.getElementById('upi-qr-code'),
        value: upiUrl,
        size: 200
    });
}


function copyUPIID() {
    const upi = document.getElementById('upi-id').textContent;
    navigator.clipboard.writeText(upi);
    const upiEl = document.getElementById('upi-id');
    const original = upiEl.textContent;
    upiEl.textContent = "Copied!";
    upiEl.classList.add('copied');
    setTimeout(() => {
        upiEl.textContent = original;
        upiEl.classList.remove('copied');
    }, 1200);
}

// Process payment
function processPayment(e) {
    e.preventDefault();
    const event = appData.currentEvent;
    const form = document.getElementById('tickets-form');
    const ticketOptionValue = form.elements['ticket-option'].value;
    const [typeIndex, optionIndex] = ticketOptionValue.split('-').map(Number);
    const ticketType = event.ticketTypes[typeIndex];
    const ticketOption = ticketType.options[optionIndex];
    const price = ticketOption.price;
    const name = form.elements['name'].value;
    const mobile = form.elements['mobile'].value;
    const email = form.elements['email'].value;
    const container = document.getElementById('payment-container');
    const { upiId, payeeName, currency } = getUPIInfo();
    // ...existing code...
    let html = `
        <div class="max-w-xl mx-auto">
            <div class="mb-8 text-center">
                <i class="fas fa-ticket-alt text-4xl text-gold-medium mb-4"></i>
                <h2 class="text-2xl mb-2">Complete Your Purchase</h2>
                <p class="text-gray-600 mb-2">${event.name} | ${event.formattedDate}</p>
                <div class="w-16 h-1 bg-gold-medium mx-auto rounded-full mb-2"></div>
            </div>
            <div class="mb-8 bg-white rounded-lg overflow-hidden shadow-lg">
                <div class="p-5 border-b border-gold-light">
                    <h3 class="text-lg font-semibold">Booking Summary</h3>
                </div>
                <div class="p-5">
                    <div class="flex justify-between mb-4 pb-4 border-b border-gray-100">
                        <div>
                            <p class="font-semibold">${ticketType.name} - ${ticketOption.name}</p>
                            <p class="text-sm text-gray-600">Name: ${name}</p>
                        </div>
                        <p class="font-bold text-gold-dark">${currency}${price}</p>
                    </div>
                    <div class="flex justify-between text-lg font-bold">
                        <p>Total Amount</p>
                        <p class="text-gold-dark">${currency}${price}</p>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 text-right">
                        <p>All taxes and charges included</p>
                    </div>
                </div>
            </div>
            <div class="mb-8">
                <h3 class="text-xl mb-4 border-b border-gold-light pb-2">Payment Options</h3>
                <div class="space-y-4">
                    <div class="payment-option active">
                        <label class="flex items-center p-4 border rounded-lg border-gold-medium bg-gold-light bg-opacity-20 cursor-pointer">
                            <input type="radio" name="payment-method" value="upi" checked class="mr-3 accent-gold-medium">
                            <div class="flex-1">
                                <p class="font-semibold">UPI / QR Code</p>
                                <p class="text-sm text-gray-600">Make payment via UPI app</p>
                            </div>
                            <i class="fas fa-qrcode text-xl text-gold-medium"></i>
                        </label>
                    </div>
                    <div class="payment-qr p-6 border rounded-lg text-center bg-white">
                        <div class="qr-code mx-auto mb-4 relative">
                            <div class="w-56 h-56 bg-gray-100 mx-auto flex items-center justify-center relative overflow-hidden">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <i class="fas fa-qrcode text-7xl text-gray-300"></i>
                                </div>
                                <div class="z-10 animate__animated animate__fadeIn animate__delay-1s">
                                    <div class="w-44 h-44 border-8 border-gold-medium relative">
                                        <div class="absolute inset-0 bg-white p-2">
                                            <div class="w-full h-full border border-gray-200 flex items-center justify-center">
                                                <div class="text-center">
                                                    <i class="fas fa-rupee-sign text-3xl text-gold-dark mb-2"></i>
                                                    <p class="text-xl font-bold">${currency}${price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="qr-scanner w-full h-2 bg-gold-medium bg-opacity-50 animate-qr-scan"></div>
                                </div>
                            </div>
                            <div class="absolute top-2 right-2 bg-gold-medium text-white rounded-full w-8 h-8 flex items-center justify-center animate__animated animate__zoomIn animate__delay-2s">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                        </div>
                        <p class="text-lg font-medium mb-1">Scan to pay ${currency}${price}</p>
                        <p class="text-sm text-gray-600 mb-4">UPI ID: ${upiId}</p>
                        <div class="flex justify-center gap-4">
                            <button class="px-4 py-2 border border-gold-medium text-gold-dark rounded-lg hover:bg-gold-light transition-all duration-300" onclick="navigator.clipboard.writeText('${upiId}')">
                                <i class="fas fa-copy mr-1"></i> Copy UPI ID
                            </button>
                            <button class="px-4 py-2 border border-gold-medium text-gold-dark rounded-lg hover:bg-gold-light transition-all duration-300" onclick="window.open('upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(price)}&cu=${encodeURIComponent(currency)}','_blank')">
                                <i class="fas fa-share-alt mr-1"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
        /* ...existing code... */
        </style>
    `;
    container.innerHTML = html;
}

// Confirm payment
async function confirmPayment() {
    // Simulate loading
    const fileInput = document.getElementById('payment-screenshot');
    // if (!fileInput || !fileInput.files || !fileInput.files.length) {
    //     showFormError('Upload payment screenshot to proceed.');
    //     return;
    // }
    showFormError('');
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.innerHTML = `<span class="relative z-10">Processing...</span><span class="confirm-shine"></span>`;
        confirmBtn.disabled = true;
    }
    // Hide modal and show success page
    document.getElementById('ticket-modal').style.display = 'none';
    const successContainer = document.getElementById('success-page');
    successContainer.style.display = 'flex';


    // Submit to Google Form (no file upload, just data)
    // await submitToGoogleForm({
    //     eventName: appData.currentEvent.name,
    //     bookingId: appData.bookingId,
    //     email: appData.bookingEmail,
    //     attendees: appData.attendees,
    //     totalAmount: appData.totalAmount
    // });

    setTimeout(() => {
        const event = appData.currentEvent;
        const successContainer = document.getElementById('success-page');
        
        // Prepare success content
        successContainer.innerHTML = `
            <div class="max-w-xl mx-auto text-center">
                <div class="success-checkmark mb-6">
                    <div class="check-icon">
                        <span class="icon-line line-tip"></span>
                        <span class="icon-line line-long"></span>
                        <div class="icon-circle"></div>
                        <div class="icon-fix"></div>
                    </div>
                </div>
                
                <h1 class="text-4xl mb-4 pt-4">Thank You!</h1>
                <h3 class="text-xl mb-8">Your booking has been confirmed</h3>
                
                <div class="ticket-card golden-ticket mb-8 relative overflow-visible">
                    <div class="ticket-gold-bg"></div>
                    <div class="relative z-10 px-4 py-6">
                        <div class="flex justify-between items-center mb-2">
                            <span class="admit-one-label">
                              ADMIT ${numberToWords(appData.attendees?.length || 1).toUpperCase()}
                            </span>
                            <span class="ticket-serial">#${appData.bookingId}</span>
                        </div>
                        <h3 class="ticket-event-name text-3xl font-extrabold text-center my-6">${event.name}</h3>
                        <div class="flex flex-wrap justify-center gap-2 mb-4">
                            <span class="ticket-label ticket-date">
                                <i class="fas fa-calendar-alt mr-1"></i> ${event.formattedDate}
                            </span>
                            ${event.venue && event.venue.trim() && event.venue.toLowerCase() !== 'to be announced'
                                ? `<a href="${parseVenue(event.venue).map}" target="_blank" class="ticket-label ticket-venue hover:bg-gold-dark hover:text-white transition" style="text-decoration:underline;">
                                    <i class="fas fa-map-marker-alt mr-1"></i> ${parseVenue(event.venue).name}
                                </a>`
                                : `<span class="ticket-label ticket-venue"><i class="fas fa-map-marker-alt mr-1"></i>Venue TBA</span>`
                            }
                            <span class="ticket-label ticket-status bg-green-100 text-green-700 border-green-300">
                                <i class="fas fa-check-circle mr-1"></i> PAID
                            </span>
                        </div>
                        <div class="ticket-divider my-4"></div>
                        <div class="flex justify-center">
                                <span style="color: black;">Togetherness © Right to admission reserved</span>
                        </div>
                    </div>
                <div class="ticket-shine"></div>
                </div>
                
                <div class="flex justify-center gap-4 mb-8">
                    <button class="btn-secondary px-6 py-3 rounded-lg">
                        <i class="fas fa-download mr-2"></i> Ticket
                    </button>
                <button class="btn btn-secondary whatsapp-circular-btn whatsapp-share-btn" title="Share via WhatsApp" style="padding: 5px;">
              <i class="fab fa-whatsapp" style="font-size: 2.5rem; padding:4px"></i>
            </button>
                    <button class="btn-secondary px-6 py-3 rounded-lg">
                        <i class="fas fa-share-alt mr-2"></i> Share
                    </button>
                </div>
                
                <div class="mt-8">
                    <!-- <p class="text-gray-600 mb-4">A copy of your ticket has been sent to your email.</p> -->
                    <button class="btn btn-primary" onclick="window.location='index.html'">
                        <i class="fas fa-home mr-2"></i> Return to Home
                    </button>
                </div>
            </div>
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            .success-checkmark {
                width: 80px;
                height: 80px;
                margin: 0 auto;
            }
            .success-checkmark .check-icon {
                width: 80px;
                height: 80px;
                position: relative;
                border-radius: 50%;
                box-sizing: content-box;
                border: 4px solid var(--gold-medium);
            }
            .success-checkmark .check-icon::before {
                top: 3px;
                left: -2px;
                width: 30px;
                transform-origin: 100% 50%;
                border-radius: 100px 0 0 100px;
            }
            .success-checkmark .check-icon::after {
                top: 0;
                left: 30px;
                width: 60px;
                transform-origin: 0 50%;
                border-radius: 0 100px 100px 0;
                animation: rotate-circle 4.25s ease-in;
            }
            .success-checkmark .check-icon::before, .success-checkmark .check-icon::after {
                content: '';
                height: 100px;
                position: absolute;
                background: transparent;
                transform: rotate(-45deg);
            }
            .success-checkmark .check-icon .icon-line {
                height: 5px;
                background-color: var(--gold-medium);
                display: block;
                border-radius: 2px;
                position: absolute;
                z-index: 10;
            }
            .success-checkmark .check-icon .icon-line.line-tip {
                top: 46px;
                left: 14px;
                width: 25px;
                transform: rotate(45deg);
                animation: icon-line-tip 0.75s;
            }
            .success-checkmark .check-icon .icon-line.line-long {
                top: 38px;
                right: 8px;
                width: 47px;
                transform: rotate(-45deg);
                animation: icon-line-long 0.75s;
            }
            .success-checkmark .check-icon .icon-circle {
                top: -4px;
                left: -4px;
                z-index: 10;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                position: absolute;
                box-sizing: content-box;
                border: 4px solid var(--gold-light);
            }
            .success-checkmark .check-icon .icon-fix {
                top: 8px;
                width: 5px;
                left: 26px;
                z-index: 1;
                height: 85px;
                position: absolute;
                transform: rotate(-45deg);
                background-color: transparent;
            }
            @keyframes rotate-circle {
                0% { transform: rotate(-45deg); }
                5% { transform: rotate(-45deg); }
                12% { transform: rotate(-405deg); }
                100% { transform: rotate(-405deg); }
            }
            @keyframes icon-line-tip {
                0% { width: 0; left: 1px; top: 19px; }
                54% { width: 0; left: 1px, top: 19px; }
                70% { width: 50px; left: -8px; top: 37px; }
                84% { width: 17px; left: 21px; top: 48px; }
                100% { width: 25px; left: 14px; top: 45px; }
            }
            @keyframes icon-line-long {
                0% { width: 0; right: 46px; top: 54px; }
                65% { width: 0; right: 46px; top: 54px; }
                 84% { width: 55px; right: 0px; top: 35px; }
                100% { width: 47px; right: 8px; top: 38px; }
            }
            
            /* Ticket pattern */
            .ticket-pattern {
                background-image: radial-gradient(var(--gold-light) 2px, transparent 2px);
                background-size: 20px 20px;
            }
        `;
        document.head.appendChild(style);
        
        // Re-bind WhatsApp share button(s) on the success page
        successContainer.querySelectorAll('.whatsapp-share-btn').forEach(whatsappBtn => {
            whatsappBtn.onclick = function() {
                const booking = {
                    eventName: appData.currentEvent?.name,
                    eventId: window.location.href,
                    bookingId: appData.bookingId,
                    email: appData.bookingEmail,
                    phone: appData.bookingPhone,
                    attendees: appData.attendees,
                    ticketTypes: appData.ticketTypes,
                    totalAmount: appData.totalAmount
                };
                submitBookingToCustomEntry(booking);
                const event = appData.currentEvent;
                const ticketId = appData.bookingId;
                const eventName = event?.name || '';
                const attendeeNames = (appData.attendees || []).map(a => a.name).join(', ');
                const { currency } = getUPIInfo();
                const amount = appData.totalAmount;
                const totalAmount = `${currency}${amount}`;
                const msg =
                    `Hi! I have paid for my ticket.\n` +
                    `Event: ${eventName}\n` +
                    `Ticket ID: ${ticketId}\n` +
                    `Attendees: ${attendeeNames}\n` +
                    `Total Amount Paid: ${totalAmount}\n` +
                    `\n(Attaching screenshot below)`;
                const url = `https://wa.me/919313046640?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
            };
        });
        
        // Add confetti animation
        const jsConfetti = new JSConfetti();
        setTimeout(() => {
            jsConfetti.addConfetti({
                confettiColors: [
                    '#d4af37', '#f8e9c6', '#996515', '#ffd700', '#f5f5f5'
                ],
                confettiRadius: 6,
                confettiNumber: 250,
            });
        }, 500);
        
        const ticket = document.querySelector('.golden-ticket');
        const shine = ticket ? ticket.querySelector('.ticket-shine') : null;
        
        if (ticket) {
          ticket.style.transformStyle = 'preserve-3d';
          ticket.style.transition = 'transform 0.4s cubic-bezier(.25,.8,.25,1), box-shadow 0.4s';
        
          let targetRotateX = 0, targetRotateY = 0, currentRotateX = 0, currentRotateY = 0;
          let targetShineX = 50, targetShineY = 50, currentShineX = 50, currentShineY = 50;
          let animating = false;
        
          function animate() {
            // Lerp for smoothness
            currentRotateX += (targetRotateX - currentRotateX) * 0.15;
            currentRotateY += (targetRotateY - currentRotateY) * 0.15;
            currentShineX += (targetShineX - currentShineX) * 0.15;
            currentShineY += (targetShineY - currentShineY) * 0.15;
        
            ticket.style.transform = `perspective(800px) rotateX(${-currentRotateX}deg) rotateY(${currentRotateY}deg) scale(1.04)`;
            ticket.style.boxShadow = `0 24px 48px -12px #d4af3744, 0 4px 24px #fffbe944`;
            ticket.style.zIndex = 10;
        
            if (shine) {
              shine.style.background = `radial-gradient(ellipse at ${currentShineX}% ${currentShineY}%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.09) 60%, rgba(255,255,255,0) 100%)`;
            }
        
            if (
              Math.abs(currentRotateX - targetRotateX) > 0.1 ||
              Math.abs(currentRotateY - targetRotateY) > 0.1 ||
              Math.abs(currentShineX - targetShineX) > 0.1 ||
              Math.abs(currentShineY - targetShineY) > 0.1
            ) {
              requestAnimationFrame(animate);
            } else {
              animating = false;
            }
          }
        
          ticket.addEventListener('mousemove', (e) => {
            const rect = ticket.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // Lower sensitivity for smoothness
            targetRotateX = ((y - centerY) / centerY) * 7;
            targetRotateY = ((x - centerX) / centerX) * 12;
            targetShineX = (x / rect.width) * 100;
            targetShineY = (y / rect.height) * 100;
            if (!animating) {
              animating = true;
              requestAnimationFrame(animate);
            }
          });
        
          ticket.addEventListener('mouseleave', () => {
            targetRotateX = 0;
            targetRotateY = 0;
            targetShineX = 50;
            targetShineY = 50;
            if (!animating) {
              animating = true;
              requestAnimationFrame(animate);
            }
            setTimeout(() => {
              ticket.style.zIndex = '';
            }, 400);
          });
        }


    }, 500); // Simulate processing delay

    const ticket = document.querySelector('.golden-ticket');
    console.log('Ticket found:', ticket); // Should not be null

    function numberToWords(n) {
      const a = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
      const b = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n/10)] + (n%10 ? "-" + a[n%10] : "");
      return n;
    }
}


// Slider functions
let autoSlideIntervalId = null; // Track the interval globally

function goToSlide(index) {
    const sliderContainer = document.querySelector('.slider-container');
    const indicators = document.querySelectorAll('.indicator');
    const slides = document.querySelectorAll('.slide');
    
    if (!sliderContainer || indicators.length === 0) return;
    
    appData.currentSlide = index;
    
    // Slide out content of current active slide
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Animate slider movement
    gsap.to(sliderContainer, {
        x: `-${index * 100}%`,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
            // Slide in content of new active slide
            slides[index].classList.add('active');
        }
    });
    
    // Update indicators with animation
    indicators.forEach((indicator, i) => {
        if (i === index) {
            indicator.classList.add('active');
            gsap.to(indicator, {
                scale: 1.3,
                duration: 0.4,
                ease: 'back.out(1.7)'
            });
        } else {
            indicator.classList.remove('active');
            gsap.to(indicator, {
                scale: 1,
                duration: 0.4
            });
        }
    });
}

// Helper functions
function renderSchedule(schedule, isProduct = false) {
    if (!schedule || schedule.length === 0)
        return `<p class="text-center italic">${isProduct ? 'No specifications available yet.' : 'No schedule information available yet.'}</p>`;

    let html = '<div class="space-y-8">';
    schedule.forEach((section, sectionIndex) => {
        if (!section.activities || section.activities.length === 0) return; // skip empty
        let sectionTitle = section.name && section.name.trim()
            ? section.name
            : (isProduct ? 'Specifications' : 'Schedule');
        html += `
            <div class="mb-6 animate__animated animate__fadeInUp" style="animation-delay: ${sectionIndex * 0.1}s">
                <h3 class="font-bold pt-5 mb-3 text-xl flex items-center text-gold-dark">
                    <i class="fas fa-calendar-day mr-2"></i>
                    <span>${sectionTitle}</span>
                </h3>
                <div class="overflow-x-auto">
                    <table class="schedule-table w-full border-separate border-spacing-y-2">
                        <tbody>
                            ${section.activities.map((activity, actIndex) => `
                                <tr>
                                    <td class="schedule-time py-1 font-mono font-bold text-lg text-gold-dark bg-gold-light/30 rounded-l-lg whitespace-nowrap text-center border-0">
                                        ${activity.left}
                                    </td>
                                    <td class="schedule-activity px-7 py-1 bg-white/80 rounded-r-lg text-base text-gray-800 border-0">
                                        ${activity.right}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function renderTicketTypes(ticketTypes) {
    if (!ticketTypes || ticketTypes.length === 0)
        return '<p class="text-center italic">No ticket information available at the moment.</p>';

    let html = '<div class="space-y-4">';
    ticketTypes.forEach((type, index) => {
        const isDisabled = type.status === 'soldout' || type.status === 'expired';
        // Overlay label for sold out/expired
        const overlayLabel = isDisabled
            ? `<span class="ticket-status-label">SOLD OUT</span>`
            : '';
        // soldOut style
        const soldClass = isDisabled ? 'text-gray-400' : '';
        html += `
            <div class="ticket-type relative ${isDisabled ? 'opacity-10 pointer-events-none' : ''}" style="transition-delay: ${index * 0.1}s">
                ${overlayLabel}
                <div class="flex justify-between items-center">
                    <h4 class="text-lg font-bold mb-0 ${soldClass}">${type.name}</h4>
                    <span class="text-lg font-bold text-gold-dark ${soldClass}">${getCurrency()}${type.price}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function renderFAQs(faqs) {
    if (!faqs || faqs.length === 0) return '<p class="text-center italic">No frequently asked questions available yet.</p>';
    
    let html = '<div class="space-y-4">';
    
    faqs.forEach((faq, index) => {
        html += `
            <div class="faq-item">
                <div class="faq-question">${faq.question}</div>
                <div class="faq-answer" id="faq-answer-${index}">${faq.answer}</div>
            </div>
        `;
    });
    html += '</div>';
    // After rendering, re-initialize toggles
    setTimeout(initFAQToggles, 0);
    return html;
}

function toggleFAQ(index) {
    const answer = document.getElementById(`faq-answer-${index}`);
    const question = answer.previousElementSibling;
    const isActive = question.classList.contains('active');
    
    // Close all FAQs first
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
    });
    
    document.querySelectorAll('.faq-answer').forEach(a => {
        a.classList.remove('active');
    });
    
    // Open this FAQ if it wasn't active before
    if (!isActive) {
        question.classList.add('active');
        answer.classList.add('active');
        
        // Smooth scroll to this FAQ if it's below the viewport
        const rect = answer.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
            const offset = rect.top + window.scrollY - 120; // 120px for breathing room
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    }
}

function formatDate(date) {
    if (!date) return '';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
}

function camelCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// Utility to get query params
function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

// Reveal text elements
// function initRevealAnimations() {
//     const revealElements = document.querySelectorAll('.reveal-element, .reveal-text');
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('revealed');
//             }
//         });
//     }, { threshold: 0.1 });
//     revealElements.forEach(element => {
//         observer.observe(element);
//     });
//     // GSAP animations
//     if (window.gsap && window.ScrollTrigger) {
//         gsap.registerPlugin(ScrollTrigger);
//         gsap.utils.toArray('.section-title').forEach(title => {
//             gsap.from(title, {
//                 scrollTrigger: {
//                     trigger: title,
//                     start: 'top 80%',
//                     toggleActions: 'play none none none'
//                 },
//                 opacity: 0,
//                 y: 30,
//                 duration: 0.8,
//                 ease: 'power2.out'
//             });
//         });
//         const eventCards = document.querySelectorAll('.event-card');
//         if (eventCards.length) {
//             gsap.from(eventCards, {
//                 scrollTrigger: {
//                     trigger: eventCards[0].parentElement,
//                     start: 'top 80%'
//                 },
//                 opacity: 0,
//                 y: 50,
//                 stagger: 0.1,
//                 duration: 0.8,
//                 ease: 'power2.out'
//             });
//         }
//     }
// }

function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-element, .reveal-text');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(element => {
        observer.observe(element);
    });

    // Only animate section-title if not already animated
    if (window.gsap && window.ScrollTrigger && !window._sectionTitleAnimated) {
        window._sectionTitleAnimated = true;
        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power2.out'
            });
        });
    }

    // Animate event cards as usual
    if (window.gsap && window.ScrollTrigger) {
        const eventCards = document.querySelectorAll('.event-card');
        if (eventCards.length) {
            gsap.from(eventCards, {
                scrollTrigger: {
                    trigger: eventCards[0].parentElement,
                    start: 'top 80%'
                },
                opacity: 0,
                y: 50,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power2.out'
            });
        }
    }
}

// function initLiveHighlighter() {
//     const highlightEls = document.querySelectorAll('.desc-link, .desc-hashtag, .desc-time, .desc-currency, .desc-emoji');
//     function checkHighlight() {
//         const viewportCenter = window.innerHeight / 2;
//         highlightEls.forEach(el => {
//             const rect = el.getBoundingClientRect();
//             const elCenter = rect.top + rect.height / 2;
//             // Adjust the 80 value for how close to center you want the highlight to trigger
//             if (elCenter > viewportCenter - 80 && elCenter < viewportCenter + 80) {
//                 if (!el.classList.contains('highlighted')) {
//                     el.classList.add('highlighted');
//                     if (el.classList.contains('desc-emoji')) {
//                         el.classList.add('animated');
//                         setTimeout(() => el.classList.remove('animated'), 700);
//                     }
//                 }
//             } else {
//                 el.classList.remove('highlighted');
//             }
//         });
//     }
//     window.addEventListener('scroll', checkHighlight, { passive: true });
//     window.addEventListener('resize', checkHighlight);
//     // Initial check
//     checkHighlight();
// }

// Main entry point for multi-page
async function main() {
    await fetchAndProcessData();
    initLuxuryFeatures();
    initLogoAnimation();
    // initCustomCursor();
    initTiltEffect();
    initRevealAnimations();

    const path = window.location.pathname;
    //Home Page
    if (document.getElementById('featured-events-slider')) {
        renderFeaturedEventsSlider();
        renderAboutSection();
        renderContactSection();
        renderFooter();
    //Events Page
    } else if (document.getElementById('events-container')) {
        appData.currentFilter = 'all';
        renderEventFilters();
        renderAllEvents();
        renderFooter();
    //Event Details Page
    } else if (document.getElementById('event-details-container')) {
        const eventName = getQueryParam('event');
        if (eventName) {
            showEventDetails(decodeURIComponent(eventName));
        } else {
            document.getElementById('event-details-container').innerHTML = '<div class="p-8 text-center">Event not found.</div>';
        }
        renderFooter();
    }
}

let currentSearchQuery = '';

function setupEventsSearch() {
    const input = document.getElementById('events-search-input');
    if (!input) return;
    input.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        renderAllEvents();
    });
}

//FORM SUBMISSION
function generateBookingID() {
    const now = new Date();
    const pad = (n, l=2) => n.toString().padStart(l, '0');
    return `TGS-${pad(now.getDate())}${pad(now.getMonth()+1)}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(),3)}`;
}

function getAttendeeDetailsString(attendees) {
    return attendees.map(a => `${a.type} - ${a.name} - ${a.phone}`).join('\n');
}

// async function submitToGoogleForm({eventName, bookingId, email, attendees, totalAmount}) {
//     const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf8rb-wJkVzrq9TMHf2d_O1n-0y-Yo2lSzcPn-c1TdLWxeJ8A/formResponse';
//     const formData = new URLSearchParams();
//     formData.append('input.whsOnd.zHQkBf', eventName);
//     formData.append('entry.whsOnd zHQkBf', bookingId);
//     formData.append('entry.EMAIL_ID', email);
//     formData.append('entry.ATTENDEE_DETAILS_ID', getAttendeeDetailsString(attendees));
//     formData.append('entry.TOTAL_AMOUNT_ID', totalAmount);

//     await fetch(formUrl, {
//         method: 'POST',
//         mode: 'no-cors',
//         body: formData
//     });
// }

// On DOMContentLoaded, run main()
document.addEventListener('DOMContentLoaded', main);

document.addEventListener('DOMContentLoaded', () => {
    setupEventsSearch();
});

// Hamburger menu toggle with X animation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('active');
        });
        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
        // Optional: close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('active');
            }
        });
    }
});

const API_KEY = '11de05c9-940c-4535-8e03-6ae1bad9ed7e';

async function createUPIOrder(order) {
  const res = await fetch('https://api.ekqr.in/api/create_order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: API_KEY,
      client_txn_id: order.txnId,
      amount: order.amount,
      p_info: order.productName,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_mobile: order.customerMobile,
      redirect_url: order.redirectUrl,
      udf1: order.udf1 || '',
      udf2: order.udf2 || '',
      udf3: order.udf3 || ''
    })
  });
  return res.json();
}


async function checkUPIOrderStatus(txnId, txnDate) {
  const res = await fetch('http://localhost:3000/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: API_KEY,
      client_txn_id: txnId,
      txn_date: txnDate // format: DD-MM-YYYY
    })
  });
  return res.json();
}

/* Add minimal CSS for animation */
const style = document.createElement('style');
style.textContent = `
.ticket-pill { transition: box-shadow 0.2s, transform 0.2s; }
.animate-bounce-plus { animation: bouncePlus 0.3s; }
.animate-bounce-minus { animation: bounceMinus 0.3s; }
@keyframes bouncePlus { 0%{transform:scale(1);} 50%{transform:scale(1.08);} 100%{transform:scale(1);} }
@keyframes bounceMinus { 0%{transform:scale(1);} 50%{transform:scale(0.95);} 100%{transform:scale(1);} }
`;
document.head.appendChild(style);

function animateTicketPill(el, type) {
    if (!el) return;
    const pill = el.closest('.ticket-pill');
    if (!pill) return;
    pill.classList.add(type === 'plus' ? 'animate-bounce-plus' : 'animate-bounce-minus');
    setTimeout(() => pill.classList.remove('animate-bounce-plus', 'animate-bounce-minus'), 350);
}

// Add this function after animateTicketPill
function updateActiveTicketClasses() {
    document.querySelectorAll('.ticket-pill').forEach((pill, idx) => {
        const qty = parseInt(document.querySelectorAll('.ticket-qty-num')[idx].textContent) || 0;
        if (qty > 0) {
            pill.classList.add('activeTicket');
        } else {
            pill.classList.remove('activeTicket');
        }
    });
}

// --- TYPICAL PAGES (WebPages) DYNAMIC CATEGORY GRID ---
async function fetchWebPagesSheet() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=WebPages`;
    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substring(47, text.length - 2));
        return json;
    } catch (e) {
        console.error('Failed to fetch WebPages sheet:', e);
        return null;
    }
}

function parseWebPagesSheet(json) {
    const pages = [];
    if (!json || !json.table || !json.table.rows || !json.table.cols) return pages;
    const cols = json.table.cols;
    const rows = json.table.rows;
    for (let colIdx = 1; colIdx < cols.length; colIdx++) { // skip col 0 (A)
        let cell = rows[0] && rows[0].c[colIdx];
        if (!cell || !cell.v) continue;
        let raw = cell.v.trim();
        let [name, icon] = raw.split('/');
        name = name ? name.trim() : '';
        icon = icon ? icon.trim() : '';
        if (!name) continue;
        // Slugify for link
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        pages.push({ name, icon, slug });
    }
    return pages;
}

function getIconClass(icon) {
    if (!icon) {
        // Fallback random icon
        const fallback = ['fa-music', 'fa-guitar', 'fa-compact-disc', 'fa-fire', 'fa-star', 'fa-heart', 'fa-diamond', 'fa-bolt'];
        return 'fas ' + fallback[Math.floor(Math.random() * fallback.length)];
    }
    if (icon.startsWith('fa-')) return 'fas ' + icon;
    return 'fas fa-' + icon;
}

// ...existing code...
function renderDynamicCategoryGrid(pages) {
    const grid = document.createElement('div');
    grid.className = 'grid-container-menu';
    // Flexbox layout and responsiveness are now handled by CSS only.
    // See style.css for required rules:
    // .grid-container { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: stretch; }
    // .card { flex: 1 1 0; min-width: 0; max-width: 100%; }
    // @media (max-width: 1200px) { .card { min-width: 25%; } } // 4 per row
    // @media (max-width: 900px) { .card { min-width: 50%; } } // 2 per row
    // @media (max-width: 600px) { .card { min-width: 100%; } } // 1 per row
    const colors = [
        { card: 'glow-pink', icon: 'pink' },
        { card: 'glow-blue', icon: 'blue' },
        { card: 'glow-green', icon: 'green' },
        { card: 'glow-purple', icon: 'purple' }
    ];
    pages.forEach((page, idx) => {
        const color = colors[idx % colors.length];
        const card = document.createElement('div');
        card.className = `card-menu ${color.card} reveal-element`;
        card.style.cursor = 'pointer';
        card.onclick = () => window.location = `page.html?page=${page.slug}`;
        card.innerHTML = `
            <div class="text-center">
                <i class="${getIconClass(page.icon)} category-icon ${color.icon}"></i>
                <h3 class="card-title">${page.name}</h3>
            </div>
        `;
        grid.appendChild(card);
    });
    // Replace the static grid on home page
    const staticGrid = document.querySelector('.grid-container-menu');
    if (staticGrid && staticGrid.parentNode) {
        staticGrid.parentNode.replaceChild(grid, staticGrid);
    }
}
// ...existing code...

// --- MAIN PATCH: On home page, load dynamic category grid ---
document.addEventListener('DOMContentLoaded', async function() {
    // ...existing code...
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        const webPagesJson = await fetchWebPagesSheet();
        const webPages = parseWebPagesSheet(webPagesJson);
        if (webPages.length > 0) {
            renderDynamicCategoryGrid(webPages);
        }
    }
    // ...existing code...
});

// Enhance FAQ functionality (robust for mobile/desktop)
function initFAQToggles() {
    // Use event delegation for better reliability
    document.querySelectorAll('.faq-question').forEach(question => {
        question.onclick = function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            // Close all
            document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('active'));
            // Open this if not already active
            if (!isActive) {
                this.classList.add('active');
                if (answer) answer.classList.add('active');
                // Scroll into view if needed (mobile)
                if (window.innerWidth < 700 && answer) {
                    // setTimeout(() => answer.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
                }
            }
        };
    });
}

function getCurrency() {
    return (appData.settings && (appData.settings.currency || appData.settings.CURRENCY)) || getUPIInfo().currency || '₹';
}

// Utility to render social links from settings
function renderSocialLinks(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!appData.settings || typeof appData.settings !== 'object') {
        console.warn('renderSocialLinks: appData.settings is not loaded or not an object', appData.settings);
        container.innerHTML = '';
        return;
    }
    // Try both normalized and legacy keys for each social
    const socials = [
        { keys: ['social_instagram', 'instagram'], icon: 'fab fa-instagram' },
        { keys: ['social_facebook', 'facebook'], icon: 'fab fa-facebook' },
        { keys: ['social_youtube', 'youtube'], icon: 'fab fa-youtube' },
        { keys: ['social_twitter', 'twitter'], icon: 'fab fa-twitter' },
        { keys: ['social_linkedin', 'linkedin'], icon: 'fab fa-linkedin' },
        { keys: ['social_website', 'website'], icon: 'fas fa-globe' }
    ];
    let html = '';
    socials.forEach(({ keys, icon }) => {
        let url = '';
        for (const key of keys) {
            if (appData.settings[key]) {
                url = appData.settings[key];
                break;
            }
        }
        if (url) {
            html += `<a href="${url}" class="social-link" target="_blank" rel="noopener"><i class="${icon}"></i></a>`;
        }
    });
    container.innerHTML = html;
}




