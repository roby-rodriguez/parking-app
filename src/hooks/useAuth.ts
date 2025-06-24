import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LoginData } from '@/types';

interface UseAuthReturn {
	session: any;
	loading: boolean;
	login: (loginData: LoginData) => Promise<{ error: string | null }>;
	logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
	const [session, setSession] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const login = async (loginData: LoginData): Promise<{ error: string | null }> => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: loginData.email,
				password: loginData.password,
			});

			if (error) {
				return { error: error.message };
			}

			setSession(data.session);
			return { error: null };
		} catch (error) {
			return { error: 'Login failed. Please try again.' };
		}
	};

	const logout = async (): Promise<void> => {
		await supabase.auth.signOut();
		setSession(null);
	};

	return {
		session,
		loading,
		login,
		logout,
	};
}; 