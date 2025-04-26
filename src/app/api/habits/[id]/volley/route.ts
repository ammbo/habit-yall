import { NextResponse } from 'next/server';
import { habitApi, volleyApi, notificationApi, userApi } from '@/lib/api/gibson';
import { getSession, isAuthenticated } from '@/lib/auth/session';
import { calculateDeadline, canCompleteVolley } from '@/lib/utils/date';
import { HabitStatus, NotificationType } from '@/lib/types';
import { sendEmail, generateVolleyNotificationEmail } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check authentication
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const habitId = parseInt(params.id);
    if (isNaN(habitId)) {
      return NextResponse.json({ error: 'Invalid habit ID' }, { status: 400 });
    }
    
    const session = await getSession();
    const userId = session.userId;
    
    // Get the habit
    const habitResponse = await habitApi.getById(habitId);
    
    if (habitResponse.error || !habitResponse.data) {
      return NextResponse.json(
        { error: habitResponse.error || 'Habit not found' },
        { status: 404 }
      );
    }
    
    const habit = habitResponse.data;
    
    // Check if user is authorized for this habit
    if (habit.creator_user_id !== userId && habit.partner_user_id !== userId) {
      return NextResponse.json(
        { error: 'You are not authorized to complete this habit' },
        { status: 403 }
      );
    }
    
    // Check if habit is active
    if (habit.status !== HabitStatus.ACTIVE) {
      return NextResponse.json(
        { error: `This habit is ${habit.status} and cannot accept volleys` },
        { status: 400 }
      );
    }
    
    // Get the latest volley
    const latestVolleyResponse = await volleyApi.getLatestByHabit(habitId);
    
    // If there are no volleys yet, this is the first volley
    if (latestVolleyResponse.error && latestVolleyResponse.error.includes('No volleys found')) {
      // First volley - check if user is the creator (they should start)
      if (userId !== habit.creator_user_id) {
        return NextResponse.json(
          { error: 'The habit creator must complete the first volley' },
          { status: 400 }
        );
      }
      
      const now = new Date();
      const deadline = calculateDeadline(now, habit.maximum_window_hours);
      
      // Create the volley
      const newVolley = await volleyApi.create({
        habit_id: habitId,
        user_id: userId,
        completed_at: now.toISOString(),
        deadline: deadline.toISOString(),
      });
      
      if (newVolley.error) {
        return NextResponse.json(
          { error: newVolley.error },
          { status: 500 }
        );
      }
      
      // Update streak count
      await habitApi.update(habitId, {
        current_streak_count: 1,
      });
      
      // Create notification for partner
      const partnerUserId = habit.partner_user_id;
      const partnerUser = await userApi.getById(partnerUserId);
      const creatorUser = await userApi.getById(userId);
      
      if (partnerUser.data && creatorUser.data) {
        // Create notification in DB
        await notificationApi.create({
          user_id: partnerUserId,
          type: NotificationType.YOUR_TURN,
          content: `${creatorUser.data.name} completed their ${habit.name} habit. Your turn!`,
          related_habit_id: habitId,
          read_status: false,
        });
        
        // Send email
        const { subject, html } = generateVolleyNotificationEmail({
          recipientName: partnerUser.data.name,
          habitName: habit.name,
          partnerName: creatorUser.data.name,
          deadlineTime: new Date(deadline).toLocaleString(),
        });
        
        await sendEmail({
          to: partnerUser.data.email,
          subject,
          html,
        });
      }
      
      return NextResponse.json(newVolley.data);
    }
    
    // This is not the first volley
    if (latestVolleyResponse.error) {
      return NextResponse.json(
        { error: latestVolleyResponse.error },
        { status: 500 }
      );
    }
    
    const latestVolley = latestVolleyResponse.data;
    
    // Check if latestVolley exists
    if (!latestVolley) {
      return NextResponse.json(
        { error: 'Latest volley data not found' },
        { status: 500 }
      );
    }
    
    // Check if the current user already completed the latest volley
    if (latestVolley.user_id === userId) {
      return NextResponse.json(
        { error: 'You already completed your turn. Wait for your partner.' },
        { status: 400 }
      );
    }
    
    // Check if the deadline has passed
    const deadline = new Date(latestVolley.deadline);
    if (new Date() > deadline) {
      // Deadline passed, habit streak is broken
      await habitApi.update(habitId, {
        status: HabitStatus.BROKEN,
      });
      
      return NextResponse.json(
        { error: 'The deadline has passed and the habit streak is broken' },
        { status: 400 }
      );
    }
    
    // Check if minimum delay has passed
    const lastCompletedAt = new Date(latestVolley.completed_at);
    if (!canCompleteVolley(lastCompletedAt, habit.minimum_delay_hours)) {
      return NextResponse.json(
        { error: `You must wait at least ${habit.minimum_delay_hours} hours since the last volley` },
        { status: 400 }
      );
    }
    
    // All checks passed, create a new volley
    const now = new Date();
    const newDeadline = calculateDeadline(now, habit.maximum_window_hours);
    
    const newVolley = await volleyApi.create({
      habit_id: habitId,
      user_id: userId,
      completed_at: now.toISOString(),
      deadline: newDeadline.toISOString(),
    });
    
    if (newVolley.error) {
      return NextResponse.json(
        { error: newVolley.error },
        { status: 500 }
      );
    }
    
    // Update streak count
    await habitApi.update(habitId, {
      current_streak_count: habit.current_streak_count + 1,
    });
    
    // Determine partner (the other user)
    const partnerUserId = userId === habit.creator_user_id 
      ? habit.partner_user_id 
      : habit.creator_user_id;
    
    const partnerUser = await userApi.getById(partnerUserId);
    const currentUser = await userApi.getById(userId);
    
    if (partnerUser.data && currentUser.data) {
      // Create notification in DB
      await notificationApi.create({
        user_id: partnerUserId,
        type: NotificationType.YOUR_TURN,
        content: `${currentUser.data.name} completed their ${habit.name} habit. Your turn!`,
        related_habit_id: habitId,
        read_status: false,
      });
      
      // Send email
      const { subject, html } = generateVolleyNotificationEmail({
        recipientName: partnerUser.data.name,
        habitName: habit.name,
        partnerName: currentUser.data.name,
        deadlineTime: new Date(newDeadline).toLocaleString(),
      });
      
      await sendEmail({
        to: partnerUser.data.email,
        subject,
        html,
      });
    }
    
    return NextResponse.json(newVolley.data);
    
  } catch (error) {
    console.error('Error completing volley:', error);
    return NextResponse.json(
      { error: 'Failed to complete habit volley' },
      { status: 500 }
    );
  }
} 