// JavaScript Document
const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister = (req, res) => {
	res.render('users/register');
};

module.exports.createUser = async(req,res, next) => {
	try { // if statements inside try do not throw an exception then it will run normally
	const {email, username, password} = req.body;
	const user = new User({email, username});
	const registeredUser = await User.register(user, password) //this method will create a salt //and hash the 'password' from line 11 and store that in 'user' from line 12
	
	//req.login is a method given to us by passport. It takes the 'registeredUser' created above //and will log him/her in right after he/she registers
	req.login(registeredUser, err => { 
		if (err) return next(err);
	req.flash('success', 'welcome to yelpcamp!');
	res.redirect('/campgrounds');
		
	})
	
	
	
	} catch(e) {
		req.flash('error', e.message); //if an exception is returned in try block, send a error //flash with the message being the value of 'e.message'
		res.redirect('/register');
	}

	
};

module.exports.renderLogin = (req,res) => {
	res.render('users/login');
};

module.exports.login = (req, res) => {
	req.flash('success', 'welcome back!');
	const redirectUrl =req.session.returnTo || '/campgrounds'; //
	delete req.session.returnTo; // this is done so that if the user then logout and then go //staright to the login page and login then he shouldnt be redirected to what was previously //saved in req.session.returnTo
	res.redirect(redirectUrl);
	
};

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Goodbye');
	res.redirect('/campgrounds');
};