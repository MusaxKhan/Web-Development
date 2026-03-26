var express = require('express');
var app = express();
const userRoute = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Create a new MongoClient
const client = new MongoClient(url);

app.get('/', function (req, res) {

    // Use connect method to connect to the Server
    client.connect(function (err) {
        assert.equal(null, err);

        const db = client.db(dbName);
        console.log("Connected successfully to DB server");

        insertUser(db, function () {
            findUser(db, function () {
                client.close();
                res.send("Operations completed");
            });
        });

    });

});


// Insert function
function insertUser(db, callback) {
    const collection = db.collection('users');

    collection.insertOne({ name: "Ali", age: 22 }, function (err, result) {
        assert.equal(err, null);
        console.log("User inserted");
        callback();
    });
}


// Find function
function findUser(db, callback) {
    const collection = db.collection('users');

    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("Users found:", docs);
        callback();
    });
}


// Start server
app.listen(3000, function () {
    console.log("Server running on port 3000");
});
