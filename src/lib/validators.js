import { check } from 'express-validator';

import {
  PHONE_NUMBER_IS_EMPTY,
  PASSWORD_IS_EMPTY,
  // PASSORT_DO_NOT_MATCH,
  EMAIL_IS_EMPTY,
  EMAIL_IS_IN_WRONG_FORMAT,
  VERIFICATION_CODE_EMPTY
} from '../constant';

export const profileValidation = [
  check('phoneNumber')
    .exists()
    .withMessage(PHONE_NUMBER_IS_EMPTY),
  check('fullName')
    .exists()
    .withMessage(PHONE_NUMBER_IS_EMPTY)
];

export const registerValidation = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('phoneNumber')
    .exists()
    .withMessage(PHONE_NUMBER_IS_EMPTY),
  check('fullName')
    .exists()
    .withMessage(PHONE_NUMBER_IS_EMPTY)
];

export const emailValidation = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT)
];

export const loginValidation = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
];

export const forgotPasswordValidation = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('code')
    .exists()
    .withMessage(VERIFICATION_CODE_EMPTY),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    // .custom((value, { req }) => {
    //   if (value !== req.body.passwordConfirm) {
    //     throw new Error(PASSORT_DO_NOT_MATCH);
    //   } else {
    //     return value;
    //   }
    // })
];

export const changePasswordValidation = [
  check('oldPassword')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    // .custom((value, { req }) => {
    //   if (value !== req.body.passwordConfirm) {
    //     throw new Error(PASSORT_DO_NOT_MATCH);
    //   } else {
    //     return value;
    //   }
    // })
];

export const changeEmailValidation = [
  check('oldEmail')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
];

export const emailVerificationValidation = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('code')
    .exists()
    .withMessage(VERIFICATION_CODE_EMPTY)
];

export const verificationCodeValidation = [
  check('code')
    .exists()
    .withMessage(VERIFICATION_CODE_EMPTY)
];
