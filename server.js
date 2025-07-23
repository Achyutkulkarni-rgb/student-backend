const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://achyutk574:QtCvkgBjz8ggRu2R@cluster0.ij0fg3x.mongodb.net/studentAuthDB?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const User = mongoose.model('User', UserSchema);

// Order Schema
// Order Schema
const OrderSchema = new mongoose.Schema({
    username: String,
    items: [
        {
            name: String,
            price: Number,
        }
    ],
    total: Number,
    gst: Number,
    grandTotal: Number,
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

// Buy Now API
app.post('/order', async (req, res) => {
    const { username, items, total, gst, grandTotal } = req.body;
    try {
        const newOrder = new Order({
            username,
            items,
            total,
            gst,
            grandTotal
        });
        await newOrder.save();
        res.send({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).send({ success: false, message: 'Order failed.' });
    }
});


// Signup API
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.send({ message: 'Signup successful!' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).send({ message: 'Signup failed.' });
    }
});

// Login API
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.send({ success: false, message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.send({ success: true, message: 'Login successful!' });
        } else {
            res.send({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send({ message: 'Login failed.' });
    }
});

// Buy API - Save order to MongoDB
app.post('/order', async (req, res) => {
    const { username, items, total, gst, grandTotal } = req.body;
    try {
        const order = new Order({
            username,
            items,
            total,
            gst,
            grandTotal
        });
        await order.save();
        res.send({ message: 'Order placed successfully!' });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).send({ message: 'Failed to place order.' });
    }
});

// Start server
app.listen(5000, () => {
    console.log('Backend running at http://localhost:5000');
});
