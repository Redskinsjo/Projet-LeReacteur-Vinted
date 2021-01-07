const User = require("../models/User");

// Middleware checking if user is connected

const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        if (token) {
            const userFound = await User.findOne({ token }).select(
                "-hash -salt"
            );
            if (userFound) {
                req.user = userFound;
                return next();
            } else {
                res.status(401).json({
                    error: { message: "No user exist with this token" },
                });
            }
        } else {
            res.status(401).json({ error: { message: "Missing a token" } });
        }
    } catch (error) {
        res.status(401).json({ error: { message: error.message } });
    }
};

module.exports = isAuthenticated;
