import { createHmac } from 'crypto';
function passwordEncrypt(password: string) {
	const pwd = createHmac('sha256', process.env.ENC_SECRET).update(password).digest('hex');
	return pwd;
}
export default passwordEncrypt;
