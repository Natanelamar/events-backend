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
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,      // Quantity of tickets purchased
        allowNull: false,
        validate: {
            min: 1                    // Ensure at least 1 ticket is purchased
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2), // Total cost of the purchase
        allowNull: false,
        validate: {
            min: 0                    // Ensure total is not negative
        }
    }
});

module.exports = UserPurchase;
