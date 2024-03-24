/*
 * Prompt.js
 *
 * This file defines the schema for Prompt
 * information in the MongoDB database.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const mongoose = require("mongoose");

const Prompt = new mongoose.Schema({
    prompt: {
        type: String
    },
    timeStart: {
        type: Date,
    },
    timeEnd: {
        type: Date
    },
    posts: [{
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    }],
    dailyWinnerID: {
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    }
})

module.exports = mongoose.model("Prompt", Prompt)
