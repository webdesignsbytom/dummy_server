import jwt from 'jsonwebtoken'
// Env
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY

export const createAccessToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
  };