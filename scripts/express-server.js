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
        `Environment variable ${name} is not set! While not critical, make sure your deployment is setup correctly!`
      );
    }
    return false;
  }
  return true;
};

console.info('Check presence of all required environment variables:');
checkOrLogEnvVar('DB_FILE_NAME', node.env.DB_FILE_NAME, false);
checkOrLogEnvVar('PASSWORD_HASH', node.env.PASSWORD_HASH, false);
checkOrLogEnvVar('JWT_SECRET', node.env.JWT_SECRET, false);
checkOrLogEnvVar('API_KEY', node.env.API_KEY, false);
checkOrLogEnvVar('OPENROUTER_API_KEY', node.env.OPENROUTER_API_KEY, true);

const app = express();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
  res.send('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

const port = parseInt(process.env.PORT) || 3000;

app.listen(port, (error) => { });
