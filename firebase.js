// Firebase SDK for JavaScript - v9.x.x
// For Firebase JS SDK v9.x.x and later, measurementId is optional
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue, set, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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
// --- END REPLACE ---

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Fetches data from a specific Firebase Realtime Database path.
 * @param {string} path - The path to the data (e.g., 'tools', 'testimonials').
 * @returns {Promise<object | null>} - A promise that resolves with the data object or null if not found.
 */
export function fetchData(path) {
  return new Promise((resolve, reject) => {
    const dataRef = ref(database, path);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      resolve(data);
    }, (error) => {
      console.error(`Error fetching data from ${path}:`, error);
      reject(error);
    }, {
      onlyOnce: true // Fetch data once, don't keep listening for changes
    });
  });
}

/**
 * Sends contact form data to Firebase.
 * @param {object} formData - Object containing name, email, message.
 * @returns {Promise<void>} - A promise that resolves when data is sent.
 */
export async function submitContactForm(formData) {
  try {
    const contactRef = ref(database, 'contactSubmissions');
    await push(contactRef, {
      ...formData,
      timestamp: serverTimestamp()
    });
    console.log("Contact form submitted successfully!");
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
}

/**
 * Submits newsletter subscription data to Firebase.
 * @param {string} email - The email address to subscribe.
 * @returns {Promise<void>} - A promise that resolves when data is sent.
 */
export async function subscribeNewsletter(email) {
  try {
    const newsletterRef = ref(database, 'newsletterSubscriptions');
    await push(newsletterRef, {
      email: email,
      timestamp: serverTimestamp()
    });
    console.log("Newsletter subscribed successfully!");
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
}
