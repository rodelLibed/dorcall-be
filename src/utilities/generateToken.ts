import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  // @ts-ignore - TypeScript has issues with expiresIn string type
  return jwt.sign(payload, secret, { expiresIn });
};

export default generateToken;
