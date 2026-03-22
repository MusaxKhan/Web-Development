const mongoose = require("./db");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const UserModel = mongoose.model("users", userSchema);

class User {

    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async register() {

        const user = new UserModel({
            username: this.username,
            password: this.password
        });

        await user.save();

        return "User registered successfully";
    }

    async login() {

        const user = await UserModel.findOne({
            username: this.username,
            password: this.password
        });

        if (user) {
            return user;
        }

        return null;
    }
}

module.exports = User;
