const fs  = require('fs');

const allEvents = JSON.parse(fs.readFileSync('./all_events.json', 'utf-8'));

// Initialize an empty array to hold all events
let eventsList = [];

// Loop through each category and add events to the eventsList array
for (let category in allEvents) {
    allEvents[category].forEach(event => {
        // Update the price of each event
        event.price = `${Math.floor(Math.random() * (500 - 100 + 1)) + 100} USD`;
        eventsList.push(event);
    });
}

// Write the flattened events array to a new JSON file
fs.writeFileSync('updatedEvents.json', JSON.stringify(eventsList, null, 2));

console.log('All events have been combined and saved to updatedEvents.json');