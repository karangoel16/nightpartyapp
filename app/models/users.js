'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var User = new Schema({
	service:String,
	displayName:String,
	twitter:{
		id:String,	
		username:String
	},
	github: {
		id: String,
		username: String,
      		publicRepos: Number
	},
	local:{
		id:String,
		username:{
			type:String,
			unique:true,
			sparse:true
		}
	},
   nbrClicks: {
      clicks: Number
   },
   city:String,
   state:String,
   hash:String,
   salt:String
});

User.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64,'SHA1',function(err){
    	if(err){
    		console.log(err);
    		return;
    	}
    	console.log("success");
    }).toString('hex');
}

User.methods.validatePassword = function(password){
    var hash=crypto.pbkdf2Sync(password, this.salt, 1000, 64,'SHA1').toString('hex');
    return this.hash === hash;
};
module.exports = mongoose.model('User', User);
