var request = require('request');
var dbConfig = require('../app/config');
var bcrypt = require('bcrypt-nodejs');
var User = require('../app/models/user');
// var db = openDatabase(dbConfig, '3.8.5', 'User Info', 2*1024*1024);

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

// exports.checkPassword = function(username, password){
//   console.log(username, password);
//   var model = new User({username: username});
//   model.query('where', 'username', '=', username)
//     .fetch()
//     .then(function(model){
//       var salt = model.get('salt');
//       var storedHashedPW = model.get('password');
//       // console.log('Salt: ', model.get('salt'));
//       // console.log('Salt: ', model.salt);

//       var enteredHashedPW = bcrypt.hashSync(password, salt);
//       console.log('New hashed pw: ', enteredHashedPW);
//       console.log('Stored hashed pw: ', storedHashedPW);
//       return enteredHashedPW === storedHashedPW;
//   });

//   // return enteredHashedPW === storedHashedPW;

// };
var isLoggedIn = function(req) {
  return req.session ? !!req.session.user : false;
}

exports.checkUser = function(req, res, next){
  if (!isLoggedIn(req)) {
    res.redirect('/login');
  } else {
    next();
  }
}

exports.createSession = function(req, res, newUser) {
  return req.session.regenerate(function() {
    req.session.user = newUser;
    res.redirect('/');
  });
};

  //query for salt at username
    // db.transaction(function(tx) {
    //   tx.executeSql('SELECT * FROM users WHERE username=?', [username], function(tx, results){
    //     console.log(results);
    //   });
    // });
  //rehash password with salt
  //compare password in db with rehashed pw
// 