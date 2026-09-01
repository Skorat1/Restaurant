import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getMessaging, Messaging, getToken, onMessage } from "firebase/messaging";

// Firebase Configuration from Environment Variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely for SSR / Next.js
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth Instance
export const auth: Auth = getAuth(app);

// Firestore Instance
export const db: Firestore = getFirestore(app);

// Storage Instance
export const storage: FirebaseStorage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Messaging Instance (Browser-only)
let messaging: Messaging | null = null;
if (typeof window !== "undefined" && "Notification" in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging could not be initialized in this browser environment:", error);
  }
}
export { messaging };

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign out the current user
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Get current user's Firebase ID token for API requests
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await getIdToken(currentUser, forceRefresh);
}

// ============================================================================
// Firebase Storage Helpers
// ============================================================================

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param file The File/Blob to upload
 * @param path Destination path, e.g. 'dishes/dish-123.jpg' or 'avatars/uid-456.png'
 * @param onProgress Optional progress callback (0 - 100)
 * @returns Download URL of uploaded file
 */
export async function uploadFileToFirebase(
  file: File | Blob,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

// ============================================================================
// Firebase Cloud Messaging (FCM Push Notifications) Helpers
// ============================================================================

/**
 * Request notification permissions and register FCM device token
 * @returns FCM Registration Token string or null
 */
export async function requestFcmToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications are not supported in this browser.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Push notification permission denied by user.");
      return null;
    }

    let msgInstance = messaging;
    if (!msgInstance) {
      msgInstance = getMessaging(app);
    }

    let registration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      await navigator.serviceWorker.ready;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BF9xb73bhM6p6Lbzxit9XC7yalCAgcp6hP3hmk1QE26OYsQLATximMZ3VcYAF1vVuI0qxpX2poh6A8qqcoMrwaE";
    const currentToken = await getToken(msgInstance, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn("No FCM registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving FCM registration token:", error);
    return null;
  }
}

/**
 * Listen for foreground push messages
 * @param callback Handler receiving payload when message arrives in foreground
 */
export function onForegroundMessage(callback: (payload: unknown) => void): () => void {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}

export default app;
