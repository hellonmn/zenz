const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventBooking = sequelize.define('EventBooking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bookingReference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Events',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    bookingType: {
      type: DataTypes.ENUM('ticket', 'stall'),
      allowNull: false
    },
    guestInfo: {
      type: DataTypes.JSON // { name, email, phone }
    },
    numberOfTickets: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    stallDetails: {
      type: DataTypes.JSON // { businessType, stallSize }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'pending'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      defaultValue: 'pending'
    },
    adminNotes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  return EventBooking;
};
