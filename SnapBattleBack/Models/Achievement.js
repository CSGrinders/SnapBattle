const mongoose = require('mongoose');

const Achievement = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Achievement", Achievement)