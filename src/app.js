import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import config from './config';
import passportSetup from './passport';
import { userRouter } from './routers';
import Mailing from './mailing';

const app = express();

// CORS setup
app.use(cors());

app.use(cookieParser());

// Passport Setup
app.use(passport.initialize());
passportSetup.applyJWTPassportStrategy(passport);
passportSetup.applyFacebookPassportStrategy(passport);
passportSetup.applyGooglePassportStrategy(passport);
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Body parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoints setup
app.use('/', userRouter);

app.post('/test-email', (req, res) => {
  try {
    Mailing.sendEmail({
      template: 'test',
      email: req.body.email,
      subject: req.body.subject
    });
    res.status(200).json({ message: 'email sent successfully' });
  } catch (error) {
    res.status(500);
  }
});

// Routes
app.get('/*', (req, res) => {
  res.send(`Request received: ${req.method} - ${req.path} - ${config.db.database}`);
});

module.exports = app;
