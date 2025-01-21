const nodemailer = require('nodemailer');

// Add debug logging for environment variables
console.log('Email Configuration:', {
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    user: "f86b1a77e6ab61" ? '✓ Set' : '✗ Missing',
    pass: "aafd417e45c1a2" ? '✓ Set' : '✗ Missing'
});

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "f86b1a77e6ab61",
        pass: "aafd417e45c1a2"
    }
});

const sendPurchaseConfirmation = async (userEmail, purchaseDetails, eventDetails) => {
    try {
        console.log('Attempting to send email to:', userEmail);
        console.log('Purchase Details:', purchaseDetails);
        console.log('Event Details:', eventDetails);

        const mailOptions = {
            from: "f86b1a77e6ab61",
            to: userEmail,
            subject: 'Purchase Confirmation - Event Ticket',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Thank you for your purchase!</h2>
                    <p>Your ticket purchase has been confirmed.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #444;">Event Details:</h3>
                        <p><strong>Event ID:</strong> ${eventDetails.eventId}</p>
                        <p><strong>Event:</strong> ${eventDetails.title}</p>
                        <p><strong>Date:</strong> ${new Date(eventDetails.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${new Date(eventDetails.date).toLocaleTimeString()}</p>
                        <p><strong>Location:</strong> ${eventDetails.location}</p>
                        <p><strong>Price per Ticket:</strong> $${eventDetails.price}</p>
                    </div>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <h3 style="color: #444;">Purchase Details:</h3>
                        <p><strong>Order ID:</strong> ${purchaseDetails.id}</p>
                        <p><strong>Quantity:</strong> ${purchaseDetails.quantity}</p>
                        <p><strong>Total Amount:</strong> $${purchaseDetails.totalAmount.toFixed(2)}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>
                    <p style="color: #666;">Best regards,<br>Your Events Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendPurchaseConfirmation
};
