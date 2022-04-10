const mongoose = require('mongoose');
const Review = require('./review');
const schema = mongoose.Schema;

//this creates a schema for images that we will insert inside the campgroundSchema
const imageSchema = new schema({
	url: String,
	filename: String
})
//'this' here will refer to each element in the images property in campgroundSchema. This code //will replace '/upload' in this.url to '/upload/w_200'. This code also adds a '.thumbnail' method //to each element of the 'images' property of campgroundSchema. When that method is called then //this.url.replace('/upload', '/upload/w_200') is what is returned. Also this virtual is not saved //in the database
imageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/w_200');
})

const opts = {toJSON: {virtuals: true}}; //this will allow the virtuals properties to show on the //client side when they're converted to json. You will then pass 'opts' as an argument in //campgroundSchema 
const campgroundSchema = new schema({
    title: String,
	images: [imageSchema],
	geometry: {
		//this makes geometry an object with a 'type' property and a 'coordinate' property. This //format is called geoJson and mapbox expects the locations data to be saved in this format
    type: {
      type: String, 
      enum: ['Point'], // 'geometry.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
    price: Number,
    description: String,
    location: String,
	author: {
		type: schema.Types.ObjectId,
		ref: 'User'
		},
	reviews:[ { //this reviews property will be an array of objectid. And 'ref' value is the model //it will link to
		type:schema.Types.ObjectId,
		ref: 'Review'
	}]
}, opts);

//this will add a virtual 'properties' key on the campground schema and add a 'popUpMarup' method //on that key. So when properties.popUpMarkup is called then <a //href="/campgrounds/${this._id}">${this.title}</a> wilol be returned. This will be used to create //the link on the cluster map.
campgroundSchema.virtual('properties.popUpMarkup').get(function() {
	return `
	<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
<p>${this.description.substring(0,20)}...</p>`;
});

campgroundSchema.post('findOneAndDelete', async function(doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews
				
			}
			
		})
	}
})

module.exports = mongoose.model('Campground',campgroundSchema);

