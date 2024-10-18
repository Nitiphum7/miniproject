const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3300;

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB (update the connection string to refer to the Docker service)
mongoose.connect('mongodb://mongodb:27017/sensorDB', {  // Change 'localhost' to 'mongodb'
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Define a schema for the fall detection data
const fallSchema = new mongoose.Schema({
    fall_status: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Create a model from the schema
const FallData = mongoose.model('FallData', fallSchema);

// Store the last received fall status
let lastFallStatus = {};

// Endpoint for handling incoming fall status
app.post('/fall-status', (req, res) => {
    lastFallStatus = req.body;  // Update the last fall status
    console.log(lastFallStatus);  // Log incoming data

    // Create a new fall status document
    const fallData = new FallData({
        fall_status: lastFallStatus.fall_status
    });

    // Save the document to the database
    fallData.save()
        .then(() => {
            console.log('Fall status saved:', lastFallStatus);
            res.send('Fall status received and saved to MongoDB');
        })
        .catch(error => {
            console.error('Error saving fall status:', error);
            res.status(500).send('Error saving fall status to MongoDB');
        });
});

// New endpoint to serve the last fall status
app.get('/fall-status', (req, res) => {
    res.json(lastFallStatus);  // Return the last fall status as JSON
});

// Example endpoint for serving index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
