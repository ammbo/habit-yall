import { IronSessionOptions, getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData } from '../types';

export const sessionOptions: IronSessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD as string,
  cookieName: process.env.IRON_SESSION_COOKIE_NAME as string,
  cookieOptions: {
    // secure should be true in production
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  },
};

// Get the session from the server component
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  // Initialize the session if it doesn't exist
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  
  return session;
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession();
  return session.isLoggedIn === true;
}

// Default session data for non-authenticated users
export const defaultSession: SessionData = {
  isLoggedIn: false,
  userId: 0,
  userUuid: '',
  email: '',
  name: '',
}; 