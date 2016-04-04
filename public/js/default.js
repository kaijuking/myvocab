'use-strict';

var reviewCards;
var startIndex = 0;
var currentIndex = 0;

document.addEventListener('click', function(event) {
  event.preventDefault();

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
        var id = document.createElement('th');
        id.textContent = i + 1;

        var title = document.createElement('th');
        var link = document.createElement('a');
        link.setAttribute('href', '#');
        link.setAttribute('data-id', 'mydeck');
        link.setAttribute('data-value', info[0].username + '-' + info[1][i].deckname);
        link.textContent = info[1][i].deckname;
        title.appendChild(link);

        var cards = document.createElement('th');
        cards.textContent = info[1][i].numcards;

        var description = document.createElement('th');
        description.textContent = info[1][i].description;

        var myDate = new Date(info[1][i].createdon);
        var created = document.createElement('th');
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
        var cardNum = document.createElement('th');
        cardNum.setAttribute('data-id', 'id');
        cardNum.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        cardNum.textContent = content[i].cards[n].id;

        var theWord = document.createElement('th');
        theWord.setAttribute('data-id', 'word');
        theWord.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        theWord.textContent = content[i].cards[n].word;

        var thePronunciation = document.createElement('th');
        thePronunciation.setAttribute('data-id', 'pronunciation');
        thePronunciation.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        thePronunciation.textContent = content[i].cards[n].pronunciation;

        var theMeaning = document.createElement('th');
        theMeaning.setAttribute('data-id', 'meaning');
        theMeaning.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        theMeaning.textContent = content[i].cards[n].meaning;

        var theType = document.createElement('th');
        theType.setAttribute('data-id', 'type');
        theType.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        theType.textContent = content[i].cards[n].type;

        var link = document.createElement('a');
        link.setAttribute('href', '#');
        link.setAttribute('data-id', 'deck-card-edit');
        link.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id);
        link.textContent = 'edit';

        var edit = document.createElement('th');
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
