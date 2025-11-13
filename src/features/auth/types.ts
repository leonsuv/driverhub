export type UserRole = "user" | "moderator" | "admin";

export interface CreateUserDTO {
	email: string;
	username: string;
	password: string;
	displayName?: string | null;
}
