import Link from 'next/link';

export default function GuidancePage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col p-6">
      
      <header className="flex justify-between items-center mb-12 mt-6">
        <span className="text-xs uppercase tracking-widest font-bold text-babyblue-500">
          DAILY INTEL
        </span>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full space-y-6">
        
        <div className="bg-navy-800 border border-navy-700 border-l-4 border-l-babyblue-500 rounded-r-2xl p-8 mb-8">
           <p className="text-gray-400 tracking-widest text-xs uppercase mb-4">Today&apos;s Focus</p>
           <p className="text-lg leading-relaxed font-medium">Control the eccentric. Drop the ego. Progression comes from tension, not just moving weight from point A to B.</p>
        </div>

        <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-8 opacity-75">
           <p className="text-gray-500 tracking-widest text-xs uppercase mb-4">Yesterday</p>
           <p className="text-base leading-relaxed text-gray-300">Hydration is a performance enhancer. Minimum 3 liters today. No exceptions.</p>
        </div>

      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-navy-900/90 backdrop-blur-md border-t border-navy-800 py-4 px-6 flex justify-around">
         <Link href="/dashboard" className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">Home</Link>
         <Link href="/progress" className="text-gray-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">Progress</Link>
         <Link href="/guidance" className="text-babyblue-500 uppercase tracking-widest text-xs font-bold">Guidance</Link>
      </nav>
    </main>
  );
}
