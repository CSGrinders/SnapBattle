/*
 * Group.js
 *
 * Defines the schema for Group information
 * in the MongoDB database,
 *
 * @SnapBattle, 2024
 */

const mongoose = require("mongoose")


const Group = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A Group name is required"]
    },
    maxUsers: {
        type: Number
    },
    timeStart: {
        type: String,
    },
    timeEnd: {
        type: String,
    },
    userList: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    adminUserID: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    timeToVote: {
        type: String
    },
    prompts: [{
        type: mongoose.Types.ObjectId,
        ref: 'Prompts'
    }]
})

module.exports = mongoose.model("Group", Group)
