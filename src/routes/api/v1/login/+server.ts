import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { password } = await request.json();

    // 1. Validate password
    if (!password) {
      console.warn('Login attempt failed because of malformed request');
      return json({ error: 'Password is required' }, { status: 400 });
    }

    if (!process.env.PASSWORD_HASH) {
      console.error("Login isn't possible because PASSWORD_HASH is not set!");
      return json({ error: 'Login is not configured' }, { status: 500 });
    }

    let isValidPassword = false;
    try {
      isValidPassword = await argon2.verify(process.env.PASSWORD_HASH!, password);
    } catch {
      console.error("Login isn't possible because PASSWORD_HASH is not set!");
      return json({ error: 'Login is misconfigured configured' }, { status: 500 });
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
    console.warn('Login attempt failed because of malformed request', error);
    return json({ error: 'Invalid request' }, { status: 400 });
  }
};
