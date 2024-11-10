const {DataTypes} = require('sequelize');
const sequelize = require('./sequlizeInstans.js');
const bcrypt = require('bcrypt');





  

const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "User must have a first name" },
            len: {
                args: [2, 50],
                msg: "First name must be between 2 and 50 characters."
            }
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "User must have a last name" },
            len: {
                args: [2, 50],
                msg: "Last name must be between 2 and 50 characters."
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: "This email is already in use."
        },
        validate: {
            notNull: { msg: "User must have an email address" },
            isEmail: { msg: "Must have a valid email address." }
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'producer', 'admin'), // Define allowed roles
        allowNull: false,
        defaultValue: 'user' // Set default role as 'user'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "User must have a password" },
            len: {
                args: [8, 100],
                msg: "Password must contain at least 8 characters long."
            },
            isStrongPassword(value) {
                if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/.test(value)) {
                    throw new Error("Password must contain uppercase, lowercase, number, and special character.");
                }
            }
        }
    }
});

// Hash password before saving
User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

module.exports = User;








