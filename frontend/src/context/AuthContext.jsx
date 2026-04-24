/* eslint-disable react-refresh/only-export-components */

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

const ROLE_COLUMNS = ["role", "user_role", "account_role", "portal_role"];
const FIRST_LOGIN_COLUMNS = [
	"is_first_login",
	"first_login",
	"must_change_password",
	"force_password_change",
];

function normalizeRole(rawRole) {
	if (!rawRole) return "Faculty";

	const normalized = String(rawRole).trim().toUpperCase();
	if (normalized === "HR") return "HR";
	if (normalized === "VPAA") return "VPAA";
	return "Faculty";
}

function detectFirstLoginFromUser(user) {
	const createdAt = user?.created_at;
	const lastSignInAt = user?.last_sign_in_at;
	if (!createdAt || !lastSignInAt) return false;

	const createdMs = new Date(createdAt).getTime();
	const lastMs = new Date(lastSignInAt).getTime();
	if (!Number.isFinite(createdMs) || !Number.isFinite(lastMs)) return false;

	return Math.abs(createdMs - lastMs) < 2000;
}

function readFirstLoginFlag(profile) {
	if (!profile) return null;

	for (const column of FIRST_LOGIN_COLUMNS) {
		const value = profile[column];
		if (typeof value === "boolean") return value;
		if (value === 1 || value === "1") return true;
		if (value === 0 || value === "0") return false;
		if (typeof value === "string") {
			if (value.toLowerCase() === "true") return true;
			if (value.toLowerCase() === "false") return false;
		}
	}

	return null;
}

function resolveRole(profile, user) {
	for (const column of ROLE_COLUMNS) {
		if (profile?.[column]) {
			return normalizeRole(profile[column]);
		}
	}

	const metadataRole = user?.app_metadata?.role || user?.user_metadata?.role;
	return normalizeRole(metadataRole);
}

export function AuthProvider({ children }) {
	const [session, setSession] = useState(null);
	const [user, setUser] = useState(null);
	const [role, setRole] = useState("Faculty");
	const [profile, setProfile] = useState(null);
	const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
	const [authLoading, setAuthLoading] = useState(true);
	const [profileLoading, setProfileLoading] = useState(false);

	const hydrateProfile = useCallback(async (currentUser) => {
		if (!currentUser) {
			setProfile(null);
			setRole("Faculty");
			setNeedsPasswordChange(false);
			return;
		}

		setProfileLoading(true);
		let profileRow = null;

		const byId = await supabase
			.from("users")
			.select("*")
			.eq("id", currentUser.id)
			.maybeSingle();

		if (!byId.error) {
			profileRow = byId.data;
		}

		if (!profileRow && currentUser.email) {
			const byEmail = await supabase
				.from("users")
				.select("*")
				.eq("email", currentUser.email)
				.maybeSingle();

			if (!byEmail.error) {
				profileRow = byEmail.data;
			}
		}

		setProfile(profileRow);
		setRole(resolveRole(profileRow, currentUser));

		const firstLoginFromProfile = readFirstLoginFlag(profileRow);
		setNeedsPasswordChange(
			typeof firstLoginFromProfile === "boolean"
				? firstLoginFromProfile
				: detectFirstLoginFromUser(currentUser),
		);

		setProfileLoading(false);
	}, []);

	useEffect(() => {
		let mounted = true;

		const boot = async () => {
			const { data } = await supabase.auth.getSession();
			if (!mounted) return;

			const nextSession = data?.session ?? null;
			setSession(nextSession);
			setUser(nextSession?.user ?? null);
			setAuthLoading(false);
			void hydrateProfile(nextSession?.user ?? null);
		};

		void boot();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession ?? null);
			setUser(nextSession?.user ?? null);
			setAuthLoading(false);
			void hydrateProfile(nextSession?.user ?? null);
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, [hydrateProfile]);

	const refreshProfile = useCallback(async () => {
		await hydrateProfile(user);
	}, [hydrateProfile, user]);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
	}, []);

	const markFirstLoginComplete = useCallback(async () => {
		if (!user) {
			setNeedsPasswordChange(false);
			return;
		}

		for (const column of FIRST_LOGIN_COLUMNS) {
			const { error } = await supabase
				.from("users")
				.update({ [column]: false })
				.eq("id", user.id);

			if (!error) {
				break;
			}
		}

		setNeedsPasswordChange(false);
	}, [user]);

	const value = useMemo(
		() => ({
			session,
			user,
			role,
			profile,
			needsPasswordChange,
			isLoading: authLoading || (Boolean(user) && profileLoading),
			refreshProfile,
			signOut,
			markFirstLoginComplete,
		}),
		[
			session,
			user,
			role,
			profile,
			needsPasswordChange,
			authLoading,
			profileLoading,
			refreshProfile,
			signOut,
			markFirstLoginComplete,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
