// firebase.js থেকে প্রয়োজনীয় ফাংশন ইম্পোর্ট করা হয়েছে
import { fetchData, submitContactForm, subscribeNewsletter } from './firebase.js';

// যখন DOM সম্পূর্ণরূপে লোড হবে, তখন এই কোডটি চলবে
document.addEventListener('DOMContentLoaded', () => {
    // বর্তমান পেজের নাম বের করা হয়েছে (যেমন: index.html, tools.html)
    const currentPage = window.location.pathname.split('/').pop();
    console.log("Current Page Detected:", currentPage); // ডিবাগিং এর জন্য

    // --- সাধারণ UI উপাদান এবং ফাংশন ---
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
            header.classList.add('-translate-y-full');
        } else {
            header.classList.remove('-translate-y-full');
        }
        lastScrollY = window.scrollY;

        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight - 100) {
                element.classList.add('fade-in-up');
            }
        });
    });

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight - 100) {
            element.classList.add('fade-in-up');
        }
    });

    // কুকি কনসেন্ট (ঐচ্ছিক)
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

    // --- পেজ-নির্দিষ্ট লজিক ---

    // হোম পেজ (index.html)
    if (currentPage === 'index.html' || currentPage === '') {
        const toolsContainer = document.getElementById('ai-tools-preview');
        const testimonialsCarousel = document.getElementById('testimonials-carousel');

        console.log("Loading Home Page Data...");

        // AI টুলস প্রিভিউ লোড করা
        if (toolsContainer) {
            toolsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500">AI টুলস প্রিভিউ লোড হচ্ছে...</div>';
            fetchData('tools').then(toolsData => {
                if (toolsData && Object.keys(toolsData).length > 0) {
                    toolsContainer.innerHTML = ''; // লোডিং মেসেজ মুছে ফেলা
                    const toolKeys = Object.keys(toolsData).slice(0, 6); // প্রথম ৬টি টুল দেখানো
                    toolKeys.forEach(key => {
                        const tool = toolsData[key];
                        const toolCard = `
                            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-16 h-16 mx-auto mb-4 object-contain">
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">${tool.title}</h3>
                                <p class="text-gray-600 text-sm">${tool.description}</p>
                                <a href="tool.html?id=${key}" class="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">বিস্তারিত দেখুন &rarr;</a>
                            </div>
                        `;
                        toolsContainer.insertAdjacentHTML('beforeend', toolCard);
                    });
                } else {
                    toolsContainer.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">কোনো AI টুলস প্রিভিউ এর জন্য উপলব্ধ নেই।</p>';
                }
            }).catch(error => {
                console.error("AI টুলস প্রিভিউ লোড করতে ব্যর্থ:", error);
                toolsContainer.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">AI টুলস প্রিভিউ লোড করতে সমস্যা হয়েছে।</p>';
            });
        }

        // টেস্টিমোনিয়াল লোড করা
        if (testimonialsCarousel) {
             testimonialsCarousel.innerHTML = '<div class="col-span-full text-center text-gray-500">টেস্টিমোনিয়াল লোড হচ্ছে...</div>';
            fetchData('testimonials').then(testimonialsData => {
                if (testimonialsData && Object.keys(testimonialsData).length > 0) {
                    testimonialsCarousel.innerHTML = ''; // লোডিং মেসেজ মুছে ফেলা
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
                    testimonialsCarousel.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">কোনো টেস্টিমোনিয়াল উপলব্ধ নেই।</p>';
                }
            }).catch(error => {
                console.error("টেস্টিমোনিয়াল লোড করতে ব্যর্থ:", error);
                testimonialsCarousel.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">টেস্টিমোনিয়াল লোড করতে সমস্যা হয়েছে।</p>';
            });
        }

        // Lottie Animation (হিরো সেকশন)
        const heroAnimationContainer = document.getElementById('hero-animation');
        if (heroAnimationContainer) {
            import('https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js').then(Lottie => {
                Lottie.loadAnimation({
                    container: heroAnimationContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: '/assets/hero-animation.json' // তোমার Lottie JSON ফাইলের পাথ
                });
            }).catch(error => console.error("Lottie ইম্পোর্ট ব্যর্থ:", error));
        }
    }

    // টুলস পেজ (tools.html)
    if (currentPage === 'tools.html') {
        const toolsGrid = document.getElementById('tools-grid');
        const searchInput = document.getElementById('search-tools');
        const categoryFilter = document.getElementById('category-filter');
        let allToolsData = {}; // ফিল্টারিং এর জন্য সব টুলস ডেটা সংরক্ষণ

        console.log("Loading Tools Page Data...");

        const renderTools = (toolsToRender) => {
            if (toolsGrid) {
                toolsGrid.innerHTML = ''; // পূর্ববর্তী টুলস (লোডিং মেসেজ সহ) মুছে ফেলা
                if (Object.keys(toolsToRender).length === 0) {
                    toolsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">আপনার শর্তাবলী অনুযায়ী কোনো টুলস পাওয়া যায়নি।</p>';
                    return;
                }
                Object.keys(toolsToRender).forEach(key => {
                    const tool = toolsToRender[key];
                    const toolCard = `
                        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-16 h-16 mx-auto mb-4 object-contain">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">${tool.title}</h3>
                            <p class="text-gray-600 text-sm">${tool.description}</p>
                            <a href="tool.html?id=${key}" class="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">বিস্তারিত দেখুন &rarr;</a>
                        </div>
                    `;
                    toolsGrid.insertAdjacentHTML('beforeend', toolCard);
                });
            }
        };

        const filterTools = () => {
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

            const filtered = Object.fromEntries(
                Object.entries(allToolsData).filter(([key, tool]) => {
                    const matchesSearch = (tool.title && tool.title.toLowerCase().includes(searchTerm)) || (tool.description && tool.description.toLowerCase().includes(searchTerm));
                    const matchesCategory = selectedCategory === 'all' || (tool.category && tool.category.toLowerCase() === selectedCategory);
                    return matchesSearch && matchesCategory;
                })
            );
            renderTools(filtered);
        };

        // toolsGrid বিদ্যমান আছে কিনা তা নিশ্চিত করা
        if (toolsGrid) {
            // প্রাথমিক লোডিং মেসেজ দেখানো
            toolsGrid.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-48 animate-pulse col-span-full">
                    <p class="text-gray-400">সব টুলস লোড হচ্ছে...</p>
                </div>
            `;
            fetchData('tools').then(toolsData => {
                if (toolsData && Object.keys(toolsData).length > 0) {
                    allToolsData = toolsData;
                    renderTools(allToolsData);

                    // ক্যাটাগরি পপুলেট করা (যদি প্রযোজ্য হয়, ধরে নেওয়া হচ্ছে টুল ডেটাতে 'category' ফিল্ড আছে)
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

                    // ডেটা লোড হওয়ার পর এবং উপাদান বিদ্যমান থাকলে ইভেন্ট লিসেনার যোগ করা
                    if (searchInput) searchInput.addEventListener('input', filterTools);
                    if (categoryFilter) categoryFilter.addEventListener('change', filterTools);

                } else {
                    toolsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">কোনো টুলস পাওয়া যায়নি।</p>';
                }
            }).catch(error => {
                console.error("tools.html এর জন্য সব টুলস লোড করতে ব্যর্থ:", error);
                toolsGrid.innerHTML = '<p class="col-span-full text-center text-red-500 text-lg">টুলস লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>';
            });
        }
    }

    // টুল ডিটেইলস পেজ (tool.html)
    if (currentPage === 'tool.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const toolId = urlParams.get('id');
        const toolDetailsContainer = document.getElementById('tool-details-container');

        console.log("Loading Tool Details Page Data for ID:", toolId);

        if (toolId && toolDetailsContainer) {
            // প্রাথমিক লোডিং মেসেজ দেখানো
            toolDetailsContainer.innerHTML = `
                <div class="bg-white p-8 rounded-lg shadow-md flex items-center justify-center h-96">
                    <p class="text-gray-400 text-lg">${toolId} এর জন্য টুলস এর বিস্তারিত লোড হচ্ছে...</p>
                </div>
            `;
            fetchData(`tools/${toolId}`).then(tool => {
                if (tool) {
                    document.title = `${tool.title} - টুলস এর বিস্তারিত`;
                    toolDetailsContainer.innerHTML = `
                        <div class="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
                            <img src="${tool.image || '/assets/placeholder-tool.png'}" alt="${tool.title}" class="w-48 h-48 mx-auto mb-6 object-contain">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">${tool.title}</h1>
                            <p class="text-lg text-gray-700 leading-relaxed mb-6 text-center">${tool.description}</p>

                            ${tool.features && tool.features.length > 0 ? `<h2 class="text-2xl font-semibold text-gray-800 mb-3">মূল বৈশিষ্ট্য:</h2>
                            <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                                ${tool.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>` : ''}

                            ${tool.iframeUrl ? `
                                <h2 class="text-2xl font-semibold text-gray-800 mb-3">লাইভ প্রিভিউ:</h2>
                                <div class="aspect-w-16 aspect-h-9 mb-6">
                                    <iframe src="${tool.iframeUrl}" class="w-full h-96 border rounded-lg shadow-inner" frameborder="0" allowfullscreen></iframe>
                                </div>
                            ` : ''}

                            <div class="flex justify-center gap-4 flex-wrap">
                                ${tool.url ? `<a href="${tool.url}" target="_blank" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg">টুলস চালু করুন &rarr;</a>` : ''}
                                <a href="tools.html" class="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors duration-300 shadow-lg">টুলস-এ ফিরে যান</a>
                            </div>
                        </div>
                    `;
                } else {
                    toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">টুলস পাওয়া যায়নি অথবা আইডি ভুল।</p>';
                }
            }).catch(error => {
                console.error("টুলস এর বিস্তারিত লোড করতে ব্যর্থ:", error);
                toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">টুলস এর বিস্তারিত লোড করতে সমস্যা হয়েছে। আরও তথ্যের জন্য কনসোল চেক করুন।</p>';
            });
        } else {
            toolDetailsContainer.innerHTML = '<p class="text-center text-red-500 text-xl">URL এ কোনো টুল আইডি দেওয়া হয়নি।</p>';
        }
    }

    // ফিচারস পেজ (features.html)
    if (currentPage === 'features.html') {
        const featuresContainer = document.getElementById('features-container');
        console.log("Loading Features Page Data...");
        if (featuresContainer) {
            featuresContainer.innerHTML = '<p class="text-center text-gray-500">ফিচারস লোড হচ্ছে...</p>';
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
                    featuresContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">কোনো ফিচারস উপলব্ধ নেই।</p>';
                }
            }).catch(error => {
                console.error("ফিচারস লোড করতে ব্যর্থ:", error);
                featuresContainer.innerHTML = '<p class="text-center text-red-500 text-lg">ফিচারস লোড করতে সমস্যা হয়েছে।</p>';
            });
        }
    }

    // FAQ পেজ (faq.html)
    if (currentPage === 'faq.html') {
        const faqContainer = document.getElementById('faq-container');
        console.log("Loading FAQ Page Data...");
        if (faqContainer) {
            faqContainer.innerHTML = '<p class="text-center text-gray-500">FAQ লোড হচ্ছে...</p>';
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

                    // অ্যাকর্ডিয়ন লজিক
                    document.querySelectorAll('.faq-question').forEach(button => {
                        button.addEventListener('click', () => {
                            const answer = button.nextElementSibling;
                            const arrow = button.querySelector('.faq-arrow');
                            answer.classList.toggle('hidden');
                            arrow.classList.toggle('rotate-45');
                        });
                    });
                } else {
                    faqContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">কোনো FAQ উপলব্ধ নেই।</p>';
                }
            }).catch(error => {
                console.error("FAQ লোড করতে ব্যর্থ:", error);
                faqContainer.innerHTML = '<p class="text-center text-red-500 text-lg">FAQ লোড করতে সমস্যা হয়েছে।</p>';
            });
        }
    }

    // অ্যাবাউট পেজ (about.html)
    if (currentPage === 'about.html') {
        const aboutContainer = document.getElementById('about-container');
        console.log("Loading About Page Data...");
        if (aboutContainer) {
            aboutContainer.innerHTML = '<p class="text-center text-gray-500">অ্যাবাউট তথ্য লোড হচ্ছে...</p>';
            // ধরে নেওয়া হচ্ছে 'about' একটি একক ডকুমেন্ট, যেমন 'about/main'
            fetchData('about/main').then(aboutData => {
                if (aboutData) {
                    aboutContainer.innerHTML = `
                        <div class="bg-white p-8 rounded-lg shadow-md mb-8 animate-on-scroll">
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">আমাদের লক্ষ্য</h2>
                            <p class="text-lg text-gray-700 leading-relaxed">${aboutData.mission || 'আমাদের লক্ষ্য হল অত্যাধুনিক AI সমাধানগুলির মাধ্যমে ব্যক্তি ও ব্যবসাগুলিকে ক্ষমতায়ন করা যা জটিল কাজগুলিকে সহজ করে এবং উদ্ভাবনকে উৎসাহিত করে।'}</p>
                        </div>

                        <div class="bg-white p-8 rounded-lg shadow-md mb-8 animate-on-scroll">
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">আমাদের গল্প</h2>
                            <p class="text-lg text-gray-700 leading-relaxed">${aboutData.story || '[বছর]-এ প্রতিষ্ঠিত, আমাদের যাত্রা AI কে গণতান্ত্রিক করার একটি দৃষ্টিভঙ্গি নিয়ে শুরু হয়েছিল। বিনয়ী শুরু থেকে, আমরা প্রভাবশালী প্রযুক্তি তৈরির জন্য নিবেদিত একটি দলে পরিণত হয়েছি।'}</p>
                        </div>

                        ${aboutData.team && aboutData.team.length > 0 ? `
                            <div class="bg-white p-8 rounded-lg shadow-md animate-on-scroll">
                                <h2 class="text-3xl font-bold text-gray-900 mb-6">দলের সাথে পরিচিত হন</h2>
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
                    aboutContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">অ্যাবাউট তথ্য পাওয়া যায়নি।</p>';
                }
            }).catch(error => {
                console.error("অ্যাবাউট তথ্য লোড করতে ব্যর্থ:", error);
                aboutContainer.innerHTML = '<p class="text-center text-red-500 text-lg">অ্যাবাউট তথ্য লোড করতে সমস্যা হয়েছে।</p>';
            });
        }
    }

    // যোগাযোগ পেজ (contact.html)
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
                    if(formMessage) {
                        formMessage.textContent = 'অনুগ্রহ করে সব ঘর পূরণ করুন।';
                        formMessage.className = 'text-red-500 mt-4 text-center';
                    }
                    return;
                }

                if(formMessage) {
                    formMessage.textContent = 'জমা দেওয়া হচ্ছে...';
                    formMessage.className = 'text-blue-600 mt-4 text-center';
                }

                try {
                    await submitContactForm({ name, email, message });
                    if(formMessage) {
                        formMessage.textContent = 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।';
                        formMessage.className = 'text-green-600 mt-4 text-center';
                    }
                    contactForm.reset();
                } catch (error) {
                    if(formMessage) {
                        formMessage.textContent = 'বার্তা পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
                        formMessage.className = 'text-red-500 mt-4 text-center';
                    }
                    console.error("যোগাযোগ ফর্ম জমা দেওয়ার ত্রুটি:", error);
                }
            });
        }

        if (contactInfoContainer) {
            // ধরে নেওয়া হচ্ছে 'contactInfo' একটি একক ডকুমেন্ট, যেমন 'contactInfo/main'
            fetchData('contactInfo/main').then(contactInfoData => {
                if (contactInfoData) {
                    contactInfoContainer.innerHTML = `
                        <p class="text-lg text-gray-700 mb-2"><strong>ইমেইল:</strong> <a href="mailto:${contactInfoData.email || 'info@yoursaas.com'}" class="text-blue-600 hover:underline">${contactInfoData.email || 'info@yoursaas.com'}</a></p>
                        <p class="text-lg text-gray-700 mb-2"><strong>ফোন:</strong> ${contactInfoData.phone || '+1 (123) 456-7890'}</p>
                        <p class="text-lg text-gray-700 mb-2"><strong>ঠিকানা:</strong> ${contactInfoData.address || '123 SaaS Lane, Innovation City, SA 98765'}</p>
                        <div class="flex space-x-4 mt-4">
                            ${contactInfoData.socials && contactInfoData.socials.facebook ? `<a href="${contactInfoData.socials.facebook}" target="_blank" class="text-blue-600 hover:text-blue-800 text-3xl"><i class="fab fa-facebook-square"></i></a>` : ''}
                            ${contactInfoData.socials && contactInfoData.socials.twitter ? `<a href="${contactInfoData.socials.twitter}" target="_blank" class="text-blue-400 hover:text-blue-600 text-3xl"><i class="fab fa-twitter-square"></i></a>` : ''}
                            ${contactInfoData.socials && contactInfoData.socials.linkedin ? `<a href="${contactInfoData.socials.linkedin}" target="_blank" class="text-blue-700 hover:text-blue-900 text-3xl"><i class="fab fa-linkedin"></i></a>` : ''}
                        </div>
                    `;
                } else {
                    contactInfoContainer.innerHTML = '<p class="text-center text-gray-600 text-lg">যোগাযোগের তথ্য পাওয়া যায়নি।</p>';
                }
            }).catch(error => {
                console.error("যোগাযোগের তথ্য লোড করতে ব্যর্থ:", error);
                contactInfoContainer.innerHTML = '<p class="text-center text-red-500 text-lg">যোগাযোগের তথ্য লোড করতে সমস্যা হয়েছে।</p>';
            });
        }
    }

    // নিউজলেটার সাবস্ক্রিপশন (যদি প্রযোজ্য হয়, ফুটার বা প্রাসঙ্গিক পেজে যোগ করুন)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput ? emailInput.value : '';
            const newsletterMessage = document.getElementById('newsletter-message');

            if (!email || !email.includes('@')) {
                if(newsletterMessage) {
                    newsletterMessage.textContent = 'অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা লিখুন।';
                    newsletterMessage.className = 'text-red-500 mt-2';
                }
                return;
            }

            if(newsletterMessage) {
                newsletterMessage.textContent = 'সাবস্ক্রাইব করা হচ্ছে...';
                newsletterMessage.className = 'text-blue-600 mt-2';
            }

            try {
                await subscribeNewsletter(email);
                if(newsletterMessage) {
                    newsletterMessage.textContent = 'সফলভাবে সাবস্ক্রাইব করা হয়েছে! ধন্যবাদ।';
                    newsletterMessage.className = 'text-green-600 mt-2';
                }
                if(emailInput) emailInput.value = '';
            } catch (error) {
                if(newsletterMessage) {
                    newsletterMessage.textContent = 'সাবস্ক্রিপশন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
                    newsletterMessage.className = 'text-red-500 mt-2';
                }
                console.error("নিউজলেটার সাবস্ক্রিপশন ত্রুটি:", error);
            }
        });
    }

    // রিয়েল-টাইম অ্যানাউন্সমেন্ট ব্যানার (ঐচ্ছিক)
    const announcementBanner = document.getElementById('announcement-banner');
    const announcementText = document.getElementById('announcement-text');
    const closeAnnouncementBtn = document.getElementById('close-announcement');

    if (announcementBanner && announcementText) {
        // ধরে নেওয়া হচ্ছে 'announcement' একটি একক ডকুমেন্ট, যেমন 'announcement/latest'
        fetchData('announcement/latest').then(announcementData => {
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
        }).catch(error => console.error("অ্যানাউন্সমেন্ট লোড করতে ব্যর্থ:", error));
    }
});
