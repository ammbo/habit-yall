import { NextResponse } from 'next/server';
import { userApi } from '@/lib/api/gibson';
import { hashPassword } from '@/lib/auth/password';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

// Validation schema for signup
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate input data
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validationResult.data;
    
    // Check if user exists
    const existingUser = await userApi.getByEmail(email);
    if (existingUser.data && existingUser.data.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create user in database
    const result = await userApi.create({
      name,
      email,
      password: hashedPassword,
    });
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    // Get the user session
    const session = await getSession();
    
    // Set session data
    session.userId = result.data!.id;
    session.userUuid = result.data!.uuid;
    session.email = result.data!.email;
    session.name = result.data!.name;
    session.isLoggedIn = true;
    await session.save();
    
    // Return success without password in response
    const { password: _, ...userWithoutPassword } = result.data!;
    return NextResponse.json(userWithoutPassword, { status: 201 });
    
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 