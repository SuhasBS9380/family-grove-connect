import mongoose from 'mongoose';
import User from './models/User.js';
import Family from './models/Family.js';
import Post from './models/Post.js';
import Message from './models/Message.js';
import Event from './models/Event.js';
import Memory from './models/Memory.js';

// MongoDB Atlas connection string with your credentials
const MONGODB_URI = "mongodb+srv://avvamane:suhas123%40@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0";

const createDemoData = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data from all collections
    await User.deleteMany({});
    await Family.deleteMany({});
    await Post.deleteMany({});
    await Message.deleteMany({});
    await Event.deleteMany({});
    await Memory.deleteMany({});
    console.log('🧹 Cleared existing data from all collections');

    // Create demo family
    const demoFamily = new Family({
      name: "Demo Family",
      description: "A demo family for testing the Family Grove Connect app",
      familyCode: "DEMO123",
      admin: null // Will be set after creating admin user
    });

    // Create demo admin user
    const adminUser = new User({
      mobile: "9380102924",
      password: "123456", // Will be hashed automatically
      firstName: "Demo",
      lastName: "Admin",
      email: "admin@demo.com",
      role: "admin"
    });

    await adminUser.save();
    console.log('👑 Demo admin user created');

    // Update family with admin
    demoFamily.admin = adminUser._id;
    demoFamily.members = [{
      user: adminUser._id,
      relationship: "admin"
    }];
    
    await demoFamily.save();
    console.log('🏠 Demo family created');

    // Update admin user with family
    adminUser.familyId = demoFamily._id;
    await adminUser.save();

    // Create demo member user
    const memberUser = new User({
      mobile: "9380102925",
      password: "123456",
      firstName: "Demo",
      lastName: "Member",
      email: "member@demo.com",
      familyId: demoFamily._id,
      role: "member"
    });

    await memberUser.save();
    console.log('👤 Demo member user created');

    // Add member to family
    demoFamily.members.push({
      user: memberUser._id,
      relationship: "member"
    });
    
    await demoFamily.save();

    // Create demo posts
    const post1 = new Post({
      content: {
        text: "Welcome to Family Grove Connect! 🎉 This is our first family post. Let's start sharing our beautiful moments together!"
      },
      user: adminUser._id,
      family: demoFamily._id,
      likes: [{
        user: memberUser._id,
        likedAt: new Date()
      }],
      comments: []
    });
    await post1.save();

    const post2 = new Post({
      content: {
        text: "Thanks for setting up this amazing family platform! 💖 Looking forward to sharing more memories and staying connected."
      },
      user: memberUser._id,
      family: demoFamily._id,
      likes: [{
        user: adminUser._id,
        likedAt: new Date()
      }],
      comments: [{
        user: adminUser._id,
        text: "So happy to have you here! 😊",
        createdAt: new Date()
      }]
    });
    await post2.save();
    console.log('📝 Demo posts created');

    // Create demo messages
    const message1 = new Message({
      content: {
        text: "Hello everyone! Welcome to our family chat. 👋"
      },
      sender: adminUser._id,
      family: demoFamily._id,
      messageType: "text"
    });
    await message1.save();

    const message2 = new Message({
      content: {
        text: "Hi! Great to be connected with the family. This is awesome! 🥰"
      },
      sender: memberUser._id,
      family: demoFamily._id,
      messageType: "text"
    });
    await message2.save();
    console.log('💬 Demo messages created');

    // Create demo event
    const event1 = new Event({
      title: "Family Reunion 2025",
      description: "Annual family get-together with games, food, and lots of fun! Everyone is invited. 🎊",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      eventTime: "10:00 AM",
      location: {
        address: "Family Home - Living Room"
      },
      createdBy: adminUser._id,
      family: demoFamily._id,
      attendees: [
        { user: adminUser._id, status: "going" },
        { user: memberUser._id, status: "maybe" }
      ]
    });
    await event1.save();
    console.log('📅 Demo event created');

    // Create demo memory
    const memory1 = new Memory({
      title: "Our First Digital Family Photo 📸",
      description: "This marks the beginning of our digital family journey! Our first shared memory on Family Grove Connect.",
      memoryDate: new Date(),
      createdBy: adminUser._id,
      family: demoFamily._id,
      media: [{
        type: "image",
        url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=300&fit=crop&crop=faces",
        caption: "Beautiful family moment"
      }],
      tags: [{
        user: adminUser._id
      }, {
        user: memberUser._id
      }],
      likes: [{
        user: memberUser._id,
        likedAt: new Date()
      }]
    });
    await memory1.save();
    console.log('📷 Demo memory created');

    console.log('\n🎉 Demo data created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('┌─────────────────────────────────────┐');
    console.log('│ Admin: 9380102924 / 123456          │');
    console.log('│ Member: 9380102925 / 123456         │');
    console.log('│ Family Code: DEMO123                │');
    console.log('└─────────────────────────────────────┘\n');
    
    console.log('🗄️ Collections Created in MongoDB Atlas:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ✅ users      - User profiles and authentication       │');
    console.log('│ ✅ families   - Family groups and settings             │');
    console.log('│ ✅ posts      - Family posts and updates               │');
    console.log('│ ✅ messages   - Family chat messages                   │');
    console.log('│ ✅ events     - Family events and gatherings           │');
    console.log('│ ✅ memories   - Shared family memories and photos      │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    console.log('🌐 Database: family-grove-connect');
    console.log('🔗 Connected to: cluster0.liudbrx.mongodb.net');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo data:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the demo data creation
createDemoData();
