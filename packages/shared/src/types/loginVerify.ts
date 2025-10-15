import { UserConfig } from './user_config';

export interface UserInfoFromToken {
	userId: string;
	username: string;
	userConfig: UserConfig;
}

export type VerifyMetaData = {
	requireLogin?: boolean;
	requireOwn?: boolean;
	tableName?: string;
	resourceId?: string;
};
