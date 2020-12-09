import { Strategy as FacebookStrategy } from 'passport-facebook';
import config from '../config';

export default (passport) => {
  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret,
    callbackURL: `${config.baseUrl}${config.facebook.callbackPath}`,
    profileFields: ['id', 'displayName', 'email']
  },
  function (accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }));
};
