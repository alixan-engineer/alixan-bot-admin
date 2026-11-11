export type Group = {
	_id: string;
	name: string;
	status: string;
	usersCount: number;
	orderBotEnabled: boolean;
	createdAt?: string;
};
export type UserRole = 'admin' | 'worker';
export type User = {
	_id: string;
	groupId: string;
	groupName?: string;
	name: string;
	phone: string;
	role: UserRole;
};
export type CreatedUser = User & { password: string };

export type GroupStore = {
	_id: string;
	storeId?: string | null;
	name: string;
	status: string;
	authStatus: string;
	isMain: boolean;
};
