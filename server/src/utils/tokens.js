import jwt from 'jsonwebtoken'
// Env
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const JWT_ADMIN_EXPIRY = process.env.JWT_ADMIN_EXPIRY

export const createAccessToken = (id, admin = false) => {
    return jwt.sign({ id }, JWT_SECRET, {
      expiresIn: admin ? JWT_ADMIN_EXPIRY : JWT_EXPIRY,
    });
  };