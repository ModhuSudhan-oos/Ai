// script.js

// Firebase SDK imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Your Firebase configuration
// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVpddOtX1yRxslNxh8yz3SJq53eUYhkZ0",
  authDomain: "next-gen-186aa.firebaseapp.com",
  projectId: "next-gen-186aa",
  storageBucket: "next-gen-186aa.firebasestorage.app",
  messagingSenderId: "338569531164",
  appId: "1:338569531164:web:932df077b59a0a371b34d9",
  measurementId: "G-7GCT5KHFQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DOM Elements ---
const announcementBanner = document.getElementById('announcement-banner');
const announcementText = document.getElementById('announcement-text');
const closeAnnouncementBtn = document.getElementById('close-announcement');
const aiToolsPreview = document.getElementById('ai-tools-preview');
const testimonialsCarousel = document.getElementById('testimonials-carousel');
const footerEmail = document.getElementById('footer-email');
const footerPhone = document.getElementById('footer-phone');

// --- Functions to Fetch and Render Data ---

// Fetch and Render Announcement
const fetchAndRenderAnnouncement = async () => {
    const announcementDocRef = doc(db, "settings", "announcement");
    try {
        const docSnap = await getDoc(announcementDocRef);
        if (docSnap.exists() && docSnap.data().active) {
            const data = docSnap.data();
            announcementText.textContent = `${data.title}: ${data.message}`;
            announcementBanner.classList.remove('hidden');
            // Close button functionality
            closeAnnouncementBtn.onclick = () => {
                announcementBanner.classList.add('hidden');
                localStorage.setItem('announcementClosed', 'true'); // Remember user closed it
            };
            // Don't show if user previously closed it
            if (localStorage.getItem('announcementClosed') === 'true') {
                announcementBanner.classList.add('hidden');
            } else {
                announcementBanner.classList.remove('hidden');
            }
        } else {
            announcementBanner.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error fetching announcement:", error);
        announcementBanner.classList.add('hidden');
    }
};

// Fetch and Render Tools Preview (first 3 tools)
const fetchAndRenderToolsPreview = async () => {
    aiToolsPreview.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading tools...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "tools"));
        let toolsHtml = '';
        let count = 0;
        querySnapshot.forEach((doc) => {
            if (count < 3) { // Limit to first 3 tools for preview
                const tool = doc.data();
                toolsHtml += `
                    <div class="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:scale-105 hover:shadow-xl animate-on-scroll">
                        <img src="${tool.image || 'https://via.placeholder.com/100?text=Tool'}" alt="${tool.name}" class="w-20 h-20 mx-auto mb-4 rounded-full object-cover">
                        <h3 class="text-xl font-semibold text-center text-gray-900 mb-2">${tool.name}</h3>
                        <p class="text-gray-600 text-center">${tool.description}</p>
                        <div class="text-center mt-4">
                            <a href="${tool.link || '#'}" class="text-blue-600 hover:underline font-medium">Learn More &rarr;</a>
                        </div>
                    </div>
                `;
                count++;
            }
        });
        aiToolsPreview.innerHTML = toolsHtml || '<p class="col-span-full text-center text-gray-500">No AI tools available yet. Please add them from the admin panel.</p>';
    } catch (error) {
        console.error("Error fetching tools:", error);
        aiToolsPreview.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading tools. Please try again later.</p>';
    }
};

// Fetch and Render Testimonials
const fetchAndRenderTestimonials = async () => {
    testimonialsCarousel.innerHTML = '<p class="min-w-full text-center text-gray-500">Loading testimonials...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "testimonials"));
        if (querySnapshot.empty) {
            testimonialsCarousel.innerHTML = '<p class="min-w-full text-center text-gray-500">No testimonials available yet.</p>';
            return;
        }
        let testimonialsHtml = '';
        querySnapshot.forEach((doc) => {
            const testimonial = doc.data();
            testimonialsHtml += `
                <div class="testimonial-card bg-white p-8 rounded-lg shadow-md snap-center flex-shrink-0 w-full md:w-1/2 lg:w-1/3 mx-2 animate-on-scroll">
                    <div class="flex items-center mb-4">
                        ${testimonial.image ? `<img src="${testimonial.image}" alt="${testimonial.author}" class="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-500">` : `<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mr-4"><i class="fas fa-user-circle"></i></div>`}
                        <div>
                            <p class="font-semibold text-gray-900">${testimonial.author}</p>
                            <p class="text-sm text-gray-600">${testimonial.title || 'Satisfied Customer'}</p>
                        </div>
                    </div>
                    <p class="text-gray-700 italic">"${testimonial.quote}"</p>
                </div>
            `;
        });
        testimonialsCarousel.innerHTML = testimonialsHtml;
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        testimonialsCarousel.innerHTML = '<p class="min-w-full text-center text-red-500">Error loading testimonials.</p>';
    }
};

// Fetch and Render Contact Info for Footer
const fetchAndRenderContactInfo = async () => {
    const contactInfoDocRef = doc(db, "settings", "contactInfo");
    try {
        const docSnap = await getDoc(contactInfoDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            footerEmail.innerHTML = `Email: <a href="mailto:${data.email || 'info@yoursaas.com'}" class="hover:text-white">${data.email || 'info@yoursaas.com'}</a>`;
            footerPhone.textContent = `Phone: ${data.phone || '+1 (123) 456-7890'}`;
        } else {
            console.log("No contactInfo document found in settings, using default.");
            footerEmail.innerHTML = `Email: <a href="mailto:info@yoursaas.com" class="hover:text-white">info@yoursaas.com</a>`;
            footerPhone.textContent = `Phone: +1 (123) 456-7890`;
        }
    } catch (error) {
        console.error("Error fetching contact info:", error);
        footerEmail.innerHTML = `Email: <a href="mailto:info@yoursaas.com" class="hover:text-white">info@yoursaas.com</a>`;
        footerPhone.textContent = `Phone: +1 (123) 456-7890`;
    }
};

// --- General UI/UX enhancements ---

// Navbar sticky toggle for mobile
const navbarToggle = document.querySelector('[data-collapse-toggle="navbar-sticky"]');
const navbarMenu = document.getElementById('navbar-sticky');

if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('hidden');
        navbarMenu.classList.toggle('flex');
        navbarMenu.classList.toggle('flex-col'); // Add flex-col for proper stacking on mobile
        navbarMenu.classList.toggle('absolute'); // Make it absolute to overlay content
        navbarMenu.classList.toggle('top-full'); // Position below header
        navbarMenu.classList.toggle('left-0');
        navbarMenu.classList.toggle('right-0');
        navbarMenu.classList.toggle('bg-white');
        navbarMenu.classList.toggle('shadow-md');
        navbarMenu.classList.toggle('p-4');
        navbarMenu.classList.toggle('space-y-2');
        navbarMenu.classList.toggle('md:relative'); // Reset on desktop
        navbarMenu.classList.toggle('md:shadow-none');
        navbarMenu.classList.toggle('md:p-0');
        navbarMenu.classList.toggle('md:space-y-0');
    });
}

// Simple Scroll Animation (if you had a full Lottie animation, you'd integrate it here)
// For now, it's just a placeholder to remove previous error, you can replace with actual Lottie init.
const heroAnimationDiv = document.getElementById('hero-animation');
if (heroAnimationDiv) {
    heroAnimationDiv.innerHTML = `<img src="https://via.placeholder.com/400x300?text=AI+Illustration" alt="AI Illustration" class="mx-auto rounded-lg shadow-xl">`;
}


// --- Initialize all data fetching on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderAnnouncement();
    fetchAndRenderToolsPreview();
    fetchAndRenderTestimonials();
    fetchAndRenderContactInfo();
    
    // Cookie Consent (optional)
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (cookieConsent && acceptCookiesBtn) {
        if (!localStorage.getItem('cookieConsentAccepted')) {
            cookieConsent.classList.remove('hidden');
        }

        acceptCookiesBtn.addEventListener('click', () => {
            cookieConsent.classList.add('hidden');
            localStorage.setItem('cookieConsentAccepted', 'true');
        });
    }
});

// Basic scroll-based animation for elements with 'animate-on-scroll' class
const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // When 10% of the item is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, observerOptions);

animateOnScrollElements.forEach(el => {
    el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700', 'ease-out');
    observer.observe(el);
});
