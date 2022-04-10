// JavaScript Document
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');//the last part 'geocoding' //is called a service and can have different value. All the different services can be found in the //mapbox/mapbox-sdk-js github page
const mapBoxToken = process.env.MAPBOX_TOKEN; // all the variables in the .env file can be //accessed with process.env
const geocoder = mbxGeocoding({accessToken: mapBoxToken})//accessToken: is required by the mapbox //module that we required. With this statement geocoder will now contain 2 mehods: fowardGeocode //and reverseGeocode
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req,res) => {
	
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', {campgrounds})
};

module.exports.renderNewForm = (req, res) => {
	
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res,next) => {
	
	const geoData = await geocoder.forwardGeocode({
		query: req.body.campground.location,//this will turn the location that the user enters //into geometric coordinates and will be available in geoData.body.features[0].geometry;
		limit:1
		
	}).send()

	const newCamp =  new Campground(req.body.campground);
	//geoData.body.features[0].geometry is coming from the mapbox api via our 'geoData' variable and will contain the geometric coordinates of the location that the user entered in our form
	newCamp.geometry = geoData.body.features[0].geometry;
	newCamp.images = req.files.map(f =>({url: f.path, filename: f.filename}));
	newCamp.author = req.user._id; 
	await newCamp.save();
	console.log(newCamp);

	req.flash('success', 'Successfully made a new campground!');
	res.redirect(`/campgrounds/${newCamp.id}`);
	
	};

module.exports.showCampground = async (req, res) => {
	const {id} = req.params;
	//the .populate({path:'reviews', populate:{path:'author'}}) is first populating the reviews //property in the campground. That is what 'path' refers to. And for each review populate is //'author' property. As the 'author' was saved as objectid's in the review model.
	const campground = await Campground.findById(req.params.id).populate({
		path: 'reviews',
		populate: {
			path: 'author'
		}
	}).populate('author'); //the '.populate' will populate the reviews property in the campground //document which is initially saved as an object id per the way we set it up in thje schema
	if(!campground) { //if no campgrounds ae found then flash error
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
		if(!campground) { //if no campgrounds are found then flash error
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds');
	}

	res.render('campgrounds/edit', {campground});
};

module.exports.updateCampground = async (req, res) => {
	
    const {id} = req.params;
//	console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	//The next 2 lines allow us to update the images in the database
	const imgs = req.files.map(f =>({url: f.path, filename: f.filename}));
	campground.images.push(...imgs);
	await campground.save();
	if (req.body.deleteImages) {
		for(let filename of req.body.deleteImages) {
			//cloudinary.uploader.destroy is a method that comes with cloudinary. It will delete //the filename passed as agument from cloudinary
			await cloudinary.uploader.destroy(filename);
		}
		//This will remove images from the images property on the document whose filename property //value is found in req.body.deleteImages. Images are removed from mongo database
		await campground.updateOne({$pull: {images:{filename:{$in: req.body.deleteImages}}}});
	}

	req.flash('success', 'successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.destroyCampground = async (req, res) => {
	const {id} = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted campground');
	res.redirect('/campgrounds');
};