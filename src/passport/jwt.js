// import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { User } from '../models';
import config from '../config';

export default (passport) => {
  const options = {};
  // options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.jwtFromRequest = req => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies.jwt;
    }
    return token;
  };
  options.secretOrKey = config.passportSecret;
  passport.use(
    new Strategy(options, async (payload, done) => {
      try {
        const user = await User.query().findOne({
          email: payload.email.toLowerCase(),
          provider: payload.provider
        });
        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
