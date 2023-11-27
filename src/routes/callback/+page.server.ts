import { redirect } from '@sveltejs/kit';
import { PUBLIC_GITHUB_ID } from '$env/static/public';
import { GITHUB_SECRET } from '$env/static/private';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, cookies }) => {
	// get the temporary code from the query string
	const code = url.searchParams.get('code');

	// if no code, redirect
	// (this could happen if the user manually types in the url `/callback` or if the user denies access)
	if (!code || code === null) {
		console.log('Oops!');
		throw redirect(302, '/');
	}

	// the data we need to send back to GitHub to get the token
	// the client_id and client_secret are from the GitHub OAuth app
	const data = {
		client_id: PUBLIC_GITHUB_ID,
		client_secret: GITHUB_SECRET,
		code: code
	};

	// exchange the code for a token by posting the code back to GitHub
	const response = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(data)
	});

	const result = await response.json();
	const accessToken = result.access_token;

	// get the scopes from the token to check if we have access to the user:email scope
	const scopes = result.scope.split(',');
	const hasEmailScope = scopes.includes('user:email') || scopes.includes('user');

	// redirect if the app doesn't have access to the user or user:email scopes
	if (!hasEmailScope) {
		throw redirect(302, '/');
	}

	// persist the token in a cookie
	cookies.set('session', accessToken, {
		// send cookie with every request to this site
		path: '/',
		// server side only cookie (you can't use `document.cookie` for this cookie)
		httpOnly: true,
		// only requests from this site can send cookies
		// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
		sameSite: 'strict',
		// only sent over HTTPS in production
		secure: process.env.NODE_ENV === 'production',
		// set cookie to expire after a month
		maxAge: 60 * 60 * 24 * 30
	});

	throw redirect(302, '/');
};
