const UserPurchase = require('../models/UserPurchase');
const Event = require('../models/Events');
const { where } = require('sequelize');
const { Sequelize } = require('sequelize');
const sequelize = require('../models/sequlizeInstans');
const paypal =  require('../utils/payPal');

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

        // Validate input parameters
        if (!event_id || !user_id || !quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid input parameters' });
        }

        // Fetch the event within the transaction
        const event = await Event.findByPk(event_id, { transaction });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
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
        event.ticketsSold += (quantity * 1);
        event.ticketsAvailable = event.ticketLimit - event.ticketsSold;

        // Save the updated event
        await event.save({ transaction });

        // Commit the transaction
        await transaction.commit();

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
    } catch (err) {
        // Rollback the transaction in case of error
        await transaction.rollback();
        console.error("Server Error:", err.message);
        return res.status(500).json({ message: 'Server error', error: err.message });
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

