const admin = require('firebase-admin');
const path = require('path');

try {
  // Load service account
  const serviceAccount = require('./firebase-service-account.json');
  
  console.log('🔧 Initializing Firebase Admin...');
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "cartifymarket.appspot.com"
  });

  const bucket = admin.storage().bucket();
  
  console.log('✅ Firebase Admin initialized successfully');
  console.log('📦 Storage bucket:', bucket.name);
  
  module.exports = { admin, bucket };
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}