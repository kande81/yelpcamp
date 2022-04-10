// JavaScript Document
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	}
});

UserSchema.plugin(passportLocalMongoose); // this will add a username and password property to the //'UserSchema' and functionalities to store the hashed password. Additionally using //passportLocalMongoose will add some new methods to our schema.

module.exports = mongoose.model('User', UserSchema);