var mongoose = require("mongoose");
var Poll = require("./models/poll");
var Ballot = require("./models/ballot");

var data = [
    {
        question: "What board game to play?",
        options: ["catan", "munchkin", "monopoly"],
        isHidden: false
    },
    {
        question: "What video game to play?",
        options: ["overwatch", "pubg", "HoTS", "LoL"],
        isHidden: false
    },
    {
        question: "What game mode?",
        options: ["arcade", "quick play"],
        isHidden: false
    },
];

function seedDB(){
    //Remove all polls
    Poll.remove({}, function(err){
         if (err){
            console.log(err);
        } 
        console.log("removed all polls!");
        Ballot.remove({}, function(err){
           if (err){
               console.log(err);
           } 
           console.log("removed all ballots!");
            //Add new polls
            data.forEach(function(seed){
               Poll.create(seed, function(err, data){
                 if(err){
                     console.log(err);
                 } else{
                     console.log("Seeded poll: " + seed.question);
                     //Add new results
    
                 }
               });
            });           
        });
    });  
    

    
}

module.exports = seedDB;