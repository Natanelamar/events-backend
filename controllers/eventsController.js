const { json } = require('sequelize');
const Event = require('../models/Events');
const crypto = require('crypto');

// Generate a unique ID function
const generateId = () => crypto.randomBytes(8).toString('hex');

exports.getTreeFromCategory = async (req, res) =>{
    try{
        const {category} = req.query;
        allEvents = await Event.findAll({
            where: {category: category}, 
            limit: 3});
        if(allEvents){
            res.status(200).json({
                message: 'success',
            data: allEvents
            })
        }else{
        res.status(400).json({message: "Can't find events"})
        }
    }catch(err){
        res.status(err.status)
        console.log(err.message)
    }

 


}


exports.getByCategory = async (req, res) => {
    try {
        const { category, page = 0 } = req.query; // Default page to 0 if not provided
        const limit = 8; // Number of events per page
        const offset = page * limit; // Calculate the offset

        // Get the total count of events in this category
        const totalEvents = await Event.count({ where: { category } });

        // Retrieve the events for the current page
        const allEvents = await Event.findAll({
            where: { category },
            offset,
            limit
        });

        const start = offset + 1;
        const end = Math.min(offset + limit, totalEvents);

        if (allEvents.length > 0) {
            res.status(200).json({
                message: 'Success',
                data: allEvents,
                pagination: {
                    total: totalEvents,
                    currentPage: parseInt(page),
                    limit,
                    range: `${start}-${end}` // Shows the range of events on the current page
                }
            });
        } else {
            res.status(404).json({ message: "No events found in this category." });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getEventById = async (req, res) =>{
    try{

       const {eventId} = req.params
      const  eventObj = await Event.findByPk(eventId);
        if (!eventObj){
           return res.status(404).json({message: "Event not found"})
        }
      return  res.status(200).json({message: 'success', data: eventObj});


    }catch (err){
        console.error("Error fetching event:", err);
       return res.status(500).json({message: err.message});

    }
}

exports.createEvent = async (req, res) => {
    try {
        // Generate unique ID
        const eventId = generateId(); 

        // Format the date to ISO format (YYYY-MM-DD)
        let formattedDate = null;
        if (req.body.date) {
            const [day, month, year] = req.body.date.split('/');
            formattedDate = `${year}-${month}-${day}`;
        }

        // Prepare event data with the generated ID
        const eventData = {
            id: eventId,
            ...req.body,
            date: formattedDate,
            ticketLimit: parseInt(req.body.ticketLimit),
            ticketsSold: 0,
            ticketsAvailable: parseInt(req.body.ticketLimit)
        };

        // Validate required fields
        const requiredFields = [
            'name', 
            'venueName', 
            'location', 
            'ticketLimit',
            'price',
            'category',
            'genre',
            'status'
        ];

        const missingFields = requiredFields.filter(field => !eventData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Create the event
        const newEvent = await Event.create(eventData);

        if (newEvent) {
            res.status(200).json({
                status: 'success',
                message: 'Event created successfully',
                data: newEvent
            });
        }
    } catch (error) {
        console.error('Event creation failed:', error);
        if (error.name === 'SequelizeValidationError') {
            res.status(400).json({
                status: 'error',
                message: error.errors.map(e => e.message)
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Failed to create event',
                error: error.message
            });
        }
    }
};
