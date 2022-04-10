//process.env.NODE_ENV is an environment variable that usually has a value of development or //production. So the below line is saying if we are in development mode require the 'dotenv' node //module. When 'dotenv' is required it will look in the '.env' file that we created and add the //variables that we defined in that file to process.env object in our node app. Then we can for //instance access process.env.SECRET. SECRET is the variable we defined in the .env file
//if (process.env.NODE_ENV !== "PRODUCTION") {
//	require('dotenv').config();
//}
	require('dotenv').config();
//process.env.NODE_ENV = 'production';
const express = require('express');
const path = require('path'); 
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');//powers the ability to use the boilerplate
const methodOverride = require('method-override'); // This is what allows us to have a method //other than a get or post in our form
const expressError = require('./utilities/ExpressErrors');//loads the code for a custom error //class that we wrote in another file
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash'); // this is used to display those e.g success messages when //you complete something
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/user');
//const {MongoStore} = require('connect-mongo');
const mongodbStore = require('connect-mongo')(session);//by adding '(session)' at the end means that we immediately execute it
const mongoSanitize = require('express-mongo-sanitize');// this is to prevent users from entering //prohibited characters such as $ or '.' in forms or in query strings that might be used to attack //the database
const helmet = require('helmet');//this is use for security
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl); 

//const db = mongoose.connection; 
//db.on("error", console.error.bind(console, "connection error:"));
//db.once("open", () => {
//    console.log("Database connected");
//});
const app = express();




app.engine('ejs', ejsMate)

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));// this is to allow us to get get back the queries //entered in the form through 'req.body'. Whithout this req.body will be empty.
app.use(methodOverride('_method')); // the '_method' will be use as the query string in the form //action attribute url to set the request method to a put or patch. You first have to require //methodOverride be using this middleware

const secret = process.env.SECRET || 'thisisasecret'

const store = new mongodbStore({
	url: dbUrl, // this is the location to save the session
	secret,
	touchafter: 24 * 60 * 60 //This is telling the app not to update the session everytime the //user refreshes the page unless some new data needs to be added to the session. Besides that //upadte only every 24 hours. The time here must be expressed in seconds
});

//this check if there is an error when session is stored to database
store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e)
});
const sessionConfig = {
	store,
	mame: 'session', //setting a custom name for the session improves the security of the site as //the default name might be known by bad actors
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,//this makes our cookies onlly accessible through http and not javascript. //This is considered a security measure
//		secure:true, // this means that the cookie can only work over https
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // this sets the expiration date. it will //expire after date.now plus 1 week. So i.e after a week from the time the request is //received
		maxAge: 1000 * 60 * 60 * 24 * 7 // this sets the max age to one week
	}
}
app.use(session(sessionConfig));//this always has to be used before 'app.use(passport.session())' //that is below

app.use(flash());
app.use(helmet());//this loads all the helmet middleware in  the app. In the version of helmet used with this app that number is 11. But current version of helmet has about 15

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
	"https://cdn.jsdelivr.net",

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drnadkdqd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());//this is to be able to actually use passport
app.use(passport.session()); // this is to allow persistent login so the user does not have to //login everytime he come to the page
passport.use(new localStrategy(User.authenticate()));// this is telling the passport module to use //the 'passport-local' module that we set to 'localStrategy' and to use an authentication method //that is found on our 'User' model; that's done with this 'User.authenticate())'
passport.serializeUser(User.serializeUser()); //this tells passport how to serialize a user. //Serializisation is about how do we store a user in a session
passport.deserializeUser(User.deserializeUser()); //deserialize is about how do we remove a user //from a session

//this has to be put before the routes handlers
//res.locals.success sets the ‘messages’ property  on the res.locals object to the value of //req.flash('success');. Note that ‘success’ can only be accessed in the route that was //redirected to when req.flash was created. In this case, we created req.flash in the post route //and then we redirected to the  index route. So when we use res.locals, ‘messages’ will only be //available in the index route and can be used in the view that is rendered in the index route //(i.e ‘farms/index’)
app.use((req, res, next) => {
	res.locals.currentUser = req.user; //req.user is a property added to the req object by //passport. It's an object that contains the user's username and email. 'currentUser' will now //be a variable accessible in all our views ejs files
    res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
    next();
})

app.get('/fakeuser', async(req,res) => {
	const user = new User({email: 'kandebabou@gmail.com', username:'kande'});
	const newUser = await User.register(user, 'blue');
	res.send(newUser);
})





app.use('/', userRoutes);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use(express.static(path.join(__dirname,'public'))); //this will serve the files in the public //directory to the browser. i.e the client will be able to see those files in the browser dev //tools. And when adding the path for the src in a script tag, we can just have '/<nameOfOurFile>' //and that file will be considered a publi file and express will automatically look in the public //directory for it
app.use(mongoSanitize());



app.get('/', (req,res) => {
	res.render('home'); 
}); 

//creating a review linked to a specific campground


app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})



app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong'} = err;
    res.status(statusCode).render('error', {err});
})

console.log(process.env.NODE_ENV)


app.listen(3000, () => {
	console.log('listening on port 3000');
})

//	const campground = await Campground.findById(req.params.id);
//	const review = req.body.review;
//	const addreview = new Review(review);
//	campground.reviews.push(addreview);
//	await addreview.save();
//	await addreview.save();
