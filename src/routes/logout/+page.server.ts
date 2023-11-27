import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// We only use this endpoint to logout, so we don't need to render anything
	throw redirect(302, '/');
};

export const actions: Actions = {
	default({ cookies }) {
		// Clear the session cookie
		cookies.set('session', null, {
			path: '/',
			expires: new Date(0)
		});

		throw redirect(302, '/');
	}
};
