'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var engine = require('ejs-locals');
var bodyparser = require('body-parser');
var mongoStore = require('connect-mongo')(session);
var path = require('path');
var Yelp= require('yelp-fusion');
var client;
var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

var http = require("http");

var request = require('request');

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, '/app/views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true,
	store: new mongoStore({
		url:process.env.MONGO_URI,
		autoRemove:'native'
	})
}));

app.use(passport.initialize());
app.use(passport.session());

var port = process.env.PORT || 8080;

app.listen(port,  function () {
    Yelp.accessToken(process.env.APP_ID, process.env.APP_SECRET).then(response => {
    client = Yelp.client(JSON.parse(response.body).access_token);
    routes(app, passport,client);
    });
    console.log('Node.js listening on port ' + port + '...');
});


/*app.get('/error',function(req,res){
		res.render('error',{login:req.isAuthenticated()});
	});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
        	login:req.isAuthenticated(),
            message: err.message,
            error: err
        });
    });
	}

// production error handler
// no stacktraces leaked to user
/*app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
    	login:req.isAuthenticated(),
        message: err.message,
        error: {}
    });
});

/*app.get('*', function(req, res){
  		res.render('404',{login:req.isAuthenticated()});
	});*/


