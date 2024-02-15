/*
 * Post.js
 *
 * Defines the schema for Post and Comment information
 * in the MongoDB database,
 *
 * @SnapBattle, 2024
 */

const mongoose = require("mongoose")

const Post = new mongoose.Schema({
    pID: {
        type: mongoose.Types.ObjectId,
        ref: 'Prompt'
    },
    picture: {
        type: String,
        default: '' //Change for default location
    },
    likes: {
        type: Number
    },
    isWeeklyWinner: {
        type: Boolean
    },
    commentsAllowed: {
        type: Boolean
    },
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }],
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    time: {
        type: Date,
        default: new Date(),
    },
    dailyVotes: {
        type: Number
    },
    weeklyVotes: {
        type: Number
    }
})

const Comment = new mongoose.Schema({
    commentID: {
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    },
    userID: {
        type: mongoose.Types.ObjectId,
        required: [true, "A userID is required"],
        ref: 'User'
    },
    time: {
        type: Date,
        default: new Date(),
    },
    content: {
        type: String
    },
    likes: {
        type: Number
    },
    replyTo: {
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }
})

module.exports = mongoose.model("Post", Post)
module.exports = mongoose.model("Comment", Comment)
