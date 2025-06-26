import { handler } from './build/handler.js';
import express from 'express';
import 'dotenv/config';

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

const port = parseInt(process.env.PORT) || 3000;

app.listen(port, (error) => { });
