export interface UserInfoFromToken {
	userId: string;
	username: string;
}

export type VerifyMetaData = {
	requireLogin?: boolean;
	requireOwn?: boolean;
	tableName?: string;
	resourceId?: string;
};
