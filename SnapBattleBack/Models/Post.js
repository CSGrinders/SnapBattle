
/*
 * Post.js
 *
 * Defines the schema for Post and Comment information
 * in the MongoDB database,
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const mongoose = require("mongoose");

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
        type: Number,
        default: 0
    },
    isWeeklyWinner: {
        type: Boolean,
        default: false
    },
    commentsAllowed: {
        type: Boolean,
        default: true
    },
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }],
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    submissionNumber: {
        type: Number,
        default: 1
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
    userID: {
        type: mongoose.Types.ObjectId,
        required: [true, "A userID is required"],
        ref: 'User'
    },
    postID: {
        type: mongoose.Types.ObjectId,
        required: [true, "A postID is required"],
        ref: 'Post'
    },
    timestamp: {
        type: Date,
        default: new Date(),
    },
    body: {
        type: String
    },
    likes: {
        type: Number,
        default: 0
    },
    replyTo: {
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }
})

const PostModel = mongoose.model("Post", Post)
const CommentModel = mongoose.model("Comment", Comment)

module.exports = {
    Post: PostModel,
    Comment: CommentModel
};