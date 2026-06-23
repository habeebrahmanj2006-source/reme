import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Award, Star, ListPlus, Trash, Check, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Homework {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  completed: boolean;
}

interface KidHabit {
  id: string;
  name: string;
  completedToday: boolean;
  streak: number;
}

interface KidsSectionProps {
  rewardPoints: number;
  setRewardPoints: React.Dispatch<React.SetStateAction<number>>;
  voiceEnabled: boolean;
}

export default function KidsSection({ rewardPoints, setRewardPoints, voiceEnabled }: KidsSectionProps) {
  // Homework state
  const [homework, setHomework] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('reme_homework');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'h1', title: 'Math Fractions Exercises 1-5', subject: 'Math', dueDate: '2026-06-21', completed: false },
      { id: 'h2', title: 'Solar system science report', subject: 'Science', dueDate: '2026-06-25', completed: false }
    ];
  });

  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('Math');
  const [hwDate, setHwDate] = useState('');

  // Kids Habits state
  const [kidHabits, setKidHabits] = useState<KidHabit[]>(() => {
    const saved = localStorage.getItem('reme_kid_habits');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'kh1', name: 'Brush teeth twice a day', completedToday: false, streak: 3 },
      { id: 'kh2', name: 'Read a book for 15 minutes', completedToday: false, streak: 5 },
      { id: 'kh3', name: 'Practice math problems', completedToday: false, streak: 1 },
      { id: 'kh4', name: 'Clean your desk / bedroom', completedToday: false, streak: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('reme_homework', JSON.stringify(homework));
  }, [homework]);

  useEffect(() => {
    localStorage.setItem('reme_kid_habits', JSON.stringify(kidHabits));
  }, [kidHabits]);

  const handleAddHw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    const newHw: Homework = {
      id: crypto.randomUUID(),
      title: hwTitle.trim(),
      subject: hwSubject,
      dueDate: hwDate || new Date().toISOString().split('T')[0],
      completed: false
    };

    setHomework(prev => [newHw, ...prev]);
    setHwTitle('');
    setHwDate('');
  };

  const handleToggleHw = (id: string) => {
    setHomework(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState) {
          setRewardPoints(p => p + 30); // 30 points for homework completing!
          speakAward("Well done, you completed your homework! You earned thirty reward points.");
        } else {
          setRewardPoints(p => Math.max(0, p - 30));
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));
  };

  const handleDeleteHw = (id: string) => {
    setHomework(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleKidHabit = (id: string) => {
    setKidHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = !h.completedToday;
        const nextStreak = nextState ? h.streak + 1 : Math.max(0, h.streak - 1);
        
        if (nextState) {
          setRewardPoints(p => p + 20); // 20 points for habit completing!
          speakAward("Amazing habit checker completed! Twenty bonus points for you!");
        } else {
          setRewardPoints(p => Math.max(0, p - 20));
        }

        return {
          ...h,
          completedToday: nextState,
          streak: nextStreak
        };
      }
      return h;
    }));
  };

  const speakAward = (msg: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.pitch = 1.2; 
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Badges system thresholds
  const badgeMilestones = [
    { points: 50, name: "🌟 Bright Star", label: "Establish consistent basic habits.", icon: "🌟" },
    { points: 150, name: "🚀 Homework Knight", label: "Conquer homework deadlines easily.", icon: "🚀" },
    { points: 300, name: "🧬 Einstein Junior", label: "Master analytical skills & focus.", icon: "🧬" },
    { points: 500, name: "🏆 Ultimate Champion", label: "Complete total habit cycles for maximum points.", icon: "🏆" }
  ];

  const totalPoints = rewardPoints;
  const starsCount = Math.floor(totalPoints / 50);

  return (
    <div className="space-y-8">
      {/* Rewards Showcase header Banner */}
      <GlassCard className="border-purple-500/20 bg-zinc-950/60 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left font-sans">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-purple-550/10 border border-purple-500/20 text-purple-400">
              <Award size={36} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white flex items-center justify-center sm:justify-start gap-1">
                Kids Star Room
                <Sparkles size={14} className="text-purple-400" />
              </h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm font-medium">
                Unlock daily achievements, custom medals, and Einstein badges by keeping homework and healthy habits checked!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 text-center min-w-[120px]">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest block uppercase mb-1">Kid Points</span>
              <span className="text-3xl font-black text-purple-400 font-mono">{rewardPoints}</span>
            </div>

            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 text-center min-w-[124px]">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest block uppercase mb-1">Stars Achieved</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-yellow-500 text-lg">
                <Star size={16} fill="currentColor" className="text-purple-400" />
                <span className="font-mono font-black text-white">{starsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kid Homework Tracker */}
        <GlassCard className="border-purple-500/10 bg-zinc-950/30 p-6">
          <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
            <BookOpen className="text-purple-400 h-5 w-5" />
            Homework Assignments
          </h3>

          <form onSubmit={handleAddHw} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-6">
            <select
              value={hwSubject}
              onChange={(e) => setHwSubject(e.target.value)}
              className="sm:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-slate-204 focus:outline-none focus:border-purple-500/40"
            >
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Art">Art</option>
              <option value="English">English</option>
            </select>
            
            <input
              type="text"
              placeholder="What homework today?"
              value={hwTitle}
              onChange={(e) => setHwTitle(e.target.value)}
              className="sm:col-span-6 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/40"
            />

            <button
              type="submit"
              className="sm:col-span-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-0.5 shadow-lg shadow-purple-500/15 hover:brightness-110 cursor-pointer border border-purple-500/20"
            >
              <ListPlus size={14} /> Add Hw
            </button>
          </form>

          {/* List homework */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {homework.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 text-xs font-semibold">
                  Celebrate! Homework files are fully completed! 🙌
                </div>
              ) : (
                homework.map((hw) => (
                  <motion.div
                    key={hw.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      hw.completed 
                        ? 'bg-zinc-900/10 border-zinc-900 opacity-55' 
                        : 'bg-zinc-905 border-zinc-800/80 hover:border-zinc-700 shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleHw(hw.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                          hw.completed ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-700 hover:border-purple-500'
                        }`}
                      >
                        {hw.completed && <Check size={11} className="stroke-[3]" />}
                      </button>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-purple-400 block mb-0.5">{hw.subject}</span>
                        <span className={`text-xs ${hw.completed ? 'line-through text-zinc-500' : 'text-slate-200'}`}>{hw.title}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHw(hw.id)}
                      className="p-1 text-zinc-600 hover:text-rose-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Kids Healthy Habits Card */}
        <GlassCard className="border-purple-500/10 bg-zinc-950/30 p-6 font-sans">
          <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
            <Star className="text-purple-400 h-5 w-5 animate-pulse" />
            Daily Kids Habits
          </h3>

          <div className="space-y-3">
            {kidHabits.map((habit) => (
              <div 
                key={habit.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  habit.completedToday 
                    ? 'bg-zinc-900/20 border-zinc-905 opacity-60' 
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleKidHabit(habit.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                      habit.completedToday 
                        ? 'bg-purple-600 border-purple-600 text-white' 
                        : 'border-zinc-700 hover:border-purple-500'
                    }`}
                  >
                    {habit.completedToday && <Check size={12} className="stroke-[3]" />}
                  </button>
                  <span className={`text-xs ${habit.completedToday ? 'line-through text-zinc-505' : 'text-slate-200 font-medium'}`}>
                    {habit.name}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold font-mono">
                    🔥 {habit.streak} Streaks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Rewards Star Badges Room */}
      <GlassCard className="border-purple-500/10 bg-zinc-950/40 p-6">
        <h3 className="text-md font-bold font-display text-zinc-400 mb-6 flex items-center gap-1.5 justify-center sm:justify-start">
          <Award size={18} className="text-purple-400" /> Unlockable Stars & Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badgeMilestones.map((b) => {
            const unlocked = totalPoints >= b.points;
            return (
              <div 
                key={b.name}
                className={`relative p-5 rounded-2xl border text-center transition-all ${
                  unlocked 
                    ? 'bg-purple-500/[0.04] border-purple-500/20 shadow-lg shadow-purple-500/5' 
                    : 'bg-zinc-900/10 border-zinc-850 opacity-40'
                }`}
              >
                {unlocked && (
                  <div className="absolute top-2 right-2 bg-purple-500/15 text-purple-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-purple-500/20">
                    unlocked
                  </div>
                )}
                
                <div className="text-4xl mb-3 filter drop-shadow-md">{b.icon}</div>
                <h4 className={`text-sm font-bold ${unlocked ? 'text-purple-400 font-display' : 'text-zinc-500 font-sans'}`}>{b.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-[160px] mx-auto min-h-[30px] font-sans">{b.label}</p>
                <div className="mt-2.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold text-slate-400 ${unlocked ? 'bg-purple-500/10 border border-purple-500/10 text-purple-400' : 'bg-zinc-900'}`}>
                    Required: {b.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
