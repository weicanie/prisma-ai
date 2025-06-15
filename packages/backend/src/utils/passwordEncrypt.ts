import * as crypto from 'crypto';
/* 盐值 */
function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password: string, salt: string): string {
  // 使用PBKDF2代替简单MD5，提高安全性
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return hash;
}
/**
 * 密码加密, 输出格式: hash.salt
 */
export function createHashedPassword(password: string): string {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  return `${hash}.${salt}`;
}
/**
 * 验证密码
 */
export function verifyPassword(
  inputPassword: string,
  storedPassword: string,
): boolean {
  const [storedHash, salt] = storedPassword.split('.');
  if (!storedHash || !salt) return false;
  const inputHash = hashPassword(inputPassword, salt);
  return inputHash === storedHash;
}
