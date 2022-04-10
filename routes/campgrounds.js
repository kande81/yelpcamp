// JavaScript Document
const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer')
const {storage} = require('../cloudinary');//here we don't have to specify '/index' that's inside //the cloudinary folder because when a folder is not specified node automatically looks for an //index.js file 

//this tells multer to store the files uploaded from the form to 'storage'
const upload = multer({storage }); 

 

const Campground = require('../models/campground'); 
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

router.route('/')
	.get( catchAsync(campgrounds.index))//.index refers to the function that is exported in the //campgrounds controller file
	.post( isLoggedIn, upload.array('image'),validateCampground, catchAsync(campgrounds.createCampground))
	

//it's important to put the'/new/ route before the '/:id' route because since a javascript program //runs line by line from bottom to top, if we requested /new but we had '/:id' first the code will //return an error once it reaches /:id because it will treat 'new' as an id but wont be able to //find it in the database
router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
	.get( catchAsync(campgrounds.showCampground))
	.put(isLoggedIn,isAuthor,upload.array('image'), catchAsync(campgrounds.updateCampground))
	.delete(isLoggedIn, isAuthor,catchAsync(campgrounds.destroyCampground))









router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));



module.exports = router;
