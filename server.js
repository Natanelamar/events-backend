require('dotenv').config();
const  connectToDb  = require('./utils/DBConnect.js');
// const syncData = require('./models/syncDatabase.js')
// const insertEvents = require('./data/insertEvents.js')
const { User, Producer, Event, UserPurchase } = require('./models/associations');
const app = require('./app.js')











const PORT = process.env.PORT || 3000;
connectToDb().then(() => {
  // syncData()
  // insertEvents()
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
});


