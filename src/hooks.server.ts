import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// get the token from the cookie
	const accessToken = event.cookies.get('session');

	if (!accessToken || accessToken === null) {
		// load page as normal
		return await resolve(event);
	}

	// fetch the user information
	const userResponse = await fetch('https://api.github.com/user', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	// the user data contains things like the user's name, full name and avatar
	const userData = await userResponse.json();

	// fetch the user's emails
	const emailResponse = await fetch('https://api.github.com/user/emails', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	// the email data contains the user's emailaddressess and whether they are verified etc.
	const emailData = await emailResponse.json();

	// set the user object in the locals
	event.locals.user = {
		name: userData.login,
		avatar: userData.avatar_url,
		email: emailData.find((email) => email.primary === true).email
	};

	return await resolve(event);
};
