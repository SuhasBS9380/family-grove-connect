import { MongoClient, ServerApiVersion } from 'mongodb';

// MongoDB Atlas connection string with your credentials
const uri = "mongodb+srv://avvamane:suhas123%40@cluster0.liudbrx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB Atlas!");
    
    // List existing databases
    console.log('\n📁 Available databases:');
    const databasesList = await client.db().admin().listDatabases();
    databasesList.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check family-grove-connect database
    const familyDb = client.db("family-grove-connect");
    console.log('\n🗂️ Collections in family-grove-connect database:');
    
    try {
      const collections = await familyDb.listCollections().toArray();
      if (collections.length === 0) {
        console.log('   📝 No collections found. Run createDemoData.js to create collections.');
      } else {
        for (const collection of collections) {
          const count = await familyDb.collection(collection.name).countDocuments();
          console.log(`   - ${collection.name} (${count} documents)`);
        }
      }
    } catch (error) {
      console.log('   📝 Database not found. Will be created when first data is inserted.');
    }
    
    console.log('\n🎯 Connection Details:');
    console.log(`   Host: cluster0.liudbrx.mongodb.net`);
    console.log(`   Database: family-grove-connect`);
    console.log(`   User: avvamane`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if IP address is whitelisted in MongoDB Atlas');
    console.error('   2. Verify username and password are correct');
    console.error('   3. Ensure network connectivity');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('\n🔒 Connection closed.');
  }
}

// Run the connection test
testConnection().catch(console.dir);
