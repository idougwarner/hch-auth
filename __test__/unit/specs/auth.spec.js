import request from 'supertest';
import faker from 'faker';
import setCookie from 'set-cookie-parser';
import app from '@src/app';

import {
  EMAIL_NOT_VERIFIED,
  USER_DOES_NOT_EXIST,
  WRONG_PASSWORD,
  USER_EXISTS_ALREADY,
  INVALID_VERIFICATION_CODE
} from '@src/constant';

describe('Authentication Test', () => {
  // request.agent persists cookies between unit test. so I am using request(app) instead.
  const agent = request(app);
  // const agent = request.agent(app);

  const verificationCode = '55555';
  const email = faker.internet.email();
  const newEmail = faker.internet.email();
  let password = faker.phone.phoneNumber();
  let jwtToken = null;

  test('Check if the email exists before registeration -> Does not exist', (done) => {
    agent
      .post('/check-email')
      .send({
        email
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.body).toBe(false);
        done();
      })
  });

  test('Create an account using the email -> Success', (done) => {
    agent
      .post('/register')
      .send({
        email,
        phoneNumber: password,
        fullName: `${faker.name.firstName()} ${faker.name.lastName()}`
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(200);
        const cookies = setCookie.parse(res, { map: true });
        jwtToken = cookies.jwt.value;
        done();
      });
  });

  test('Try to create an account again using the email -> Fail', (done) => {
    agent
      .post('/register')
      .send({
        email,
        phoneNumber: password,
        fullName: `${faker.name.firstName()} ${faker.name.lastName()}`
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(403);
        expect(res.body.errors.email.msg).toBe(USER_EXISTS_ALREADY);
        done();
      });
  });

  test('Log in to the account without verifying the email -> Fail', (done) => {
    agent
      .post('/login')
      .send({
        email,
        password
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(403);
        expect(res.body.errors.email.msg).toBe(EMAIL_NOT_VERIFIED);
        done();
      });
  });

  test('Send a verification code again to a random email -> Fail', (done) => {
    agent
      .post('/resend-verification')
      .send({
        email: faker.internet.email()
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(404);
        expect(res.body.errors.email.msg).toBe(USER_DOES_NOT_EXIST);
        done();
      });
  });

  test('Send a verification code to the email -> Success', (done) => {
    agent
      .post('/resend-verification')
      .send({
        email
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200, done);
  });

  test('Verify a random email -> Fail', (done) => {
    agent
      .post('/verify-email')
      .send({
        email: faker.internet.email(),
        code: '23423'
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(404);
        expect(res.body.errors.email.msg).toBe(USER_DOES_NOT_EXIST);
        done();
      });
  });

  test('Verify the email using an invalid verification code -> Fail', (done) => {
    agent
      .post('/verify-email')
      .send({
        email,
        code: '23423'
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(403);
        expect(res.body.errors.code.msg).toBe(INVALID_VERIFICATION_CODE);
        done();
      });
  });

  test('Verify the email using a correct verification code -> Success', (done) => {
    agent
      .post('/verify-email')
      .send({
        email,
        code: verificationCode
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200, done);
  });

  test('Log in to the account using a wrong password -> Fail', (done) => {
    agent
      .post('/login')
      .send({
        email,
        password: faker.internet.password()
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(403);
        expect(res.body.errors.password.msg).toBe(WRONG_PASSWORD);
        done();
      });
  });

  test('Log in to the account using a correct password -> Success', (done) => {
    agent
      .post('/login')
      .send({
        email,
        password
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(200);
        const cookies = setCookie.parse(res, { map: true });
        jwtToken = cookies.jwt.value;
        done();
      });
  });

  test('Forgot password to a random email -> Fail', (done) => {
    agent
      .post('/forgot-password')
      .send({
        email: faker.internet.email()
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(404);
        expect(res.body.errors.email.msg).toBe(USER_DOES_NOT_EXIST);
        done();
      });
  });

  test('Forgot password to the email -> Success', (done) => {
    agent
      .post('/forgot-password')
      .send({
        email
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200, done);
  });

  test('Reset the password of a random email -> Fail', (done) => {
    const fakePassword = faker.internet.password();
    agent
      .post('/complete-forgot-password')
      .send({
        email: faker.internet.email(),
        code: '23423',
        password: fakePassword,
        // passwordConfirm: fakePassword
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(404);
        expect(res.body.errors.email.msg).toBe(USER_DOES_NOT_EXIST);
        done();
      });
  });

  test('Reset the email password using an invalid code -> Fail', (done) => {
    const fakePassword = faker.internet.password();
    agent
      .post('/complete-forgot-password')
      .send({
        email,
        code: '23423',
        password: fakePassword,
        // passwordConfirm: fakePassword
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(403);
        expect(res.body.errors.code.msg).toBe(INVALID_VERIFICATION_CODE);
        done();
      });
  });

  test('Reset the email password using a correct code -> Success', (done) => {
    password = faker.internet.password();
    agent
      .post('/complete-forgot-password')
      .send({
        email,
        code: verificationCode,
        password,
        // passwordConfirm: password
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200, done);
  });

  test('Log in to the account using the new password -> Success', (done) => {
    agent
      .post('/login')
      .send({
        email,
        password
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(200);
        const cookies = setCookie.parse(res, { map: true });
        jwtToken = cookies.jwt.value;
        done();
      });
  });

  test('Try to change the email password without logging in -> Fail', (done) => {
    agent
      .post('/change-password')
      .send({
        oldPassword: password,
        password: faker.internet.password()
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(401, done);
  });

  test('Try to change the email password without knowing the current password -> Fail', (done) => {
    const fakerPassword = faker.internet.password();
    agent
      .post('/change-password')
      .send({
        oldPassword: faker.internet.password(),
        password: fakerPassword,
        // passwordConfirm: fakerPassword
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', [`jwt=${jwtToken}`])
      .then(res => {
        expect(res.status).toBe(403);
        expect(res.body.errors.password.msg).toBe(WRONG_PASSWORD);
        done();
      });
  });

  test('Change the email password -> Success', (done) => {
    const oldPassword = password;
    password = faker.internet.password();
    agent
      .post('/change-password')
      .send({
        oldPassword,
        password,
        // passwordConfirm: password
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', [`jwt=${jwtToken}`])
      .expect(200, done);
  });

  test('Log in to the account using the new password -> Success', (done) => {
    agent
      .post('/login')
      .send({
        email,
        password
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(200);
        const cookies = setCookie.parse(res, { map: true });
        jwtToken = cookies.jwt.value;
        done();
      });
  });

  test('Try to change the email without logging in -> Fail', (done) => {
    agent
      .post('/change-email')
      .send({})
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(401, done);
  });

  test('Send a verification code to a new email before changing the email -> Success', (done) => {
    agent
      .post('/change-email')
      .send({
        email: newEmail
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', [`jwt=${jwtToken}`])
      .expect(200, done);
  });

  test('Try to change the email using an invalid verification code -> Fail', (done) => {
    agent
      .post('/complete-change-email')
      .send({
        code: '23425'
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', [`jwt=${jwtToken}`])
      .then(res => {
        expect(res.status).toBe(403);
        expect(res.body.errors.code.msg).toBe(INVALID_VERIFICATION_CODE);
        done();
      });
  });

  test('Change the email using a correct verification code -> Success', (done) => {
    agent
      .post('/complete-change-email')
      .send({
        code: verificationCode
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', [`jwt=${jwtToken}`])
      .then(res => {
        expect(res.status).toBe(200);
        const cookies = setCookie.parse(res, { map: true });
        jwtToken = cookies.jwt.value;
        done();
      });
  });

  test('Log in to the account using the new email -> Success', (done) => {
    agent
      .post('/login')
      .send({
        email: newEmail,
        password
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(res => {
        expect(res.status).toBe(200);
        const cookies = setCookie.parse(res, { map: true });
        jwtToken = cookies.jwt.value;
        done();
      });
  });

  test('Update the account profile -> Success', (done) => {
    agent
      .post('/update-profile')
      .send({
        fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
        phoneNumber: faker.phone.phoneNumber()
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', [`jwt=${jwtToken}`])
      .expect(200, done);
  });

  test('Get the account data -> Success', (done) => {
    agent
      .get('/account')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', [`jwt=${jwtToken}`])
      .then(res => {
        expect(res.status).toBe(200);
        console.log('The account', res.body);
        done();
      })
  });
});
