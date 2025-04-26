import { NextResponse } from 'next/server';
import { notificationApi } from '@/lib/api/gibson';
import { getSession, isAuthenticated } from '@/lib/auth/session';

export async function GET(request: Request) {
  // Check authentication
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const session = await getSession();
    const userId = session.userId;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const readStatus = searchParams.get('read');
    
    let notifications;
    
    if (readStatus !== null) {
      // Filter by read status
      const isRead = readStatus === 'true';
      notifications = await notificationApi.getByUser(userId, isRead);
    } else {
      // Get all notifications
      notifications = await notificationApi.getByUser(userId);
    }
    
    if (notifications.error) {
      return NextResponse.json(
        { error: notifications.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(notifications.data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 