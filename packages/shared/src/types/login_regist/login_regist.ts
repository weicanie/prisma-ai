interface RegistResponse {
	id: number;
	username: string;
	email: string;
	create_at: Date | null;
	role: string;
}
interface LoginResponse {
	id: number;
	username: string;
	role: string;
	create_at: Date | null;
	update_at: Date | null;
	email: string;
	token: string;
	userId?: number; //前端添加
}
export { type LoginResponse, type RegistResponse };
