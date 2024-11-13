const UserPurchase = require('../models/UserPurchase');
const Event = require('../models/Events');
const { where } = require('sequelize');

exports.buyTicket = async (req, res) =>{
    try{
        const { event_id, user_id, quantity } = req.body;

        const purchases = Array.from({ length: quantity }, () => ({
            event_id,
            user_id,
            purchase_date: new Date(), // Current date
        }));
        const purchasDetails = await UserPurchase.bulkCreate(purchases);
        

        // const purchasDetails = await UserPurchase.create(req.body);
        res.status(201).json({
            message: 'Success',
            data: purchasDetails
        })

    }catch (err){
        console.log(err.message);
    }
}