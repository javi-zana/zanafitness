"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EXERCISES = [
  { name: 'Barbell Squat', sets: 3, reps: '8-10', current: 1 },
  { name: 'Leg Press', sets: 3, reps: '10-12', current: 1 },
  { name: 'Romanian Deadlift', sets: 3, reps: '8-10', current: 1 },
];

export default function WorkoutPage() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);

  const activeExercise = EXERCISES[exerciseIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsResting(false);
      setTimeLeft(90); // Reset for next time
    }
    return () => clearInterval(timer);
  }, [isResting, timeLeft]);

  const handleCompleteSet = () => {
    if (setIndex < activeExercise.sets) {
      setSetIndex(prev => prev + 1);
      setIsResting(true);
    } else {
      if (exerciseIndex < EXERCISES.length - 1) {
        setExerciseIndex(prev => prev + 1);
        setSetIndex(1);
        setIsResting(true);
      } else {
        // Workout Complete
        window.location.href = '/dashboard';
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col p-6">
      
      <header className="flex justify-between items-center mb-12 mt-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
          &larr; Quit
        </Link>
        <span className="text-xs uppercase tracking-widest font-bold text-babyblue-500">
          {exerciseIndex + 1} / {EXERCISES.length}
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center">
        
        {isResting ? (
          <div className="space-y-8 w-full animate-fade-in">
            <p className="text-babyblue-500 tracking-widest uppercase text-sm font-bold">REST</p>
            <div className="text-8xl font-medium tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-400 tracking-widest uppercase text-xs pt-8">Next: {setIndex === 1 && exerciseIndex > 0 ? EXERCISES[exerciseIndex].name : `Set ${setIndex}`}</p>
            
            <button 
              onClick={() => setIsResting(false)}
              className="mt-12 bg-navy-800 text-white font-bold w-full py-4 rounded-lg border border-navy-700 uppercase tracking-widest hover:border-gray-500 transition-colors"
            >
              Skip Rest
            </button>
          </div>
        ) : (
          <div className="space-y-12 w-full animate-fade-in">
            <div>
              <p className="text-babyblue-500 tracking-widest uppercase text-sm font-bold mb-4">
                SET {setIndex} OF {activeExercise.sets}
              </p>
              <h2 className="text-4xl md:text-5xl font-medium uppercase tracking-tight leading-tight">
                {activeExercise.name}
              </h2>
            </div>
            
            <div className="flex justify-center items-center gap-12 bg-navy-800 border border-navy-700 rounded-2xl p-8">
              <div className="text-center">
                <p className="text-gray-400 tracking-widest uppercase text-xs mb-1">Target</p>
                <p className="text-2xl font-bold">{activeExercise.reps}</p>
              </div>
              <div className="w-px h-12 bg-navy-700"></div>
              <div className="text-center">
                <p className="text-gray-400 tracking-widest uppercase text-xs mb-1">Previous</p>
                <p className="text-2xl font-bold text-gray-500">-</p>
              </div>
            </div>

            <button 
              onClick={handleCompleteSet}
              className="w-full bg-babyblue-500 text-navy-900 font-bold py-5 rounded-lg uppercase tracking-widest text-lg hover:bg-babyblue-400 transition-colors"
            >
              Log Set
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
