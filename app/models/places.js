var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require("./users");
mongoose.Promise = require('bluebird');
var placesSchema = new Schema({
	id:String,
	name:String,
	coordinates:{
		latitude:Number,
		longitude:Number
	},
	image_url:String,
	rating:Number,
	user:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});
placesSchema.methods.addUser = function(val){
	this.update({$addToSet:{user:val}},function(err){
		if(err)
		{
			console.log(err);
			return;
		}
		console.log("successfully added");
	});
}
placesSchema.methods.deleteUser = function(val){
	this.update({$pull:{user:val}},function(err){
		if(err){
			console.log(err);
			return ;
		}
		console.log("successfully deleted");
	});
}

module.exports = mongoose.model('Places',placesSchema);