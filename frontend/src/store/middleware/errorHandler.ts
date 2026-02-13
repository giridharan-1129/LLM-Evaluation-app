import type { Middleware } from '@reduxjs/toolkit'

const errorHandler: Middleware = (_store) => (next) => (action) => {
  try {
    return next(action)
  } catch (error) {
    console.error('Error in action:', action, error)
    throw error
  }
}

export default errorHandler
