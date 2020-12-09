import capitalizeString from 'lodash/capitalize';
import { User } from '../models';
import AuthHasher from 'passport-local-authenticate';

const comparePassword = ({ user, password }) => {
  // Get salt and hash and verify user password
  const pwFieldSplit = user.authHash.split('|');
  const hashed = {
    salt: pwFieldSplit[1],
    hash: pwFieldSplit[2]
  };

  return new Promise((resolve, reject) => {
    AuthHasher.verify(password, hashed, (err, verified) => {
      if (err) reject(err);
      if (verified) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const createUser = ({ email, password, reqBody }) => {
  return new Promise((resolve, reject) => {
    AuthHasher.hash(password, async (err, hashed) => {
      if (err) reject(err);

      // .salt and .hash
      const passwordToSave = `hc|${hashed.salt}|${hashed.hash}`;

      const user = await User.query()
        .insert({
          email,
          authHash: passwordToSave,
          fullName: capitalizeString(reqBody.fullName),
          phoneNumber: reqBody.phoneNumber,
          emailVerified: false,
          provider: 'email'
        })
        .returning('*');

      resolve(user);
    });
  });
};

const generateAuthHash = (password) => {
  return new Promise((resolve, reject) => {
    AuthHasher.hash(password, async (err, hashed) => {
      if (err) reject(err);

      // .salt and .hash
      const passwordToSave = `hc|${hashed.salt}|${hashed.hash}`;
      resolve(passwordToSave);
    });
  });
}

export default { createUser, comparePassword, generateAuthHash };
