const { User } = require('../models/User.js');
const {generateToken} = require('../utils/generateToken.js');
const bcrypt = require('bcrypt');

exports.create = async (req, res) => {
    try {
        const newUser = await User.create(req.body);

        if (newUser) {
            const userObj = {
                name: newUser.firstName,
                lastname: newUser.lastName,
                email: newUser.email
            };

           console.log(userObj)
            generateToken(res, userObj);

           
            res.status(200).json({
                status: 'Success',
                data: {
                    name: newUser.firstName,
                    lastname: newUser.lastName,
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
                message: 'Internal server error'
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
                    name: user.firstName,
                    lastname: user.lastName,
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
                        name: user.firstName,
                        lastname: user.lastName,
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
