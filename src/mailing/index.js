import nodemailer from 'nodemailer';
import ejs from 'ejs';

import config from '../config';

const { google } = require('googleapis');

const { OAuth2 } = google.auth;

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const Mailing = {};

const oauth2Client = new OAuth2(
  config.mailing.clientId,
  config.mailing.clientSecret,
  OAUTH_PLAYGROUND
);

const TEMPLATES = {
  test: 'test.ejs',
};

Mailing.sendEmail = async data => {
  oauth2Client.setCredentials({
    refresh_token: config.mailing.refreshToken,
  });

  const accessToken = await oauth2Client.getAccessToken();

  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: config.mailing.senderEmailAddress,
      clientId: config.mailing.clientId,
      clientSecret: config.mailing.clientSecret,
      refreshToken: config.mailing.refreshToken,
      accessToken: accessToken.token,
    },
  });

  const filePath = `${__dirname}/templates/${TEMPLATES[data.template]}`;
  ejs.renderFile(filePath, data, {}, (e, content) => {
    if (e) return e;
    const mailOptions = {
      from: config.mailing.senderEmailAddress,
      to: data.email,
      subject: data.subject,
      html: content,
    };

    console.log('render file', mailOptions)
    smtpTransport.sendMail(mailOptions, (err, info) => {
      console.log('send mail error', err);
      if (err) return err;
      return info;
    });
  });
};

export default Mailing;
