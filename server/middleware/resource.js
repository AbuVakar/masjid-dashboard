const { AppError } = require('./errorHandler');

/**
 * Middleware to check if a resource exists.
 * If the resource exists, it is attached to the request object as req.resource.
 * If not, it throws a 404 error.
 * @param {import('mongoose').Model} model - The Mongoose model to query.
 * @param {string} resourceName - The name of the resource (e.g., 'House').
 * @returns {function} Express middleware function.
 */
const checkResourceExists = (model, resourceName) => async (req, res, next) => {
  const resource = await model.findById(req.params.id);
  if (!resource) {
    throw new AppError(`${resourceName} not found`, 404, `${resourceName.toUpperCase()}_NOT_FOUND`);
  }
  req.resource = resource;
  next();
};

module.exports = { checkResourceExists };
