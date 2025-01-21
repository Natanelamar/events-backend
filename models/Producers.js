const { DataTypes } = require('sequelize');
const sequelize = require('./sequlizeInstans'); // Import the shared Sequelize instance

const Producer = sequelize.define('Producer', {
    producer_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Producer must have a company name" },
            len: {
                args: [2, 100],
                msg: "Company name must be between 2 and 100 characters."
            }
        }
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Users', // Name of the User model table
            key: 'id'       // Foreign key references User model's primary key
        },
        unique: true      // Ensures a one-to-one relationship with User
    }
}, {
    tableName: 'producers', // Specify table name if needed
    timestamps: false       // Disable timestamps if not needed
});

module.exports = Producer;
