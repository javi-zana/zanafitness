import Link from 'next/link';

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col p-6">
      
      <header className="flex justify-between items-center mb-12 mt-6">
        <span className="text-xs uppercase tracking-widest font-bold text-babyblue-500">
          PROGRESS
        </span>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full space-y-8">
        
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8">
           <h3 className="uppercase tracking-widest text-sm font-bold mb-6 text-gray-400">Consistency</h3>
           <div className="flex items-end gap-4">
              <p className="text-5xl font-medium tracking-tighter">92%</p>
              <p className="text-babyblue-500 text-sm tracking-widest uppercase font-bold mb-2">Phase 01</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6">
               <h3 className="uppercase tracking-widest text-xs font-bold mb-4 text-gray-400">Strength Trend</h3>
               <p className="text-3xl font-medium tracking-tighter text-green-400 mb-1">+12%</p>
               <p className="text-xs tracking-widest uppercase text-gray-500">All Lifts</p>
            </div>
            <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6">
               <h3 className="uppercase tracking-widest text-xs font-bold mb-4 text-gray-400">Bodyweight</h3>
               <p className="text-3xl font-medium tracking-tighter mb-1">174.2</p>
               <p className="text-xs tracking-widest uppercase text-gray-500">LBS. Average</p>
            </div>
        </div>

      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-navy-900/90 backdrop-blur-md border-t border-navy-800 py-4 px-6 flex justify-around">
         <Link href="/dashboard" className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">Home</Link>
         <Link href="/progress" className="text-babyblue-500 uppercase tracking-widest text-xs font-bold">Progress</Link>
         <Link href="/guidance" className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">Guidance</Link>
      </nav>
    </main>
  );
}
