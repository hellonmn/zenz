const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Trip = require('../models/Trip');

dotenv.config();

// Sample trips data
const sampleTrips = [
  {
    placeName: "Amber Fort",
    city: "Jaipur",
    country: "India",
    flag: "🇮🇳",
    category: "Historical",
    description: "A magnificent fort with stunning architecture and rich history. Experience the grandeur of Rajputana era.",
    artImg: "/3.png",
    images: ["/historic_place.png"],
    rating: 4.9,
    reviews: 112,
    duration: "1 day",
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-01'),
    price: 49,
    currency: "USD",
    maxParticipants: 50,
    availableSlots: 50,
    status: "active",
    featured: true,
    popular: true
  },
  {
    placeName: "Jantar Mantar",
    city: "Jaipur",
    country: "India",
    flag: "🇮🇳",
    category: "Historical",
    description: "UNESCO World Heritage astronomical observatory.",
    artImg: "/2.png",
    images: ["/historic_place.png"],
    rating: 4.7,
    reviews: 98,
    duration: "Half day",
    price: 29,
    currency: "USD",
    maxParticipants: 40,
    availableSlots: 40,
    status: "active",
    popular: true
  },
  {
    placeName: "Golden Temple",
    city: "Amritsar",
    country: "India",
    flag: "🇮🇳",
    category: "Spiritual",
    description: "The holiest Gurdwara of Sikhism.",
    artImg: "/3.png",
    images: [],
    rating: 4.9,
    reviews: 215,
    duration: "2 days",
    price: 149,
    currency: "USD",
    maxParticipants: 30,
    availableSlots: 30,
    status: "active",
    featured: true,
    popular: true
  },
  {
    placeName: "Goa Beaches",
    city: "Goa",
    country: "India",
    flag: "🇮🇳",
    category: "Beaches",
    description: "Pristine beaches and vibrant nightlife.",
    artImg: "/4.png",
    images: [],
    rating: 4.8,
    reviews: 320,
    duration: "5 days",
    price: 499,
    currency: "USD",
    maxParticipants: 25,
    availableSlots: 25,
    status: "active",
    featured: true,
    popular: true
  },
  {
    placeName: "Taj Mahal",
    city: "Agra",
    country: "India",
    flag: "🇮🇳",
    category: "Historical",
    description: "One of the Seven Wonders of the World.",
    artImg: "/3.png",
    images: [],
    rating: 5.0,
    reviews: 450,
    duration: "1 day",
    price: 79,
    currency: "USD",
    maxParticipants: 60,
    availableSlots: 60,
    status: "active",
    featured: true,
    popular: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    // ===== SEED ADMIN USER =====
    console.log('📌 Seeding Admin User...');
    const adminExists = await User.findOne({ email: 'admin@tourism.com' });
    
    if (adminExists) {
      console.log('⚠️  Admin user already exists');
    } else {
      await User.create({
        name: 'Admin User',
        email: 'admin@tourism.com',
        password: 'admin123',
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
      console.log('   Email: admin@tourism.com');
      console.log('   Password: admin123');
    }

    // ===== SEED SAMPLE USER =====
    console.log('\n📌 Seeding Sample User...');
    const userExists = await User.findOne({ email: 'user@example.com' });
    
    if (userExists) {
      console.log('⚠️  Sample user already exists');
    } else {
      await User.create({
        name: 'John Doe',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
        location: 'New York, USA',
        bio: 'Travel enthusiast',
        joinDate: new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: '2-digit', 
          year: 'numeric' 
        })
      });
      console.log('✅ Sample user created successfully');
      console.log('   Email: user@example.com');
      console.log('   Password: user123');
    }

    // ===== SEED TRIPS =====
    console.log('\n📌 Seeding Sample Trips...');
    const tripCount = await Trip.countDocuments();
    
    if (tripCount > 0) {
      console.log(`⚠️  ${tripCount} trips already exist. Skipping...`);
    } else {
      const trips = await Trip.insertMany(sampleTrips);
      console.log(`✅ ${trips.length} sample trips created successfully\n`);
      
      console.log('Created trips:');
      trips.forEach(trip => {
        console.log(`   - ${trip.placeName}, ${trip.city} (${trip.category}) - $${trip.price}`);
      });
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@tourism.com / admin123');
    console.log('   User:  user@example.com / user123');
    console.log('\n⚠️  Please change default passwords in production!\n');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();