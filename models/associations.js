const User = require('./User');
const Producer = require('./Producers');
const Event = require('./Events');
const UserPurchase = require('./UserPurchase');

// 1. User and Producer Association (One-to-One)
// A User with the 'producer' role has one associated Producer profile
User.hasOne(Producer, { foreignKey: 'user_id', as: 'producerDetails' });
Producer.belongsTo(User, { foreignKey: 'user_id', as: 'producer' });

// 2. Producer and Event Association (One-to-Many)
// A Producer can create multiple Events
Producer.hasMany(Event, { foreignKey: 'producer_id', as: 'events' });
Event.belongsTo(Producer, { foreignKey: 'producer_id', as: 'producer' });

// 3. User and UserPurchase Association (One-to-Many)
// A User can have multiple UserPurchase records
User.hasMany(UserPurchase, { foreignKey: 'user_id', as: 'purchases' });
UserPurchase.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 4. Event and UserPurchase Association (One-to-Many)
// An Event can have multiple UserPurchase records
Event.hasMany(UserPurchase, { foreignKey: 'event_id', as: 'purchases' });
UserPurchase.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

module.exports = { User, Producer, Event, UserPurchase };
