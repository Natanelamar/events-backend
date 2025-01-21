const { Op } = require('sequelize');
const Event = require('../models/Events');
const User = require('../models/User.js');
const UserPurchase = require('../models/UserPurchase.js');
const usersController = require('./usersController');
const { createEvent } = require('./eventsController');
const { createPurchase } = require('./purchasesController');

const bcrypt = require('bcrypt');

// Admin-specific create user function that doesn't generate tokens
const adminCreateUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);    
        if (newUser) {
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

const createFunctions = {
    'users': adminCreateUser,
    'events': createEvent,
    'sales': createPurchase
};

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


if (queryParam === 'sales') {
    // Map purchase_id to id for the frontend table
    infObj = infObj.map(purchase => ({
        ...purchase.toJSON(),
        id: purchase.purchase_id  // Add this field for the frontend table
    }));
}
    
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

exports.deleteData = async (req, res) =>{
    try {
        const modelsName = {
            'users': User,
            'events': Event,
            'sales': UserPurchase,
        }

      
        if (!modelsName[req.params.modelParam]) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid model parameter: ${req.params.modelParam}`
            });
        }

        const {modelParam} = req.params;
        const ids = req.body.ids || req.body.id; // Accept either ids or id from body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a valid array of IDs to delete'
            });
        }

        let primaryKey;
        if (modelParam === 'sales') {
            primaryKey = 'purchase_id';
        } else {
            primaryKey = 'id';
        }

        const result = await modelsName[modelParam].destroy({
            where: {
                [primaryKey]: {
                    [Op.in]: ids  
                }
            }
        });

        
        if (result === 0) {
            return res.status(404).json({
                status: 'warning',
                message: 'No records found with the provided IDs'
            });
        }

        res.status(200).json({
            status: 'success',
            message: `Successfully deleted ${result} records`
        });
    } catch (error) {
        console.error('Delete operation failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while deleting the records',
            error: error.message
        });
    }
}

exports.updateData = async (req, res) => {
    try {
        const modelsName = {
            'users': User,
            'events': Event,
            'sales': UserPurchase,
        }

        if (!modelsName[req.params.modelParam]) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid model parameter: ${req.params.modelParam}`
            });
        }

        const {modelParam} = req.params;
        const {ids, data} = req.body;
        console.log(req.params)
        console.log(req.body)
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a valid array of IDs to update'
            });
        }

        if (!data || typeof data !== 'object') {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide valid data to update'
            });
        }

        // Create a copy of the update data
        const updateData = { ...data };
        delete updateData.id;
        
        // For user updates, remove password field if it's not being changed
        if (modelParam === 'users' && updateData.password === undefined) {
            delete updateData.password;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No valid fields to update'
            });
        }

        // For user updates with password change
        if (modelParam === 'users' && updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const [updatedCount] = await modelsName[modelParam].update(updateData, {
            where: {
                id: {
                    [Op.in]: ids  
                }
            }
        });

        if (updatedCount === 0) {
            return res.status(404).json({
                status: 'warning',
                message: 'No records found with the provided IDs'
            });
        }

        // Fetch and return the updated records
        const updatedRecords = await modelsName[modelParam].findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        res.status(200).json({
            status: 'success',
            message: `Successfully updated ${updatedCount} records`,
            data: updatedRecords
        });
    } catch (error) {
        console.error('Update operation failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating the records',
            error: error.message
        });
    }
};

exports.createFunction = async (req, res) => {
    try {
        const { queryParam } = req.params;
        console.log('Received queryParam:', queryParam);
        console.log('Available functions:', Object.keys(createFunctions));
        console.log('Request body:', req.body);
        
        // Check if model exists
        if (!createFunctions[queryParam]) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid model parameter: ${queryParam}. Available models: ${Object.keys(createFunctions).join(', ')}`
            });
        }

        // Call the appropriate create function
        await createFunctions[queryParam](req, res);

    } catch (error) {
        console.error('Creation failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Creation failed',
            error: error.message
        });
    }
};