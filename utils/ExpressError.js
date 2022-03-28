//  A utility which helps us create our own custom Error from ExpresError.
//  We have our two arguments, message and status code which we than add to
//  the errors.message and .statusCode which we later render on our error template
//  with our middleware

class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
