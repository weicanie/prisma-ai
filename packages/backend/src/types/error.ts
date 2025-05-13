export enum ErrorCode {
	SUCCESS = '0',
	//通用错误
	VALIDATION_ERROR = '1001',
	AUTH_ERROR = '1002',
	FORBIDDEN = '1003',
	NOT_FOUND = '1004',
	SERVER_ERROR = '1005',
	//业务错误
	//1、注册、登录
	USER_NOT_FOUND = '2001',
	USER_ALREADY_EXISTS = '2002',
	USER_PASSWORD_WRONG = '2003',
	CAPTCHAEXPIRED = '2004',
	CAPTCHAWRONG = '2005',
	USER_TOKEN_INVALID = '2006',
	USER_TOKEN_NOT_CARRY = '2007'
}

export const errorMessage = {
	//通用错误
	[ErrorCode.SUCCESS]: '成功',
	[ErrorCode.VALIDATION_ERROR]: '参数验证失败',
	[ErrorCode.AUTH_ERROR]: '未授权',
	[ErrorCode.FORBIDDEN]: '禁止访问',
	[ErrorCode.NOT_FOUND]: '资源未找到',
	[ErrorCode.SERVER_ERROR]: '服务器错误',
	//业务错误
	//1、注册、登录
	[ErrorCode.USER_NOT_FOUND]: '用户不存在',
	[ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
	[ErrorCode.USER_PASSWORD_WRONG]: '密码错误',
	[ErrorCode.CAPTCHAEXPIRED]: '验证码已过期',
	[ErrorCode.CAPTCHAWRONG]: '验证码错误',
	[ErrorCode.USER_TOKEN_INVALID]: '用户token无效',
	[ErrorCode.USER_TOKEN_NOT_CARRY]: '用户token未携带'
};
