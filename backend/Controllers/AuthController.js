// controllers/authController.js
const Manager = require('../Schemas/Manager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const manager = await Manager.findOne({ email });
        if (!manager) {
            return res.status(401).json({ message: "Incorrect Email" });
        }

        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) {
            console.log(manager.password, password);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "JWT secret not configured" });
        }

        const token = jwt.sign(
            { id: manager._id, email: manager.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, message: "Login successful" });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
