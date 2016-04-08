'use-strict';

//Used In One Or More 'click' Event Listeners
var reviewCards;
var startIndex = 0;
var currentIndex = 0;
var theId = 1;
var theCards = [];

document.addEventListener('DOMContentLoaded', function(event){
  console.log('DOM has fully loaded and parsed.');
  console.log('reviewCards is: ' + reviewCards);
  console.log('startIndex is: ' + startIndex);
  console.log('currentIndex is: ' + currentIndex);
  console.log('theId is: ' + theId);
  console.log(theCards)

  var session = new XMLHttpRequest();
  session.open('GET', '/session', true);
  session.send();

  session.addEventListener('load', function() {
    var username = session.responseText;

    if(username === 'false') {
      var loginPage = document.getElementById('login-page');
      var homePage = document.getElementById('home-page');

      loginPage.setAttribute('class', 'show');
      homePage.setAttribute('class', 'hide');

    } else {
      var loginPage = document.getElementById('login-page');
      var homePage = document.getElementById('home-page');

      loginPage.setAttribute('class', 'hide');
      homePage.setAttribute('class', 'show');

      var user = {username: username};
      var userInfo = JSON.stringify(user);

      var profile = new XMLHttpRequest();
      profile.open('POST', '/loadProfile', true);
      profile.setRequestHeader('Content-Type', 'application/json');
      profile.send(userInfo);

      profile.addEventListener('load', function() {
        var info = JSON.parse(profile.responseText);
        loadProfile(info);

        $(function () {
          $('[data-toggle="tooltip"]').tooltip()
        });
      });
    }
  })

});

document.addEventListener('click', function(event) {
  //event.preventDefault();

  var theTarget = event.target;

  /*Target Events For The Tabs: Profile, My Decks, My Cards and Search*/
  if(theTarget.getAttribute('data-id') === 'user-profile') {
    $('#tab-user-profile a[href="#user-profile"]').tab('show');
  }

  if(theTarget.getAttribute('data-id') === 'user-mydecks') {

    var session = new XMLHttpRequest();
    session.open('GET', '/session', true);
    session.send();

    session.addEventListener('load', function() {
      var username = session.responseText;

      if(username != null) {
        var info = {username: username};
        var user = JSON.stringify(info);

        var dropdown = new XMLHttpRequest();
        dropdown.open('POST', '/deckDropDown', true);
        dropdown.setRequestHeader('Content-Type', 'application/json');
        dropdown.send(user);

        dropdown.addEventListener('load', function() {
          var deckNames = JSON.parse(dropdown.responseText);
          var username = deckNames[0];
          var decks = deckNames[1];

          var myDropDown = 'deck-dropdown';
          var myItems = 'deck-dropdown-items';

          loadDropDown(username, decks, myDropDown, myItems);
        })
      }
    })

    $('#tab-user-mydecks a[href="#user-mydecks"]').tab('show');

  }

  if(theTarget.getAttribute('data-id') === 'user-mycards') {

    var session = new XMLHttpRequest();
    session.open('GET', '/session', true);
    session.send();

    session.addEventListener('load', function() {
      var username = session.responseText;

      var btnReview = document.getElementById('btn-card-review');
      btnReview.setAttribute('data-value', username);

      if(username != null) {
        var info = {username: username};
        var user = JSON.stringify(info);

        var dropdown = new XMLHttpRequest();
        dropdown.open('POST', '/deckDropDown', true);
        dropdown.setRequestHeader('Content-Type', 'application/json');
        dropdown.send(user);

        dropdown.addEventListener('load', function() {
          var deckNames = JSON.parse(dropdown.responseText);
          var username = deckNames[0];
          var decks = deckNames[1];

          var myDropDown = 'deck-mycards-dropdown';
          var myItems = 'deck-mycards-dropdown-items';

          loadDropDown(username, decks, myDropDown, myItems);
        })
      }
    })

    $('#tab-user-mycards a[href="#user-mycards"]').tab('show');
  }

  if(theTarget.getAttribute('data-id') === 'user-search') {
    $('#tab-user-search a[href="#user-search"]').tab('show');
  }

  /*Target Event For When User Clicks On A Deck Name On The Profile Page*/
  if(theTarget.getAttribute('data-id') === 'mydeck') {
    var dataValue = theTarget.getAttribute('data-value');
    $('#tab-user-mydecks a[href="#user-mydecks"]').tab('show');

    var stringArray = dataValue.split('-',2);
    var user = stringArray[0];
    var deck = stringArray[1];

    var data = {
      username: user,
      deckname: deck
    }

    var deckInfo = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/loadDeck', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(deckInfo);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);
      loadDeck(deck, response);
    });
  };

  /*Target Event For When User Clicks On A Deck Name On The Profile Page*/
  if(theTarget.getAttribute('data-id') === 'mycards') {
    var dataValue = theTarget.getAttribute('data-value');

    var stringArray = dataValue.split('-',2);
    var user = stringArray[0];
    var deck = stringArray[1];
    startIndex = 0;
    currentIndex = 0;

    var data = {
      username: user,
      deckname: deck
    }

    var deckInfo = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/loadDeck', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(deckInfo);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);
      console.log(response);
      loadCards(user, deck, response);
    });

    $('#tab-user-mycards a[href="#user-mycards"]').tab('show');
  };

  if(theTarget.getAttribute('data-id') === 'btn-card-review') {

    startIndex = 0;
    currentIndex = 0;

    var username = document.getElementById('deck-mycards-username');
    var deckname = document.getElementById('deck-mycards-name');

    var data = {
      username: username.textContent,
      deckname: deckname.textContent
    }

    var deckInfo = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/singleDeck', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(deckInfo);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);

      reviewCards = response;

      var panelBody = document.getElementById('panel-body-review-card');
      panelBody.textContent = response[0].cards[0].word;
    });
  }

  if(theTarget.getAttribute('data-id') === 'btn-show-prev-next') {
    var dataValue = theTarget.getAttribute('data-value');
    var lastIndex = reviewCards[0].cards.length - 1;
    var panelHeader = document.getElementById('panel-heading-review-card');

    if(dataValue === 'card-show-answer-false') {
      var panelBody = document.getElementById('panel-body-review-card');
      panelBody.textContent = reviewCards[0].cards[currentIndex].pronunciation + ' - ' + reviewCards[0].cards[currentIndex].meaning;

      var btnAnswer = document.getElementById('btn-show-answer');
      btnAnswer.setAttribute('data-value', 'card-show-answer-true')
    }

    if(dataValue === 'card-show-answer-true') {
      var panelBody = document.getElementById('panel-body-review-card');
      panelBody.textContent = reviewCards[0].cards[currentIndex].word;

      var btnAnswer = document.getElementById('btn-show-answer');
      btnAnswer.setAttribute('data-value', 'card-show-answer-false')
    }

    if(dataValue === 'card-prev') {
      currentIndex--;
      if(currentIndex > -1) {
        var panelBody = document.getElementById('panel-body-review-card');
        panelBody.textContent = reviewCards[0].cards[currentIndex].word;

        var btnAnswer = document.getElementById('btn-show-answer');
        btnAnswer.setAttribute('data-value', 'card-show-answer-false')

        panelHeader.textContent = reviewCards[0].deckname + ' (' + (currentIndex + 1) + ' of ' + (lastIndex + 1) + ')';
      } else {
        currentIndex = lastIndex;
        var panelBody = document.getElementById('panel-body-review-card');
        panelBody.textContent = reviewCards[0].cards[currentIndex].word;

        var btnAnswer = document.getElementById('btn-show-answer');
        btnAnswer.setAttribute('data-value', 'card-show-answer-false')

        panelHeader.textContent = reviewCards[0].deckname + ' (' + (currentIndex + 1) + ' of ' + (lastIndex + 1) + ')';
      }
    }

    if(dataValue === 'card-next') {
      if(currentIndex === lastIndex) {
        currentIndex = 0;
        var panelBody = document.getElementById('panel-body-review-card');
        panelBody.textContent = reviewCards[0].cards[currentIndex].word;

        var btnAnswer = document.getElementById('btn-show-answer');
        btnAnswer.setAttribute('data-value', 'card-show-answer-false')

        panelHeader.textContent = reviewCards[0].deckname + ' (' + (currentIndex + 1) + ' of ' + (lastIndex + 1) + ')';
      } else {
        currentIndex++;
        var panelBody = document.getElementById('panel-body-review-card');
        panelBody.textContent = reviewCards[0].cards[currentIndex].word;

        var btnAnswer = document.getElementById('btn-show-answer');
        btnAnswer.setAttribute('data-value', 'card-show-answer-false')

        panelHeader.textContent = reviewCards[0].deckname + ' (' + (currentIndex + 1) + ' of ' + (lastIndex + 1) + ')';
      }
    }
  }

  if(theTarget.getAttribute('data-id') === 'deck-card-edit') {
    var dataValue = theTarget.getAttribute('data-value');
    var stringArray = dataValue.split('-',3);
    console.log(stringArray);

    var theUsername = stringArray[0];
    var theDeckname = stringArray[1];
    var cardId = stringArray[2];

    var deck = document.getElementById('table-deck');
    var children = deck.childNodes;
    var childIndex = cardId -1 ;

    var userName = document.getElementById('modal-username-card');
    userName.textContent = theUsername;

    var deckName = document.getElementById('modal-deckname-card');
    deckName.textContent = theDeckname;

    var id = document.getElementById('modal-card-id');
    id.textContent = cardId;

    var word = document.getElementById('modal-card-word');
    word.value = children[4].childNodes[childIndex].childNodes[1].textContent;

    var pronunciation = document.getElementById('modal-card-pronunciation');
    pronunciation.value = children[4].childNodes[childIndex].childNodes[2].textContent;

    var meaning = document.getElementById('modal-card-meaning');
    meaning.value = children[4].childNodes[childIndex].childNodes[3].textContent;

    var type = document.getElementById('modal-card-type');
    type.value = children[4].childNodes[childIndex].childNodes[4].textContent;

    $('#myModal').modal('show');

  }

  if(theTarget.getAttribute('data-id') === 'modal-edit-card-btn-save') {
    var dataValue = theTarget.getAttribute('data-value');

    var deck = document.getElementById('table-deck');
    var children = deck.childNodes;
    //children[4].childNodes[0] === table row 0 (i.e. card #1)
    //children[4].childNodes[0].childNodes[1] === tabe row 0, column #2 (i.e. Word)

    var userName = document.getElementById('modal-username-card');
    var deckName = document.getElementById('modal-deckname-card');

    var id = document.getElementById('modal-card-id');
    var childIndex = id.textContent - 1;

    var word = document.getElementById('modal-card-word');
    children[4].childNodes[childIndex].childNodes[1].textContent = word.value;

    var pronunciation = document.getElementById('modal-card-pronunciation');
    children[4].childNodes[childIndex].childNodes[2].textContent = pronunciation.value;

    var meaning = document.getElementById('modal-card-meaning');
    children[4].childNodes[childIndex].childNodes[3].textContent = meaning.value;

    var type = document.getElementById('modal-card-type');
    children[4].childNodes[childIndex].childNodes[4].textContent = type.value;

    var data = {
      username: userName.textContent,
      deckname: deckName.textContent,
      card: id.textContent,
      word: word.value,
      pronunciation: pronunciation.value,
      meaning: meaning.value,
      type: type.value
    }

    var cardInfo = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/editCard', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(cardInfo);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);

      if(response === true) {
        $('#myModal').modal('hide');
      }

    });
  }

  if(theTarget.getAttribute('data-id') === 'btn-edit-deck') {
    var dataValue = theTarget.getAttribute('data-value');

    var deckName = document.getElementById('deck-name');
    if(deckName.textContent === ''){
      console.log('no deck name selected.');
    } else {

      var theUsername = document.getElementById('deck-username').textContent;
      var theDeckname = document.getElementById('deck-name').textContent;
      var theSource = document.getElementById('deck-source').textContent;
      var thePublisher = document.getElementById('deck-publisher').textContent;
      var theISBN = document.getElementById('deck-isbn').textContent;
      var theDescription = document.getElementById('deck-description').textContent;

      var username = document.getElementById('modal-edit-deck-username');
      username.textContent = theUsername;

      var deckname = document.getElementById('modal-edit-deck-deckname');
      deckname.value = theDeckname;

      var source = document.getElementById('modal-edit-deck-source');
      source.value = theSource;

      var publisher = document.getElementById('modal-edit-deck-publisher');
      publisher.value = thePublisher;

      var isbn = document.getElementById('modal-edit-deck-isbn');
      isbn.value = theISBN;

      var description = document.getElementById('modal-edit-deck-description');
      description.value = theDescription;

      $('#myModal-edit-deck').modal('show');
    }
  }

  if(theTarget.getAttribute('data-id') === 'modal-edit-deck-btn-save') {

    var deck = document.getElementById('deck-name');
    var dataValue = deck.getAttribute('data-value');
    var stringArray = dataValue.split('-', 3);
    var username = stringArray[0];
    var originalDeckname = stringArray[1];
    var deckId = stringArray[2];

    var newDeckname = document.getElementById('modal-edit-deck-deckname').value;
    var source = document.getElementById('modal-edit-deck-source').value;
    var publisher = document.getElementById('modal-edit-deck-publisher').value;
    var isbn = document.getElementById('modal-edit-deck-isbn').value;
    var description = document.getElementById('modal-edit-deck-description').value;

    var data = {
      username: username,
      deckId: deckId,
      originalDeckname: originalDeckname,
      newDeckname: newDeckname,
      source: source,
      publisher: publisher,
      isbn: isbn,
      description: description
    }

    var deckInfo = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/editDeck', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(deckInfo);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);

      if(response != false) {
        console.log(response);

        var modifiedDate = new Date(response);
        var modified = document.getElementById('deck-modifiedon');
        modified.textContent = (modifiedDate.getMonth() + 1) + '/' + modifiedDate.getUTCDate() + '/' + modifiedDate.getFullYear();

        var theDeckname = document.getElementById('deck-name');
        theDeckname.textContent = newDeckname;

        var theSource = document.getElementById('deck-source');
        theSource.textContent = source;

        var thePublisher = document.getElementById('deck-publisher');
        thePublisher.textContent = publisher;

        var theISBN = document.getElementById('deck-isbn');
        theISBN.textContent = isbn;

        var theDescription = document.getElementById('deck-description');
        theDescription.textContent = description;
        $('#myModal-edit-deck').modal('hide');
      }

    });
  }

  if(theTarget.getAttribute('data-id') === 'btn-search') {
    var search = document.getElementById('search-input').value;

    var data = {
      search: search
    }

    var searchData = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/search', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(searchData);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);
      console.log(response[0]);
      console.log(response);

      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');

      table1.setAttribute('class', 'table table-hover show');
      table2.setAttribute('class', 'table table-hover hide');

      searchResults(response);
    });
  }

  if(theTarget.getAttribute('data-id') === 'btn-search-raw-english') {
    var search = document.getElementById('search-input').value;

    var data = {
      search: search
    }

    var searchData = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/wwwjdicEnglish', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(searchData);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);

      var theBody = response[0].body;
      var testText = '';

      for(var i = (theBody.indexOf('<pre>') + 5); i < theBody.lastIndexOf('</pre>'); i++) {
        testText = testText + response[0].body[i];
      }

      var lines = testText.split('\n');

      for(var i = 1; i < lines.length; i++) {
        console.log(lines[i]);
      }

      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');

      table1.setAttribute('class', 'table table-hover hide table-striped');
      table2.setAttribute('class', 'table table-hover show table-striped');

      jimBreen(lines);

    });
  }

  if(theTarget.getAttribute('data-id') === 'btn-search-raw-japanese') {
    var search = document.getElementById('search-input').value;

    var data = {
      search: search
    }

    var searchData = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/wwwjdicJapanese', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(searchData);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);

      var theBody = response[0].body;
      var testText = '';

      for(var i = (theBody.indexOf('<pre>') + 5); i < theBody.lastIndexOf('</pre>'); i++) {
        testText = testText + response[0].body[i];
      }

      var lines = testText.split('\n');

      for(var i = 1; i < lines.length; i++) {
        console.log(lines[i]);
      }

      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');

      table1.setAttribute('class', 'table table-hover hide table-striped');
      table2.setAttribute('class', 'table table-hover show table-striped');

      jimBreen(lines);

    });
  };

  if(theTarget.getAttribute('data-id') === 'btn-create-new-deck') {
    var theUser = new XMLHttpRequest();
    theUser.open('GET', '/activeUser', true);
    theUser.send();

    theUser.addEventListener('load', function() {
      var activeUser = theUser.responseText;
      if(activeUser != null) {
        var username = document.getElementById('modal-new-deck-username');
        username.textContent = activeUser;

        var now = Date.now();
        var createDate = new Date(now);
        var createdOn = document.getElementById('modal-new-deck-createdon');
        createdOn.setAttribute('data-value', now);
        createdOn.textContent = (createDate.getMonth() + 1) + '/' + createDate.getUTCDate() + '/' + createDate.getFullYear();

        $('#myModal-new-deck').modal('show');
      }
    });
  };

  if(theTarget.getAttribute('data-id') === 'btn-new-deck-add-card') {
    var theWord = document.getElementById('modal-new-deck-card-word').value;
    var thePronunciation = document.getElementById('modal-new-deck-card-pronunciation').value;
    var theMeaning = document.getElementById('modal-new-deck-card-meaning').value;
    var theType = document.getElementById('modal-new-deck-card-type').value;

    var theItem = {id: theId, word: theWord, pronunciation: thePronunciation, meaning: theMeaning, type: theType};
    theCards.push(theItem);
    theId++;

    addNewCard(theItem);
    resetNewCard();
  }

  if(theTarget.getAttribute('data-id') === 'modal-new-deck-btn-cancel') {
    resetNewDeck();
  }

  if(theTarget.getAttribute('data-id') === 'modal-new-deck-btn-save') {

    var saveButton = document.getElementById('modal-new-deck-btn-save');

    var username = document.getElementById('modal-new-deck-username').textContent;
    var deckname = document.getElementById('modal-new-deck-deckname').value;
    var publisher = document.getElementById('modal-new-deck-publisher').value;
    var source = document.getElementById('modal-new-deck-source').value;
    var isbn = document.getElementById('modal-new-deck-isbn').value;
    var description = document.getElementById('modal-new-deck-description').value;
    var createdon = Date.now();
    var cards = theCards;

    if(deckname === null || deckname === '') {
      var warning = document.getElementById('deckname-warning-alert');
      warning.setAttribute('class', 'alert alert-danger alert-dismissible show');
    } else {
      saveButton.setAttribute('disabled', 'disabled');
      var data = {
        username: username,
        deckname: deckname,
        publisher: publisher,
        source: source,
        isbn: isbn,
        description: description,
        createdon: createdon,
        cards: cards
      }

      var deck = JSON.stringify(data);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/newDeck', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(deck);

      var theResponse = '';
      xhr.addEventListener('load', function() {
        var response = xhr.responseText;

        if(response != 'error') {
          var info = {username: response};
          var user = JSON.stringify(info);

          var dropdown = new XMLHttpRequest();
          dropdown.open('POST', '/deckDropDown', true);
          dropdown.setRequestHeader('Content-Type', 'application/json');
          dropdown.send(user);

          dropdown.addEventListener('load', function() {
            var deckNames = JSON.parse(dropdown.responseText);
            var username = deckNames[0];
            var decks = deckNames[1];

            var myDropDown = 'deck-dropdown';
            var myItems = 'deck-dropdown-items';

            loadDropDown(username, decks, myDropDown, myItems);
            saveButton.removeAttribute('disabled');
            resetNewDeck();
            $('#myModal-new-deck').modal('hide');

            var theDropDown = document.getElementById('deck-dropdown-items');
            var count = {numcards: theDropDown.children.length};
            console.log(count)
            updateProfile(count);

            var profileDeck = {id: theDropDown.children.length, username: username, deckname: deckname, numcards: cards.length, description: description, createdon: createdon};
            newProfileDeck(profileDeck);

            var warning = document.getElementById('deckname-warning-alert');
            warning.setAttribute('class', 'alert alert-danger alert-dismissible hide');

          });
        };
      });
    }
  };

  if(theTarget.getAttribute('data-id') === 'new-deck-card-remove') {
    var dataValue = theTarget.getAttribute('data-value');

    var stringArray = dataValue.split('-', 2);
    var rowNum = stringArray[1] - 1;

    var tbody = document.getElementById('new-deck-card-tbody');
    var children = tbody.children;

    tbody.removeChild(children[rowNum]);
    theId--;

    for(var i = (rowNum); i < children.length; i++) {
      var num = children[i].children[0].textContent;
      children[i].children[0].textContent = num - 1;
      children[i].children[0].setAttribute('data-id', num - 1);
      children[i].children[0].setAttribute('data-value', num - 1);

      //Updating The Data-Value Of The "Remove" Column For Row i
      children[i].children[5].children[0].setAttribute('data-value', 'remove new card-' + (num - 1));
    }

    theCards.splice(rowNum, 1);
    for(var i = 0; i < theCards.length; i++) {
      theCards[i].id = i + 1;
    }
  }

  if(theTarget.getAttribute('data-id') === 'logout') {
    var logout = true;
    var theData = {logout: logout};
    var data = JSON.stringify(theData);

    var tryLogout = new XMLHttpRequest();
    tryLogout.open('POST', '/logout', true);
    tryLogout.setRequestHeader('Content-Type', 'application/json');
    tryLogout.send(data);

    tryLogout.addEventListener('load', function() {
      var response = JSON.parse(tryLogout.responseText);

      if(response != false) {
        var loginPage = document.getElementById('login-page');
        var homePage = document.getElementById('home-page');

        loginPage.setAttribute('class', 'show');
        homePage.setAttribute('class', 'hide');

        resetNewDeck();
        resetNewCard();

        var usernameField = document.getElementById('login-username');
        var passwordField = document.getElementById('login-password');

        usernameField.value = '';
        passwordField.value = '';

        console.log('you have logged out');
      } else {
        console.log('ERROR: Logout was unsuccessfull');
      };
    });
  };

  if(theTarget.getAttribute('data-id') === 'radio-btn') {
    var dataValue = theTarget.getAttribute('data-value');

    if(dataValue === 'japaneasy') {
      console.log('Radio Button japaneasy clicked');
      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');
      var div = document.getElementById('book-search');

      table1.setAttribute('class', 'table table-hover show');
      table2.setAttribute('class', 'table table-hover hide');
      div.setAttribute('class', 'container hide');
    }

    if(dataValue === 'wwwjdic-english') {
      console.log('Radio Button wwwjdic-english clicked');
      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');
      var div = document.getElementById('book-search');

      table1.setAttribute('class', 'table table-hover hide');
      table2.setAttribute('class', 'table table-hover show');
      div.setAttribute('class', 'container hide');
    }

    if(dataValue === 'wwwjdic-japanese') {
      console.log('Radio Button wwwjdic-japanese clicked');
      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');
      var div = document.getElementById('book-search');

      table1.setAttribute('class', 'table table-hover hide');
      table2.setAttribute('class', 'table table-hover show');
      div.setAttribute('class', 'container hide');
    }

    if(dataValue === 'book-search') {
      console.log('Radio Button wwwjdic-japanese clicked');
      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');
      var div = document.getElementById('book-search');

      table1.setAttribute('class', 'table table-hover hide');
      table2.setAttribute('class', 'table table-hover hide');
      div.setAttribute('class', 'container show');
    }
  }

  if(theTarget.getAttribute('data-id') === 'search-btn') {
    var dataId = theTarget.getAttribute('data-id');
    var searchTerm = document.getElementById('search-input').value;
    var searchType = radioButton(dataId);

    console.log(searchTerm);
    console.log(searchType);

    wordSearch(searchTerm, searchType);

  }

  if(theTarget.getAttribute('data-id') === 'book-search-btn') {
    var dataId = theTarget.getAttribute('data-id');
    var searchTerm = document.getElementById('book-search-input').value;
    var searchType = radioButton(dataId);

    console.log(searchTerm);
    console.log(searchType);

    bookSearch(searchTerm, searchType);
  }

});

var login = document.getElementById('btn-login');
login.addEventListener('click', function(event) {
  event.preventDefault();

  var theUsername = document.getElementById('login-username').value;
  var thePassword = document.getElementById('login-password').value;

  var data = {
    username: theUsername,
    password: thePassword
  }

  var loginInfo = JSON.stringify(data);

  var tryLogin = new XMLHttpRequest();
  tryLogin.open('POST', '/login', true);
  tryLogin.setRequestHeader('Content-Type', 'application/json');
  tryLogin.send(loginInfo);
  var loginResponse = false;

  tryLogin.addEventListener('load', function() {
    var response = JSON.parse(tryLogin.responseText);
    loginResponse = response;

    if(loginResponse === true) {
      var user = {username: theUsername};
      var userInfo = JSON.stringify(user);

      var profile = new XMLHttpRequest();
      profile.open('POST', '/loadProfile', true);
      profile.setRequestHeader('Content-Type', 'application/json');
      profile.send(userInfo);

      profile.addEventListener('load', function() {
        var info = JSON.parse(profile.responseText);
        loadProfile(info);
      });
    };
  });
});

function loadProfile(info) {
  var loginPage = document.getElementById('login-page');
  var homePage = document.getElementById('home-page');

  if(info != false) {
    var length = info[0].decks.length;
    var p1 = new Promise(function(resolve, reject) {
      var picture = document.getElementById('user-profile-picture');
      picture.setAttribute('src', '/images/' + info[0].profilepicture);

      var name = document.getElementById('user-username');
      name.textContent = info[0].username;

      var email = document.getElementById('user-email');
      email.textContent = info[0].email;

      var deckcount = document.getElementById('user-deckcount');
      deckcount.textContent = length;

      var myDate = new Date(info[0].createdon);
      var membersince = document.getElementById('user-member-since');
      membersince.textContent = (myDate.getMonth() + 1) + '/' + myDate.getUTCDate() + '/' + myDate.getFullYear();

      var description = document.getElementById('user-description');
      description.textContent = info[0].description;
    });

    var p2 = new Promise(function(resolve, reject) {

      var table = document.getElementById('user-profile-deck-table');

      for(var i = 0; i < length; i++) {
        var id = document.createElement('td');
        id.textContent = i + 1;

        var title = document.createElement('td');
        var link = document.createElement('a');
        link.setAttribute('href', '#');
        link.setAttribute('data-id', 'mydeck');
        link.setAttribute('data-value', info[0].username + '-' + info[1][i].deckname);
        link.textContent = info[1][i].deckname;
        title.appendChild(link);

        var cards = document.createElement('td');
        cards.textContent = info[1][i].numcards;

        var description = document.createElement('td');
        description.textContent = info[1][i].description;

        var myDate = new Date(info[1][i].createdon);
        var created = document.createElement('td');
        created.textContent = (myDate.getMonth() + 1) + '/' + myDate.getUTCDate() + '/' + myDate.getFullYear();

        var row = document.createElement('tr');
        row.appendChild(id);
        row.appendChild(title);
        row.appendChild(cards);
        row.appendChild(description);
        row.appendChild(created);

        table.appendChild(row);
      }
    });

    var p3 = new Promise(function(resolve, reject) {
      loginPage.setAttribute('class', 'hide');
      homePage.setAttribute('class', 'show');
    });

    Promise.all([p1, p2, p3]).then(function(value) {
      console.log(value);
    }, function(reason) {
      console.log(reason);
    });

  } else {
    console.log('incorrect username and/or password');
    var formLogin = document.getElementById('form-login');
    formLogin.setAttribute('class', 'form-inline has-warning');
  }
}

function loadDeck(deckname, content) {
  var dropdown = document.getElementById('deck-dropdown');
  var items = document.getElementById('deck-dropdown-items');

  if(items != null) {
    dropdown.removeChild(items);
    var newItems = document.createElement('ul');
    newItems.setAttribute('class', 'dropdown-menu');
    newItems.setAttribute('aria-labelledby', 'deck-dropdown');
    newItems.setAttribute('id', 'deck-dropdown-items');
  }

  /*Populate The Dropdown Menu With Deck Names*/
  for(var i = 0; i < content.length; i++) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.setAttribute('href', '#');
    link.setAttribute('data-id', 'mydeck');
    link.setAttribute('data-value', content[i].username + '-' + content[i].deckname)
    link.textContent = content[i].deckname;
    item.appendChild(link);
    newItems.appendChild(item);
    dropdown.appendChild(newItems);
  }

  /*Populate The Onscreen Deck Info*/
  for(var i = 0; i < content.length; i++) {
    if(content[i].deckname === deckname) {
      var image = document.getElementById('deck-source-image');
      image.setAttribute('src', '/images/' + content[i].sourceimage);

      var user = document.getElementById('deck-username');
      user.textContent = content[i].username;

      var name = document.getElementById('deck-name');
      name.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].id)
      name.textContent = content[i].deckname;

      var cardcount = document.getElementById('deck-cardcount');
      cardcount.textContent = content[i].numcards;

      var source = document.getElementById('deck-source');
      source.textContent = content[i].source;

      var publisher = document.getElementById('deck-publisher');
      publisher.textContent = content[i].publisher;

      var isbn = document.getElementById('deck-isbn');
      isbn.textContent = content[i].isbn;

      var createDate = new Date(content[i].createdon);
      var created = document.getElementById('deck-createdon');
      created.textContent = (createDate.getMonth() + 1) + '/' + createDate.getUTCDate() + '/' + createDate.getFullYear();

      var modifyDate = new Date(content[i].lastmodified);
      var modified = document.getElementById('deck-modifiedon');
      modified.textContent = (modifyDate.getMonth() + 1) + '/' + modifyDate.getUTCDate() + '/' + modifyDate.getFullYear();

      var description = document.getElementById('deck-description');
      description.textContent = content[i].description;
    }
  }

  var table = document.getElementById('table-deck');
  var tbody = document.getElementById('table-deck-cards');
  if(tbody != null) {
    table.removeChild(tbody);
    var tableBody = document.createElement('tbody');
    tableBody.setAttribute('id', 'table-deck-cards');
    table.appendChild(tableBody);
  }

  /*Populate The Table With The Deck's Individual Cards*/
  for(var i = 0; i < content.length; i++) {
    if(content[i].deckname === deckname) {
      for(var n = 0; n < content[i].cards.length; n++) {
        var cardNum = document.createElement('td');
        cardNum.setAttribute('data-id', 'id');
        cardNum.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        cardNum.textContent = content[i].cards[n].id;

        var theWord = document.createElement('td');
        theWord.setAttribute('data-id', 'word');
        theWord.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        theWord.textContent = content[i].cards[n].word;

        var thePronunciation = document.createElement('td');
        thePronunciation.setAttribute('data-id', 'pronunciation');
        thePronunciation.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        thePronunciation.textContent = content[i].cards[n].pronunciation;

        var theMeaning = document.createElement('td');
        theMeaning.setAttribute('data-id', 'meaning');
        theMeaning.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        theMeaning.textContent = content[i].cards[n].meaning;

        var theType = document.createElement('td');
        theType.setAttribute('data-id', 'type');
        theType.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        theType.textContent = content[i].cards[n].type;

        var link = document.createElement('a');
        link.setAttribute('href', '#');
        link.setAttribute('data-id', 'deck-card-edit');
        link.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        link.textContent = 'edit';

        var edit = document.createElement('td');
        edit.appendChild(link);

        var row = document.createElement('tr');
        row.appendChild(cardNum);
        row.appendChild(theWord);
        row.appendChild(thePronunciation);
        row.appendChild(theMeaning);
        row.appendChild(theType);
        row.appendChild(edit);
        tableBody.appendChild(row);
      };
    };
  };
};

function loadDropDown(username, decks, myDropDown, myItems) {

  var dropdown = document.getElementById(myDropDown);
  var items = document.getElementById(myItems);

  if(items != null) {
    dropdown.removeChild(items);
    var newItems = document.createElement('ul');
    newItems.setAttribute('class', 'dropdown-menu');
    newItems.setAttribute('aria-labelledby', 'deck-dropdown');
    newItems.setAttribute('id', myItems);
  }

  /*Populate The Dropdown Menu With Deck Names*/
  for(var i = 0; i < decks.length; i++) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.setAttribute('href', '#');
    if(myItems === 'deck-dropdown-items') {
      link.setAttribute('data-id', 'mydeck');
      link.setAttribute('data-value', username + '-' + decks[i]);
      link.textContent = decks[i];
      item.appendChild(link);
      newItems.appendChild(item);
      dropdown.appendChild(newItems);
    }
    if(myItems === 'deck-mycards-dropdown-items') {
      link.setAttribute('data-id', 'mycards');
      link.setAttribute('data-value', username + '-' + decks[i]);
      link.textContent = decks[i];
      item.appendChild(link);
      newItems.appendChild(item);
      dropdown.appendChild(newItems);
    }
  }
}

function loadCards(user, deckname, content) {
  var username = document.getElementById('deck-mycards-username');
  username.textContent = user;

  /*Populate The Onscreen Deck Info*/
  for(var i = 0; i < content.length; i++) {
    if(content[i].deckname === deckname) {

      var image = document.getElementById('deck-mycards-source-image');
      image.setAttribute('src', '/images/' + content[i].sourceimage);

      var name = document.getElementById('deck-mycards-name');
      name.textContent = content[i].deckname;

      var panelHeader = document.getElementById('panel-heading-review-card');
      panelHeader.textContent = content[i].deckname + ' (' + (currentIndex + 1) + ' of ' + content[i].cards.length + ')';

      var cardcount = document.getElementById('deck-mycards-cardcount');
      cardcount.textContent = content[i].numcards;

      var source = document.getElementById('deck-mycards-source');
      source.textContent = content[i].source;

      var publisher = document.getElementById('deck-mycards-publisher');
      publisher.textContent = content[i].publisher;

      var isbn = document.getElementById('deck-mycards-isbn');
      isbn.textContent = content[i].isbn;

      var createDate = new Date(content[i].createdon);
      var created = document.getElementById('deck-mycards-createdon');
      created.textContent = (createDate.getMonth() + 1) + '/' + createDate.getUTCDate() + '/' + createDate.getFullYear();

      var modifyDate = new Date(content[i].lastmodified);
      var modified = document.getElementById('deck-mycards-modifiedon');
      modified.textContent = (modifyDate.getMonth() + 1) + '/' + modifyDate.getUTCDate() + '/' + modifyDate.getFullYear();

      var description = document.getElementById('deck-mycards-description');
      description.textContent = content[i].description;
    }
  }
}

function searchResults(content, searchType) {

  var tbodyResults = document.getElementById('table-search-results');
  var tbodyRaw = document.getElementById('table-search-results-raw');

  if(tbodyResults != null && searchType === 'japaneasy') {
    var tableSearch = document.getElementById('table-search');
    tableSearch.removeChild(tbodyResults);

    var tableBody = document.createElement('tbody');
    tableBody.setAttribute('id', 'table-search-results');
    tableSearch.appendChild(tableBody);

    /*Populate The Table With The Search Results*/
    for(var i = 0; i < content.length; i++) {
      var japanese = document.createElement('td');
      japanese.textContent = content[i].japanese;

      var pronunciation = document.createElement('td');
      pronunciation.textContent = content[i].pronunciation;

      var english = document.createElement('td');
      english.textContent = content[i].english;

      var type = document.createElement('td');
      type.textContent = content[i].pos;

      var row = document.createElement('tr');
      row.appendChild(japanese);
      row.appendChild(pronunciation);
      row.appendChild(english);
      row.appendChild(type);
      tableBody.appendChild(row);
    };
  }
};

function rawResults(content) {
  var table = document.getElementById('table-search-raw');
  var tbody = document.getElementById('table-search-results-raw');

  if(tbody != null) {
    table.removeChild(tbody);
    var tableBody = document.createElement('tbody');
    tableBody.setAttribute('id', 'table-search-results-raw');
    table.appendChild(tableBody);
  }

  /*Populate The Table With The Search Results*/
  for(var i = 1; i < content.length; i++) {
    var results = document.createElement('td');
    results.textContent = content[i];

    var row = document.createElement('tr');
    row.appendChild(results);
    tableBody.appendChild(row);
  };
};

function jimBreen(content) {
  var table = document.getElementById('table-search-raw');
  var tbody = document.getElementById('table-search-results-raw');

  var lines = [];
  var word = [];

  for(var i = 0; i < content.length; i++) {
    var theValue = content[i].slice(0, -1);
    lines.push(theValue);
  }

  for(var i = 1; i < (lines.length - 1); i++) {
    word.push(lines[i].split(' /', 2));
  }

  if(tbody != null) {
    table.removeChild(tbody);
    var tableBody = document.createElement('tbody');
    tableBody.setAttribute('id', 'table-search-results-raw');
    table.appendChild(tableBody);
  }

  for(var i = 0; i < word.length; i++) {

    var stringArray = word[i][0].split(' ', 2);
    console.log(stringArray);

    if(stringArray[1] != null) {
      var pronunciation = stringArray[1].slice(1, -1);
    } else {
      var pronunciation = 'N/A';
    }

    var theWord = document.createElement('td');
    theWord.setAttribute('colspan', '3');
    theWord.textContent = stringArray[0];

    var thePronunciation = document.createElement('td');
    thePronunciation.setAttribute('colspan', '3');
    thePronunciation.textContent = pronunciation;

    var theMeaning = document.createElement('td');
    theMeaning.textContent = word[i][1];

    var row = document.createElement('tr');
    row.appendChild(theWord);
    row.appendChild(thePronunciation);
    row.appendChild(theMeaning);
    tableBody.appendChild(row);
  }

}

function addNewCard(content) {

  var table = document.getElementById('new-deck-card-table');
  var tbody = document.getElementById('new-deck-card-tbody');
  if(tbody === null) {
    var tbody = document.createElement('tbody');
    tbody.setAttribute('id', 'new-deck-card-tbody');
    table.appendChild(tbody);
  }

  console.log(content);

  var id = document.createElement('td');
  id.setAttribute('data-id', content.id);
  id.setAttribute('data-value', content.id);
  id.textContent = content.id;

  var word = document.createElement('td');
  word.textContent = content.word;

  var pronunciation = document.createElement('td');
  pronunciation.textContent = content.pronunciation;

  var meaning = document.createElement('td');
  meaning.textContent = content.meaning;

  var type = document.createElement('td');
  type.textContent = content.type;

  var link = document.createElement('a');
  link.setAttribute('href', '#');
  link.setAttribute('data-id', 'new-deck-card-remove');
  link.setAttribute('data-value', 'remove new card-' + content.id);
  link.textContent = 'remove';

  var remove = document.createElement('td');
  remove.appendChild(link);

  var row = document.createElement('tr');
  row.appendChild(id);
  row.appendChild(word);
  row.appendChild(pronunciation);
  row.appendChild(meaning);
  row.appendChild(type);
  row.appendChild(remove);
  tbody.appendChild(row);

}

function newProfileDeck(content) {
  console.log('newProfileDeck data: ');
  console.log(content);

  var table = document.getElementById('user-profile-deck-table');

  var id = document.createElement('td');
  id.textContent = content.id;

  var title = document.createElement('td');
  var link = document.createElement('a');
  link.setAttribute('href', '#');
  link.setAttribute('data-id', 'mydeck');
  link.setAttribute('data-value', content.username + '-' + content.deckname);
  link.textContent = content.deckname;
  title.appendChild(link);

  var cards = document.createElement('td');
  cards.textContent = content.numcards;

  var description = document.createElement('td');
  description.textContent = content.description;

  var myDate = new Date(content.createdon);
  var created = document.createElement('td');
  created.textContent = (myDate.getMonth() + 1) + '/' + myDate.getUTCDate() + '/' + myDate.getFullYear();

  var row = document.createElement('tr');
  row.appendChild(id);
  row.appendChild(title);
  row.appendChild(cards);
  row.appendChild(description);
  row.appendChild(created);

  table.appendChild(row);
}

function updateProfile(content) {
  var deckcount = document.getElementById('user-deckcount');
  deckcount.textContent = content.numcards;
}

function resetNewDeck() {
  var username = document.getElementById('modal-new-deck-username');
  var createdOn = document.getElementById('modal-new-deck-createdon');
  var deckname = document.getElementById('modal-new-deck-deckname');
  var publisher = document.getElementById('modal-new-deck-publisher');
  var source = document.getElementById('modal-new-deck-source');
  var isbn = document.getElementById('modal-new-deck-isbn');
  var description = document.getElementById('modal-new-deck-description');

  username.textContent = '';
  createdOn.textContent = '';
  deckname.value = '';
  publisher.value = '';
  source.value = '';
  isbn.value = '';
  description.value = '';
  theCards = [];
  theId = 1;

  var word = document.getElementById('modal-new-deck-card-word');
  var pronunciation = document.getElementById('modal-new-deck-card-pronunciation');
  var meaning = document.getElementById('modal-new-deck-card-meaning');
  var type = document.getElementById('modal-new-deck-card-type');

  word.value = '';
  pronunciation.value = '';
  meaning.value = '';
  type.value = '';

  var table = document.getElementById('new-deck-card-table');
  var tbody = document.getElementById('new-deck-card-tbody');
  if(tbody != null) {
    table.removeChild(tbody);
  }
}

function resetNewCard() {
  var word = document.getElementById('modal-new-deck-card-word');
  var pronunciation = document.getElementById('modal-new-deck-card-pronunciation');
  var meaning = document.getElementById('modal-new-deck-card-meaning');
  var type = document.getElementById('modal-new-deck-card-type');

  word.value = '';
  pronunciation.value = '';
  meaning.value = '';
  type.value = '';
}

function wordSearch(searchTerm, searchType) {

  var data = {
    term: searchTerm,
    type: searchType
  }

  var searchData = JSON.stringify(data);
  console.log(searchData);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/wordSearch', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(searchData);

  xhr.addEventListener('load', function() {
    var response = JSON.parse(xhr.responseText);

    if(searchType != 'japaneasy') {
      var theBody = response[0].body;
      var testText = '';

      for(var i = (theBody.indexOf('<pre>') + 5); i < theBody.lastIndexOf('</pre>'); i++) {
        testText = testText + response[0].body[i];
      }

      var lines = testText.split('\n');

      for(var i = 1; i < lines.length; i++) {
        console.log(lines[i]);
      }

      var table1 = document.getElementById('table-search');
      var table2 = document.getElementById('table-search-raw');

      table1.setAttribute('class', 'table table-hover hide table-striped');
      table2.setAttribute('class', 'table table-hover show table-striped');

      jimBreen(lines);
    } else {
      searchResults(response, searchType);
    }
  });
}

function bookSearch(searchTerm, searchType) {

  var data = {
    term: searchTerm,
    type: searchType
  }

  var searchData = JSON.stringify(data);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/bookSearch', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(searchData);

  xhr.addEventListener('load', function() {
    var response = JSON.parse(xhr.responseText);
    bookResults(response);
  });
}

function bookResults(content) {
  var theItems = JSON.parse(content[0].body);
  var length = theItems.items.length;
  console.log(length);
  console.log(theItems);

  for(var i = 0; i < theItems.items.length; i++) {
    // console.log(theItems.items[i]);
    if(theItems.items[i].volumeInfo.imageLinks) {
      console.log(theItems.items[i].volumeInfo.imageLinks.thumbnail);
    }

    console.log(theItems.items[i].volumeInfo.title);
    console.log(theItems.items[i].volumeInfo.subtitle);
    console.log(theItems.items[i].volumeInfo.publisher);
    console.log(theItems.items[i].volumeInfo.publishedDate);
    console.log(theItems.items[i].volumeInfo.industryIdentifiers);
  }
}

function radioButton(dataId) {
  if(dataId === 'search-btn') {
    var form = document.getElementById('radio-form');
    var length = form.elements.length;
    var name = 'optionsRadios';
    var radioButton = form.elements[name];
    var result = [];

    for(var i = 0; i < length; i++) {
      if(radioButton[i].checked === true) {
        result = radioButton[i].getAttribute('data-value');
      }
    }

    return result;
  } else {
    var form = document.getElementById('radio-form-book');
    var length = form.elements.length;
    var name = 'bookRadios';
    var radioButton = form.elements[name];
    var result = [];

    for(var i = 0; i < length; i++) {
      if(radioButton[i].checked === true) {
        result = radioButton[i].getAttribute('data-value');
      }
    }

    return result;
  }
}
