export default {
  NODE_ENV: process.env.NODE_ENV,
  baseUrl: process.env.BASE_URL || '',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL,
  passportSecret: process.env.PASSPORT_SECRET,
  logLevel: process.env.LOG_LEVEL || 'info',
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    minPool: process.env.DB_MIN_POOL,
    maxPool: process.env.DB_MAX_POOL
  },
  mailing: {
    clientId: process.env.MAILING_SERVICE_CLIENT_ID,
    clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
    refreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
    senderEmailAddress: process.env.SENDER_EMAIL_ADDRESS
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackPath: process.env.FACEBOOK_CALLBACK_PATH
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackPath: process.env.GOOGLE_CALLBACK_PATH
  }
};
