// JavaScript Document
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//cloud_name, api_key, api_secret have to be named and spelled as shown
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET
});

//this sets up CloudinaryStorage to have the credentials for our cloudinary account
const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder:'YelpCamp', // this is the folder in cloudinary where we will save the files.
		allowedFormats: ['jpeg', 'png', 'jpg']
	}
});

module.exports = {
	cloudinary,
	storage
}