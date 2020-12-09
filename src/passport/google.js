import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../config';

export default (passport) => {
  passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: `${config.baseUrl}${config.google.callbackPath}`
  },
  function (accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }));
};
