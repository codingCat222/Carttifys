const { bucket } = require('./config/firebase');

async function testFirebase() {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    // 1. Check if bucket exists
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log('❌ Bucket not found - need to enable Storage');
      console.log('🔧 Go to: Firebase Console → Storage → Get Started');
      return false;
    }
    
    console.log('✅ Bucket exists:', bucket.name);
    
    // 2. Try to list files (simple operation)
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log(`📁 Found ${files.length} file(s)`);
    
    // 3. Test upload (optional - small test)
    console.log('📤 Testing upload...');
    const testFileName = `test-${Date.now()}.txt`;
    const testFile = bucket.file(testFileName);
    
    await testFile.save('Firebase test connection', {
      metadata: { contentType: 'text/plain' }
    });
    
    console.log('✅ Test file uploaded');
    
    // 4. Clean up
    await testFile.delete();
    console.log('🗑️ Test file cleaned up');
    
    console.log('\n🎉 Firebase Storage is working!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 404) {
      console.log('💡 Enable Storage in Firebase Console:');
      console.log('1. Go to Firebase Console');
      console.log('2. Select "cartifymarket" project');
      console.log('3. Click "Storage" in left menu');
      console.log('4. Click "Get Started"');
      console.log('5. Choose "Start in test mode"');
    }
    
    return false;
  }
}

testFirebase();