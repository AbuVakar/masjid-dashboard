const { AppError } = require('./errorHandler');

// Basic email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (schema) => (req, res, next) => {
  const errors = {};
  for (const key in schema) {
    const rule = schema[key];
    const value = req.body[key];
    const result = rule(value);
    if (result !== true) {
      errors[key] = result;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid input data', 400, 'VALIDATION_ERROR', errors);
  }

  next();
};

const rules = {
  username: (value) => {
    if (!value || typeof value !== 'string' || value.trim().length < 3) {
      return 'Username is required and must be at least 3 characters long.';
    }
    return true;
  },
  password: (value) => {
    if (!value || typeof value !== 'string' || value.length < 8) {
      return 'Password is required and must be at least 8 characters long.';
    }
    return true;
  },
  passwordComplex: (value) => {
    if (!value || typeof value !== 'string' || value.length < 8) {
      return 'Password is required and must be at least 8 characters long.';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    return true;
  },
  email: (value) => {
    if (value && (typeof value !== 'string' || !emailRegex.test(value))) {
      return 'Please provide a valid email address.';
    }
    return true;
  },
  name: (value) => {
    if (value && (typeof value !== 'string' || value.trim().length === 0)) {
      return 'Name cannot be empty.';
    }
    return true;
  },
  mobile: (value) => {
    if (
      value &&
      (typeof value !== 'string' || !/^\+?[0-9\s-()]*$/.test(value))
    ) {
      return 'Please provide a valid mobile number.';
    }
    return true;
  },
  token: (value) => {
    if (!value || typeof value !== 'string') {
      return 'Token is required.';
    }
    return true;
  },
};

const validateRegistration = validate({
  username: rules.username,
  password: rules.passwordComplex,
  email: rules.email,
});

const validateLogin = validate({
  username: rules.username,
  password: rules.password,
});

const validateUpdateProfile = validate({
  name: rules.name,
  email: rules.email,
  mobile: rules.mobile,
});

const validateChangePassword = validate({
  currentPassword: rules.password,
  newPassword: rules.passwordComplex,
});

const validateForgotPassword = validate({
  email: (value) => {
    if (!value || typeof value !== 'string' || !emailRegex.test(value)) {
      return 'A valid email is required.';
    }
    return true;
  },
});

const validateResetPassword = validate({
  token: rules.token,
  newPassword: rules.passwordComplex,
});

const validateHouse = validate({
  number: (value) => {
    if (value == null || value === '') {
      return 'House number is required.';
    }
    return true;
  },
  street: (value) => {
    if (value && (typeof value !== 'string' || value.trim().length === 0)) {
      return 'Street must be a non-empty string.';
    }
    return true;
  },
});

const validateMember = validate({
  name: (value) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'Member name is required.';
    }
    return true;
  },
  age: (value) => {
    if (
      value != null &&
      (typeof value !== 'number' || value < 0 || value > 150)
    ) {
      return 'Age must be a valid number between 0 and 150.';
    }
    return true;
  },
});

const validateResource = (req, res, next) => {
  // A bit more complex due to file upload, so we do it manually for now
  const { title, description, category } = req.body;
  const errors = {};

  if (!title || title.trim().length < 3) {
    errors.title = 'Title is required and must be at least 3 characters long.';
  }

  if (!description || description.trim().length < 10) {
    errors.description =
      'Description is required and must be at least 10 characters long.';
  }

  if (!category || category.trim().length === 0) {
    errors.category = 'Category is required.';
  }

  if (!req.file && !req.body.fileUrl) {
    // Only require file or fileUrl on create, not update
    if (req.method === 'POST') {
      errors.file = 'A file or fileUrl is required to create a resource.';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid input data', 400, 'VALIDATION_ERROR', errors);
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateHouse,
  validateMember,
  validateResource,
};
