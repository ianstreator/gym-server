const PROD_CORS_URL = "https://constfitness.vercel.app";
const DEV_CORS_URL = "http://localhost:5173";
const ENV = process.env.RENDER;
export const ENV_CORS_URL = ENV ? PROD_CORS_URL : DEV_CORS_URL;