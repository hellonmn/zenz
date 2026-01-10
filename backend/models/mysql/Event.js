const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Event = sequelize.define('Event', {
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
    tagline: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    edition: {
      type: DataTypes.STRING
    },
    bannerImage: {
      type: DataTypes.STRING
    },
    brochureUrl: {
      type: DataTypes.STRING
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    venue: {
      type: DataTypes.JSON // { name, address, city, state, mapLink }
    },
    ticketPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    schedule: {
      type: DataTypes.JSON // Array of day schedules
    },
    highlights: {
      type: DataTypes.JSON // Array of highlight strings
    },
    contactInfo: {
      type: DataTypes.JSON // Array of contact objects
    },
    stallsAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    stallInfo: {
      type: DataTypes.JSON // { totalStalls, bookedStalls, prices }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'cancelled'),
      defaultValue: 'draft'
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    autoApproveBookings: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    maxAttendees: {
      type: DataTypes.INTEGER
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

  return Event;
};
