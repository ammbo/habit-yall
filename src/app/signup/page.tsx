import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Habit Y&apos;all
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Habit Y&apos;all
      </footer>
    </div>
  );
} 