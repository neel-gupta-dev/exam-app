import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};


export default generateToken;
