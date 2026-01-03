console.log('=== SIMPLE FIREBASE TEST ===\n');

// Test 1: Load packages separately
console.log('1. Loading packages separately...');

let admin;
try {
  admin = require('firebase-admin');
  console.log('✅ firebase-admin loaded');
} catch (err) {
  console.error('❌ firebase-admin:', err.message);
  process.exit(1);
}

let Storage;
try {
  Storage = require('@google-cloud/storage').Storage;
  console.log('✅ @google-cloud/storage loaded');
} catch (err) {
  console.error('❌ @google-cloud/storage:', err.message);
  process.exit(1);
}

// Test 2: Load service account
console.log('\n2. Loading service account...');
try {
  const fs = require('fs');
  const serviceAccountPath = require('path').join(__dirname, 'config', 'firebase-service-account.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ File not found:', serviceAccountPath);
    process.exit(1);
  }
  
  const rawData = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(rawData);
  console.log('✅ Service account loaded');
  console.log('   Project:', serviceAccount.project_id);
  console.log('   Email:', serviceAccount.client_email);
  
} catch (err) {
  console.error('❌ Service account error:', err.message);
  process.exit(1);
}

// Test 3: Initialize WITHOUT any extra options
console.log('\n3. Initializing Firebase...');
try {
  const serviceAccount = require('./config/firebase-service-account.json');
  
  // SIMPLEST initialization possible
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase app initialized');
  
  // Try to get storage bucket
  console.log('\n4. Testing storage...');
  try {
    const bucket = app.storage().bucket('cartifymarket.appspot.com');
    console.log('✅ Storage bucket created');
    
    // Simple operation
    bucket.getMetadata().then(([metadata]) => {
      console.log('✅ Bucket metadata retrieved');
      console.log('📦 Name:', metadata.name);
      console.log('📍 Location:', metadata.location);
      
      app.delete().then(() => {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
      });
      
    }).catch(storageErr => {
      console.error('❌ Storage operation failed:', storageErr.message);
      console.log('\n💡 Enable Storage in Firebase Console:');
      console.log('1. Go to Firebase Console');
      console.log('2. Select "cartifymarket" project');
      console.log('3. Click "Storage" in left menu');
      console.log('4. Click "Get Started"');
      app.delete();
      process.exit(1);
    });
    
  } catch (storageInitErr) {
    console.error('❌ Storage init error:', storageInitErr.message);
    app.delete();
    process.exit(1);
  }
  
} catch (initErr) {
  console.error('❌ Firebase init error:', initErr.message);
  console.error('Stack:', initErr.stack);
  process.exit(1);
}