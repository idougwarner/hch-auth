import express from 'express';
import passport from 'passport';

import * as userController from './user.controller';
import {
  registerValidation,
  emailValidation,
  loginValidation,
  forgotPasswordValidation,
  emailVerificationValidation,
  changePasswordValidation,
  verificationCodeValidation,
  profileValidation
} from '../lib/validators';
import config from '../config';

const userRouter = express.Router();

const authRequiredMiddleware = passport.authenticate('jwt', { session: false });

userRouter.get(
  '/auth-required',
  authRequiredMiddleware,
  userController.authRequired
);

userRouter.get(
  '/account',
  authRequiredMiddleware,
  userController.getAccount
);
userRouter.post(
  '/update-profile',
  authRequiredMiddleware,
  profileValidation,
  userController.updateProfile
);

userRouter.post(
  '/login',
  loginValidation,
  userController.login
);
userRouter.post(
  '/resend-verification',
  emailValidation,
  userController.resendVerificationCode
);
userRouter.post(
  '/check-email',
  emailValidation,
  userController.checkEmailIfExists
);
userRouter.post(
  '/register',
  registerValidation,
  userController.registerUser
);
userRouter.post(
  '/verify-email',
  emailVerificationValidation,
  userController.verifyEmail
);
userRouter.post(
  '/forgot-password',
  emailValidation,
  userController.forgotPassword
);
userRouter.post(
  '/complete-forgot-password',
  forgotPasswordValidation,
  userController.completeForgotPassword
);
userRouter.post(
  '/change-password',
  authRequiredMiddleware,
  changePasswordValidation,
  userController.changePassword
);
userRouter.post(
  '/change-email',
  authRequiredMiddleware,
  emailValidation,
  userController.changeEmail
);
userRouter.post(
  '/complete-change-email',
  authRequiredMiddleware,
  verificationCodeValidation,
  userController.completeChangeEmail
);

userRouter.get(
  '/facebook-login',
  passport.authenticate('facebook', { scope: 'email' })
);
userRouter.get(
  config.facebook.callbackPath,
  passport.authenticate('facebook', { scope: 'email' }),
  userController.handleFacebookCallback
);

userRouter.get(
  '/google-login',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
userRouter.get(
  config.google.callbackPath,
  passport.authenticate('google'),
  userController.handleGoogleCallback
);

export default userRouter;
