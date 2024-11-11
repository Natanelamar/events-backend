const Event = require('../models/Events');

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
        const limit = 5; // Number of events per page
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

