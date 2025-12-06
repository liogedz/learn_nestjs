import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: Math.floor(
        ms(process.env.JWT_EXPIRES_IN as StringValue) / 1000,
      ),
    },
  }),
);
