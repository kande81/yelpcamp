// JavaScript Document
const {campgroundSchema} = require('./joiSchema.js')//this loads the error validation schema //created with the 'joi' node package
const expressError = require('./utilities/ExpressErrors');
const Campground = require('./models/campground');
const {reviewSchema} = require('./joiSchema.js')//this loads the error //validation schema created with the 'joi' node package
const Review = require('./models/review');
							 

//req.isAuthenticated() is a method added to the req object by passport. it will check if a user //is logged in
module.exports.isLoggedIn = (req, res, next) => {
	if(!req.isAuthenticated()){
	req.session.returnTo = req.originalUrl;//req.originalUrl property has the value of the url path //of the button that was clicked. So here we are adding 'returnTo' to the req.session object.
	req.flash('error', 'you must be signed in');
	return res.redirect('/login');
}	
	next();
};

module.exports.validateCampground = (req, res, next) => { //this is a middleware that will //validate the data using the error schema that was created with the joi packagae.
		const {error} = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join();//error.details is an array of //objects. The '.map' method will go through each elements in the array and return //'el.message' and will put all those in a new array. That's how the map method works. The //'.join' method then join all the elements in that new array into a single string.
		throw new expressError(msg,400)//sends the error to the error handler at the bottom of //this file
	} else {
		next();
	}
}

//.equals is a mongoose method. It compares mongoose ObjectId's to see if they're equal
module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if(!campground.author.equals(req.user._id)) {
		req.flash('error', 'you do not have permission to do that');
		return res.redirect(`/campgrounds/${id}`);
	} 
	
	next();
};

module.exports.validateReview = (req, res, next) => { //this is a middleware that will validate the //data //using the error schema that was created with the joi packagae.
		const {error} = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join();//error.details is an array of //objects. The '.map' method will go through each elements in the array and return //'el.message' and will put all those in a new array. That's how the map method works. The //'.join' method then join all the elements in that new array into a single string.
		throw new expressError(msg,400)//sends the error to the error handler at the bottom of //this file
	} else {
		next();
	}
}
module.exports.isReviewAuthor = async (req, res, next) => {
	const { id,reviewId} = req.params;
	const review = await Review.findById(reviewId);
	if(!review.author.equals(req.user._id)) {
		req.flash('error', 'you do not have permission to do that');
		return res.redirect(`/campgrounds/${id}`);
	} 
	
	next();
};