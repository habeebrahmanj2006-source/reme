import React, { useState, useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import { Droplet, Moon, Heart, Smile, Play, Pause, RotateCcw, AlertCircle, Wind, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HealthSectionProps {
  water: number;
  setWater: React.Dispatch<React.SetStateAction<number>>;
  sleepHours: number;
  setSleepHours: React.Dispatch<React.SetStateAction<number>>;
  meditationMinutes: number;
  setMeditationMinutes: React.Dispatch<React.SetStateAction<number>>;
  rewardPoints: number;
  setRewardPoints: React.Dispatch<React.SetStateAction<number>>;
  voiceEnabled: boolean;
}

export default function HealthSection({
  water,
  setWater,
  sleepHours,
  setSleepHours,
  meditationMinutes,
  setMeditationMinutes,
  rewardPoints,
  setRewardPoints,
  voiceEnabled
}: HealthSectionProps) {
  // Meditation states
  const [medTime, setMedTime] = useState(10 * 60); // 10 minutes default
  const [medActive, setMedActive] = useState(false);
  const medIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing states
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Goals
  const waterGoal = 2500; // ml
  const sleepGoal = 8; // hours

  // Meditation timer loop
  useEffect(() => {
    if (medActive) {
      medIntervalRef.current = setInterval(() => {
        setMedTime(prev => {
          if (prev <= 1) {
            handleMeditationComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (medIntervalRef.current) clearInterval(medIntervalRef.current);
    }
    return () => {
      if (medIntervalRef.current) clearInterval(medIntervalRef.current);
    };
  }, [medActive]);

  const handleMeditationComplete = () => {
    setMedActive(false);
    setMeditationMinutes(prev => prev + 10);
    setRewardPoints(p => p + 30); // 30 points

    if ('speechSynthesis' in window && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance("Meditation complete. You are centered and calm.");
      window.speechSynthesis.speak(utterance);
    } else {
      alert("🧘 Mindful Meditation complete! You earned 30 points.");
    }
    setMedTime(10 * 60);
  };

  // Breathing cycle pacing loops (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    if (breathActive) {
      breathIntervalRef.current = setInterval(() => {
        setBreathSeconds(prev => {
          if (prev <= 1) {
            // transition phase
            setBreathPhase(current => {
              if (current === 'Inhale') {
                return 'Hold';
              } else if (current === 'Hold') {
                return 'Exhale';
              } else {
                return 'Inhale';
              }
            });
            return 4; // Reset phase duration
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    }
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [breathActive]);

  // Calculate Daily Health Score (from 0 to 100)
  const calculateHealthScore = () => {
    const waterScore = Math.min(40, (water / waterGoal) * 40);
    const sleepScore = Math.min(40, (sleepHours / sleepGoal) * 40);
    const meditationScore = Math.min(20, (meditationMinutes / 20) * 20); // 20 mins meditation maxes score component
    return Math.round(waterScore + sleepScore + meditationScore);
  };

  const healthScore = calculateHealthScore();

  // Score comment feedback
  let feedback = "Establish goals by using the health widgets below!";
  if (healthScore >= 85) feedback = "Excellent! You are prioritizing sleep, meditation, and perfect hydration levels.";
  else if (healthScore >= 60) feedback = "Solid, but you have room to improve hydration or mindfulness today.";
  else if (healthScore > 0) feedback = "Hydrate and rest to power your score and feel re-energized.";

  return (
    <div className="space-y-8">
      {/* Dynamic Health Dashboard Banner */}
      <GlassCard className="border-purple-500/20 bg-zinc-950/65 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center bg-purple-500/10 shadow-lg shadow-purple-500/10">
              <span className="text-3xl font-black text-purple-400 font-mono">{healthScore}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                Daily Wellness Index
                <Trophy className="text-purple-400 h-4 w-4 animate-bounce" />
              </h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-md font-sans">{feedback}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-805 text-center min-w-[100px]">
              <span className="text-xs text-zinc-500 block font-bold uppercase tracking-widest mb-1">Water Goal</span>
              <span className="text-sm font-bold text-purple-400">{water} / {waterGoal} ml</span>
            </div>
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-805 text-center min-w-[100px]">
              <span className="text-xs text-zinc-500 block font-bold uppercase tracking-widest mb-1">SleepHours</span>
              <span className="text-sm font-bold text-purple-400">{sleepHours}h / {sleepGoal}h</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Hydration Tracker */}
        <GlassCard className="border-purple-500/10 bg-zinc-950/30 p-6">
          <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
            <Droplet className="text-purple-400 h-5 w-5" />
            Hydration Tracker
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-black text-white">{water}ml</p>
              <p className="text-xs text-zinc-505 font-medium">Target daily intake: {waterGoal}ml</p>
            </div>
            <Droplet className={`h-8 w-8 text-purple-400 ${water > 0 ? 'animate-bounce' : ''}`} />
          </div>

          {/* Water Progress Bar */}
          <div className="w-full bg-zinc-900/60 h-3 rounded-full overflow-hidden mb-6 border border-zinc-805">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (water / waterGoal) * 100)}%` }}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setWater(prev => prev + 250);
                setRewardPoints(p => p + 5);
              }}
              className="bg-zinc-90 w-full hover:bg-purple-500/10 hover:text-purple-450 border border-zinc-800 rounded-xl py-3 text-xs font-bold text-zinc-300 transition-all active:scale-95 cursor-pointer"
            >
              +250ml Glass
            </button>
            <button
              onClick={() => {
                setWater(prev => prev + 500);
                setRewardPoints(p => p + 10);
              }}
              className="bg-zinc-90 w-full hover:bg-purple-500/10 hover:text-purple-450 border border-zinc-800 rounded-xl py-3 text-xs font-bold text-zinc-300 transition-all active:scale-95 cursor-pointer"
            >
              +500ml Bottle
            </button>
            <button
              onClick={() => setWater(0)}
              className="bg-zinc-950 hover:bg-rose-500/10 hover:text-rose-400 border border-zinc-850 rounded-xl py-3 text-xs font-bold text-zinc-500 transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </GlassCard>

        {/* Sleep Evaluator Card */}
        <GlassCard className="border-purple-500/10 bg-zinc-950/30 p-6">
          <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
            <Moon className="text-purple-400 h-5 w-5" />
            Sleep Evaluator
          </h3>

          <p className="text-xs text-zinc-400 mb-6 font-sans">
            Log your sleep to build an accurate wellness score and consecutive streaks.
          </p>

          <div className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-[#27272a] mb-6 shadow-inner">
            <div className="flex-1">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-1">Hours Rested last night</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={sleepHours || ''}
                  onChange={(e) => {
                    const h = parseFloat(e.target.value) || 0;
                    setSleepHours(Math.min(24, Math.max(0, h)));
                  }}
                  className="w-20 bg-zinc-950 border border-zinc-805 rounded-lg py-1.5 px-3 text-center text-sm font-bold text-white focus:outline-none focus:border-purple-500/40"
                  placeholder="0"
                />
                <span className="text-sm font-bold text-zinc-400 font-sans">hours</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-500 block uppercase font-bold">Sleep Quality Tracker</span>
              <span className="text-sm font-bold text-purple-400 font-sans">
                {sleepHours >= 8 ? '⭐️ Optimal sleep' : sleepHours >= 6 ? '✨ Moderate sleep' : '⚠️ Insufficient'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center py-2 bg-purple-500/5 rounded-xl border border-purple-500/10 text-purple-400 text-xs font-semibold leading-relaxed">
            <AlertCircle size={14} className="animate-pulse" />
            <span className="font-sans">Optimal sleep supports neuroplasticity for learning.</span>
          </div>
        </GlassCard>

        {/* Meditation Timer Card */}
        <GlassCard className="border-purple-500/10 bg-zinc-950/30 p-6 text-center">
          <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center justify-center gap-2">
            <Heart className="text-purple-400 h-5 w-5 animate-pulse" />
            Zen Meditation Timer
          </h3>
          <p className="text-xs text-zinc-400 mb-6 font-sans">Deep breathing audio and visual pacing simulation.</p>

          <div className="relative w-36 h-36 mx-auto flex items-center justify-center rounded-full bg-zinc-900/60 border border-zinc-800 mb-6 shadow-md shadow-purple-500/5">
            {medActive && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute inset-0 bg-purple-550/10 rounded-full"
              />
            )}
            <div>
              <span className="text-3xl font-mono font-bold text-white tracking-widest">
                {Math.floor(medTime / 60)}:{String(medTime % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => {
                setMedActive(false);
                setMedTime(10 * 60);
              }}
              className="p-2.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 rounded-xl text-zinc-450 hover:text-white cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setMedActive(!medActive)}
              className={`py-2.5 px-6 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg cursor-pointer ${
                medActive 
                  ? 'bg-rose-605 hover:bg-rose-500 text-white shadow-rose-500/10' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/15 border border-purple-500/20'
              }`}
            >
              {medActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              {medActive ? 'Pause Session' : 'Start Zen'}
            </button>
          </div>
        </GlassCard>

        {/* Breathing Exercise Pacer Card */}
        <GlassCard className="border-purple-500/10 bg-zinc-950/30 p-6 text-center flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center justify-center gap-2">
              <Wind className="text-purple-400 h-5 w-5 animate-pulse" />
              Box Breathing Guide
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-sans">
              Inhale, Hold, and Exhale deeply to reduce stress levels immediately.
            </p>

            <div className="relative w-32 h-32 mx-auto flex items-center justify-center rounded-full mb-6 bg-zinc-900/60 border border-zinc-800">
              {breathActive && (
                <motion.div
                  key={breathPhase}
                  animate={{
                    scale: breathPhase === 'Inhale' 
                      ? [1, 1.4] 
                      : breathPhase === 'Hold' 
                        ? [1.4, 1.4] 
                        : [1.4, 1]
                  }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className="absolute inset-0 bg-purple-550/10 rounded-full"
                />
              )}
              <div className="z-10">
                <span className="text-xs tracking-widest uppercase font-bold text-purple-400 block mb-1 font-mono">
                  {breathPhase}
                </span>
                <span className="text-2xl font-mono font-bold text-white">
                  {breathSeconds}s
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                setBreathActive(!breathActive);
                setBreathPhase('Inhale');
                setBreathSeconds(4);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                breathActive
                  ? 'bg-zinc-850 border border-zinc-700 hover:bg-zinc-700 text-zinc-400'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-md shadow-purple-500/15 border border-purple-500/20'
              }`}
            >
              <Wind size={16} />
              {breathActive ? 'End Breathing Exercise' : 'Begin Deep Breathing'}
            </button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
