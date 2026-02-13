import { Middleware } from '@reduxjs/toolkit';

const TRACKED_ACTIONS = [
  'auth/loginSuccess',
  'auth/logout',
  'project/createProjectSuccess',
  'project/deleteProjectSuccess',
  'job/createJobSuccess',
  'job/jobCompleted',
  'job/jobFailed',
];

export const analyticsMiddleware: Middleware = () => (next) => (action) => {
  if (TRACKED_ACTIONS.includes(action.type)) {
    trackEvent(action.type, action.payload);
  }

  return next(action);
};

function trackEvent(eventName: string, data: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`📊 Analytics Event: ${eventName}`, data);
  }
}
