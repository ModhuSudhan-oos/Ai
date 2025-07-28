import { fetchData, submitContactForm, subscribeNewsletter } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    console.log("Current Page:", currentPage); // For debugging: check which page is detected

    // --- Common UI Elements & Functions ---
    const navToggle = document.querySelector('[data-collapse-toggle="navbar-sticky"]');
    const mobileMenu = document.getElementById('navbar-sticky');
    const header = document.querySelector('header');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            // Scrolling down and past a threshold
            header.classList.add('-translate-y-full');
        } else {
            // Scrolling up
            header.classList.remove('-translate-y-full');
        }
        lastScrollY = window.scrollY;

        // Apply scroll animations
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight - 100) {
                element.classList.add('fade-in-up'); // Example animation class
            }
        });
    });

    // Initial check for scroll animations
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight - 100) {
            element.classList.add('fade-in-up');
        }
    });

    // Cookie Consent (Optional)
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (cookieConsent && acceptCookiesBtn) {
        if (!localStorage.getItem('cookieConsent')) {
            cookieConsent.classList.remove('hidden');
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieConsent.classList.add('hidden');
        });
    }


    // --- Page-specific Logic ---

    // Home Page (index.html)
    if (currentPage === 'index.html' || currentPage === '') {
        const toolsContainer = document.getElementById('ai-tools-preview');
        const testimonialsCarousel = document.getElementById('testimonials-carousel');

        console.log("Loading Home Page Data...");

        // Load AI Tools Preview
        if (toolsContainer) {
            toolsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading AI Tools preview...</div>';
            fetchData('tools').then(toolsData => {
                if (toolsData && Object.keys(toolsData).length > 0) {
                    toolsContainer.innerHTML = ''; // Clear loading message
                    const toolKeys = Object.keys(toolsData).slice(0, 6); // Get up to 6 tools
                    toolKeys.forEach(key => {
                        const tool = toolsData[key];
                        const toolCard = `
                            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-16 h-16 mx-auto mb-4 object-contain">
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">${tool.title}</h3>
                                <p class="text-gray-600 text-sm">${tool.description}</p>
                                <a href="tool.html?id=${key}" class="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">Learn More &rarr;</a>
                            </div>
                        `;
                        toolsContainer.insertAdjacentHTML('beforeend', toolCard);
                    });
                } else {
                    toolsContainer.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No AI tools available for preview.</p>';
                }
            }).catch(error => {
                console.error("Failed to load tools preview:", error);
                toolsContainer.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">Error loading tools preview.</p>';
            });
        }


        // Load Testimonials
        if (testimonialsCarousel) {
             testimonialsCarousel.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading testimonials...</div>';
            fetchData('testimonials').then(testimonialsData => {
                if (testimonialsData && Object.keys(testimonialsData).length > 0) {
                    testimonialsCarousel.innerHTML = ''; // Clear loading message
                    const testimonialsArray = Object.values(testimonialsData);
                    testimonialsArray.forEach(testimonial => {
                        const testimonialSlide = `
                            <div class="flex-none w-full md:w-1/2 lg:w-1/3 p-4 snap-center">
                                <div class="bg-white p-6 rounded-lg shadow-md">
                                    <p class="text-gray-700 italic mb-4">"${testimonial.quote}"</p>
                                    <p class="font-semibold text-gray-800">- ${testimonial.name}</p>
                                </div>
                            </div>
                        `;
                        testimonialsCarousel.insertAdjacentHTML('beforeend', testimonialSlide);
                    });
                } else {
                    testimonialsCarousel.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No testimonials available.</p>';
                }
            }).catch(error => {
                console.error("Failed to load testimonials:", error);
                testimonialsCarousel.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">Error loading testimonials.</p>';
            });
        }


        // Lottie Animation (Hero Section)
        const heroAnimationContainer = document.getElementById('hero-animation');
        if (heroAnimationContainer) {
            import('https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js').then(Lottie => {
                Lottie.loadAnimation({
                    container: heroAnimationContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: '/assets/hero-animation.json' // Path to your Lottie JSON file
                });
            }).catch(error => console.error("Lottie import failed:", error));
        }
    }

    // Tools Page (tools.html)
    if (currentPage === 'tools.html') {
        const toolsGrid = document.getElementById('tools-grid');
        const searchInput = document.getElementById('search-tools');
        const categoryFilter = document.getElementById('category-filter');
        let allToolsData = {}; // Store all tools for filtering

        console.log("Loading Tools Page Data...");

        const renderTools = (toolsToRender) => {
            if (toolsGrid) {
                toolsGrid.innerHTML = ''; // Clear previous tools (including loading messages)
                if (Object.keys(toolsToRender).length === 0) {
                    toolsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No tools found matching your criteria.</p>';
                    return;
                }
                Object.keys(toolsToRender).forEach(key => {
                    const tool = toolsToRender[key];
                    const toolCard = `
                        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-16 h-16 mx-auto mb-4 object-contain">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">${tool.title}</h3>
                            <p class="text-gray-600 text-sm">${tool.description}</p>
                            <a href="tool.html?id=${key}" class="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">View Details &rarr;</a>
                        </div>
                    `;
                    toolsGrid.insertAdjacentHTML('beforeend', toolCard);
                });
            }
        };

        // Ensure toolsGrid exists before trying to manipulate it
        if (toolsGrid) {
            // Show initial loading message
            toolsGrid.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-48 animate-pulse col-span-full">
                    <p class="text-gray-400">Loading all tools...</p>
                </div>
            `;
            fetchData('tools').then(toolsData => {
                if (toolsData && Object.keys(toolsData).length > 0) {
                    allToolsData = toolsData;
                    renderTools(allToolsData);

                    // Populate categories (if applicable, assuming 'category' field in tool data)
                    const categories = new Set();
                    Object.values(toolsData).forEach(tool => {
                        if (tool.category) {
                            categories.add(tool.category.toLowerCase());
                        }
                    });
                    if (categoryFilter) {
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                            categoryFilter.appendChild(option);
                        });
                    }

                    // Add event listeners only after data is loaded and elements exist
                    if (searchInput) searchInput.addEventListener('input', filterTools);
                    if (categoryFilter) categoryFilter.addEventListener('change', filterTools);

                } else {
                    toolsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No tools found.</p>';
                }
            }).catch(error => {
                console.error("Failed to load all tools for tools.html:", error);
                toolsGrid.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">Error loading tools. Please try again later.</p>';
            });
        }
    }

    // Tool Details Page (tool.html)
    if (currentPage === 'tool.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const toolId = urlParams.get('id');
        const toolDetailsContainer = document.getElementById('tool-details-container');

        console.log("Loading Tool Details Page Data for ID:", toolId);

        if (toolId && toolDetailsContainer) {
            // Show initial loading message
            toolDetailsContainer.innerHTML = `
                <div class="bg-white p-8 rounded-lg shadow-md flex items-center justify-center h-96">
                    <p class="text-gray-400 text-lg">Loading tool details for ${toolId}...</p>
                </div>
            `;
            fetchData(`tools/${toolId}`).then(tool => {
                if (tool) {
                    document.title = `${tool.title} - Tool Details`;
                    toolDetailsContainer.innerHTML = `
                        <div class="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
                            <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-48 h-48 mx-auto mb-6 object-contain">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">${tool.title}</h1>
                            <p class="text-lg text-gray-700 leading-relaxed mb-6 text-center">${tool.description}</p>

                            ${tool.features && tool.features.length > 0 ? `<h2 class="text-2xl font-semibold text-gray-800 mb-3">Key Features:</h2>
                            <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                                ${tool.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>` : ''}

                            ${tool.iframeUrl ? `
                                <h2 class="text-2xl font-semibold text-gray-800 mb-3">Live Preview:</h2>
                                <div class="aspect-w-16 aspect-h-9 mb-6">
                                    <iframe src="${tool.iframeUrl}" class="w-full h-96 border rounded-lg shadow-inner" frameborder="0" allowfullscreen></iframe>
                                </div>
                            ` : ''}

                            <div class="flex justify-center gap-4 flex-wrap">
                                ${tool.url ? `<a href="${tool.url}" target="_blank" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg">Launch Tool &rarr;</a>` : ''}
                                <a href="tools.html" class="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors duration-300 shadow-lg">Back to Tools</a>
                            </div>
                        </div>
                    `;
                } else {
                    toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">Tool not found or invalid ID.</p>';
                }
            }).catch(error => {
                console.error("Failed to load tool details:", error);
                toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">Error loading tool details. Please check console for more info.</p>';
            });
        } else {
            toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">No tool ID provided in URL.</p>';
        }
    }

    // Features Page (features.html)
    if (currentPage === 'features.html') {
        const featuresContainer = document.getElementById('features-container');
        console.log("Loading Features Page Data...");
        if (featuresContainer) {
            featuresContainer.innerHTML = '<p class="text-center text-gray-500">Loading features...</p>';
            fetchData('features').then(featuresData => {
                if (featuresData && Object.keys(featuresData).length > 0) {
                    featuresContainer.innerHTML = '';
                    Object.keys(featuresData).forEach(key => {
                        const feature = featuresData[key];
                        const featureCard = `
                            <div class="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 animate-on-scroll">
                                <div class="text-4xl p-2 rounded-full bg-blue-100 text-blue-600">${feature.icon || '✨'}</div>
                                <div>
                                    <h3 class="text-xl font-semibold text-gray-800 mb-2">${feature.title}</h3>
                                    <p class="text-gray-600">${feature.description}</p>
                                </div>
                            </div>
                        `;
                        featuresContainer.insertAdjacentHTML('beforeend', featureCard);
                    });
                } else {
                    featuresContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">No features available.</p>';
                }
            }).catch(error => {
                console.error("Failed to load features:", error);
                featuresContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading features.</p>';
            });
        }
    }

    // FAQ Page (faq.html)
    if (currentPage === 'faq.html') {
        const faqContainer = document.getElementById('faq-container');
        console.log("Loading FAQ Page Data...");
        if (faqContainer) {
            faqContainer.innerHTML = '<p class="text-center text-gray-500">Loading FAQs...</p>';
            fetchData('faqs').then(faqsData => {
                if (faqsData && Object.keys(faqsData).length > 0) {
                    faqContainer.innerHTML = '';
                    Object.keys(faqsData).forEach(key => {
                        const faq = faqsData[key];
                        const faqItem = `
                            <div class="border-b border-gray-200 py-4 animate-on-scroll">
                                <button class="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-800 hover:text-blue-600 focus:outline-none faq-question">
                                    <span>${faq.question}</span>
                                    <span class="text-xl transform transition-transform duration-300 rotate-0 faq-arrow">+</span>
                                </button>
                                <div class="faq-answer mt-2 text-gray-600 hidden">
                                    <p>${faq.answer}</p>
                                </div>
                            </div>
                        `;
                        faqContainer.insertAdjacentHTML('beforeend', faqItem);
                    });

                    // Accordion logic
                    document.querySelectorAll('.faq-question').forEach(button => {
                        button.addEventListener('click', () => {
                            const answer = button.nextElementSibling;
                            const arrow = button.querySelector('.faq-arrow');
                            answer.classList.toggle('hidden');
                            arrow.classList.toggle('rotate-45');
                        });
                    });
                } else {
                    faqContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">No FAQs available.</p>';
                }
            }).catch(error => {
                console.error("Failed to load FAQs:", error);
                faqContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading FAQs.</p>';
            });
        }
    }

    // About Page (about.html)
    if (currentPage === 'about.html') {
        const aboutContainer = document.getElementById('about-container');
        console.log("Loading About Page Data...");
        if (aboutContainer) {
            aboutContainer.innerHTML = '<p class="text-center text-gray-500">Loading about information...</p>';
            // Assuming 'about' is a single document, like 'about/main'
            fetchData('about/main').then(aboutData => { // Adjusted path for single document fetch
                if (aboutData) {
                    aboutContainer.innerHTML = `
                        <div class="bg-white p-8 rounded-lg shadow-md mb-8 animate-on-scroll">
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p class="text-lg text-gray-700 leading-relaxed">${aboutData.mission || 'Our mission is to empower individuals and businesses with cutting-edge AI solutions that simplify complex tasks and foster innovation.'}</p>
                        </div>

                        <div class="bg-white p-8 rounded-lg shadow-md mb-8 animate-on-scroll">
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                            <p class="text-lg text-gray-700 leading-relaxed">${aboutData.story || 'Founded in [Year], our journey began with a vision to democratize AI. From humble beginnings, we have grown into a dedicated team passionate about creating impactful technology.'}</p>
                        </div>

                        ${aboutData.team && aboutData.team.length > 0 ? `
                            <div class="bg-white p-8 rounded-lg shadow-md animate-on-scroll">
                                <h2 class="text-3xl font-bold text-gray-900 mb-6">Meet the Team</h2>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    ${aboutData.team.map(member => `
                                        <div class="text-center">
                                            <img src="${member.image || '/assets/placeholder-avatar.png'}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200">
                                            <h3 class="text-xl font-semibold text-gray-800">${member.name}</h3>
                                            <p class="text-blue-600">${member.role}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    `;
                } else {
                    aboutContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">About information not found.</p>';
                }
            }).catch(error => {
                console.error("Failed to load about info:", error);
                aboutContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading about information.</p>';
            });
        }
    }

    // Contact Page (contact.html)
    if (currentPage === 'contact.html') {
        const contactForm = document.getElementById('contact-form');
        const contactInfoContainer = document.getElementById('contact-info');
        const formMessage = document.getElementById('form-message');

        console.log("Loading Contact Page Data...");

        if (contactForm) {
            contactForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;

                if (!name || !email || !message) {
                    formMessage.textContent = 'Please fill in all fields.';
                    formMessage.className = 'text-red-500 mt-4 text-center';
                    return;
                }

                formMessage.textContent = 'Submitting...';
                formMessage.className = 'text-blue-600 mt-4 text-center';

                try {
                    await submitContactForm({ name, email, message });
                    formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                    formMessage.className = 'text-green-600 mt-4 text-center';
                    contactForm.reset();
                } catch (error) {
                    formMessage.textContent = 'Failed to send message. Please try again later.';
                    formMessage.className = 'text-red-500 mt-4 text-center';
                    console.error("Contact form submission error:", error);
                }
            });
        }

        if (contactInfoContainer) {
            // Assuming 'contactInfo' is a single document, like 'contactInfo/main'
            fetchData('contactInfo/main').then(contactInfoData => { // Adjusted path for single document fetch
                if (contactInfoData) {
                    contactInfoContainer.innerHTML = `
                        <p class="text-lg text-gray-700 mb-2"><strong>Email:</strong> <a href="mailto:${contactInfoData.email || 'info@yoursaas.com'}" class="text-blue-600 hover:underline">${contactInfoData.email || 'info@yoursaas.com'}</a></p>
                        <p class="text-lg text-gray-700 mb-2"><strong>Phone:</strong> ${contactInfoData.phone || '+1 (123) 456-7890'}</p>
                        <p class="text-lg text-gray-700 mb-2"><strong>Address:</strong> ${contactInfoData.address || '123 SaaS Lane, Innovation City, SA 98765'}</p>
                        <div class="flex space-x-4 mt-4">
                            ${contactInfoData.socials && contactInfoData.socials.facebook ? `<a href="${contactInfoData.socials.facebook}" target="_blank" class="text-blue-600 hover:text-blue-800 text-3xl"><i class="fab fa-facebook-square"></i></a>` : ''}
                            ${contactInfoData.socials && contactInfoData.socials.twitter ? `<a href="${contactInfoData.socials.twitter}" target="_blank" class="text-blue-400 hover:text-blue-600 text-3xl"><i class="fab fa-twitter-square"></i></a>` : ''}
                            ${contactInfoData.socials && contactInfoData.socials.linkedin ? `<a href="${contactInfoData.socials.linkedin}" target="_blank" class="text-blue-700 hover:text-blue-900 text-3xl"><i class="fab fa-linkedin"></i></a>` : ''}
                        </div>
                    `;
                } else {
                    contactInfoContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">Contact information not found.</p>';
                }
            }).catch(error => {
                console.error("Failed to load contact info:", error);
                contactInfoContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading contact information.</p>';
            });
        }
    }

    // Newsletter Subscription (if applicable, add to footer or relevant pages)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput.value;
            const newsletterMessage = document.getElementById('newsletter-message');

            if (!email || !email.includes('@')) {
                newsletterMessage.textContent = 'Please enter a valid email address.';
                newsletterMessage.className = 'text-red-500 mt-2';
                return;
            }

            newsletterMessage.textContent = 'Subscribing...';
            newsletterMessage.className = 'text-blue-600 mt-2';

            try {
                await subscribeNewsletter(email);
                newsletterMessage.textContent = 'Subscribed successfully! Thank you.';
                newsletterMessage.className = 'text-green-600 mt-2';
                emailInput.value = '';
            } catch (error) {
                newsletterMessage.textContent = 'Subscription failed. Please try again.';
                newsletterMessage.className = 'text-red-500 mt-2';
                console.error("Newsletter subscription error:", error);
            }
        });
    }

    // Real-time announcement banner (Optional)
    const announcementBanner = document.getElementById('announcement-banner');
    const announcementText = document.getElementById('announcement-text');
    const closeAnnouncementBtn = document.getElementById('close-announcement');

    if (announcementBanner && announcementText) {
        // Assuming 'announcement' is a single document, like 'announcement/latest'
        fetchData('announcement/latest').then(announcementData => { // Adjusted path for single document fetch
            if (announcementData && announcementData.active && announcementData.message) {
                announcementText.textContent = announcementData.message;
                announcementBanner.classList.remove('hidden');
                if (closeAnnouncementBtn) {
                    closeAnnouncementBtn.addEventListener('click', () => {
                        announcementBanner.classList.add('hidden');
                    });
                }
            } else {
                announcementBanner.classList.add('hidden');
            }
        }).catch(error => console.error("Failed to load announcement:", error));
    }
});import { fetchData, submitContactForm, subscribeNewsletter } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    console.log("Current Page:", currentPage); // For debugging: check which page is detected

    // --- Common UI Elements & Functions ---
    const navToggle = document.querySelector('[data-collapse-toggle="navbar-sticky"]');
    const mobileMenu = document.getElementById('navbar-sticky');
    const header = document.querySelector('header');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            // Scrolling down and past a threshold
            header.classList.add('-translate-y-full');
        } else {
            // Scrolling up
            header.classList.remove('-translate-y-full');
        }
        lastScrollY = window.scrollY;

        // Apply scroll animations
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight - 100) {
                element.classList.add('fade-in-up'); // Example animation class
            }
        });
    });

    // Initial check for scroll animations
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight - 100) {
            element.classList.add('fade-in-up');
        }
    });

    // Cookie Consent (Optional)
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (cookieConsent && acceptCookiesBtn) {
        if (!localStorage.getItem('cookieConsent')) {
            cookieConsent.classList.remove('hidden');
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieConsent.classList.add('hidden');
        });
    }


    // --- Page-specific Logic ---

    // Home Page (index.html)
    if (currentPage === 'index.html' || currentPage === '') {
        const toolsContainer = document.getElementById('ai-tools-preview');
        const testimonialsCarousel = document.getElementById('testimonials-carousel');

        console.log("Loading Home Page Data...");

        // Load AI Tools Preview
        if (toolsContainer) {
            toolsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading AI Tools preview...</div>';
            fetchData('tools').then(toolsData => {
                if (toolsData && Object.keys(toolsData).length > 0) {
                    toolsContainer.innerHTML = ''; // Clear loading message
                    const toolKeys = Object.keys(toolsData).slice(0, 6); // Get up to 6 tools
                    toolKeys.forEach(key => {
                        const tool = toolsData[key];
                        const toolCard = `
                            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-16 h-16 mx-auto mb-4 object-contain">
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">${tool.title}</h3>
                                <p class="text-gray-600 text-sm">${tool.description}</p>
                                <a href="tool.html?id=${key}" class="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">Learn More &rarr;</a>
                            </div>
                        `;
                        toolsContainer.insertAdjacentHTML('beforeend', toolCard);
                    });
                } else {
                    toolsContainer.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No AI tools available for preview.</p>';
                }
            }).catch(error => {
                console.error("Failed to load tools preview:", error);
                toolsContainer.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">Error loading tools preview.</p>';
            });
        }


        // Load Testimonials
        if (testimonialsCarousel) {
             testimonialsCarousel.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading testimonials...</div>';
            fetchData('testimonials').then(testimonialsData => {
                if (testimonialsData && Object.keys(testimonialsData).length > 0) {
                    testimonialsCarousel.innerHTML = ''; // Clear loading message
                    const testimonialsArray = Object.values(testimonialsData);
                    testimonialsArray.forEach(testimonial => {
                        const testimonialSlide = `
                            <div class="flex-none w-full md:w-1/2 lg:w-1/3 p-4 snap-center">
                                <div class="bg-white p-6 rounded-lg shadow-md">
                                    <p class="text-gray-700 italic mb-4">"${testimonial.quote}"</p>
                                    <p class="font-semibold text-gray-800">- ${testimonial.name}</p>
                                </div>
                            </div>
                        `;
                        testimonialsCarousel.insertAdjacentHTML('beforeend', testimonialSlide);
                    });
                } else {
                    testimonialsCarousel.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No testimonials available.</p>';
                }
            }).catch(error => {
                console.error("Failed to load testimonials:", error);
                testimonialsCarousel.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">Error loading testimonials.</p>';
            });
        }


        // Lottie Animation (Hero Section)
        const heroAnimationContainer = document.getElementById('hero-animation');
        if (heroAnimationContainer) {
            import('https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js').then(Lottie => {
                Lottie.loadAnimation({
                    container: heroAnimationContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: '/assets/hero-animation.json' // Path to your Lottie JSON file
                });
            }).catch(error => console.error("Lottie import failed:", error));
        }
    }

    // Tools Page (tools.html)
    if (currentPage === 'tools.html') {
        const toolsGrid = document.getElementById('tools-grid');
        const searchInput = document.getElementById('search-tools');
        const categoryFilter = document.getElementById('category-filter');
        let allToolsData = {}; // Store all tools for filtering

        console.log("Loading Tools Page Data...");

        const renderTools = (toolsToRender) => {
            if (toolsGrid) {
                toolsGrid.innerHTML = ''; // Clear previous tools (including loading messages)
                if (Object.keys(toolsToRender).length === 0) {
                    toolsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No tools found matching your criteria.</p>';
                    return;
                }
                Object.keys(toolsToRender).forEach(key => {
                    const tool = toolsToRender[key];
                    const toolCard = `
                        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-16 h-16 mx-auto mb-4 object-contain">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">${tool.title}</h3>
                            <p class="text-gray-600 text-sm">${tool.description}</p>
                            <a href="tool.html?id=${key}" class="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">View Details &rarr;</a>
                        </div>
                    `;
                    toolsGrid.insertAdjacentHTML('beforeend', toolCard);
                });
            }
        };

        // Ensure toolsGrid exists before trying to manipulate it
        if (toolsGrid) {
            // Show initial loading message
            toolsGrid.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-48 animate-pulse col-span-full">
                    <p class="text-gray-400">Loading all tools...</p>
                </div>
            `;
            fetchData('tools').then(toolsData => {
                if (toolsData && Object.keys(toolsData).length > 0) {
                    allToolsData = toolsData;
                    renderTools(allToolsData);

                    // Populate categories (if applicable, assuming 'category' field in tool data)
                    const categories = new Set();
                    Object.values(toolsData).forEach(tool => {
                        if (tool.category) {
                            categories.add(tool.category.toLowerCase());
                        }
                    });
                    if (categoryFilter) {
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                            categoryFilter.appendChild(option);
                        });
                    }

                    // Add event listeners only after data is loaded and elements exist
                    if (searchInput) searchInput.addEventListener('input', filterTools);
                    if (categoryFilter) categoryFilter.addEventListener('change', filterTools);

                } else {
                    toolsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No tools found.</p>';
                }
            }).catch(error => {
                console.error("Failed to load all tools for tools.html:", error);
                toolsGrid.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">Error loading tools. Please try again later.</p>';
            });
        }
    }

    // Tool Details Page (tool.html)
    if (currentPage === 'tool.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const toolId = urlParams.get('id');
        const toolDetailsContainer = document.getElementById('tool-details-container');

        console.log("Loading Tool Details Page Data for ID:", toolId);

        if (toolId && toolDetailsContainer) {
            // Show initial loading message
            toolDetailsContainer.innerHTML = `
                <div class="bg-white p-8 rounded-lg shadow-md flex items-center justify-center h-96">
                    <p class="text-gray-400 text-lg">Loading tool details for ${toolId}...</p>
                </div>
            `;
            fetchData(`tools/${toolId}`).then(tool => {
                if (tool) {
                    document.title = `${tool.title} - Tool Details`;
                    toolDetailsContainer.innerHTML = `
                        <div class="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
                            <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-48 h-48 mx-auto mb-6 object-contain">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">${tool.title}</h1>
                            <p class="text-lg text-gray-700 leading-relaxed mb-6 text-center">${tool.description}</p>

                            ${tool.features && tool.features.length > 0 ? `<h2 class="text-2xl font-semibold text-gray-800 mb-3">Key Features:</h2>
                            <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                                ${tool.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>` : ''}

                            ${tool.iframeUrl ? `
                                <h2 class="text-2xl font-semibold text-gray-800 mb-3">Live Preview:</h2>
                                <div class="aspect-w-16 aspect-h-9 mb-6">
                                    <iframe src="${tool.iframeUrl}" class="w-full h-96 border rounded-lg shadow-inner" frameborder="0" allowfullscreen></iframe>
                                </div>
                            ` : ''}

                            <div class="flex justify-center gap-4 flex-wrap">
                                ${tool.url ? `<a href="${tool.url}" target="_blank" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg">Launch Tool &rarr;</a>` : ''}
                                <a href="tools.html" class="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors duration-300 shadow-lg">Back to Tools</a>
                            </div>
                        </div>
                    `;
                } else {
                    toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">Tool not found or invalid ID.</p>';
                }
            }).catch(error => {
                console.error("Failed to load tool details:", error);
                toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">Error loading tool details. Please check console for more info.</p>';
            });
        } else {
            toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">No tool ID provided in URL.</p>';
        }
    }

    // Features Page (features.html)
    if (currentPage === 'features.html') {
        const featuresContainer = document.getElementById('features-container');
        console.log("Loading Features Page Data...");
        if (featuresContainer) {
            featuresContainer.innerHTML = '<p class="text-center text-gray-500">Loading features...</p>';
            fetchData('features').then(featuresData => {
                if (featuresData && Object.keys(featuresData).length > 0) {
                    featuresContainer.innerHTML = '';
                    Object.keys(featuresData).forEach(key => {
                        const feature = featuresData[key];
                        const featureCard = `
                            <div class="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 animate-on-scroll">
                                <div class="text-4xl p-2 rounded-full bg-blue-100 text-blue-600">${feature.icon || '✨'}</div>
                                <div>
                                    <h3 class="text-xl font-semibold text-gray-800 mb-2">${feature.title}</h3>
                                    <p class="text-gray-600">${feature.description}</p>
                                </div>
                            </div>
                        `;
                        featuresContainer.insertAdjacentHTML('beforeend', featureCard);
                    });
                } else {
                    featuresContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">No features available.</p>';
                }
            }).catch(error => {
                console.error("Failed to load features:", error);
                featuresContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading features.</p>';
            });
        }
    }

    // FAQ Page (faq.html)
    if (currentPage === 'faq.html') {
        const faqContainer = document.getElementById('faq-container');
        console.log("Loading FAQ Page Data...");
        if (faqContainer) {
            faqContainer.innerHTML = '<p class="text-center text-gray-500">Loading FAQs...</p>';
            fetchData('faqs').then(faqsData => {
                if (faqsData && Object.keys(faqsData).length > 0) {
                    faqContainer.innerHTML = '';
                    Object.keys(faqsData).forEach(key => {
                        const faq = faqsData[key];
                        const faqItem = `
                            <div class="border-b border-gray-200 py-4 animate-on-scroll">
                                <button class="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-800 hover:text-blue-600 focus:outline-none faq-question">
                                    <span>${faq.question}</span>
                                    <span class="text-xl transform transition-transform duration-300 rotate-0 faq-arrow">+</span>
                                </button>
                                <div class="faq-answer mt-2 text-gray-600 hidden">
                                    <p>${faq.answer}</p>
                                </div>
                            </div>
                        `;
                        faqContainer.insertAdjacentHTML('beforeend', faqItem);
                    });

                    // Accordion logic
                    document.querySelectorAll('.faq-question').forEach(button => {
                        button.addEventListener('click', () => {
                            const answer = button.nextElementSibling;
                            const arrow = button.querySelector('.faq-arrow');
                            answer.classList.toggle('hidden');
                            arrow.classList.toggle('rotate-45');
                        });
                    });
                } else {
                    faqContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">No FAQs available.</p>';
                }
            }).catch(error => {
                console.error("Failed to load FAQs:", error);
                faqContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading FAQs.</p>';
            });
        }
    }

    // About Page (about.html)
    if (currentPage === 'about.html') {
        const aboutContainer = document.getElementById('about-container');
        console.log("Loading About Page Data...");
        if (aboutContainer) {
            aboutContainer.innerHTML = '<p class="text-center text-gray-500">Loading about information...</p>';
            // Assuming 'about' is a single document, like 'about/main'
            fetchData('about/main').then(aboutData => { // Adjusted path for single document fetch
                if (aboutData) {
                    aboutContainer.innerHTML = `
                        <div class="bg-white p-8 rounded-lg shadow-md mb-8 animate-on-scroll">
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p class="text-lg text-gray-700 leading-relaxed">${aboutData.mission || 'Our mission is to empower individuals and businesses with cutting-edge AI solutions that simplify complex tasks and foster innovation.'}</p>
                        </div>

                        <div class="bg-white p-8 rounded-lg shadow-md mb-8 animate-on-scroll">
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                            <p class="text-lg text-gray-700 leading-relaxed">${aboutData.story || 'Founded in [Year], our journey began with a vision to democratize AI. From humble beginnings, we have grown into a dedicated team passionate about creating impactful technology.'}</p>
                        </div>

                        ${aboutData.team && aboutData.team.length > 0 ? `
                            <div class="bg-white p-8 rounded-lg shadow-md animate-on-scroll">
                                <h2 class="text-3xl font-bold text-gray-900 mb-6">Meet the Team</h2>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    ${aboutData.team.map(member => `
                                        <div class="text-center">
                                            <img src="${member.image || '/assets/placeholder-avatar.png'}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200">
                                            <h3 class="text-xl font-semibold text-gray-800">${member.name}</h3>
                                            <p class="text-blue-600">${member.role}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    `;
                } else {
                    aboutContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">About information not found.</p>';
                }
            }).catch(error => {
                console.error("Failed to load about info:", error);
                aboutContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading about information.</p>';
            });
        }
    }

    // Contact Page (contact.html)
    if (currentPage === 'contact.html') {
        const contactForm = document.getElementById('contact-form');
        const contactInfoContainer = document.getElementById('contact-info');
        const formMessage = document.getElementById('form-message');

        console.log("Loading Contact Page Data...");

        if (contactForm) {
            contactForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;

                if (!name || !email || !message) {
                    formMessage.textContent = 'Please fill in all fields.';
                    formMessage.className = 'text-red-500 mt-4 text-center';
                    return;
                }

                formMessage.textContent = 'Submitting...';
                formMessage.className = 'text-blue-600 mt-4 text-center';

                try {
                    await submitContactForm({ name, email, message });
                    formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                    formMessage.className = 'text-green-600 mt-4 text-center';
                    contactForm.reset();
                } catch (error) {
                    formMessage.textContent = 'Failed to send message. Please try again later.';
                    formMessage.className = 'text-red-500 mt-4 text-center';
                    console.error("Contact form submission error:", error);
                }
            });
        }

        if (contactInfoContainer) {
            // Assuming 'contactInfo' is a single document, like 'contactInfo/main'
            fetchData('contactInfo/main').then(contactInfoData => { // Adjusted path for single document fetch
                if (contactInfoData) {
                    contactInfoContainer.innerHTML = `
                        <p class="text-lg text-gray-700 mb-2"><strong>Email:</strong> <a href="mailto:${contactInfoData.email || 'info@yoursaas.com'}" class="text-blue-600 hover:underline">${contactInfoData.email || 'info@yoursaas.com'}</a></p>
                        <p class="text-lg text-gray-700 mb-2"><strong>Phone:</strong> ${contactInfoData.phone || '+1 (123) 456-7890'}</p>
                        <p class="text-lg text-gray-700 mb-2"><strong>Address:</strong> ${contactInfoData.address || '123 SaaS Lane, Innovation City, SA 98765'}</p>
                        <div class="flex space-x-4 mt-4">
                            ${contactInfoData.socials && contactInfoData.socials.facebook ? `<a href="${contactInfoData.socials.facebook}" target="_blank" class="text-blue-600 hover:text-blue-800 text-3xl"><i class="fab fa-facebook-square"></i></a>` : ''}
                            ${contactInfoData.socials && contactInfoData.socials.twitter ? `<a href="${contactInfoData.socials.twitter}" target="_blank" class="text-blue-400 hover:text-blue-600 text-3xl"><i class="fab fa-twitter-square"></i></a>` : ''}
                            ${contactInfoData.socials && contactInfoData.socials.linkedin ? `<a href="${contactInfoData.socials.linkedin}" target="_blank" class="text-blue-700 hover:text-blue-900 text-3xl"><i class="fab fa-linkedin"></i></a>` : ''}
                        </div>
                    `;
                } else {
                    contactInfoContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">Contact information not found.</p>';
                }
            }).catch(error => {
                console.error("Failed to load contact info:", error);
                contactInfoContainer.innerHTML = '<p class="text-center text-red-500 text-lg">Error loading contact information.</p>';
            });
        }
    }

    // Newsletter Subscription (if applicable, add to footer or relevant pages)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput.value;
            const newsletterMessage = document.getElementById('newsletter-message');

            if (!email || !email.includes('@')) {
                newsletterMessage.textContent = 'Please enter a valid email address.';
                newsletterMessage.className = 'text-red-500 mt-2';
                return;
            }

            newsletterMessage.textContent = 'Subscribing...';
            newsletterMessage.className = 'text-blue-600 mt-2';

            try {
                await subscribeNewsletter(email);
                newsletterMessage.textContent = 'Subscribed successfully! Thank you.';
                newsletterMessage.className = 'text-green-600 mt-2';
                emailInput.value = '';
            } catch (error) {
                newsletterMessage.textContent = 'Subscription failed. Please try again.';
                newsletterMessage.className = 'text-red-500 mt-2';
                console.error("Newsletter subscription error:", error);
            }
        });
    }

    // Real-time announcement banner (Optional)
    const announcementBanner = document.getElementById('announcement-banner');
    const announcementText = document.getElementById('announcement-text');
    const closeAnnouncementBtn = document.getElementById('close-announcement');

    if (announcementBanner && announcementText) {
        // Assuming 'announcement' is a single document, like 'announcement/latest'
        fetchData('announcement/latest').then(announcementData => { // Adjusted path for single document fetch
            if (announcementData && announcementData.active && announcementData.message) {
                announcementText.textContent = announcementData.message;
                announcementBanner.classList.remove('hidden');
                if (closeAnnouncementBtn) {
                    closeAnnouncementBtn.addEventListener('click', () => {
                        announcementBanner.classList.add('hidden');
                    });
                }
            } else {
                announcementBanner.classList.add('hidden');
            }
        }).catch(error => console.error("Failed to load announcement:", error));
    }
});
