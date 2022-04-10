// JavaScript Document
const baseJoi = require('joi');
// campgroundSchema = joi.object this is saying that 
//we are expecting campgroundSchema to be an object
// we are exptecting that object to have a property 'campground' 
	//that should be an object

const sanitizeHtml = require('sanitize-html');

//this code to to prevent cross site scripting attacks
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),//this will add an extension(i.e a method) on joi.string. The name of the //method is 'escapeHTML' further below in this function. So in the schema that we defined at //the bottom of the file we can add that method whenever we have joi.string. e,g from below:	//description: joi.string().required().escapeHTML()

    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, { //sanitizeHtml is a node package that needs to //be installed
					//allowedTags and allowedattributes are used to define what is allowed. In /this cased here we are not allowing any html tags nor attribute
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const joi = baseJoi.extend(extension)




module.exports.campgroundSchema = joi.object({ 
		campground: joi.object({ 						
			title: joi.string().required().escapeHTML(),
			price: joi.number().required().min(0),
//			image: joi.string().required(),
			location: joi.string().required().escapeHTML(),
			description: joi.string().required().escapeHTML()
		}).required()
	});
	
//The way this will be used in the controller is by calling campgroundSchema.validate(expression to //validate)

module.exports.reviewSchema = joi.object({
	review: joi.object({
		rating: joi.number().required(),
		body: joi.string().required().escapeHTML()
	}).required()
});