const UserModel = require("./User");

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async register() {
        const existingUser = await UserModel.findOne({ username: this.username });

        if (existingUser) {
            return { success: false, message: "User already exists" };
        }

        const user = new UserModel({
            username: this.username,
            password: this.password
        });

        await user.save();

        return { success: true, message: "User registered successfully" };
    }

    async login() {
        const user = await UserModel.findOne({
            username: this.username,
            password: this.password
        });

        if (!user) {
            return { success: false, message: "Invalid credentials" };
        }

        return { success: true, user };
    }
}

module.exports = User;