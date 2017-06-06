var mongoose = require('mongoose');
var Places = require('./places');
var Schema = mongoose.Schema;

var citySchema=new Schema({
	name:String,
	place:[{type: mongoose.Schema.Types.ObjectId, ref: 'Places'}]
});
citySchema.methods.addPlace = function(Place){
	this.update({$push:{place:Place}},function(err){
		if(err){
			console.log(err);
			return ;
		}
		console.log("Added place into city");
	});
}
citySchema.methods.pop = function(){
	this.populate('place place.user');
}
module.exports=mongoose.model('CITY',citySchema);