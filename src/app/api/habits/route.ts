import { NextResponse } from 'next/server';
import { habitApi, userApi } from '@/lib/api/gibson';
import { getSession, isAuthenticated } from '@/lib/auth/session';
import { HabitStatus } from '@/lib/types';
import { z } from 'zod';

// Schema for creating a habit
const createHabitSchema = z.object({
  name: z.string().min(3, 'Habit name must be at least 3 characters'),
  partnerEmail: z.string().email('Invalid partner email'),
  credits_pledged: z.number().int().min(1, 'Credits must be at least 1'),
  minimum_delay_hours: z.number().int().min(1, 'Minimum delay must be at least 1 hour'),
  maximum_window_hours: z.number().int().min(1, 'Maximum window must be at least 1 hour'),
});

// Get all habits for the current user
export async function GET() {
  // Check authentication
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const session = await getSession();
    const userId = session.userId;
    
    // Get habits where user is either creator or partner
    const habitsResponse = await habitApi.getUserHabits(userId);
    
    if (habitsResponse.error) {
      return NextResponse.json({ error: habitsResponse.error }, { status: 500 });
    }
    
    return NextResponse.json(habitsResponse.data);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

// Create a new habit
export async function POST(request: Request) {
  // Check authentication
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const session = await getSession();
    const creatorUserId = session.userId;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createHabitSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, partnerEmail, credits_pledged, minimum_delay_hours, maximum_window_hours } = validationResult.data;
    
    // Find partner by email
    const partnerResponse = await userApi.getByEmail(partnerEmail);
    
    if (partnerResponse.error || !partnerResponse.data || partnerResponse.data.length === 0) {
      return NextResponse.json(
        { error: 'Partner not found with the provided email' },
        { status: 404 }
      );
    }
    
    const partnerUserId = partnerResponse.data[0].id;
    
    // Ensure user is not partnering with themselves
    if (partnerUserId === creatorUserId) {
      return NextResponse.json(
        { error: 'You cannot partner with yourself' },
        { status: 400 }
      );
    }
    
    // Create the habit
    const habitData = {
      name,
      creator_user_id: creatorUserId,
      partner_user_id: partnerUserId,
      credits_pledged,
      minimum_delay_hours,
      maximum_window_hours,
      status: HabitStatus.ACTIVE,
      current_streak_count: 0,
    };
    
    console.log('Creating habit with data:', JSON.stringify(habitData));
    
    const habitResponse = await habitApi.create(habitData);
    
    if (habitResponse.error) {
      console.error('Error from Gibson API:', habitResponse.error);
      return NextResponse.json(
        { error: `Failed to create habit: ${habitResponse.error}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(habitResponse.data, { status: 201 });
    
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: error instanceof Error ? `Failed to create habit: ${error.message}` : 'Failed to create habit' },
      { status: 500 }
    );
  }
} 