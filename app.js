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

app.post('/editCard', jsonParser, function(req, res) {
  var username = req.body.username;
  var deckname = req.body.deckname;
  var cardId = req.body.card;
  var word = req.body.word;
  var pronunciation = req.body.pronunciation;
  var meaning = req.body.meaning;
  var type = req.body.type;

  var result = false;

  for(var i = 0; i < allDecks.length; i++) {
    if(allDecks[i].username === username && allDecks[i].deckname === deckname) {
      for(var n = 0; n < allDecks[i].cards.length; n++) {
        if(allDecks[i].cards[n].id == cardId) {
          result = true;
          allDecks[i].cards[n].word = word;
          allDecks[i].cards[n].pronunciation = pronunciation;
          allDecks[i].cards[n].meaning = meaning;
          allDecks[i].cards[n].type = type;
        }
      }
    }
  }

  if(result != false) {
    res.json(result);
  } else {
    res.json(result);
  }

});

app.post('/editDeck', jsonParser, function(req, res) {
  console.log(req.body);

  var username = req.body.username;
  var deckId = req.body.deckId;
  var originalDeckname = req.body.originalDeckname;
  var newDeckname = req.body.newDeckname;
  var source = req.body.source;
  var publisher = req.body.publisher;
  var isbn = req.body.isbn;
  var description = req.body.description;

  var result = false;
  var lastModified;

  for(var i = 0; i < allDecks.length; i++) {
    if(allDecks[i].username === username && allDecks[i].id === deckId) {
      allDecks[i].deckname = newDeckname;
      allDecks[i].source = source;
      allDecks[i].publisher = publisher;
      allDecks[i].isbn = isbn;
      allDecks[i].description = description;
      var now = Date.now();
      allDecks[i].lastmodified = now;
      lastModified = allDecks[i].lastmodified;
      result = true;
    }
  }

  if(result != false) {
    res.json(lastModified);
  } else {
    res.json(result);
  }

});

app.listen(8080, function() {
  console.log('Project #2: MyVocab');
});
