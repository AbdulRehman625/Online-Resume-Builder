/*
*/
(function (window) {
	const KEY = 'resume_users';
	const CURRENT_KEY = 'resume_current_user';

	const readUsers = () => {
		try {
			const raw = localStorage.getItem(KEY);
			if (!raw) return [];
			return JSON.parse(raw);
		} catch (e) {
			console.error('Failed to parse users from localStorage', e);
			return [];
		}
	};

	const writeUsers = (users) => {
		localStorage.setItem(KEY, JSON.stringify(users));
	};

	// NOTE: passwords are stored base64-encoded to avoid plain text copy, but
	// this is NOT secure. For real apps use proper server-side hashing.
	const encodePassword = (pwd) => btoa(pwd);
	const decodePassword = (enc) => atob(enc);

	const getUsers = () => readUsers();

	// user = { name, email, password }
	const saveUser = (user) => {
		if (!user || !user.email || !user.password) return { ok: false, error: 'Missing fields' };
		const users = readUsers();
		const exists = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
		if (exists) return { ok: false, error: 'Email already registered' };

		const toSave = {
			name: user.name || '',
			email: user.email.toLowerCase(),
			password: encodePassword(user.password),
			createdAt: new Date().toISOString()
		};

		users.push(toSave);
		writeUsers(users);
		return { ok: true, user: toSave };
	};

	const findUserByEmail = (email) => {
		if (!email) return null;
		const users = readUsers();
		return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
	};

	const authenticate = (email, password) => {
		const user = findUserByEmail(email);
		if (!user) return { ok: false, error: 'User not found' };
		if (decodePassword(user.password) !== password) return { ok: false, error: 'Invalid password' };
		setCurrentUser(user);
		return { ok: true, user };
	};

	const setCurrentUser = (user) => {
		if (!user) return localStorage.removeItem(CURRENT_KEY);
		localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
	};

	const getCurrentUser = () => {
		const raw = localStorage.getItem(CURRENT_KEY);
		if (!raw) return null;
		try { return JSON.parse(raw); } catch (e) { return null; }
	};

	const signOut = () => {
		localStorage.removeItem(CURRENT_KEY);
	};

	window.StoreData = {
		getUsers,
		saveUser,
		findUserByEmail,
		authenticate,
		setCurrentUser,
		getCurrentUser,
		signOut
	};

})(window);

