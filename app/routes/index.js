'use strict';

var path = process.cwd();
var requestify = require('requestify');
var Places = require('../models/places');
var CITY = require('../models/city');
var User = require('../models/users');
var searchRequest = {
  term:'beer bar night',
  location: 'san francisco, ca'
};

module.exports = function (app, passport,client) {

	function isLoggedIn (req, res, next) {
		console.log(req);
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}
	app.route('/signup')
		.get(function(req,res){
			if(req.isAuthenticated())
			{
				res.redirect('/');
			}
			res.render('signup',{login:false});
		})
		.post(function(req,res){
			var user=new User();
			user.service="local";
			user.local.username=req.body.username;
			user.setPassword(req.body.password);
			console.log("reached here");
			user.save(function(err){
				if(err){
					console.log(err);
					return err;
				}
				console.log("save local success");
				res.redirect("/");
			})
		});

	app.route('/click')
		.post(isLoggedIn,function(req,res,next){
			Places.findOne({_id:req.body.data},function(err,places){
				if(err)
				{
					console.log(err);
					return ;
				}
				places.addUser(req.user._id);
				places.save(function(err){
					if(err){
						console.log(err);
						return ;
					}
					res.json({success : "Updated Successfully", status : 200});
				});
			});
		});

	app.route('/delUser')
	.post(isLoggedIn,function(req,res,next){
		Places.findOne({_id:req.body.data},function(err,places){
			if(err)
			{
				console.log(err);
				return ;
			}
			places.deleteUser(req.user._id);
			places.save(function(err){
				if(err){
					console.log(err);
					return ;
				}
				res.json({success : "Updated Successfully", status : 200});
			});
		});
	});

	app.route('/')
		.get(function (req, res,next) {
			res.render('index',{login:req.isAuthenticated()})
		})
		.post(function(req,res,next){
				var arr=[];
				searchRequest.location=req.body.place;
				client.search(searchRequest).then(response=>{
					response.jsonBody.businesses.forEach(function(d){
						Places.findOne({coordinates:d.coordinates}).then((place)=>{
							if(!place)
							{
								//we will add code here
								var Newplace = new Places();
								Newplace.image_url = d.image_url;
								Newplace.rating = d.rating;
								Newplace.coordinates = d.coordinates;
								Newplace.id = d.id;
								Newplace.name= d.name;
								Newplace.save();
								arr.push(Newplace);
							}
							else
							{
								arr.push(place)
							}
							if(arr.length==response.jsonBody.businesses.length)
							{
								if(req.isAuthenticated())
								{
									res.render('searchResult',{login:true,data:arr,user:req.user._id});
								}
								else
								{
									res.render('searchResult',{login:false,data:arr,user:null});
								}
							}
						});
					});
				});
			});

	app.route('/login')
		.get(function (req, res) {
			res.render('login',{login:false});
		})
		.post(
			passport.authenticate('local'),function(req,res){
					res.redirect('/');
			});	

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.render('profile',{login:true,user:JSON.stringify(req.user)});
		});

	app.route('/updateUser')
		.post(isLoggedIn,function(req,res){
			User.update({_id:req.user._id},{city:req.body.city,state:req.body.state,displayName:req.body.name},function(err,user){
				if(err)
				{
					console.log(err);
					return ;
				}
				res.json({success : "Updated Successfully", status : 200});
			});
		});
		
	app.route('/changePassword')
		.post(isLoggedIn,function(req,res){
			req.user.setPassword(req.body.password);
			res.json({success : "Updated Successfully", status : 200});
		});


	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter',{
			successRedirect:'/',
			failureRedirect:'/login'
		}));
};
