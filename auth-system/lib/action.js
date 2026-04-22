'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import connectDB from './mongodb';
import User from '../models/User';

// ─── SIGNUP ───────────────────────────────────────────────
export async function signupAction(prevState, formData) {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'All fields are required.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return { error: 'An account with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ email, password: hashedPassword });
  } catch (err) {
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/login?registered=true');
}

// ─── LOGIN ────────────────────────────────────────────────
export async function loginAction(prevState, formData) {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'All fields are required.' };
  }

  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: 'Invalid email or password.' };
    }

    const cookieStore = await cookies();
    cookieStore.set('session_user', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } catch (err) {
    return { error: 'Login failed. Please try again.' };
  }

  redirect('/dashboard');
}

// ─── LOGOUT ───────────────────────────────────────────────
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session_user');
  redirect('/login');
}