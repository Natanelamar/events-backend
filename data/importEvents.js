const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: './.env' });

async function fetchEvents(category) {
    const response = await axios.get(`${process.env.BASE_URL}`, {
        params: {
            apikey: process.env.TICKETMASTER_API_KEY,
            classificationName: category,
            size: 50 // Fetch 50 events
        }
    });

    // Extract only the necessary properties for each event
    const events = response.data._embedded?.events?.map(event => ({
        id: event.id,
        name: event.name,
        venueName: event._embedded.venues[0].name,
        location: `${event._embedded.venues[0].address.line1}, ${event._embedded.venues[0].city.name}`,
        date: event.dates.start.localDate,
        startTime: event.dates.start.localTime,
        endTime: event.sales.public.endDateTime,
        ticketLimit: Math.floor(Math.random() * (5000 -  500 + 1)) + 500,
        price: event.priceRanges ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}` : `${Math.floor(Math.random() * (500 -  100 + 1)) + 100} USD`,
        category: category,
        genre: event.classifications[0].genre.name,
        imageUrl: event.images[0].url,
        status: event.dates.status.code,
        performers: event._embedded.attractions ? event._embedded.attractions.map(attraction => attraction.name).join(', ') : 'No performers listed',
        description: event.info || 'No description available',
        eventUrl: event.url
    })) || [];

    return events;
}

async function getAllEvents() {
    const categories = ['Sports', 'Music', 'Art', 'Comedy']; // Adjusted "Arts & Theater" for API compatibility
    const allEvents = {};

    for (const category of categories) {
        try {
            allEvents[category] = await fetchEvents(category);
        } catch (error) {
            console.error(`Error fetching events for ${category}:`, error.message);
        }
    }
    fs.writeFileSync('./data/music_events.json', JSON.stringify(allEvents, null, 2));
}

// Export the function for external use
module.exports = { getAllEvents };
