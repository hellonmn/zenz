const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER // days
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discountedPrice: {
      type: DataTypes.DECIMAL(10, 2)
    },
    maxGroupSize: {
      type: DataTypes.INTEGER,
      defaultValue: 15
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'moderate', 'challenging'),
      defaultValue: 'moderate'
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    images: {
      type: DataTypes.JSON // Array of image URLs
    },
    coverImage: {
      type: DataTypes.STRING
    },
    inclusions: {
      type: DataTypes.JSON // Array of strings
    },
    exclusions: {
      type: DataTypes.JSON // Array of strings
    },
    itinerary: {
      type: DataTypes.JSON // Array of day objects
    },
    meetingPoint: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING
    },
    tags: {
      type: DataTypes.JSON // Array of strings
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    availableSeats: {
      type: DataTypes.INTEGER
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bookingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true
  });

  return Trip;
};
