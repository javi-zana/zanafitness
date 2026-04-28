import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col p-6">
      
      <header className="flex justify-between items-center mb-12 mt-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
          &larr; Back
        </Link>
        <span className="text-xs uppercase tracking-widest font-bold text-babyblue-500">
          PROFILE
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center max-w-lg mx-auto w-full">
        
        <div className="w-24 h-24 rounded-full border border-navy-700 bg-navy-800 flex items-center justify-center mb-6 shadow-xl">
           <span className="text-2xl tracking-widest font-bold text-babyblue-500">US</span>
        </div>
        
        <h1 className="text-2xl font-medium tracking-wide uppercase mb-1">User Account</h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase mb-12">user@example.com</p>

        <div className="w-full space-y-4">
          <Card className="flex justify-between items-center py-5">
             <span className="uppercase tracking-widest text-xs font-bold text-gray-400">Current Phase</span>
             <span className="uppercase tracking-widest text-sm font-bold">Phase 01</span>
          </Card>
          <Card className="flex justify-between items-center py-5">
             <span className="uppercase tracking-widest text-xs font-bold text-gray-400">Active Week</span>
             <span className="uppercase tracking-widest text-sm font-bold">Week 2 of 12</span>
          </Card>
        </div>

        <div className="mt-16 w-full text-center space-y-6">
           <a href="mailto:hello@zanafitness.com" className="block text-gray-400 uppercase tracking-widest text-xs hover:text-babyblue-500 transition-colors">
             Support: hello@zanafitness.com
           </a>
           <a href="https://zanafitness.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 uppercase tracking-widest text-xs hover:text-babyblue-500 transition-colors">
             zanafitness.com
           </a>
        </div>

      </div>
    </main>
  );
}
