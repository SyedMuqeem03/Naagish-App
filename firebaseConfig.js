// Add this to your Firebase configuration file

import { initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Replace the existing Firestore initialization with this
const db = initializeFirestore(app, {
  cacheSizeBytes: 5242880 // 5MB cache size
});

// Try to enable persistence
try {
  enableIndexedDbPersistence(db);
} catch (err) {
  console.error("Persistence error:", err);
}

// Then export as usual
export { auth, db };