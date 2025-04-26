'use client';

import { useState } from 'react';
import { Habit, HabitStatus } from '@/lib/types';
import { formatDateTime, getTimeRemaining, isBeforeDeadline } from '@/lib/utils/date';

interface HabitCardProps {
  habit: Habit;
  isCurrentUserTurn: boolean;
  partnerName: string;
  lastVolleyTime?: string;
  deadline?: string;
  onCheckIn: () => void;
}

export default function HabitCard({
  habit,
  isCurrentUserTurn,
  partnerName,
  lastVolleyTime,
  deadline,
  onCheckIn,
}: HabitCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      await onCheckIn();
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusClass = () => {
    switch (habit.status) {
      case HabitStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case HabitStatus.BROKEN:
        return 'bg-red-100 text-red-800';
      case HabitStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = () => {
    switch (habit.status) {
      case HabitStatus.ACTIVE:
        return 'ACTIVE';
      case HabitStatus.BROKEN:
        return 'BROKEN';
      case HabitStatus.COMPLETED:
        return 'COMPLETED';
      default:
        return 'UNKNOWN';
    }
  };
  
  const isActiveAndBeforeDeadline = 
    habit.status === HabitStatus.ACTIVE && 
    deadline && 
    isBeforeDeadline(new Date(deadline));
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{habit.name}</h3>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="mb-4">
          <div className="text-gray-600 mb-1">
            <span className="font-semibold">Partner:</span> {partnerName}
          </div>
          <div className="text-gray-600 mb-1">
            <span className="font-semibold">Credits Pledged:</span> {habit.credits_pledged}
          </div>
          <div className="text-gray-600">
            <span className="font-semibold">Current Streak:</span> {habit.current_streak_count}
          </div>
        </div>
        
        {habit.status === HabitStatus.ACTIVE && (
          <>
            <div className="mb-5">
              {isCurrentUserTurn ? (
                <div className="bg-primary-50 text-primary-800 p-4 rounded-md">
                  <p className="font-semibold">It&apos;s your turn!</p>
                  {deadline && (
                    <p className="text-sm">
                      Time remaining: {getTimeRemaining(new Date(deadline))}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-semibold">Waiting for {partnerName}</p>
                  {lastVolleyTime && (
                    <p className="text-sm">
                      Last activity: {formatDateTime(new Date(lastVolleyTime))}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {isCurrentUserTurn && isActiveAndBeforeDeadline && (
              <button
                onClick={handleCheckIn}
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Checking In...' : 'Check In'}
              </button>
            )}
          </>
        )}
        
        {habit.status === HabitStatus.BROKEN && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
            <p className="font-semibold">
              This habit streak was broken after {habit.current_streak_count} volleys.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 