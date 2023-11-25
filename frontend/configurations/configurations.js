// config.js
import dotenv from 'dotenv';

dotenv.config();

const backendDomain = process.env.NEXT_PUBLIC_BACKEND_REST_DOMAIN;
const backendSocket = process.env.NEXT_PUBLIC_BACKEND_SOCKET_DOMAIN;

export { backendDomain, backendSocket };
