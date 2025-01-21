const { DataTypes } = require('sequelize');
const sequelize = require('./sequlizeInstans'); // Import your existing Sequelize instance

const UserPurchase = sequelize.define('UserPurchase', {
    purchase_id: {
        type: DataTypes.BIGINT,       // Use BIGINT for large integer values
        primaryKey: true,
        autoIncrement: true           // Auto-increment for unique identifier
    },
    event_id: {
        type: DataTypes.STRING,       // Use STRING if event_id is not numeric
        allowNull: false,
        references: {
            model: 'Events',          // Name of the Event model
            key: 'id'                 // Key in the Event model being referenced
        }
    },
    user_id: {
        type: DataTypes.BIGINT,       // Use BIGINT for user IDs if large
        allowNull: false,
        references: {
            model: 'Users',           // Name of the User model
            key: 'id'                 // Key in the User model being referenced
        }
    },
    purchase_date: {
        type: DataTypes.DATEONLY,     // Stores only the date
        allowNull: false,
        defaultValue:  DataTypes.NOW 
    }
   
});

module.exports = UserPurchase;
