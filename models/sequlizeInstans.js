const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',  // Adjust dialect as per your database
    logging: false        // Optional: Disable logging for cleaner output
});


module.exports = sequelize;