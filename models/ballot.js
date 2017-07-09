var mongoose = require("mongoose");

//SCHEMA
var ballotSchema = new mongoose.Schema({
    PollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll"
    },
    vote: [Number],
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Ballot", ballotSchema);
