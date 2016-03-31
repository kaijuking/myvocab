'use-strict';

document.addEventListener('click', function(event) {
  event.preventDefault();

  var theTarget = event.target;

  /*Target Events For The Tabs: Profile, My Decks, My Cards and Search*/
  if(theTarget.getAttribute('data-id') === 'user-profile') {
    $('#tab-user-profile a[href="#user-profile"]').tab('show');
  }

  if(theTarget.getAttribute('data-id') === 'user-mydecks') {
    console.log('test');
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
          loadDropDown(username, decks);
        })
      }
    })

    $('#tab-user-mydecks a[href="#user-mydecks"]').tab('show');

  }

  if(theTarget.getAttribute('data-id') === 'user-mycards') {
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
    console.log(deckInfo);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/loadDeck', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(deckInfo);

    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.responseText);
      loadDeck(deck, response);
    });
  };

  if(theTarget.getAttribute('data-id') === 'dropdown-deck-title') {
    var deckTitle = theTarget.getAttribute('data-value');
    console.log(deckTitle);
    //
    // var data = {
    //   username: user,
    //   deckname: deck
    // }
    //
    // var deckInfo = JSON.stringify(data);
    // console.log(deckInfo);
    //
    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', '/loadDeck', true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.send(deckInfo);
    //
    // xhr.addEventListener('load', function() {
    //   var response = JSON.parse(xhr.responseText);
    //   loadDeck(deck, response);
    // });
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
    console.log(response);
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
        console.log(info);

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
      membersince.textContent = myDate.getMonth() + '/' + myDate.getUTCDate() + '/' + myDate.getFullYear();

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
        created.textContent = myDate.getMonth() + '/' + myDate.getUTCDate() + '/' + myDate.getFullYear();

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

  console.log('the username is: ' + content.username);

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
      var name = document.getElementById('deck-name');
      name.textContent = content[i].deckname;

      var cardcount = document.getElementById('deck-cardcount');
      cardcount.textContent = content[i].numcards;

      var createDate = new Date(content[i].createdon);
      var created = document.getElementById('deck-createdon');
      created.textContent = createDate.getMonth() + '/' + createDate.getUTCDate() + '/' + createDate.getFullYear();

      var modifyDate = new Date(content[i].lastmodified);
      var modified = document.getElementById('deck-modifiedon');
      modified.textContent = modifyDate.getMonth() + '/' + modifyDate.getUTCDate() + '/' + modifyDate.getFullYear();

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
        cardNum.textContent = content[i].cards[n].id;

        var theWord = document.createElement('th');
        theWord.textContent = content[i].cards[n].word;

        var thePronunciation = document.createElement('th');
        thePronunciation.textContent = content[i].cards[n].pronunciation;

        var theMeaning = document.createElement('th');
        theMeaning.textContent = content[i].cards[n].meaning;

        var theType = document.createElement('th');
        theType.textContent = content[i].cards[n].type;

        var link = document.createElement('a');
        link.setAttribute('href', '#');
        link.setAttribute('data-id', 'deck-card-edit');
        link.setAttribute('data-value', content[i].username + '-' + content[i].deckname + '-' + content[i].cards[n].id)
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

function loadDropDown(username, decks) {
  var dropdown = document.getElementById('deck-dropdown');
  var items = document.getElementById('deck-dropdown-items');

  if(decks != null) {
    dropdown.removeChild(items);
    var newItems = document.createElement('ul');
    newItems.setAttribute('class', 'dropdown-menu');
    newItems.setAttribute('aria-labelledby', 'deck-dropdown');
    newItems.setAttribute('id', 'deck-dropdown-items');
  }

  /*Populate The Dropdown Menu With Deck Names*/
  for(var i = 0; i < decks.length; i++) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.setAttribute('href', '#');
    link.setAttribute('data-id', 'mydeck');
    link.setAttribute('data-value', username + '-' + decks[i])
    link.textContent = decks[i];
    item.appendChild(link);
    newItems.appendChild(item);
    dropdown.appendChild(newItems);
  }
}
