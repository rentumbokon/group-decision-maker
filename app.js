var express = require("express");
var app = express();
var bodyParser = require("body-parser");
//var flash = require("connect-flash"); //future use for flash msgs
//var session = require("express-session"); //future use for flash msgs, 1 vote per pc 
var mongoose = require("mongoose");

var Poll = require("./models/poll");
var Ballot = require("./models/ballot");

var seedDB = require("./seeds");


seedDB();
mongoose.connect("mongodb://localhost/group-decision-maker", { useMongoClient: true });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/", function(req, res){ //landing page
    res.redirect('/polls');
});


//INDEX - Show all polls
app.get("/polls", function(req, res){
    //Get all polls from DB
    Poll.find({}, function(err, allPolls){
       if (err){
           console.log(err);
       } else{
           res.render("index", {polls:allPolls.reverse()});
       }
    });
});

//CREATE poll - Get data from form and add to polls array
app.post("/polls", function(req,res){
    var question = req.body.question.trim();
    if (question.charAt(question.length-1) != '?'){
        question += '?';
    }
    
    var options = req.body.options.split(/\r\n|\r|\n/g);
    options = options.map(function(str){ return str.trim() });
    options = options.filter(function(str){ return str.length > 0 }); //filter out empty options
    if (options.length > 10){
        options = options.slice(0,10); //limit to 10
    }
    var isHidden = Number(req.body.isHidden);
    var defaultResult = []
    var i;
    for (i = 0; i < options.length; i++){
        defaultResult.push(0);
    }
    if (question.length < 2 || options.length < 2){
        res.send("Stupid end user...");
        return;
    }
    var pollObj = {question: question, options: options, isHidden: isHidden}
    //Create new poll and save to DB
    Poll.create(pollObj, function(err, newPoll){
       if(err){
           console.log(err);
       } else{
            console.log("New Poll created: " + newPoll.question);
           res.redirect("/polls/" + newPoll._id);
       }
    });
});

//NEW - show form
app.get("/polls/new", function(req, res){
   res.render("new"); 
});

//SHOW poll
app.get("/polls/:id", function(req,res){
    Poll.findById(req.params.id, function(err, foundPoll){
        if (err){
            console.log(err);
        } else{
            res.render("show", {poll: foundPoll});
        }
    });
});

/*@@@@@@@@@@@@@@@@@@@@@@*/

//CREATE results- Get data from poll and add to results array
app.post("/polls/:id", function(req,res){
    Poll.findById(req.params.id, function(err, foundPoll){
        if (err){
            console.log(err);
            res.redirect("/polls");
        } else{
            var pollId = req.params.id;
            var stringVote = req.body.ballot; //get array
            var denormalizedVote = [];
            var normalizedVote = [];
            
            var sum = 0; 
            var i;
            for (i = 0; i < stringVote.length; i++){ //string array to num array
                denormalizedVote.push(Number(stringVote[i]));
            }
            //math to normalize to 100
            for (i = 0; i < denormalizedVote.length; i++){
                sum += denormalizedVote[i];
            }
            for (i = 0; i < denormalizedVote.length; i++){
                normalizedVote.push(round((denormalizedVote[i]*100)/sum, 1)) ;  //round
            }    
            var ballot = {id: pollId, vote: normalizedVote};
            
            //Create new poll and save to DB
            Ballot.create(ballot, function(err, newBallot){ //create ballot
               if(err){
                   console.log(err);
               } else{
                    //connect newBallot to foundPoll
                    foundPoll.ballots.push(newBallot);
                    foundPoll.save();
                    console.log("Vote entered for: " + foundPoll.question + ": " + newBallot.vote);
                    res.redirect("/polls/" + req.params.id + "/results");
               }
            });               
        }
    });
});

//SHOW poll results
app.get("/polls/:id/results", function(req,res){
    Poll.findById(req.params.id).populate("ballots").exec(function(err, foundPoll){
        if (err){
            console.log(err);
        } else{
            var numBallots = foundPoll.ballots.length;
            var numOptions = foundPoll.options.length;
            var currResults = [];
            foundPoll.options.forEach(function(option){
               currResults.push(0); 
            });
            var i;
            for (i = 0; i < numBallots; i++){
                var j;
                for (j = 0; j < numOptions; j++){
                    currResults[j] += foundPoll.ballots[i].vote[j];
                }
            }
            for (i = 0; i < numOptions; i++){
                var currResult = round(currResults[i]/numBallots, 1); //average
                if (isNaN(currResult)){
                    currResults[i] = 0; //if no votes
                } else{
                    currResults[i] = currResult;
                }
            }            
            res.render("results/show", {poll: foundPoll, currResults: currResults});
        }
    });
});




app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started!");
});


/*
** Misc functions
*/

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

