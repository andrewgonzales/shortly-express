var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config')
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var uuid = require('node-uuid');
var app = express();

var sess;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session({
        // genid: function(req){
        //   return uuid.v1();
        // },
        secret: 'nyan cat', 
        cookie: {maxAge: 30000}, 
        resave: false, 
        saveUninitialized: true}));

app.get('/', util.checkUser, function(req, res) {
    res.render('index');
});

app.get('/create', util.checkUser, function(req, res) {
    res.render('index');
});

app.get('/links', util.checkUser, function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', util.checkUser, function(req, res) {

  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {//Already in database
      res.send(200, found.attributes);
    } else {

      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/login', 
function(req, res) {
  sess = req.session;
  if(sess.username){
    res.redirect('/index');
  } else {
    res.render('login');
  }
});

app.post('/login', function(req,res){
  var username = req.body.username;
  var password = req.body.password;
  // sess = req.session;
  // sess.username = req.body.username;

  //Bookshelf will turn this into a SQL query using the where statement since we have fetch()
  new User({username: username}).fetch().then(function(found){
    if (found){ //in db
      found.checkPassword(password, function(match){
        if(match) {
          util.createSession(req, res, found);
        } else {
          res.redirect('/login');  
        }
      });
    } else {
      res.redirect('/login')
    }  //username not in db, redirect to signup
  });

  //redirect to index
});
 
app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/login');
  });
});



app.get('/signup', 
function(req, res) {
  res.render('signup');
});

app.post('/signup', function(req,res){
  //Store username and hashed password into user table
  var username = req.body.username;
  var password = req.body.password;
  new User({username: username}).fetch().then(function(found){
    if (found) {
      res.redirect('/login');
    } else {  
      var user = Users.create({
        username: username,
        password: password
      })
      .then(function(user){
        util.createSession(req, res, user);
      });
    }
  });
});



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
