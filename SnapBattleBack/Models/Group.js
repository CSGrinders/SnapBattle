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
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        points: {
            type: Number,
            default: 0
        },
        winStreak: {
            type: Number,
            default: 0
        }
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
    weeklyVotingDay: {
        type: Number
    },
    lastPeriod: {
        type: Date,
        default: new Date()
    },
    weeklyWinners: [{
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    }],
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
