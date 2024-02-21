/*
 * User.js
 *
 * This file defines the schema for User information in the MongoDB database.
 *
 * @SnapBattle, 2024
 */

const mongoose = require("mongoose")
const bcrypt = require("bcrypt")


const User = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Your username is required"]
    },
    name: {
        type: String
    },
    email: {
        type: String,
        required: [true, "Your email is required"]
    },
    biography: {
      type: String,
      default: 'I love SnapBattle!'
    },
    password: {
        type: String,
        required: [true, "Your password is required"]
    },
    profilePicture: {
        type: String,
    },
    friends: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    groups: [{
        type: mongoose.Types.ObjectId,
        ref: 'Group'
    }],
    invites: [{
        type: mongoose.Types.ObjectId,
        ref: 'Group'
    }],
    blockedUsers: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    numWins: {
        type: Number
    }
})

const Session = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    token: {
        type: String,
    }
})


//Encrypt password before saving it to database
User.pre("save", async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)
    next();
})


const UserModel = mongoose.model("User", User);
const SessionModel = mongoose.model("Session", Session);

module.exports = {
    User: UserModel,
    Session: SessionModel
};