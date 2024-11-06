const fs = require('fs');
const path = require('path');
const  Event = require('../models/Events'); // Adjust the path as needed

async function insertEvents() {
    try {
        // Read and parse the updated events file
        const eventsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'updatedEvents.json'), 'utf-8'));

        // const event = {
        //     "id": "G5dIZb8kECzK3",
        //     "name": "San Antonio Spurs vs Phoenix Suns",
        //     "venueName": "Moody Center ATX",
        //     "location": "2001 Robert Dedman Drive, Austin",
        //     "date": "2025-02-20",
        //     "startTime": "20:30:00",
        //     "endTime": "2025-02-21T03:30:00Z",
        //     "ticketLimit": 1364,
        //     "price": "336 USD",
        //     "category": "Sports",
        //     "genre": "Basketball",
        //     "imageUrl": "https://s1.ticketm.net/dam/a/455/612b13a2-822a-4cda-9920-098692170455_TABLET_LANDSCAPE_16_9.jpg",
        //     "status": "onsale",
        //     "performers": "San Antonio Spurs, Phoenix Suns",
        //     "description": "No description available",
        //     "eventUrl": "https://www.ticketmaster.com/san-antonio-spurs-vs-phoenix-suns-austin-texas-02-20-2025/event/3A006101A73B84D2"
        //   }
        

        // Insert data into the database
        await Event.bulkCreate(eventsData);

        console.log('Events successfully inserted into the database.');
    } catch (error) {
        console.error('Error inserting events:', error);
    }
}

module.exports = insertEvents;

