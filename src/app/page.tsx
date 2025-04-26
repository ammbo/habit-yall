import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Habit Y&apos;all</h1>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary-600 to-primary-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-6">Build Habits Together</h2>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              Keep each other accountable with a ping-pong style volley system.
              Complete your habit, then it&apos;s your partner&apos;s turn!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/signup" 
                className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-md shadow-md transition-colors">
                Sign Up
              </Link>
              <Link 
                href="/login" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-md shadow-md transition-colors">
                Log In
              </Link>
            </div>
          </div>
        </section>
        
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-primary-100 text-primary-700 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">1</div>
                <h3 className="text-xl font-bold mb-3">Partner Up</h3>
                <p className="text-gray-600">
                  Find a partner who shares your habit goals. Connect via email and set your
                  habit challenge together.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-primary-100 text-primary-700 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">2</div>
                <h3 className="text-xl font-bold mb-3">Pledge Credits</h3>
                <p className="text-gray-600">
                  Both partners pledge credits for the duration of the habit. If you break the streak,
                  your partner receives your pledged credits.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-primary-100 text-primary-700 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">3</div>
                <h3 className="text-xl font-bold mb-3">Volley Back and Forth</h3>
                <p className="text-gray-600">
                  After you complete your habit, your partner has a time window to complete theirs.
                  Keep the streak alive together!
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Build Better Habits?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              Join Habit Y&apos;all today and transform your habit goals with the power of partnership.
            </p>
            <Link 
              href="/signup" 
              className="bg-primary-600 text-white hover:bg-primary-700 font-semibold py-3 px-8 rounded-md shadow-md transition-colors">
              Get Started
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Habit Y&apos;all. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 