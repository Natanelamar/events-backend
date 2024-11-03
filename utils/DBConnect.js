const {sequelize} = require ('../models/User')

async function connectToDb() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync();  // Sync models with database
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = connectToDb;