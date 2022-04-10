class ExpressError extends Error {
	constructor(message, statusCode) {
		super(); //'super' is used to inherit all the other properties of 'Error' in this new //class. You must use it in the constructor of a  new class that extends from another //before using the 'this' keyword. In other words you must put 'super' first before using //'this'
		this.message = message;
		this.statusCode = statusCode;
	}
};

module.exports = ExpressError;