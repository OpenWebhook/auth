import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
}));
