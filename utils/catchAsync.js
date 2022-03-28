// Utility in which we wrap our entire async function in routes.
// We then add .catch to it and call next if an error arises.

// This is the easiest way to handle errors in async function, since they
// don't behave as usual ones and simply throwing and error won't necessarily work.
// Thats why we use this to wrap the entire async function and be 100% sure that we will catch the error.

module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
