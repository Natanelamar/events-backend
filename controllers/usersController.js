const  User  = require('../models/User.js');
const UserPurchase = require('../models/UserPurchase.js');
const Event = require('../models/Events.js');
const {generateToken} = require('../utils/generateToken.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.create = async (req, res) => {
    try {
        const newUser = await User.create(req.body);    
          if (newUser) {
            const userObj = {
                firstName: newUser.firstName,
                email: newUser.email
            };

    
            generateToken(res, userObj);

           
            res.status(200).json({
                status: 'Success',
                data: {
                    firstName: newUser.firstName,
                    email: newUser.email
                }
            });
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({
                status: 'Failure',
                message: error.errors ? error.errors.map(e => e.message) : 'Validation error'
            });
        } else {
            res.status(500).json({
                status: 'Failure',
                message: error.message || 'Internal server error'
            });
        }
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email: email } });

        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const userObj = {
                    firstName: user.firstName,
                    email: user.email
                };

                try {
                    generateToken(res, userObj);  // Generate and set tokens
                } catch (tokenError) {
                    return res.status(500).json({
                        status: 'Failure',
                        message: 'Error generating token'
                    });
                }

                return res.status(200).json({
                    status: 'Success',
                    data: {
                        firstName: user.firstName,
                        email: user.email
                    }
                });
            } else {
                // Incorrect password
                return res.status(401).json({ status: 'Failure', message: 'Incorrect password' });
            }
        } else {
            // User not found
            return res.status(404).json({ status: 'Failure', message: 'User was not found' });
        }
    } catch (error) {
        // Handle unexpected server error
        return res.status(500).json({ status: 'Failure', message: 'Internal server error' });
    }
};


exports.isAuthonticatd = async (req, res) =>{
    try{
        const { jwtRefresh } = req.cookies;
    
        if(jwtRefresh){
            jwt.verify(jwtRefresh, process.env.SECRET_KEY,async (err, decode) =>{
                if (err){
                    
                     return res.status(403).json({message: err.message})
                } 
                
                const { email} = decode
                try {
                    const userData = await User.findOne({ where: { email: email } });
                    if (!userData) {
                        return res.status(404).json({ message: 'User not found' });
                    }
                    
                    req.user = {
                        id:userData.id,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        role: userData.role
                    };
                    console.log(req.user);
                    res.status(200).json({ message: 'success', user: req.user });
                } catch (err) {
                    console.log(err.message);
                    res.status(500).json({ message: 'Database error' });
                } 
               
            })

        }else{
            res.status( 401).json({message: 'No authentication token found'})
        }
      
    
}catch (err){
    console.log(err.message);
}
}

exports.logout = async (req,res ) =>{
    res.cookie("jwtRefresh", "", {
        httpOnly: true,
        expires: new Date(0),
      });
    res.cookie("jwtAccess", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ message: "User logged out" });
    
}

exports.getUserPurchases = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find all purchases for this user, including event details
        const purchases = await UserPurchase.findAll({
            where: { user_id: userId },
            include: [{
                model: Event,
                as: 'event',
                attributes: ['id', 'name', 'date', 'location', 'venueName', 'status', 'price','imageUrl']
            }]
        });

        if (!purchases || purchases.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No purchases found for this user'
            });
        }

        const events = purchases.map(purchase => purchase.event);

        res.status(200).json({
            status: 'success',
            data: events
        });
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user purchases'
        });
    }
};

