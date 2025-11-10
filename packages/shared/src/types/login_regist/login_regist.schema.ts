import { z } from 'zod';

const loginformSchema = z.object({
	username: z.string().min(2, {
		message: '用户名至少需要2个字符'
	}),
	password: z.string().min(6, {
		message: '密码至少需要6个字符'
	})
});

const registformSchema = z.object({
	username: z.string().min(2, {
		message: '用户名至少需要2个字符'
	}),
	password: z.string().min(6, {
		message: '密码至少需要6个字符'
	}),
	confirmPassword: z.string().min(6, {
		message: '请再次输入密码'
	}),
	email: z.string().email({
		message: '请输入正确的邮箱地址'
	}),
	captcha: z.string().min(6, {
		message: '请输入正确的验证码'
	})
});

type LoginFormType = z.infer<typeof loginformSchema>;
type RegistFormType = z.infer<typeof registformSchema>;

export { loginformSchema, registformSchema, type LoginFormType, type RegistFormType };
