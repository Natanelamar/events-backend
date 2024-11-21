
const Event = require('../models/Events');
const  User  = require('../models/User.js');

exports.getAllInfo = async (req, res) =>{
    try{
    const {queryParam} = req.params;
    console.log(req.params)
    console.log(queryParam)
    let infObj; // Define a variable in the outer scope
    if (queryParam === 'events') {
        infObj = await Event.findAll();
    } else if (queryParam === 'users') {
        infObj = await User.findAll();
    } else {
        return res.status(400).json({
            message: 'Invalid query parameter. Use "events" or "users".'
        });
    }
    res.status(200).json({
        message: 'success',
        data: infObj
    })
}
catch (err){
    console.log(err.message)
} 
}