/*
 * User.js
 *
 * This file defines the schema for User information in the MongoDB database
 * @SnapBattle, 2023
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
        default: '' //Change for default location
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


//Encrypt password before saving it to database
User.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 12)
})

module.exports = mongoose.model("User", User)