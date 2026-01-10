const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB models
const MongoUser = require('../models/User');
const MongoTrip = require('../models/Trip');
const MongoEvent = require('../models/Event');
const MongoBooking = require('../models/Booking');
const MongoEventBooking = require('../models/EventBooking');

// MySQL connection
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USERNAME,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize MySQL models
const MySQLUser = require('../models/mysql/User')(sequelize);
const MySQLTrip = require('../models/mysql/Trip')(sequelize);
const MySQLEvent = require('../models/mysql/Event')(sequelize);
const MySQLBooking = require('../models/mysql/Booking')(sequelize);
const MySQLEventBooking = require('../models/mysql/EventBooking')(sequelize);

// Define relationships
MySQLUser.hasMany(MySQLBooking, { foreignKey: 'userId', as: 'bookings' });
MySQLBooking.belongsTo(MySQLUser, { foreignKey: 'userId', as: 'user' });
MySQLTrip.hasMany(MySQLBooking, { foreignKey: 'tripId', as: 'bookings' });
MySQLBooking.belongsTo(MySQLTrip, { foreignKey: 'tripId', as: 'trip' });
MySQLUser.hasMany(MySQLEventBooking, { foreignKey: 'userId', as: 'eventBookings' });
MySQLEventBooking.belongsTo(MySQLUser, { foreignKey: 'userId', as: 'user' });
MySQLEvent.hasMany(MySQLEventBooking, { foreignKey: 'eventId', as: 'bookings' });
MySQLEventBooking.belongsTo(MySQLEvent, { foreignKey: 'eventId', as: 'event' });

// Migration functions
const migrateUsers = async () => {
  console.log('\n📦 Migrating Users...');
  const mongoUsers = await MongoUser.find({});
  console.log(`Found ${mongoUsers.length} users in MongoDB`);

  const idMap = new Map(); // Map MongoDB IDs to MySQL IDs

  for (const mongoUser of mongoUsers) {
    try {
      const mysqlUser = await MySQLUser.create({
        name: mongoUser.name,
        email: mongoUser.email,
        password: mongoUser.password, // Already hashed
        phone: mongoUser.phone,
        phoneNumber: mongoUser.phoneNumber,
        role: mongoUser.role,
        profilePicture: mongoUser.profilePicture,
        dateOfBirth: mongoUser.dateOfBirth,
        address: mongoUser.address,
        isVerified: mongoUser.isVerified,
        createdAt: mongoUser.createdAt,
        updatedAt: mongoUser.updatedAt
      });
      idMap.set(mongoUser._id.toString(), mysqlUser.id);
      console.log(`✓ Migrated user: ${mongoUser.email}`);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log(`⚠ User already exists: ${mongoUser.email}`);
        const existing = await MySQLUser.findOne({ where: { email: mongoUser.email } });
        idMap.set(mongoUser._id.toString(), existing.id);
      } else {
        console.error(`✗ Error migrating user ${mongoUser.email}:`, error.message);
      }
    }
  }

  return idMap;
};

const migrateTrips = async () => {
  console.log('\n📦 Migrating Trips...');
  const mongoTrips = await MongoTrip.find({});
  console.log(`Found ${mongoTrips.length} trips in MongoDB`);

  const idMap = new Map();

  for (const mongoTrip of mongoTrips) {
    try {
      // Generate slug from placeName
      const slug = (mongoTrip.placeName || mongoTrip.title || 'trip')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const mysqlTrip = await MySQLTrip.create({
        title: mongoTrip.placeName || mongoTrip.title || 'Untitled Trip',
        slug: slug,
        description: mongoTrip.description || mongoTrip.whatToExpect || '',
        destination: mongoTrip.city || mongoTrip.destination || mongoTrip.country || 'Unknown',
        duration: mongoTrip.duration ? parseInt(mongoTrip.duration) : 1,
        price: mongoTrip.price || 0,
        discountedPrice: mongoTrip.discountedPrice,
        maxGroupSize: mongoTrip.maxParticipants || mongoTrip.maxGroupSize || 15,
        difficulty: mongoTrip.difficulty || 'moderate',
        startDate: mongoTrip.startDate,
        endDate: mongoTrip.endDate,
        images: mongoTrip.images ? JSON.stringify(mongoTrip.images) : null,
        coverImage: mongoTrip.artImg || mongoTrip.coverImage,
        inclusions: mongoTrip.inclusions ? JSON.stringify(mongoTrip.inclusions) : null,
        exclusions: mongoTrip.exclusions ? JSON.stringify(mongoTrip.exclusions) : null,
        itinerary: mongoTrip.itinerary ? JSON.stringify(mongoTrip.itinerary) : null,
        meetingPoint: mongoTrip.meetingPoint,
        category: mongoTrip.category,
        tags: mongoTrip.tags ? JSON.stringify(mongoTrip.tags) : null,
        isFeatured: mongoTrip.featured || mongoTrip.isFeatured || false,
        isActive: mongoTrip.status === 'active' || mongoTrip.isActive || true,
        availableSeats: mongoTrip.availableSlots || mongoTrip.availableSeats,
        rating: mongoTrip.rating || 0,
        reviewCount: mongoTrip.reviews || mongoTrip.reviewCount || 0,
        bookingCount: mongoTrip.bookingCount || 0,
        viewCount: mongoTrip.viewCount || 0,
        createdAt: mongoTrip.createdAt,
        updatedAt: mongoTrip.updatedAt
      });
      idMap.set(mongoTrip._id.toString(), mysqlTrip.id);
      console.log(`✓ Migrated trip: ${mongoTrip.title}`);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log(`⚠ Trip already exists: ${mongoTrip.slug}`);
        const existing = await MySQLTrip.findOne({ where: { slug: mongoTrip.slug } });
        idMap.set(mongoTrip._id.toString(), existing.id);
      } else {
        console.error(`✗ Error migrating trip ${mongoTrip.title}:`, error.message);
      }
    }
  }

  return idMap;
};

const migrateEvents = async () => {
  console.log('\n📦 Migrating Events...');
  const mongoEvents = await MongoEvent.find({});
  console.log(`Found ${mongoEvents.length} events in MongoDB`);

  const idMap = new Map();

  for (const mongoEvent of mongoEvents) {
    try {
      const mysqlEvent = await MySQLEvent.create({
        title: mongoEvent.title,
        slug: mongoEvent.slug,
        tagline: mongoEvent.tagline,
        description: mongoEvent.description,
        edition: mongoEvent.edition,
        bannerImage: mongoEvent.bannerImage,
        brochureUrl: mongoEvent.brochureUrl,
        startDate: mongoEvent.startDate,
        endDate: mongoEvent.endDate,
        venue: mongoEvent.venue ? JSON.stringify(mongoEvent.venue) : null,
        ticketPrice: mongoEvent.ticketPrice,
        schedule: mongoEvent.schedule ? JSON.stringify(mongoEvent.schedule) : null,
        highlights: mongoEvent.highlights ? JSON.stringify(mongoEvent.highlights) : null,
        contactInfo: mongoEvent.contactInfo ? JSON.stringify(mongoEvent.contactInfo) : null,
        stallsAvailable: mongoEvent.stallsAvailable,
        stallInfo: mongoEvent.stallInfo ? JSON.stringify(mongoEvent.stallInfo) : null,
        status: mongoEvent.status,
        featured: mongoEvent.featured,
        autoApproveBookings: mongoEvent.autoApproveBookings,
        maxAttendees: mongoEvent.maxAttendees,
        bookingCount: mongoEvent.bookingCount,
        viewCount: mongoEvent.viewCount,
        createdAt: mongoEvent.createdAt,
        updatedAt: mongoEvent.updatedAt
      });
      idMap.set(mongoEvent._id.toString(), mysqlEvent.id);
      console.log(`✓ Migrated event: ${mongoEvent.title}`);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log(`⚠ Event already exists: ${mongoEvent.slug}`);
        const existing = await MySQLEvent.findOne({ where: { slug: mongoEvent.slug } });
        idMap.set(mongoEvent._id.toString(), existing.id);
      } else {
        console.error(`✗ Error migrating event ${mongoEvent.title}:`, error.message);
      }
    }
  }

  return idMap;
};

const migrateBookings = async (userIdMap, tripIdMap) => {
  console.log('\n📦 Migrating Bookings...');
  const mongoBookings = await MongoBooking.find({});
  console.log(`Found ${mongoBookings.length} bookings in MongoDB`);

  for (const mongoBooking of mongoBookings) {
    try {
      const userId = mongoBooking.user ? userIdMap.get(mongoBooking.user.toString()) : null;
      const tripId = tripIdMap.get(mongoBooking.trip.toString());

      if (!tripId) {
        console.log(`⚠ Skipping booking - trip not found`);
        continue;
      }

      await MySQLBooking.create({
        bookingReference: mongoBooking.bookingReference,
        tripId: tripId,
        userId: userId,
        guestInfo: mongoBooking.guestInfo ? JSON.stringify(mongoBooking.guestInfo) : null,
        numberOfTravelers: mongoBooking.numberOfTravelers,
        travelerDetails: mongoBooking.travelerDetails ? JSON.stringify(mongoBooking.travelerDetails) : null,
        totalAmount: mongoBooking.totalAmount,
        status: mongoBooking.status,
        paymentStatus: mongoBooking.paymentStatus,
        paymentMethod: mongoBooking.paymentMethod,
        paymentDetails: mongoBooking.paymentDetails ? JSON.stringify(mongoBooking.paymentDetails) : null,
        specialRequests: mongoBooking.specialRequests,
        emergencyContact: mongoBooking.emergencyContact ? JSON.stringify(mongoBooking.emergencyContact) : null,
        cancellationReason: mongoBooking.cancellationReason,
        adminNotes: mongoBooking.adminNotes,
        createdAt: mongoBooking.createdAt,
        updatedAt: mongoBooking.updatedAt
      });
      console.log(`✓ Migrated booking: ${mongoBooking.bookingReference}`);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log(`⚠ Booking already exists: ${mongoBooking.bookingReference}`);
      } else {
        console.error(`✗ Error migrating booking ${mongoBooking.bookingReference}:`, error.message);
      }
    }
  }
};

const migrateEventBookings = async (userIdMap, eventIdMap) => {
  console.log('\n📦 Migrating Event Bookings...');
  const mongoEventBookings = await MongoEventBooking.find({});
  console.log(`Found ${mongoEventBookings.length} event bookings in MongoDB`);

  for (const mongoEventBooking of mongoEventBookings) {
    try {
      const userId = mongoEventBooking.user ? userIdMap.get(mongoEventBooking.user.toString()) : null;
      const eventId = eventIdMap.get(mongoEventBooking.event.toString());

      if (!eventId) {
        console.log(`⚠ Skipping event booking - event not found`);
        continue;
      }

      await MySQLEventBooking.create({
        bookingReference: mongoEventBooking.bookingReference,
        eventId: eventId,
        userId: userId,
        bookingType: mongoEventBooking.bookingType,
        guestInfo: mongoEventBooking.guestInfo ? JSON.stringify(mongoEventBooking.guestInfo) : null,
        numberOfTickets: mongoEventBooking.numberOfTickets,
        stallDetails: mongoEventBooking.stallDetails ? JSON.stringify(mongoEventBooking.stallDetails) : null,
        totalAmount: mongoEventBooking.totalAmount,
        status: mongoEventBooking.status,
        paymentStatus: mongoEventBooking.paymentStatus,
        adminNotes: mongoEventBooking.adminNotes,
        createdAt: mongoEventBooking.createdAt,
        updatedAt: mongoEventBooking.updatedAt
      });
      console.log(`✓ Migrated event booking: ${mongoEventBooking.bookingReference}`);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log(`⚠ Event booking already exists: ${mongoEventBooking.bookingReference}`);
      } else {
        console.error(`✗ Error migrating event booking ${mongoEventBooking.bookingReference}:`, error.message);
      }
    }
  }
};

const seedAdminUser = async () => {
  console.log('\n👤 Seeding Admin User...');

  try {
    // Check if admin already exists
    const existingAdmin = await MySQLUser.findOne({ where: { email: 'admin@zenzawara.com' } });

    if (existingAdmin) {
      console.log('⚠ Admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('ThisIsNotMyPassword@1999', salt);

    // Create admin user
    await MySQLUser.create({
      name: 'Admin',
      email: 'admin@zenzawara.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('✓ Admin user created successfully');
    console.log('  Email: admin@zenzawara.com');
    console.log('  Password: ThisIsNotMyPassword@1999');
  } catch (error) {
    console.error('✗ Error seeding admin user:', error.message);
  }
};

// Main migration function
const migrate = async () => {
  try {
    console.log('🚀 Starting Migration from MongoDB to MySQL...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Connect to MySQL
    console.log('📡 Connecting to MySQL...');
    await sequelize.authenticate();
    console.log('✓ Connected to MySQL');

    // Sync MySQL database (create tables)
    console.log('🔧 Syncing MySQL database...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ MySQL tables synchronized');

    // Seed admin user first
    await seedAdminUser();

    // Migrate data
    const userIdMap = await migrateUsers();
    const tripIdMap = await migrateTrips();
    const eventIdMap = await migrateEvents();
    await migrateBookings(userIdMap, tripIdMap);
    await migrateEventBookings(userIdMap, eventIdMap);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  Users: ${userIdMap.size}`);
    console.log(`  Trips: ${tripIdMap.size}`);
    console.log(`  Events: ${eventIdMap.size}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    await mongoose.connection.close();
    await sequelize.close();
    console.log('\n👋 Database connections closed');
  }
};

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
