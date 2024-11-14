const UserPurchase = require('../models/UserPurchase');
const Event = require('../models/Events');
const { where } = require('sequelize');
const { Sequelize } = require('sequelize');
const sequelize = require('../models/sequlizeInstans');

exports.buyTicket = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { event_id, user_id, quantity } = req.params;
        console.log(req.params);

        // Fetch the event within the transaction
        const event = await Event.findByPk(event_id, { transaction });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if there are enough tickets available
        if (event.ticketsAvailable < quantity) {
            return res.status(400).json({ message: 'Not enough tickets available' });
        }

        // Create purchase records
        const purchases = Array.from({ length: quantity }, () => ({
            event_id,
            user_id,
            purchase_date: new Date(),
        }));
        const purchaseDetails = await UserPurchase.bulkCreate(purchases, { transaction });

        // Update `ticketsSold` and calculate `ticketsAvailable`
        event.ticketsSold += quantity;  // Add purchased quantity to tickets sold
        event.ticketsAvailable = event.ticketLimit - event.ticketsSold;  // Calculate new available tickets
        await event.save({ transaction });

        // Commit the transaction if everything is successful
        await transaction.commit();

        res.status(201).json({
            message: 'Success',
            data: purchaseDetails,
            eventStatus: {
                ticketsSold: event.ticketsSold,
                ticketsAvailable: event.ticketsAvailable,
            },
        });
    } catch (err) {
        // Rollback the transaction in case of any error
        await transaction.rollback();
        console.log(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
