// JavaScript Document
const express = require('express');
const router = express.Router({ mergeParams: true }); // { mergeParams: true } this gives us //access to the ':id' in 'app.use('/campgrounds/:id/reviews', reviews)' that we defined in the //controller. The only reason we used this option here is because the app.use contains an ':id'. //When the ':id' is included here in the router then we don't need to use that option.
const {validateReview, isLoggedIn,isReviewAuthor} = require('../middleware');
const catchAsync = require('../utilities/catchAsync');

const expressError = require('../utilities/ExpressErrors');//loads the code for a custom error //class that we wrote in another file
const Review = require('../models/review'); 
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews');




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
//DELETE ROUTE COMMENT. { $pull: { reviews: reviewId } } this will remove a review in the reviews
// property that matches 'reviewId'. the 'pull' operator is used only when removing from a //property that contains an array
router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchAsync(reviews.destroyReview));

module.exports = router;
