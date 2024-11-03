const dotenv = require('dotenv');
const  connectToDb  = require('./utils/DBConnect.js');
const app = require('./app.js')



// Load environment variables
dotenv.config();







const PORT = process.env.PORT || 3000;
connectToDb().then(() => {
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
});


