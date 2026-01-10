const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
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
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Trips',
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
    guestInfo: {
      type: DataTypes.JSON // { name, email, phone }
    },
    numberOfTravelers: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    travelerDetails: {
      type: DataTypes.JSON // Array of traveler objects
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    paymentDetails: {
      type: DataTypes.JSON
    },
    specialRequests: {
      type: DataTypes.TEXT
    },
    emergencyContact: {
      type: DataTypes.JSON // { name, phone, relation }
    },
    cancellationReason: {
      type: DataTypes.TEXT
    },
    adminNotes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  return Booking;
};
