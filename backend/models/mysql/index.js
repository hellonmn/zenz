const { getSequelize } = require('../../config/database');

let models = {};

const initializeModels = () => {
  const sequelize = getSequelize();

  // Initialize all models
  models.User = require('./User')(sequelize);
  models.Trip = require('./Trip')(sequelize);
  models.Event = require('./Event')(sequelize);
  models.Booking = require('./Booking')(sequelize);
  models.EventBooking = require('./EventBooking')(sequelize);

  // Define relationships
  // User -> Bookings
  models.User.hasMany(models.Booking, {
    foreignKey: 'userId',
    as: 'bookings'
  });
  models.Booking.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Trip -> Bookings
  models.Trip.hasMany(models.Booking, {
    foreignKey: 'tripId',
    as: 'bookings'
  });
  models.Booking.belongsTo(models.Trip, {
    foreignKey: 'tripId',
    as: 'trip'
  });

  // User -> EventBookings
  models.User.hasMany(models.EventBooking, {
    foreignKey: 'userId',
    as: 'eventBookings'
  });
  models.EventBooking.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Event -> EventBookings
  models.Event.hasMany(models.EventBooking, {
    foreignKey: 'eventId',
    as: 'bookings'
  });
  models.EventBooking.belongsTo(models.Event, {
    foreignKey: 'eventId',
    as: 'event'
  });

  return models;
};

module.exports = { initializeModels, models };
