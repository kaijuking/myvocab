/*Required NPM Modules*/
var express = require('express');
var path = require('path');
var jsonParser = require('body-parser').json();
var cookieParser = require('cookie-parser');
var app = express();

/*Required Data Objects*/
var allUsers = require('./user.js');
var allDecks = require('./decks.js');

var defaultMiddleware = express.static('./public');
app.use(defaultMiddleware);
app.use(cookieParser());

/*Validate User Login And Set Session If Successful*/
app.post('/login', jsonParser, function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var result = false;

  for(var i = 0; i < allUsers.length; i++) {
    if(allUsers[i].username === username && allUsers[i].password === password) {
      result = true;
      res.cookie('myvocabRemember', 'true-' + username.toString());
    }
  }

  if(result != false) {
    res.send(result);
  } else {
    res.send(result);
  }
});

/*Check To See If User Has A Valid Session Or Not*/
app.get('/session', function(req, res) {
  if(req.cookies.myvocabRemember) {
    var cookie = req.cookies.myvocabRemember;
    var stringArray = cookie.split('-', 2);
    var username = stringArray[1];
    res.send(username);
  } else {
    res.send(false);
  }
});

/*Populate The User's Profile Page*/
app.post('/loadProfile', jsonParser, function(req, res) {
  console.log(req.cookies.myvocabRemember);
  // res.json({result: 'test'});
  var cookie = req.cookies.myvocabRemember;
  var stringArray = cookie.split('-', 2);
  var username = stringArray[1];

  var result = false;
  var userinfo = {};
  var userdecks = [];

  for(var i = 0; i < allUsers.length; i++) {
    if(allUsers[i].username === username) {
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

/*Populate The Deck Dropdown List With The Names Of The User's Decks*/
app.post('/deckDropDown', jsonParser, function(req, res) {
  var username = req.body.username;
  var decks = [];
  var result = false;

  for(var i = 0; i < allDecks.length; i++) {
    if(allDecks[i].username === username) {
      result = true;
      decks.push(allDecks[i].deckname);
    };
  };

  if(result != false) {
    res.json([username, decks]);
  } else {
    res.send(result);
  }
});

/*Populate The My Decks Tab With Data For a Particular Deck*/
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

app.post('/singleDeck', jsonParser, function(req, res) {
  console.log(req.body);
  var username = req.body.username;
  var deckname = req.body.deckname;

  var result = false;
  var userdeck = [];

  for(var i = 0; i < allDecks.length; i++) {
    if(allDecks[i].username === username && allDecks[i].deckname === deckname) {
      result = true;
      userdeck.push(allDecks[i]);
    }
  }

  if(result != false) {
    res.json(userdeck);
  } else {
    res.send(result);
  }
});

app.listen(8080, function() {
  console.log('Project #2: MyVocab');
});
