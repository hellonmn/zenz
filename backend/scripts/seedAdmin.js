const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@tourism.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tourism.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      location: 'Headquarters',
      bio: 'System Administrator',
      joinDate: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: '2-digit', 
        year: 'numeric' 
      })
    });

    console.log('✅ Admin user created successfully');
    console.log('Email: admin@tourism.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();