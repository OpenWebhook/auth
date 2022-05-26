import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  githubOauth: {
    clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
    clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
  },
}));
