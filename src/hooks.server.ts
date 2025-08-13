import { redirect, type Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const BEARER_TOKEN = `Bearer ${process.env.API_KEY}`;

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('Authorization');
	if (
		authHeader === process.env.API_KEY ||
		authHeader === BEARER_TOKEN ||
		event.url.pathname.startsWith('/login') ||
		event.url.pathname.startsWith('/api/v1/login')
	) {
		const response = await resolve(event);
		return response;
	}

	// Validate token for protected routes
	try {
		if (event.url.pathname.startsWith('/api/v1/retention')) {
			throw new Error('Retention auth only with API Key');
		}
		const authToken = event.cookies.get('auth_token');

		if (!authToken) {
			throw new Error('No authentication token found');
		}

		// Verify JWT token
		jwt.verify(authToken, process.env.JWT_SECRET!) as jwt.JwtPayload;
	} catch (err) {
		// If token is invalid, redirect to login page
		if (event.url.pathname.startsWith('/api')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(303, '/login');
	}

	// Continue processing the request
	return await resolve(event);
};
