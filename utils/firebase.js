// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase Config - Project: bk-library-e0771
// Database URL: https://bk-library-e0771-default-rtdb.asia-southeast1.firebasedatabase.app
const firebaseConfig = {
    apiKey: "AIzaSyBo7NA8RBjKV2E2GsXpoAIpsbMOF3WAlGk",
    authDomain: "bk-library-e0771.firebaseapp.com",
    databaseURL: "https://bk-library-e0771-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bk-library-e0771",
    storageBucket: "bk-library-e0771.firebasestorage.app",
    messagingSenderId: "1095539599968",
    appId: "1:1095539599968:web:5d52d8461e994a5bfef105",
    measurementId: "G-NQG77CC0QH" // Optional: For Analytics (not needed for Realtime Database)
};

// Database Secret (dùng cho backend/security rules, KHÔNG dùng trong client app)
// Secret: IhcgbPBhTFqdXSa21zRtI5C649AEQLkt1Bd0UXCu

// Initialize Firebase
let app;
let database;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('[Firebase] Initialized successfully');
} catch (error) {
    console.error('[Firebase] Initialization error:', error);
}

export { app, database };

