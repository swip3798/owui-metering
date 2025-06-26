import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import * as z from 'zod/v4';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // 1. Validate password
    const Login = z.object({
      password: z.string().min(1)
    });
    const { password } = Login.parse(await request.json());

    if (!process.env.PASSWORD_HASH) {
      console.error("Login isn't possible because PASSWORD_HASH is not set!");
      return json({ error: 'Login is not configured' }, { status: 500 });
    }

    let isValidPassword = false;
    try {
      isValidPassword = await argon2.verify(process.env.PASSWORD_HASH!, password);
    } catch {
      console.error("Login isn't possible because PASSWORD_HASH is not set in the correct format!");
      return json({ error: 'Login is misconfigured' }, { status: 500 });
    }

    if (!isValidPassword) {
      console.warn('Login attempt failed because of wrong password');
      return json({ error: 'Invalid password' }, { status: 401 });
    }

    // 2. Generate JWT token
    const token = jwt.sign(
      { userId: 'some-user-id' }, // Payload - replace with actual user data
      process.env.JWT_SECRET!,
      { expiresIn: '6h' }
    );

    // 3. Set cookie in response
    cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
      maxAge: 6 * 60 * 60, // 6 hours in seconds
      path: '/'
    });

    console.info('New successfull login');
    return json({
      success: true,
      message: 'Authentication successful'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('Login attempt failed because of malformed request', error.issues);
      return json({ error: 'Invalid request', issues: error.issues }, { status: 400 });
    }
    console.warn('Unexpected error occured', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
