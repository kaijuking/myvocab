/*Required NPM Modules*/
var express = require('express');
var path = require('path');
var jsonParser = require('body-parser').json();
var cookieParser = require('cookie-parser');
var app = express();

/*Required Data Objects*/
var allUsers = require('./user.js');
var allDecks = require('./decks.js');
// var flashCards = require('./flashcards.js');

var defaultMiddleware = express.static('./public');
app.use(defaultMiddleware);

app.post('/login', jsonParser, function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var result = false;
  var userinfo = {};
  var userdecks = [];

  for(var i = 0; i < allUsers.length; i++) {
    if(allUsers[i].username === username && allUsers[i].password === password) {
      result = true;
      userinfo = allUsers[i];
    }
  }

  for(var i = 0; i < allDecks.length; i++) {
    if(allDecks[i].username === username) {
      userdecks.push(allDecks[i]);
    }
  }

  if(result != false) {
    res.json([userinfo, userdecks]);
  } else {
    res.send(result);
  }
});

app.post('/loadDeck', jsonParser, function(req, res) {
  console.log(req.body);
  var username = req.body.username;
  var deckname = req.body.deckname;

  var result = false;
  var userdecks = [];

  for(var i = 0; i < allDecks.length; i++) {
    if(allDecks[i].username === username) {
      result = true;
      userdecks.push(allDecks[i]);
    }
  }

  if(result != false) {
    res.json(userdecks);
  } else {
    res.send(result);
  }
});

app.listen(8080, function() {
  console.log('Project #2: MyVocab');
});
