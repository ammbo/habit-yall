import { getSession } from '@/lib/auth/session';
import { habitApi, userApi, volleyApi } from '@/lib/api/gibson';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import HabitCard from '@/components/habits/HabitCard';
import CreateHabitForm from '@/components/habits/CreateHabitForm';
import { HabitStatus } from '@/lib/types';

async function getUserHabits(userId: number) {
  const habitsResponse = await habitApi.getUserHabits(userId);
  
  if (habitsResponse.error || !habitsResponse.data) {
    return [];
  }
  
  return habitsResponse.data;
}

async function getUserName(userId: number) {
  const userResponse = await userApi.getById(userId);
  
  if (userResponse.error || !userResponse.data) {
    return null;
  }
  
  return userResponse.data;
}

async function getPartners(habits: any[], currentUserId: number) {
  const partnerIds = habits.map(habit =>
    habit.creator_user_id !== currentUserId ? habit.creator_user_id : habit.partner_user_id
  );
  
  const uniquePartnerIds = Array.from(new Set(partnerIds));
  
  const partnerPromises = uniquePartnerIds.map(id => userApi.getById(id));
  const partnerResponses = await Promise.all(partnerPromises);
  
  const partners: Record<number, any> = {};
  
  partnerResponses.forEach(response => {
    if (response.data) {
      partners[response.data.id] = response.data;
    }
  });
  
  return partners;
}

async function getLatestVolleys(habits: any[]) {
  const volleyPromises = habits.map(habit => volleyApi.getLatestByHabit(habit.id));
  const volleyResponses = await Promise.all(volleyPromises);
  
  const volleys: Record<number, any> = {};
  
  volleyResponses.forEach((response, index) => {
    if (response.data) {
      volleys[habits[index].id] = response.data;
    }
  });
  
  return volleys;
}

async function handleHabitSuccess() {
  'use server';
  // This is just a placeholder as we can't directly refresh in server components
  // In a real implementation, we might want to revalidate cache or perform other server actions
}

export default async function DashboardPage() {
  const session = await getSession();
  
  // Redirect to login if not authenticated
  if (!session.isLoggedIn) {
    redirect('/login');
  }
  
  const currentUserId = session.userId;
  const currentUser = await getUserName(currentUserId);
  const habits = await getUserHabits(currentUserId);
  const partners = await getPartners(habits, currentUserId);
  const latestVolleys = await getLatestVolleys(habits);
  
  const getPartnerName = (habit: any) => {
    const partnerId = habit.creator_user_id === currentUserId 
      ? habit.partner_user_id 
      : habit.creator_user_id;
    
    return partners[partnerId]?.name || 'Unknown Partner';
  };
  
  const isCurrentUserTurn = (habit: any) => {
    const latestVolley = latestVolleys[habit.id];
    
    // If no volleys yet and user is creator, it's their turn
    if (!latestVolley && habit.creator_user_id === currentUserId) {
      return true;
    }
    
    // If no volleys yet and user is partner, it's not their turn
    if (!latestVolley) {
      return false;
    }
    
    // It's the user's turn if the last volley was completed by the other user
    return latestVolley.user_id !== currentUserId;
  };
  
  const getLastVolleyTime = (habit: any) => {
    const latestVolley = latestVolleys[habit.id];
    return latestVolley?.completed_at;
  };
  
  const getDeadline = (habit: any) => {
    const latestVolley = latestVolleys[habit.id];
    return latestVolley?.deadline;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Habit Y&apos;all
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Hi, {currentUser?.name || 'User'}
            </span>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-gray-600 hover:text-gray-900">
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Habits</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Habits</h2>
              
              {habits.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-gray-500 text-center">
                  You don&apos;t have any habits yet. Create your first one!
                </div>
              ) : (
                <div className="space-y-6">
                  {habits.map((habit: any) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCurrentUserTurn={isCurrentUserTurn(habit)}
                      partnerName={getPartnerName(habit)}
                      lastVolleyTime={getLastVolleyTime(habit)}
                      deadline={getDeadline(habit)}
                      onCheckIn={async () => {
                        'use server';
                        await fetch(`/api/habits/${habit.id}/volley`, {
                          method: 'POST'
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New Habit</h2>
              <CreateHabitForm
                onSuccess={handleHabitSuccess}
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Habit Y&apos;all
      </footer>
    </div>
  );
} 