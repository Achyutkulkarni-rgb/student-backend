// ========================= BACKEND (server.js) =========================

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = express.Router();


const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://achyutk574:QtCvkgBjz8ggRu2R@cluster0.ij0fg3x.mongodb.net/studentAuthDB?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String
});
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
    username: String,
    address: String,
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

app.post('/profile', async (req, res) => {
    const { username, name, email } = req.body;
    try {
        await User.updateOne({ username }, { name, email });
        res.send({ success: true, message: 'Profile updated!' });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).send({ success: false, message: 'Profile update failed.' });
    }
});

router.post("/order", async (req, res) => {
  try {
    const { username, items, total, gst, grandTotal, address } = req.body;

    const newOrder = new Order({
      username,
      items,
      total,
      gst,
      grandTotal,
      address, // ✅ save address
      date: new Date(),
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to place order" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
