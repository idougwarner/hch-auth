export default {
  type: 'object',
  required: [],
  properties: {
    id: { type: 'integer' },
    email: { type: 'string' },
    fullName: { type: 'string', minLength: 1, maxLength: 255 },
    phoneNumber: { type: 'string' },
    authHash: { type: 'string' },
    emailVerified: { type: 'boolean' },
    code: { type: 'string' },
    newEmail: { type: 'string' },
    provider: { type: 'string' }
  },
  required: ['email', 'fullName', 'provider'],
  additionalProperties: false
};
