import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			precompress: true
		}),
		csrf: { checkOrigin: process.env.NODE_ENV === 'development' ? false : true }
	}
};

export default config;
