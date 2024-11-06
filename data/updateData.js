const fs = require('fs');

const allEvents = JSON.parse(fs.readFileSync('./all_events.json', 'utf-8'))

 for(category in allEvents){
   allEvents[category].forEach(event => {
        event.price = `${Math.floor(Math.random() * (500 -  100 + 1)) + 100} USD` 
    });
}

fs.writeFileSync('updatedEvents.json', JSON.stringify(allEvents, null, 2));