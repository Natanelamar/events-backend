const UserPurchase = require('../models/UserPurchase');
const Event = require('../models/Events');
const User = require('../models/User'); // Add this line
const { where } = require('sequelize');
const { Sequelize } = require('sequelize');
const sequelize = require('../models/sequlizeInstans');
const paypal =  require('../utils/payPal');
const { sendPurchaseConfirmation } = require('../utils/emailService'); // Add this line

// exports.buyTicket = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { event_id, user_id, quantity } = req.params;
//         console.log(req.params);

//         // Fetch the event within the transaction
//         const event = await Event.findByPk(event_id, { transaction });
//         if (!event) {
//             return res.status(404).json({ message: 'Event not found' });
//         }

//         // Check if there are enough tickets available
//         if (event.ticketsAvailable < quantity) {
//             return res.status(400).json({ message: 'Not enough tickets available' });
//         }

//         // Create purchase records
//         const purchases = Array.from({ length: quantity }, () => ({
//             event_id,
//             user_id,
//             purchase_date: new Date(),
//         }));
//         const purchaseDetails = await UserPurchase.bulkCreate(purchases, { transaction });

//         // Update `ticketsSold` and calculate `ticketsAvailable`
//         event.ticketsSold += quantity;  // Add purchased quantity to tickets sold
//         event.ticketsAvailable = event.ticketLimit - event.ticketsSold;  // Calculate new available tickets
//         await event.save({ transaction });

//         // Commit the transaction if everything is successful
//         await transaction.commit();
//                 // Initiate PayPal payment
//                 const total = (event.price * quantity).toFixed(2); // Calculate total cost
//                 const paymentJson = {
//                     intent: "sale",
//                     payer: {
//                         payment_method: "paypal",
//                     },
//                     transactions: [
//                         {
//                             amount: {
//                                 total: total,
//                                 currency: "USD",
//                             },
//                             description: `Purchase of ${quantity} tickets for event ${event_id}`,
//                         },
//                     ],
//                     redirect_urls: {
//                         return_url: `http://localhost:3000/success`, // Change as needed
//                         cancel_url: `http://localhost:3000/cancel`, // Change as needed
//                     },
//                 };
        
//                 // Create payment
//                 paypal.payment.create(paymentJson, (err, payment) => {
//                     if (err) {
//                         console.error(err);
//                         return res.status(500).json({ message: 'Error initiating payment' });
//                     }
        
//                     // Redirect user to PayPal for approval
//                     const approvalUrl = payment.links.find(link => link.rel === "approval_url");
//                     if (approvalUrl) {
//                         res.status(200).json({ approvalUrl: approvalUrl.href });
//                     } else {
//                         res.status(500).json({ message: 'Approval URL not found' });
//                     }
//                 });

//         res.status(201).json({
//             message: 'Success',
//             data: purchaseDetails,
//             eventStatus: {
//                 ticketsSold: event.ticketsSold,
//                 ticketsAvailable: event.ticketsAvailable,
//             },
//         });
//     } catch (err) {
//         // Rollback the transaction in case of any error
//         await transaction.rollback();
//         console.log(err.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// };



exports.buyTicket = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { event_id, user_id, quantity } = req.params;
        console.log(req.params)

        // Fetch the event and user within the transaction
        const event = await Event.findByPk(event_id, { transaction });
        const user = await User.findByPk(user_id, { transaction });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate input parameters
        if (!event_id || !user_id || !quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid input parameters' });
        }

        // Check if there are enough tickets available
        if (event.ticketsAvailable < quantity) {
            return res.status(400).json({ message: 'Not enough tickets available' });
        }

        // Ensure price is a valid number
        const price = parseFloat(event.price); // Convert to a number if stored as a string
        if (isNaN(price)) {
            throw new Error("Invalid price format in the database");
        }

        // Create purchase records
        const purchases = Array.from({ length: quantity }, () => ({
            event_id,
            user_id,
            purchase_date: new Date(),
        }));
        const purchaseDetails = await UserPurchase.bulkCreate(purchases, { transaction });

        // Update `ticketsSold` and calculate `ticketsAvailable`
        event.ticketsSold += parseInt(quantity);  // Add purchased quantity to tickets sold
        event.ticketsAvailable = event.ticketLimit - event.ticketsSold;  // Calculate new available tickets
        await event.save({ transaction });

        // Commit the transaction
        await transaction.commit();

        // Send confirmation email
        try {
            console.log('Attempting to send confirmation email...');
            const emailResult = await sendPurchaseConfirmation(
                user.email,
                {
                    id: purchaseDetails[0].id,
                    quantity: quantity,
                    totalAmount: event.price * quantity
                },
                {
                    eventId: event.id,
                    title: event.name,
                    date: event.date,
                    location: event.location || 'TBA',
                    price: event.price
                }
            );
            console.log('Email sent successfully:', emailResult);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the purchase if email fails
        }

        // Calculate total cost for PayPal payment
        const total = (price * quantity).toFixed(2); // Ensure two decimal places

        // Prepare the PayPal payment object
        const paymentJson = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
            transactions: [
                {
                    amount: {
                        total: total, // Must be a string with two decimal places
                        currency: "USD", // Valid ISO currency code
                    },
                    description: `Purchase of ${quantity} tickets for event ${event_id}`,
                },
            ],
            redirect_urls: {
                return_url: "http://localhost:3000/success", // Update as needed
                cancel_url: "http://localhost:3000/cancel", // Update as needed
            },
        };

        // Create PayPal payment
        paypal.payment.create(paymentJson, (err, payment) => {
            if (err) {
                console.error("PayPal Error:", err.response?.details || err);
                return res.status(500).json({
                    message: 'Error initiating PayPal payment',
                    error: err.response?.details || err.message,
                });
            }

            // Find the approval URL and send it in the response
            const approvalUrl = payment.links.find(link => link.rel === "approval_url");
            if (approvalUrl) {
                return res.status(200).json({ approvalUrl: approvalUrl.href });
            } else {
                return res.status(500).json({ message: 'Approval URL not found' });
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'Failed to process purchase', error: error.message });
    }
};



exports.createPurchase = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { event_id, user_id, quantity = 1 } = req.body;

        // Validate required fields
        const requiredFields = ['event_id', 'user_id'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Check if event exists
        const event = await Event.findByPk(event_id, { transaction });
        if (!event) {
            await transaction.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        // Check if user exists
        const user = await User.findByPk(user_id, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if there are enough tickets available
        if (event.ticketsAvailable < quantity) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: `Not enough tickets available. Requested: ${quantity}, Available: ${event.ticketsAvailable}`
            });
        }

        // Create multiple purchase records
        const purchases = Array.from({ length: quantity }, () => ({
            event_id,
            user_id,
            purchase_date: new Date()
        }));

        const newPurchases = await UserPurchase.bulkCreate(purchases, { transaction });

        // Update event tickets
        event.ticketsSold += quantity;
        event.ticketsAvailable = event.ticketLimit - event.ticketsSold;
        await event.save({ transaction });

        // Calculate total price
        const totalPrice = parseFloat(event.price) * quantity;

        // Commit transaction
        await transaction.commit();

        // Send email confirmation
        try {
            await sendPurchaseConfirmation(
                user.email,
                {
                    id: newPurchases[0].id,
                    eventName: event.name,
                    quantity,
                    totalAmount: totalPrice,
                    purchaseDate: new Date(),
                    eventDate: event.date
                },
                {
                    eventId: event.id,
                    title: event.name,
                    date: event.date,
                    location: event.location,
                    price: event.price
                }
            );
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the purchase if email fails
        }

        res.status(200).json({
            status: 'success',
            message: 'Purchase created successfully',
            data: {
                purchases: newPurchases,
                eventStatus: {
                    ticketsSold: event.ticketsSold,
                    ticketsAvailable: event.ticketsAvailable
                },
                totalPrice
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Purchase creation failed:', error);
        
        if (error.name === 'SequelizeValidationError') {
            res.status(400).json({
                status: 'error',
                message: error.errors.map(e => e.message)
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Failed to create purchase',
                error: error.message
            });
        }
    }
};



exports.successPay = (req, res) => {
    const { paymentId, PayerID } = req.query;

    if (!paymentId || !PayerID) {
        return res.status(400).json({ message: 'Missing paymentId or PayerID' });
    }

    // Define the payment execution details
    const executePaymentJson = {
        payer_id: PayerID,
    };

    // Execute the payment
    paypal.payment.execute(paymentId, executePaymentJson, (err, payment) => {
        if (err) {
            console.error('Error executing PayPal payment:', err.response?.details || err.message);
            return res.status(500).json({ message: 'Error executing PayPal payment', error: err.response?.details || err.message });
        }

        // Respond with the payment details
        res.status(200).json({
            message: 'Payment successful',
            paymentDetails: payment,
        });
    });
};
