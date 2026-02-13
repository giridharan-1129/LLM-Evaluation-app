import { Middleware } from '@reduxjs/toolkit';

export const errorHandlerMiddleware: Middleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('❌ Redux Error:', error);
    throw error;
  }
};
