// JavaScript Document seed file
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
		const price= Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
			author:'623fdcc2f9c4beaf3af9a995',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,

			description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium debitis odit ut possimus',
			geometry: {
				type : "Point",
				coordinates: [ cities[random1000].longitude, cities[random1000].latitude]
				
			},
			images:  [
    {
      url: 'https://res.cloudinary.com/drnadkdqd/image/upload/v1648959823/YelpCamp/w1mkj4s1ck4a0h1uwjg5.jpg',
      filename: 'YelpCamp/w1mkj4s1ck4a0h1uwjg5',

    },
    {
      url: 'https://res.cloudinary.com/drnadkdqd/image/upload/v1648959824/YelpCamp/w2soddxtstgmw7fehihn.jpg',
      filename: 'YelpCamp/w2soddxtstgmw7fehihn',
    }
  ],

			price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
