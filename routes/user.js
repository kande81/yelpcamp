// JavaScript Document
const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users')

router.get('/register', users.renderRegister);

router.post('/register', catchAsync(users.createUser));

router.get('/login', users.renderLogin);

//failureFlash:true, will flash an error message if the login fails. This flash is done by //passport.
router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}),  users.login);
//req.logout is a method added by passport that will log the user out
router.get('/logout', users.logout);


module.exports = router;