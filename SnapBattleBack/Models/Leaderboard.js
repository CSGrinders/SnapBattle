/*
 * Leaderboard.js
 *
 * Defines the schema for leaderboard information
 * in the MongoDB database,
 *
 * @SnapBattle, 2023
 */

const mongoose = require("mongoose")

const Leaderboard = new mongoose.Schema({
    usersByPoints: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    points: [{
        type: [Number]
    }]
})

module.exports = mongoose.model("Leaderboard", Leaderboard)