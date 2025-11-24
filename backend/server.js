// backend/test-connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Atlas Connection...\n');
console.log('📝 Connection Details:');
console.log('   URI:', process.env.MONGO_URI?.replace(/:[^:@]+@/, ':****@'));
console.log('   Timeout: 20 seconds\n');

let progressInterval;
let dots = 0;

const testConnection = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    // Show progress dots
    progressInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      process.stdout.write('\r   ' + '.'.repeat(dots + 1) + '   ');
    }, 500);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });

    clearInterval(progressInterval);
    console.log('\r                    '); // Clear progress dots

    console.log('\n✅ ✅ ✅ SUCCESS! Connected to MongoDB Atlas! ✅ ✅ ✅\n');
    console.log('📊 Connection Information:');
    console.log('   Database Name:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Ready State:', mongoose.connection.readyState, '(1 = connected)');
    console.log('   Port:', mongoose.connection.port);
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('   Collections found:', collections.length);
    
    if (collections.length > 0) {
      console.log('   Existing collections:', collections.map(c => c.name).join(', '));
    } else {
      console.log('   No collections yet (database is new - this is normal!)');
    }

    console.log('\n🎉 Everything is working perfectly!');
    console.log('💡 You can now start your server with: npm start\n');
    
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    clearInterval(progressInterval);
    console.log('\r                    '); // Clear progress dots
    
    console.error('\n❌ ❌ ❌ CONNECTION FAILED! ❌ ❌ ❌\n');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    console.error('\n🔧 TROUBLESHOOTING STEPS:\n');
    
    if (error.message.includes('ETIMEOUT') || error.message.includes('timeout')) {
      console.error('⚠️  TIMEOUT ERROR - This usually means:');
      console.error('   1. Your IP is NOT whitelisted in MongoDB Atlas');
      console.error('   2. Firewall is blocking the connection');
      console.error('   3. VPN is interfering\n');
      console.error('🔧 FIX:');
      console.error('   → Go to: https://cloud.mongodb.com/');
      console.error('   → Click "Network Access" (left sidebar)');
      console.error('   → Click "+ ADD IP ADDRESS"');
      console.error('   → Click "ALLOW ACCESS FROM ANYWHERE"');
      console.error('   → Enter: 0.0.0.0/0');
      console.error('   → Click "Confirm"');
      console.error('   → WAIT 2-3 minutes then try again\n');
    } else if (error.message.includes('authentication failed') || error.message.includes('auth')) {
      console.error('⚠️  AUTHENTICATION ERROR - Wrong credentials');
      console.error('🔧 FIX:');
      console.error('   → Check username and password in .env file');
      console.error('   → Make sure there are no spaces');
      console.error('   → If password has special characters, URL encode them\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('⚠️  DNS ERROR - Cannot find MongoDB server');
      console.error('🔧 FIX:');
      console.error('   → Check your internet connection');
      console.error('   → Verify connection string in .env');
      console.error('   → Try using Google DNS (8.8.8.8)\n');
    }
    
    console.error('📋 Current Configuration:');
    console.error('   NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.error('   PORT:', process.env.PORT || 'not set');
    console.error('\n💡 Need more help? Check the MongoDB Atlas dashboard for cluster status.\n');
    
    process.exit(1);
  }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  clearInterval(progressInterval);
  console.log('\n\n👋 Test cancelled by user');
  process.exit(0);
});

testConnection();