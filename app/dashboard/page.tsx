import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col p-6">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 mt-6">
        <div>
          <h1 className="text-xl font-bold tracking-widest uppercase text-babyblue-500">Zana System</h1>
          <p className="text-sm text-gray-400 tracking-widest uppercase mt-1">Phase 1</p>
        </div>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center cursor-pointer hover:border-babyblue-500 transition-colors">
             <span className="text-xs font-bold tracking-wider">US</span>
          </div>
        </Link>
      </header>

      {/* CORE DISPLAY */}
      <div className="flex-1 space-y-6 max-w-lg mx-auto w-full">
        
        <div className="text-center mb-10">
          <p className="text-6xl font-medium tracking-tighter mb-2">DAY 12</p>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Stick to the plan.</p>
        </div>

        {/* 1. WORKOUT STATUS */}
        <Card className="border border-navy-700 bg-navy-800/80 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="uppercase tracking-widest text-sm font-bold">Today&apos;s Session</h2>
            <span className="text-xs text-gray-400 uppercase tracking-widest">45 Min</span>
          </div>
          <p className="text-2xl font-medium uppercase tracking-wide mb-8">Lower Body <br/> Hypertrophy</p>
          <Link href="/workout" className="block w-full text-center bg-white text-navy-900 font-bold px-6 py-4 rounded-lg uppercase tracking-widest hover:bg-gray-200 transition-colors">
            Start Session
          </Link>
        </Card>

        {/* 2. NUTRITION STATUS */}
        <Link href="/nutrition" className="block">
          <Card className="border border-navy-700 bg-navy-800/50 hover:bg-navy-800 transition-colors cursor-pointer group">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="uppercase tracking-widest text-sm font-bold text-gray-400 group-hover:text-babyblue-500 transition-colors">Nutrition</h2>
                <p className="text-lg font-medium uppercase mt-1">On Track</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-babyblue-500 flex items-center justify-center">
                 <span className="text-babyblue-500 font-bold">&#10003;</span>
              </div>
            </div>
          </Card>
        </Link>
        
      </div>
      
      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-navy-900/90 backdrop-blur-md border-t border-navy-800 py-4 px-6 flex justify-around">
         <Link href="/dashboard" className="text-babyblue-500 uppercase tracking-widest text-xs font-bold">Home</Link>
         <Link href="/progress" className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">Progress</Link>
         <Link href="/guidance" className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">Guidance</Link>
      </nav>

    </main>
  );
}
