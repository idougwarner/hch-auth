import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import { generateServerErrorCode } from '../lib/response';
import { User } from '../models';
import authHelpers from '../passport/helpers';
import config from '../config';
import {
  USER_EXISTS_ALREADY,
  SOME_THING_WENT_WRONG,
  WRONG_PASSWORD,
  USER_DOES_NOT_EXIST,
  INVALID_VERIFICATION_CODE,
  EMAIL_NOT_VERIFIED
} from '../constant';

/**
 * Select the properties that can be open to public from the user data.
 * @param {User} user user data from the database
 */
const getPublicFacingUserData = user => {
  const { authHash, newEmail, code, ...publicUser } = user;

  return publicUser;
};

/**
 * Generate a 5 digits verification code.
 * If the process is a Jest, it just returns '55555' in order to emulate sending a verification email.
 */
const getVerificationCode = () => {
  return '55555';

  if (global.TESTING) {
    return '55555';
  }

  return `${Math.floor(10000 + Math.random() * 90000)}`
};

/**
 * Create a JWT (JSON web token) for the signed in user. The expiration date is 1 week
 * @param {String} email The signed in email address
 * @param {String} provider email | facebook | google
 */
const createToken = (email, provider = 'email') => jwt.sign({ email: email.toLowerCase(), provider }, config.passportSecret, {
  expiresIn: 7 * 24 * 60 * 60 * 1000 // 1 week
});

// @ToDo Send a verification email here
const sendVerificationEmail = (email, code) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // console.log('send a verification email', email, code);
      resolve();
    }, 100);
  });
};

export const authRequired = (req, res) => {
  res.status(200).json({ msg: 'authenticated' });
};

/**
 * Returns the public user data.
 * @param {Request} req The /account request
 * @param {Response} res The /account response
 */
export const getAccount = async (req, res) => {
  res.status(200).json({
    user: getPublicFacingUserData(req.user)
  });
};

/**
 * Update full_name or phone_number of the user.
 * @param {Request} req The /update-profile request
 * @param {Response} res The /update-profile response
 * @payload
 *  - phoneNumber
 *  - fullName
 */
export const updateProfile = async (req, res) => {
  const errorsAfterValidation = validationResult(req);

  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    const { phoneNumber, fullName } = req.body;
    const tokenUser = req.user;

    try {
      const user = await User.query()
        .findOne({
          email: tokenUser.email.toLowerCase(),
          provider: tokenUser.provider
        })
        .patch({
          fullName,
          phoneNumber
        })
        .returning('*');

      res.status(200).json({
        user: getPublicFacingUserData(user)
      });
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

/**
 * Re-send a verification code when the user has not been received any verification email for some reason.
 * @param {Request} req The /resend-verification request
 * @param {Response} res The /resend-verification response
 * @payload
 *  - email
 */
export const resendVerificationCode = async (req, res) => {
  const errorsAfterValidation = validationResult(req);

  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email } = req.body;

      const user = await User.query().findOne({
        email: email.toLowerCase(),
        provider: 'email'
      });
      
      if (user) {
        const code = getVerificationCode();
        await user.$query().patch({ code });
        await sendVerificationEmail(email, code);

        res.status(200).json(true);
      } else {
        generateServerErrorCode(
          res,
          404,
          'resend-verification email error',
          USER_DOES_NOT_EXIST,
          'email'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }    
  }
};

/**
 * Create an account
 * @param {Request} req The /register request
 * @param {Response} res The /register response
 * @payload
 *  - email
 *  - phoneNumber
 */
export const registerUser = async (req, res) => {
  const errorsAfterValidation = validationResult(req);

  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email, phoneNumber: password } = req.body;

      const lowerCaseEmail = email.toLowerCase();
      const user = await User.query().findOne({
        email: lowerCaseEmail,
        provider: 'email'
      });

      if (!user) {
        await authHelpers.createUser({
          email: lowerCaseEmail,
          password,
          reqBody: req.body
        });

        const code = getVerificationCode();
        const newUser = await User.query()
          .findOne({
            email: lowerCaseEmail,
            provider: 'email'
          })
          .patch({ code })
          .returning('*');

        await sendVerificationEmail(email, code);

        res.cookie('jwt', createToken(email));
        res.status(200).json({
          user: getPublicFacingUserData(newUser)
        });
      } else {
        generateServerErrorCode(
          res,
          403,
          'register email error',
          USER_EXISTS_ALREADY,
          'email'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

/**
 * Verify an email address.
 * @param {Request} req The /verify-email request
 * @param {Response} res The /verify-email response
 * @payload
 *  - email
 *  - code
 */
export const verifyEmail = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email, code } = req.body;

      const user = await User.query().findOne({
        email: email.toLowerCase(),
        provider: 'email'
      });

      if (user) {
        if (user.code === code) {
          await user.$query().patch({ emailVerified: true });

          res.status(200).json(true);
        } else {
          generateServerErrorCode(
            res,
            403,
            'email-verification code error',
            INVALID_VERIFICATION_CODE,
            'code'
          );
        }
      } else {
        generateServerErrorCode(
          res,
          404,
          'email-verification email error',
          USER_DOES_NOT_EXIST,
          'email'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }    
};

/**
 * Check an email address to see if it exists.
 * @param {Request} req The /check-email request
 * @param {Response} res The /check-email response
 * @payload
 *  - email
 */
export const checkEmailIfExists = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email } = req.body;

      const user = await User.query().findOne({
        email: email.toLowerCase(),
        provider: 'email'
      });

      res.status(200).json(!!user);
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

/**
 * Sign in.
 * @param {Request} req The /login request
 * @param {Response} res The /login response
 * @payload
 *  - email
 *  - password
 */
export const login = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email, password } = req.body;

      const user = await User.query().findOne({
        email: email.toLowerCase(),
        provider: 'email'
      });

      if (user) {
        if (!user.emailVerified) {
          generateServerErrorCode(
            res,
            403,
            'login email unverified error',
            EMAIL_NOT_VERIFIED,
            'email'
          );
        } else {
          const isPasswordMatched = await authHelpers.comparePassword({ user, password });
          if (isPasswordMatched) {
            res.cookie('jwt', createToken(email));
            res.status(200).json({
              user: getPublicFacingUserData(user)
            });
          } else {
            generateServerErrorCode(
              res,
              403,
              'login password error',
              WRONG_PASSWORD,
              'password'
            );
          }
        }
      } else {
        generateServerErrorCode(
          res,
          404,
          'login email error',
          USER_DOES_NOT_EXIST,
          'email'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

/**
 * Start the "Forgot password" workflow.
 * Send a verification code that can be used to reset the forgot password
 * @param {Request} req The /forgot-password request
 * @param {Response} res The /forgot-password response
 * @payload
 *  - email
 */
export const forgotPassword = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email } = req.body;

      const user = await User.query().findOne({
        email: email.toLowerCase(),
        provider: 'email'
      });

      if (user) {
        const code = getVerificationCode();
        await sendVerificationEmail(email, code);
        await user.$query().patch({ code });

        res.status(200).json(true);
      } else {
        generateServerErrorCode(
          res,
          404,
          'forgot-password email error',
          USER_DOES_NOT_EXIST,
          'email'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

/**
 * Finish the workflow to reset the password.
 * @param {Request} req The /complete-forgot-password request
 * @param {Response} res The /complete-forgot-password response
 * @payload
 *  - email
 *  - code
 *  - password
 */
export const completeForgotPassword = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email, code, password } = req.body;

      const user = await User.query().findOne({
        email: email.toLowerCase(),
        provider: 'email'
      });

      if (user) {
        if (user.code === code) {
          const authHash = await authHelpers.generateAuthHash(password);
          await user.$query().patch({
            authHash,
            emailVerified: true,
            code: ''
          });

          res.status(200).json(true);
        } else {
          generateServerErrorCode(
            res,
            403,
            'forgot-password code error',
            INVALID_VERIFICATION_CODE,
            'code'
          );
        }
      } else {
        generateServerErrorCode(
          res,
          404,
          'forgot-password email error',
          USER_DOES_NOT_EXIST,
          'email'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

/**
 * Change the password
 * @param {Request} req The /change-password request
 * @param {Response} res The /change-password response
 * @payload
 *  - oldPassword
 *  - password
 */
export const changePassword = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    // User input
    const { oldPassword, password } = req.body;

    const tokenUser = req.user;

    try {
      const isPasswordMatched = await authHelpers.comparePassword({
        user: tokenUser,
        password: oldPassword
      });

      if (isPasswordMatched) {
        const authHash = await authHelpers.generateAuthHash(password);
        await User.query()
          .findOne({
            email: tokenUser.email.toLowerCase(),
            provider: 'email'
          })
          .patch({ authHash });

        res.status(200).json(true);
      } else {
        generateServerErrorCode(
          res,
          403,
          'change-password password error',
          WRONG_PASSWORD,
          'password'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }    
};

/**
 * Start the workflow to change the email address
 * @param {Request} req The /change-email request
 * @param {Response} res The /change-email response
 * @payload
 *  - email
 */
export const changeEmail = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { email: newEmail } = req.body;

      const tokenUser = req.user;

      const user = await User.query().findOne({
        email: newEmail.toLowerCase(),
        provider: 'email'
      });
      if (!user) {
        const code = getVerificationCode();
        await sendVerificationEmail(newEmail, code);
        await User.query()
          .findOne({
            email: tokenUser.email.toLowerCase(),
            provider: 'email'
          })
          .patch({
            code,
            newEmail: newEmail.toLowerCase()
          });

        res.status(200).json(true);
      } else {
        generateServerErrorCode(
          res,
          403,
          'change-email email error',
          USER_EXISTS_ALREADY,
          'email'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

/**
 * Finish the workflow to change the email address
 * @param {Request} req The /complete-change-email request
 * @param {*} res The /complete-change-email response
 * @payload
 *  - code
 */
export const completeChangeEmail = async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // User input
      const { code } = req.body;

      const tokenUser = req.user;

      if (tokenUser.code === code) {
        const { email, newEmail } = tokenUser;

        const user = await User.query()
          .findOne({
            email: email.toLowerCase(),
            provider: 'email'
          })
          .patch({
            email: newEmail,
            newEmail: '',
            code: ''
          })
          .returning('*');

        res.cookie('jwt', createToken(newEmail));
        res.status(200).json({
          user: getPublicFacingUserData(user)
        });
      } else {
        generateServerErrorCode(
          res,
          403,
          'complete-change-email code error',
          INVALID_VERIFICATION_CODE,
          'code'
        );
      }
    } catch (error) {
      generateServerErrorCode(res, 500, error, SOME_THING_WENT_WRONG);
    }
  }
};

export const handleFacebookCallback = async (req, res) => {
  const { name, email } = req.user._json;
  const lowerCaseEmail = email.toLowerCase();

  try {
    const user = await User.query()
      .findOne({
        email: lowerCaseEmail,
        provider: 'facebook'
      });

    if (!user) {
      await User.query().insert({
        email: lowerCaseEmail,
        provider: 'facebook',
        fullName: name,
        emailVerified: true
      });
    }

    const token = createToken(email, 'facebook');
    res.cookie('jwt', token);
    res.redirect(config.frontendBaseUrl);
  } catch (error) {
    res.redirect(config.frontendBaseUrl);
  }
};

export const handleGoogleCallback = async (req, res) => {
  const { name, email } = req.user._json;
  const lowerCaseEmail = email.toLowerCase();

  try {
    const user = await User.query()
      .findOne({
        email: lowerCaseEmail,
        provider: 'google'
      });

    if (!user) {
      await User.query().insert({
        email: lowerCaseEmail,
        provider: 'google',
        fullName: name,
        emailVerified: true
      });
    }

    const token = createToken(email, 'google');
    res.cookie('jwt', token);
    res.redirect(config.frontendBaseUrl);
  } catch (error) {
    res.redirect(config.frontendBaseUrl);
  }
};
