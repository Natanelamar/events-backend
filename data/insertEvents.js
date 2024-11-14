const fs = require('fs');
const path = require('path');
const  Event = require('../models/Events'); // Adjust the path as needed

async function insertEvents() {
    try {
        // Read and parse the updated events file
        const eventsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'updatedEvents.json'), 'utf-8'));

        // const eventsWithAvailability = eventsData.map(event => ({
        //     ...event,
        //     ticketsAvailable: event.ticketLimit, // Initialize ticketsAvailable
        // }));

   

        // Insert data into the database
        await Event.bulkCreate(eventsData);

        console.log('Events successfully inserted into the database.');
    } catch (error) {
        console.error('Error inserting events:', error);
    }
}

module.exports = insertEvents;

