var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  defaults: {
    salt: ''
  },

  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var pw = model.get('password');
      // console.log(pw);
      var salt = bcrypt.genSaltSync(10);
      model.set('salt', salt);
      var hash = bcrypt.hashSync(pw, salt);
      model.set('password', hash);
    });

  }





});

module.exports = User;