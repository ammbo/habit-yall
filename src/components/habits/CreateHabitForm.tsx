'use client';

import { useState } from 'react';

interface CreateHabitFormProps {
  onSuccess: () => void;
}

export default function CreateHabitForm({ onSuccess }: CreateHabitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    partnerEmail: '',
    credits_pledged: 30,
    minimum_delay_hours: 1,
    maximum_window_hours: 24,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name.includes('hours') || name === 'credits_pledged' 
        ? parseInt(value) || 0 
        : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!formData.name || !formData.partnerEmail) {
      setError('Habit name and partner email are required');
      return;
    }
    
    if (formData.minimum_delay_hours < 1) {
      setError('Minimum delay must be at least 1 hour');
      return;
    }
    
    if (formData.maximum_window_hours < 1) {
      setError('Maximum window must be at least 1 hour');
      return;
    }
    
    if (formData.minimum_delay_hours >= formData.maximum_window_hours) {
      setError('Minimum delay must be less than the maximum window');
      return;
    }
    
    if (formData.credits_pledged < 1) {
      setError('Credits pledged must be at least 1');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));
      
      if (!response.ok) {
        const errorMessage = typeof data.error === 'object' 
          ? JSON.stringify(data.error) 
          : data.error || 'Failed to create habit';
        throw new Error(errorMessage);
      }
      
      // Reset form and notify parent of success
      setFormData({
        name: '',
        partnerEmail: '',
        credits_pledged: 30,
        minimum_delay_hours: 1,
        maximum_window_hours: 24,
      });
      
      onSuccess();
      
    } catch (err) {
      console.error('Error creating habit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Habit</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Habit Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Daily 10-minute meditation"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="partnerEmail" className="block text-gray-700 font-medium mb-2">
            Partner&apos;s Email
          </label>
          <input
            type="email"
            id="partnerEmail"
            name="partnerEmail"
            value={formData.partnerEmail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your partner's email"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="credits_pledged" className="block text-gray-700 font-medium mb-2">
            Credits Pledged
          </label>
          <input
            type="number"
            id="credits_pledged"
            name="credits_pledged"
            value={formData.credits_pledged}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Credits that are transferred if the streak breaks
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="minimum_delay_hours" className="block text-gray-700 font-medium mb-2">
              Minimum Delay (hours)
            </label>
            <input
              type="number"
              id="minimum_delay_hours"
              name="minimum_delay_hours"
              value={formData.minimum_delay_hours}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum time between volleys
            </p>
          </div>
          <div>
            <label htmlFor="maximum_window_hours" className="block text-gray-700 font-medium mb-2">
              Response Window (hours)
            </label>
            <input
              type="number"
              id="maximum_window_hours"
              name="maximum_window_hours"
              value={formData.maximum_window_hours}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum time to respond
            </p>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Habit'}
        </button>
      </form>
    </div>
  );
} 