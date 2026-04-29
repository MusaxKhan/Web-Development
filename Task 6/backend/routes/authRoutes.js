const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SIGNUP
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashed, role });
    await user.save();

    res.send("User created");
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send("Wrong password");

    const token = jwt.sign(
        { id: user._id, role: user.role },
        "secretkey",
        { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
});

module.exports = router;