const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load the .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
  exposedHeaders: ['Content-Disposition'],
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI); 
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Manual seed route - only run when you want to seed
app.post('/api/v1/seed', async (req, res) => {
    try {
        const seedManager = require('./Scripts/seedManager');
        await seedManager();
        res.json({ message: 'Seeding completed successfully' });
    } catch (err) {
        console.error('Error running seedManager:', err);
        res.status(500).json({ error: 'Seeding failed', details: err.message });
    }
});

app.use('/api/v1/auth', require('./Routes/AuthRoutes'));
app.use('/api/v1/students', require('./Routes/StudentRoutes'));
app.use('/api/v1/fees', require('./Routes/FeeRoutes'));
app.use('/api/v1/result', require('./Routes/ResultRoutes'));

// Start server
const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`);
    console.log(`To seed manager, make a POST request to: http://localhost:${PORT}/api/v1/seed`);
});
