const Event = require('../models/Events');

exports.getByCategory = async (req, res) =>{
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


