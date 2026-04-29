const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).send("No token");

    jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) return res.status(401).send("Invalid token");
        req.user = decoded;
        next();
    });
};

exports.isOwner = (req, res, next) => {
    if (req.user.role !== 'owner')
        return res.status(403).send("Owner access only");
    next();
};