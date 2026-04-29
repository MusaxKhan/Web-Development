const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/jwtAuth')
    .then(() => console.log("DB Connected"))
    .catch(err => console.log(err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));

app.listen(5000, () => console.log("Server running"));