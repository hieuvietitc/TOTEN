import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'toten_dev_secret_key_change_in_prod';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '7d';

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const verifyToken = (token: string): { userId: string; email: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const refreshToken = (token: string): string | null => {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return generateToken(decoded.userId, decoded.email);
};
