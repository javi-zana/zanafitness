import Link from 'next/link';

export default function NutritionPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col p-6">
      
      <header className="flex justify-between items-center mb-12 mt-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
          &larr; Back
        </Link>
        <span className="text-xs uppercase tracking-widest font-bold text-babyblue-500">
          NUTRITION
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        
        <div className="text-center mb-16">
           <div className="inline-flex items-center justify-center bg-green-900/30 text-green-400 border border-green-900/50 px-6 py-2 rounded-full mb-8">
              <span className="uppercase tracking-widest text-sm font-bold">● On Track</span>
           </div>
           <h2 className="text-4xl font-medium tracking-tight uppercase leading-snug">
             Fuel the Machine.
           </h2>
        </div>

        <div className="w-full space-y-6">
          <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 flex justify-between items-end">
            <div>
              <p className="text-gray-400 tracking-widest uppercase text-xs mb-2">Target Calories</p>
              <p className="text-4xl font-bold">2,400</p>
            </div>
            <p className="text-babyblue-500 tracking-widest uppercase text-xs font-bold pb-1 text-right max-w-24">Required for Growth</p>
          </div>

          <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 flex justify-between items-end">
            <div>
              <p className="text-gray-400 tracking-widest uppercase text-xs mb-2">Target Protein</p>
              <p className="text-4xl font-bold">180<span className="text-lg text-gray-500 ml-1">g</span></p>
            </div>
             <p className="text-babyblue-500 tracking-widest uppercase text-xs font-bold pb-1 text-right max-w-24">Non Negotiable</p>
          </div>
        </div>

      </div>
    </main>
  );
}
