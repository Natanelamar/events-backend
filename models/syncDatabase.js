const sequelize = require('./sequlizeInstans');
const { User, Producer, Event, UserPurchase } = require('./associations');

async function syncDatabase() {
    try {
        // Sync all models with the database
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models with the database:', error);
    }
}

module.exports = syncDatabase;
