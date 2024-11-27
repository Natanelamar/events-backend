
const Event = require('../models/Events');
const  User  = require('../models/User.js');
const UserPurchase = require('../models/UserPurchase.js');
exports.getAllInfo = async (req, res) =>{
    try{
        const modelsName = {
            'users': User,
            'events': Event,
            'sales': UserPurchase,
        }
    const {queryParam} = req.params;
    console.log(req.params)
    console.log(queryParam)
    let infObj; 
    if (queryParam in modelsName) {
         infObj = await modelsName[queryParam].findAll(); // Dynamically access the model
    
    } else {
        return res.status(400).json({
            message: 'Invalid query parameter. Use "users", "events", or "sales".'
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