/*Required NPM Modules*/
var express = require('express');
var path = require('path');
var jsonParser = require('body-parser').json();
var cookieParser = require('cookie-parser');
var request = require('request');
var app = express();

/*This Is Needed And Used For The NPM Module 'japaneasy'*/
var Dictionary = require('japaneasy');
var dict = new Dictionary();

/*Required Data Objects*/
var allUsers = require('./user.js');
var allDecks = require('./decks.js');

/*Used To Determine Which User Is Logged In*/
var activeUser;

/*Used When Creating A New Deck*/
function Deck(username, id, deckname, source, sourceimage, isbn, publisher, numcards, description, createdon, lastmodified, cards){
  this.username = username;
  this.id = id;
  this.deckname = deckname;
  this.source = source;
  this.sourceimage = sourceimage; //'test.png'
  this.isbn = isbn;
  this.publisher = publisher;
  this.numcards = numcards;
  this.description = description;
  this.createdon = createdon;
  this.lastmodified = lastmodified;
  this.cards = cards; //cards is an Array of cards
}

/*Middleware To Use*/
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
      activeUser = username;
      res.cookie('myvocabRemember', 'true-' + username.toString());
    }
  }

  if(result != false) {
    res.send(result);
  } else {
    res.send(result);
  }
});

/*Used When User Logs Out. This Will Clear The Saved Cookie*/
app.post('/logout', jsonParser, function(req, res) {
  var doLogout = req.body.logout;

  if(doLogout === true) {
    res.clearCookie('myvocabRemember');
    activeUser = '';
    var result = true;
  };

  if(result != false) {
    res.json(result);
  } else {
    res.json(result);
  };

});

/*Used To Get The Value Of The 'activeUser' Variable*/
app.get('/activeUser', function(req, res) {
  if(activeUser != null) {
    res.send(activeUser);
  } else {
    res.send(null);
  }
})

/*Check To See If User Has A Valid Session Or Not*/
app.get('/session', function(req, res) {
  if(req.cookies.myvocabRemember) {
    var cookie = req.cookies.myvocabRemember;
    var stringArray = cookie.split('-', 2);
    var username = stringArray[1];
    activeUser = username;
    res.send(username);
  } else {
    res.send('false');
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

/*Used To Retrieve A Single Deck*/
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

/*Used To Edit An Individual Card Of A Particular Deck*/
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

/*Used To Edit A Particular Deck*/
app.post('/editDeck', jsonParser, function(req, res) {
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

/*Used When Creating A New Deck*/
app.post('/newDeck', jsonParser, function(req, res) {

  var username = req.body.username;
  var deckId = allDecks.length + 1;
  var deckname = req.body.deckname;
  var source = req.body.source;
  var isbn = req.body.isbn;
  var publisher = req.body.publisher;
  var numCards = req.body.cards.length;
  var description = req.body.description;
  var createdOn = req.body.createdon;
  var lastModified = req.body.createdon;
  var cards = req.body.cards;

  var newDeck = new Deck(username, deckId, deckname, source, 'default2.jpg', isbn, publisher, numCards, description, createdOn, lastModified, cards);
  allDecks.push(newDeck);

  for(var i = 0; i < allUsers.length; i++) {
    if(allUsers[i].username === username) {
      allUsers[i].decks.push(deckname);
    }
  }

  res.send(username);
});

/*Search By English Word Only Using Japaneasy*/
app.post('/search', jsonParser, function(req, res) {
  var word = req.body.search;
  dict(word).then(function(result) {
    console.log(result);
    res.send(result);
  });
})

/*Search By English Word Only Using 'wwwjdic (English)'*/
app.post('/wwwjdicEnglish', jsonParser, function(req, res) {
  var term = req.body.search;
  var theURL = 'http://nihongo.monash.edu/cgi-bin/wwwjdic?1ZUE' + term;

  var p1 = new Promise(function(resolve, reject) {
    request(theURL, function(error, response, body) {
      if(!error && response.statusCode == 200) {
       resolve(response);
     }
    })
  })

  Promise.all([p1]).then(function(value) {
     res.json(value);
  }, function(reason) {
    console.log(reason)
 });

})

/*Search By Japanese Word Only Using 'wwwjdic (Japanese)'*/
app.post('/wwwjdicJapanese', jsonParser, function(req, res) {
  var term = req.body.search;
  var theTerm = encodeURIComponent(term);

  //1 = EDICT, Z = backdoor entry (raw dictionary display), U = where the lookup text is in UTF-8, J = for Japanese keys
  var theURL = 'http://nihongo.monash.edu/cgi-bin/wwwjdic?1ZUJ' + theTerm;

  var p1 = new Promise(function(resolve, reject) {
    request(theURL, function(error, response, body) {
      if(!error && response.statusCode == 200) {
       resolve(response);
     }
    })
  })

  Promise.all([p1]).then(function(value) {
    res.json(value);
  }, function(reason) {
    console.log(reason)
 });
});

/*Used When Looking Up Books. This Uses Google's Book API*/
app.post('/bookSearch', jsonParser, function(req,res) {
  var term = req.body.term;
  var type = req.body.type;

  var apiKey = 'AIzaSyCST9ncJG5QX84gOwpFJe_qMO5NMXPfQCw';
  var theURL = 'https://www.googleapis.com/books/v1/volumes?q=' + type + ':' + term + '&key=' + apiKey;

  var p1 = new Promise(function(resolve, reject) {
    request(theURL, function(error, response, body) {
      if(!error && response.statusCode == 200) {
       resolve(response);
     }
    })
  })

  Promise.all([p1]).then(function(value) {
    res.json(value);
  }, function(reason) {
    console.log(reason)
 });

});

/*Used When Looking Up Words. This Is Used With The Radio Buttons On The Word Search Tab.*/
app.post('/wordSearch', jsonParser, function(req, res) {
  var term = req.body.term;
  var type = req.body.type;

  /*Search By English Word Only Using Japaneasy*/
  if(type === 'japaneasy') {
    dict(term).then(function(result) {
      res.send(result);
    });
  }

  /*Search By English Word Only Using 'wwwjdic (English)'*/
  if(type === 'wwwjdic-english') {
    var theURL = 'http://nihongo.monash.edu/cgi-bin/wwwjdic?1ZUE' + term;

    var p1 = new Promise(function(resolve, reject) {
      request(theURL, function(error, response, body) {
        if(!error && response.statusCode == 200) {
         resolve(response);
       }
      })
    })

    Promise.all([p1]).then(function(value) {
       res.json(value);
    }, function(reason) {
      console.log(reason)
   });
  }

  /*Search By Japanese Word Only Using 'wwwjdic (Japanese)'*/
  if(type === 'wwwjdic-japanese') {
    var theTerm = encodeURIComponent(term);

    //1 = EDICT, Z = backdoor entry (raw dictionary display), U = where the lookup text is in UTF-8, J = for Japanese keys
    var theURL = 'http://nihongo.monash.edu/cgi-bin/wwwjdic?1ZUJ' + theTerm;

    var p1 = new Promise(function(resolve, reject) {
      request(theURL, function(error, response, body) {
        if(!error && response.statusCode == 200) {
         resolve(response);
       }
      })
    })

    Promise.all([p1]).then(function(value) {
      res.json(value);
    }, function(reason) {
      console.log(reason)
   });
  }
});

/*Configure Which Port To Listen For LocalHost*/
var port = process.env.PORT || 1337;
app.listen(port, function() {
 console.log("Project #2 (MyVocab) is listening on port " + port);
});
