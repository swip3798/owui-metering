import { handler } from './build/handler.js';
import express from 'express';
import 'dotenv/config';

const port = parseInt(process.env.PORT) || 3000;

const checkOrLogEnvVar = (name, envVar, optional) => {
	if (!envVar) {
		if (!optional) {
			console.error(
				`Environment variable ${name} is not set, but critical for correct functioning, check your deployment!`
			);
		} else {
			console.warn(
				`Environment variable ${name} is not set! While not critical, make sure this is intentional!`
			);
		}
		return false;
	}
	return true;
};

const setupBackgroundTasks = () => {
	console.info('Starting retention background task...');
	const interval = setInterval(async () => {
		try {
			const response = await fetch(`http://localhost:${port}/api/v1/retention/tick`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: process.env.API_KEY }
			});

			// Process response if needed
			const result = await response.json();
			console.log('Background task result:', result);
		} catch (err) {
			console.error('Background task failed:', err);
		}
	}, 3600000 * 12);
	// Clean up on server shutdown
	process.on('SIGTERM', () => clearInterval(interval));
	process.on('SIGINT', () => clearInterval(interval));
};

console.info('Check presence of all required environment variables:');
const envChecks =
	checkOrLogEnvVar('DB_FILE_NAME', process.env.DB_FILE_NAME, false) &&
	checkOrLogEnvVar('PASSWORD_HASH', process.env.PASSWORD_HASH, false) &&
	checkOrLogEnvVar('JWT_SECRET', process.env.JWT_SECRET, false) &&
	checkOrLogEnvVar('API_KEY', process.env.API_KEY, false) &&
	checkOrLogEnvVar('OPENROUTER_API_KEY', process.env.OPENROUTER_API_KEY, true);
if (envChecks) {
	console.info('All environment variables are set!');
}

const app = express();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
	res.send('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

if (process.env.pm_id === '0' || !process.env.pm_id) {
	// Only run in the first PM2 process or when not using PM2
	setupBackgroundTasks();
}

app.listen(port, (error) => { });
