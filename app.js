//jshint esversion:6
require('dotenv').config()
const express= require("express");
const bodyParser= require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app= express();
//md5 encryption-- const md5 = require("md5");
//const encrypt = require("mongoose-encryption");
//bcrypt-- var bcrypt = require('bcrypt');

//bcrypt version-- salting
// const saltRounds= 3 -- use more than 10 in real life

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
//passport use
app.use(session({
	secret: "my secret",
	resave: false,
	saveUninitialized: false
	}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
const userSchema= new mongoose.Schema ({
	email: String,
	password: String
});
userSchema.plugin(passportLocalMongoose); //authenicated
//encryption - secret
//mongoose encryption
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User= new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
	res.render("home");
});
app.get("/login", function(req, res){
	res.render("login");
});
app.get("/register", function(req, res){
	res.render("register");
});
app.get("/secrets", function(req, res){
	if (req.isAuthenticated()){
		res.render("secrets");
	} else{
		res.redirect("/login");
	}
});
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
})
app.post("/register", function(req, res){
	User.register({username: req.body.username}, req.body.password, function(err, res){
		if (err){
			console.log(err);
			res.redirect("/register");
		} else{
			passport.authenicate("local")(req, res, function(){
				res.redirect("/secrets");
			});
		}
	});
	//-------------------------------------------
	//bcrypt and md5 views
	//-------------------------------------------
			// 	bcrypt.hash(req.body.password, saltRounds, function(err, hash){
			// 		const newUser = new User ({
			// 		email: req.body.username,
			// 		password: hash

			// 	});
			// 	md5--
			// 	const newUser = new User ({
			// 		email: req.body.username,
			// 		//md5-- password: md5(req.body.password)

			// 	});
			// 	newUser.save(function(err){
			// 		if (err){
			// 			console.log(err);
			// 		} else{
			// 			res.render("secrets");
			// 		}
			// 	});
			// });
//----------------------------------------------------------

});
app.post("/login", function(req, res){
const user= new User({
	username: req.body.username,
	password: req.body.password
});
req.login(user, function(err){
	if(err){
		console.log(err);
	} else{
		passport.authenicate("local");
		res.redirect("/secrets");
	}
});

	//-------------------------------------------
	//bcrypt and md5 views
	//------------------------------------------
	// const username = req.body.username;
	// //for md5- const password = md5(req.body.password);
	// //bcrypt
	// const password = req.body.password;
	// User.findOne({email: username}, function(err, foundUser){
	// 	if(err){
	// 		console.log(err);
	// 	} else{
	// 		if (foundUser){
	// 			/*if (foundUser.password === password){
	// 				res.render("secrets");*/
	// 				//bcrypt--
	// 			bcrypt.compare(password, foundUser.password, function(err, result){
	// 					if(result == true){
	// 						res.render("secrets");
	// 					}
	// 			});
	// 			}
	// 		}
		
	// });
});

app.listen(3000, function(){
	console.log("Server running on port 3000");
});