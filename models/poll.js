var mongoose = require("mongoose");

//SCHEMA
var pollSchema = new mongoose.Schema({
    question: String,
    options: [String],
    isHidden: Boolean,
    ballots: [
        {
            type: mongoose.Schema.Types.ObjectId,              
            ref: "Ballot"
        }    
    ],
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Poll", pollSchema);

/*
Poll.create(
    {
        question: "What game mode?", 
        options: ["Arcade", "Quick Play", "Ranked"],
        date: "7/5/2017, 9:44:23 PM GMT"
    }, function(err, poll){
        if (err){
            console.log(err);
        } else{
            console.log("Created new poll: ");
            console.log(poll);
        }
});
*/
/* 
    var polls = [
       {question: "What video game?", options: ["Overwatch", "PUBG", "HoTS"], date: "7/2/2017, 2:23:03 AM GMT"},
       {question: "What board game?", options: ["Codenames", "Secret Hitler", "Catan"], date: "7/3/2017, 5:05:02 AM GMT"},
       {question: "What game mode?", options: ["Arcade", "Quick Play", "Ranked"], date: "7/5/2017, 9:44:23 PM GMT"}
    ];
*/