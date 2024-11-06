const { DataTypes } = require('sequelize');
const sequelize = require('./sequlizeInstans');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    venueName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull:true

    },
    startTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    endTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ticketLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ticketsSold: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Start with 0 tickets sold
    },
    ticketsAvailable: {
        type: DataTypes.INTEGER,  
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    performers: {
        type: DataTypes.STRING,
        allowNull: true
    },  
    description: {
        type: DataTypes.TEXT,  // Use TEXT for potentially long descriptions
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: (event) => {
            // Set ticketsAvailable equal to ticketLimit if ticketsAvailable is missing
            if (event.ticketLimit !== undefined && event.ticketsAvailable == null) {
                event.ticketsAvailable = event.ticketLimit;
            }
        }
    }
});

module.exports = Event;
