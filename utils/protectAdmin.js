const User = require("../models/User");
const jwt = require("jsonwebtoken");

const protectAdmin = async (req, res, next) => {
    const { jwtRefresh } = req.cookies;
    if (jwtRefresh) {
        jwt.verify(jwtRefresh, process.env.SECRET_KEY, async (err, decode) => {
            if (err) {
                return res.status(403).json({ message: err.message });
            }    
            const { email } = decode;
            try {
                const userData = await User.findOne({ where: { email: email } });
                if (!userData) {
                    return res.status(404).json({ message: "User not found" });
                }
                if (userData.role !== "admin") {
                    return res.status(403).json({ message: "Unauthorized access" });
                }
                next();
            } catch (err) {
                console.log(err.message);
                res.status(500).json({ message: "Database error" });
            }
        });
    } else {
        return res.status(401).json({ message: "Unauthorized access" });
    }
};

module.exports = protectAdmin;