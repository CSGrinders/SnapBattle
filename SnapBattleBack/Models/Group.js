/*
 * Group.js
 *
 * Defines the schema for Group information
 * in the MongoDB database,
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const mongoose = require("mongoose");


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
    adminName: {
        type: String,
        required: [true, "A admin is required"]
    },
    adminUserID: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    timeToVote: {
        type: String
    },
    prompts: [{
        type: mongoose.Types.ObjectId,
        ref: 'Prompt'
    }],
    messages: [{
        _id: {
            type: String,
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        user: {
            _id: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: false,
            },
            avatar: {
                type: String,
                required: false,
            },
        },
        replyMessage: {
            _id: {
                type: String,
                required: false,
            },
            name: {
                type: String,
                required: false,
            },
            text: {
                type: String,
                required: false,
            },
        },
    }]
})

module.exports = mongoose.model("Group", Group);
