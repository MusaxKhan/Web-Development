const router = require('express').Router();
const { verifyToken, isOwner } = require('../middleware/auth');

// ANY LOGGED USER
router.get('/profile', verifyToken, (req, res) => {
    res.send("Protected Profile Data");
});

// OWNER ONLY
router.post('/add', verifyToken, isOwner, (req, res) => {
    res.send("Data inserted by owner");
});

module.exports = router;