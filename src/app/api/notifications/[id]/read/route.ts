import { NextResponse } from 'next/server';
import { notificationApi } from '@/lib/api/gibson';
import { isAuthenticated } from '@/lib/auth/session';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check authentication
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const notificationId = params.id;
    
    // Get the notification to check ownership
    const notificationResponse = await notificationApi.getById(notificationId);
    
    if (notificationResponse.error || !notificationResponse.data) {
      return NextResponse.json(
        { error: notificationResponse.error || 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Mark the notification as read
    const updateResult = await notificationApi.markAsRead(notificationId);
    
    if (updateResult.error) {
      return NextResponse.json(
        { error: updateResult.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
} 