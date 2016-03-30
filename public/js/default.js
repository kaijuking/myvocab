'use-strict';

document.addEventListener('click', function(event) {
  event.preventDefault();

  var theTarget = event.target;

  /*Target Events For The Tabs: Profile, My Decks, My Cards and Search*/
  if(theTarget.getAttribute('data-id') === 'user-profile') {
    $('#tab-user-profile a[href="#user-profile"]').tab('show');
  }

  if(theTarget.getAttribute('data-id') === 'user-mydecks') {
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
      console.log(response);
      loadDeck(response);
    });
  };

});

var login = document.getElementById('btn-login');
login.addEventListener('click', function(event) {
  event.preventDefault();

  var loginPage = document.getElementById('login-page');
  var homePage = document.getElementById('home-page');

  var theUsername = document.getElementById('login-username').value;
  var thePassword = document.getElementById('login-password').value;

  var data = {
    username: theUsername,
    password: thePassword
  }

  var loginInfo = JSON.stringify(data);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/login', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(loginInfo);

  xhr.addEventListener('load', function() {
    var response = JSON.parse(xhr.responseText);
    console.log(response);
    var length = response[0].decks.length;

    if(response != false) {

      var p1 = new Promise(function(resolve, reject) {
        var picture = document.getElementById('user-profile-picture');
        picture.setAttribute('src', '/images/' + response[0].profilepicture);

        var name = document.getElementById('user-username');
        name.textContent = response[0].username;

        var email = document.getElementById('user-email');
        email.textContent = response[0].email;

        var deckcount = document.getElementById('user-deckcount');
        deckcount.textContent = length;

        var myDate = new Date(response[0].createdon);
        var membersince = document.getElementById('user-member-since');
        membersince.textContent = myDate.getMonth() + '/' + myDate.getUTCDate() + '/' + myDate.getFullYear();

        var description = document.getElementById('user-description');
        description.textContent = response[0].description;
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
          link.setAttribute('data-value', response[0].username + '-' + response[1][i].deckname);
          link.textContent = response[1][i].deckname;
          title.appendChild(link);

          var cards = document.createElement('th');
          cards.textContent = response[1][i].numcards;

          var description = document.createElement('th');
          description.textContent = response[1][i].description;

          var myDate = new Date(response[1][i].createdon);
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

  });
});

function loadDeck(dataArray) {
  console.log(dataArray);
}
