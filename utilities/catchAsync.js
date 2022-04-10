// JavaScript Document
module.exports = func => { // this is an axample of a function that takes a function as a parameter 
							//and return that same function
	return (req,res,next) =>{
		func(req,res,next).catch(next); // the syntax 'catch(next)' is a shortcut that is allowed by //express. normaly when we use catch the syntax should be 'catch(e => {expression})'; but //in this case 'e' is automatically passed to next which is a function.
	}
}

							