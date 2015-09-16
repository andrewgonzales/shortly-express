var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var pw = model.get('password');
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(pw, salt);
      model.set('password', hash);
    });
  },

  checkPassword: function(password, callback){
    bcrypt.compare(password, this.get('password'), function(err, match){
      callback(match);
    })
  }



});

module.exports = User;