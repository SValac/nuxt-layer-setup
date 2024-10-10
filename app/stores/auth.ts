// import { supabase } from '@/lib/supabaseClient'
import { profileQuery } from '@/utils/supaQueries';
import type { Session, User } from '@supabase/supabase-js';
import type { Tables } from 'database/types';

export const useAuthStore = defineStore('auth-store', () => {
	const supabase = useSupabaseClient();
	const user = ref<null | User>(null);
	const profile = ref<null | Tables<'profiles'>>(null);

	/**
	 * Set the profile data in the store based on the current user
	 *
	 * If the user is not logged in, the profile data is set to null.
	 * If the user is logged in and the profile data is not set or the profile.id
	 * does not match the user.id, the profile data is fetched from the database.
	 * @returns {void}
	 */
	const setProfile = async (): Promise<void> => {
		if (!user.value) {
			profile.value = null;
			return;
		}

		if (!profile.value || profile.value.id !== user.value.id) {
			const { data } = await profileQuery(user.value.id);
			profile.value = data || null;
		}
	};

	/**
	 * Set the user and profile data in the store based on the userSession
	 * @param {Session | null} userSession - the user session object from Supabase
	 * @returns {void}
	 */
	const setAuth = async (
		userSession: null | Session = null
	): Promise<void> => {
		if (!userSession) {
			user.value = null;
			return;
		}
		user.value = userSession.user;
		await setProfile();
	};

	const getSession = async () => {
		const { data } = await supabase.auth.getSession();
		if (data.session?.user) await setAuth(data.session);
	};

	return {
		user,
		profile,
		setAuth,
		getSession
	};
});
