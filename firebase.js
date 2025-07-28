// Firebase SDK for JavaScript - v9.x.x
// For Firebase JS SDK v9.x.x and later, measurementId is optional
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
// Firestore মডিউল ইম্পোর্ট করা হয়েছে
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


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
// Firestore ডেটাবেজ ইনিশিয়ালাইজ করা হয়েছে
const db = getFirestore(app);

/**
 * Fetches data from a specific Firestore collection or document.
 * @param {string} path - The path to the data (e.g., 'tools', 'testimonials', or 'about/ourMission').
 * @returns {Promise<object | null>} - A promise that resolves with the data object or null if not found.
 */
export async function fetchData(path) {
  try {
    // পাথটি একটি কালেকশন নাকি একটি নির্দিষ্ট ডকুমেন্ট নির্দেশ করে তা নির্ধারণ করা হয়েছে
    const pathSegments = path.split('/');
    if (pathSegments.length % 2 === 1) { // বিজোড় সংখ্যক সেগমেন্ট মানে সাধারণত একটি কালেকশন (যেমন, 'tools')
      const querySnapshot = await getDocs(collection(db, path));
      const data = {};
      querySnapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      return data;
    } else { // জোড় সংখ্যক সেগমেন্ট মানে সাধারণত একটি ডকুমেন্ট (যেমন, 'about/ourMission')
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.warn(`No such document: ${path}`);
        return null;
      }
    }
  } catch (error) {
    console.error(`Error fetching data from Firestore path ${path}:`, error);
    throw error;
  }
}

/**
 * Sends contact form data to Firestore.
 * @param {object} formData - Object containing name, email, message.
 * @returns {Promise<void>} - A promise that resolves when data is sent.
 */
export async function submitContactForm(formData) {
  try {
    // Firestore এ ডেটা যোগ করা হয়েছে
    await addDoc(collection(db, 'contactSubmissions'), {
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
 * Submits newsletter subscription data to Firestore.
 * @param {string} email - The email address to subscribe.
 * @returns {Promise<void>} - A promise that resolves when data is sent.
 */
export async function subscribeNewsletter(email) {
  try {
    // Firestore এ ডেটা যোগ করা হয়েছে
    await addDoc(collection(db, 'newsletterSubscriptions'), {
      email: email,
      timestamp: serverTimestamp()
    });
    console.log("Newsletter subscribed successfully!");
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
}
