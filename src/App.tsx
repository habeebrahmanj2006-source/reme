/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, ListTodo, GraduationCap, Heart, CalendarRange, 
  Sparkles, BarChart3, Settings, Menu, X, Flame, Award, Volume2, VolumeX, AlertCircle 
} from 'lucide-react';

import { Task, Topic } from './types';
import TaskSection from './components/TaskSection';
import StudySection from './components/StudySection';
import HealthSection from './components/HealthSection';
import FemaleSection from './components/FemaleSection';
import KidsSection from './components/KidsSection';
import AnalyticsSection from './components/AnalyticsSection';
import ProfileSection from './components/ProfileSection';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'tasks' | 'study' | 'health' | 'female' | 'kids' | 'analytics' | 'profile'>('tasks');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core global user profile states
  const [userName, setUserName] = useState(() => localStorage.getItem('reme_username') || 'Alex');
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('reme_voice_enabled') === 'true');
  const [streak, setStreak] = useState(1);
  const [rewardPoints, setRewardPoints] = useState(() => {
    const saved = localStorage.getItem('reme_rewards_points');
    return saved ? parseInt(saved) : 120; // Default points seed
  });

  // Core feature states (Local Storage fallback)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('reme_tasks_v2');
    if (saved) return JSON.parse(saved);
    return [
      { id: 't1', title: 'Finish reading physics chapter 4', priority: 'High', category: 'Study', dueDate: '2026-06-[TODAY]', dueTime: '15:30', completed: false },
      { id: 't2', title: 'Drill 3 liters of water', priority: 'Medium', category: 'Health', dueDate: '2026-06-[TODAY]', dueTime: '19:00', completed: false },
      { id: 't3', title: 'Complete Art folder outline', priority: 'Low', category: 'Personal', dueDate: '2026-06-[TODAY]', dueTime: '21:00', completed: true }
    ];
  });

  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('reme_topics');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'tp1', name: 'Optics laws & wave propagation', subject: 'Physics', completed: false },
      { id: 'tp2', name: 'DNA sequence and transcription loops', subject: 'Biology', completed: true }
    ];
  });

  // Health Stats
  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem('reme_water');
    return saved ? parseInt(saved) : 750;
  });
  const [sleepHours, setSleepHours] = useState(() => {
    const saved = localStorage.getItem('reme_sleep_hours');
    return saved ? parseFloat(saved) : 7.0;
  });
  const [meditationMinutes, setMeditationMinutes] = useState(() => {
    const saved = localStorage.getItem('reme_meditation');
    return saved ? parseInt(saved) : 0;
  });

  // Task Notifications/Alarm states
  const [activeAlarm, setActiveAlarm] = useState<Task | null>(null);

  // Sync basic profile values
  useEffect(() => {
    localStorage.setItem('reme_username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('reme_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('reme_rewards_points', String(rewardPoints));
  }, [rewardPoints]);

  useEffect(() => {
    localStorage.setItem('reme_tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('reme_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('reme_water', String(water));
  }, [water]);

  useEffect(() => {
    localStorage.setItem('reme_sleep_hours', String(sleepHours));
  }, [sleepHours]);

  useEffect(() => {
    localStorage.setItem('reme_meditation', String(meditationMinutes));
  }, [meditationMinutes]);

  // Evaluated consecutive daily login streaks
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('reme_last_login_date');
    const savedStreak = localStorage.getItem('reme_login_streak');

    if (lastLogin) {
      if (lastLogin !== todayStr) {
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(todayStr);
        const differenceInTime = todayDate.getTime() - lastDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);

        if (differenceInDays <= 1.2) {
          // Consecution confirmed!
          const nextStreak = savedStreak ? parseInt(savedStreak) + 1 : 2;
          setStreak(nextStreak);
          localStorage.setItem('reme_login_streak', String(nextStreak));
        } else {
          // Streak broken
          setStreak(1);
          localStorage.setItem('reme_login_streak', '1');
        }
        localStorage.setItem('reme_last_login_date', todayStr);
      } else {
        setStreak(savedStreak ? parseInt(savedStreak) : 1);
      }
    } else {
      localStorage.setItem('reme_last_login_date', todayStr);
      localStorage.setItem('reme_login_streak', '1');
      setStreak(1);
    }
  }, []);

  // background checker clock scanning for smart alerts matching deadlines
  useEffect(() => {
    const checkAlarmClock = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMin = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentHours}:${currentMin}`;

      tasks.forEach(t => {
        if (!t.completed && t.dueTime === timeStr && !t.notified) {
          // Trigger alarm details
          setActiveAlarm(t);
          
          if (voiceEnabled && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(`Reminder, ${userName}. Your task: ${t.title} is scheduled for now.`);
            window.speechSynthesis.speak(speech);
          }

          // Mark task as notified so it doesn't endlessly fire in the same minute
          setTasks(prev => prev.map(item => item.id === t.id ? { ...item, notified: true } : item));
        }
      });
    }, 15000); // Check clock state every 15 seconds safely

    return () => clearInterval(checkAlarmClock);
  }, [tasks, userName, voiceEnabled]);

  // Tab Details map
  const menuItems = [
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'study', label: 'Study Hub', icon: GraduationCap },
    { id: 'health', label: 'Wellness Room', icon: Heart },
    { id: 'female', label: 'Cycle Tracker', icon: CalendarRange },
    { id: 'kids', label: 'Kids Star', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-purple-500/20 antialiased overflow-x-hidden relative flex flex-col md:flex-row">
      
      {/* Absolute Decorative Premium Glow highlights */}
      <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full bg-purple-600/[0.04] blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.04] blur-[150px] pointer-events-none"></div>

      {/* DOCK BAR (Mobile Side Header) */}
      <header className="md:hidden bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Bell size={20} className="animate-pulse" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-1">
            REME <span className="text-purple-400 text-[10px] font-mono uppercase bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/10 tracking-widest font-semibold">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio State Icon Indicator */}
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 hover:text-purple-400 transition-colors"
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 hover:text-purple-400 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-zinc-950/95 backdrop-blur-3xl border-b border-zinc-900 px-6 py-8 fixed top-[73px] left-0 right-0 z-30"
          >
            <div className="flex flex-col gap-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all text-left ${
                      active 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/15 border border-purple-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* DESKTOP GLASS SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-zinc-950/45 backdrop-blur-3xl border-r border-zinc-900 p-6 min-h-screen sticky top-0 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Bell size={22} className="animate-pulse" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-1.5 leading-none">
              REME <span className="text-[10px] text-purple-400 font-mono uppercase bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/10 font-bold tracking-widest">AI</span>
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all leading-none ${
                    active 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/15 border border-purple-500/20'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900/40'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Profile capsule and telemetry highlight */}
        <div className="pt-6 border-t border-zinc-900 space-y-4">
          <div className="flex items-center gap-3 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-900 shadow-inner">
            <div className="w-10 h-10 rounded-full border border-purple-500/30 flex items-center justify-center bg-purple-500/10 font-bold text-sm text-purple-400 uppercase font-mono">
              {userName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold block text-white truncate">{userName}</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono mt-0.5 font-sans">🔥 {streak} Streak</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase text-zinc-600 tracking-wider font-extrabold flex items-center gap-1">
              <Award size={12} className="text-purple-400" /> {rewardPoints} Point Room
            </span>
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="text-zinc-500 hover:text-purple-400 transition-colors bg-transparent border-none cursor-pointer"
              title="Voice alert setting Toggle"
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* CORE VIEWPORT APP CANVAS AREA */}
      <main className="flex-1 px-4 py-8 md:p-12 max-w-5xl mx-auto w-full space-y-8 z-10">
        
        {/* TOP COMPREHENSIVE GLOBAL NOTIFICATION ALARM TOAST */}
        <AnimatePresence>
          {activeAlarm && (
            <motion.div
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.95 }}
              className="bg-zinc-950/80 backdrop-blur-2xl text-slate-100 p-5 rounded-3xl flex items-center justify-between shadow-2xl relative z-50 border border-purple-500/30"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-bounce">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display tracking-wide text-white">REMEDY SYSTEM ALARM ALERT</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Task: <span className="text-purple-300 font-semibold">"{activeAlarm.title}"</span> is due now!</p>
                </div>
              </div>
              <button
                onClick={() => setActiveAlarm(null)}
                className="bg-purple-950/60 text-purple-300 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-purple-900 transition-all cursor-pointer border border-purple-500/20"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content routing switches */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="min-h-[500px]"
          >
            {activeTab === 'tasks' && (
              <TaskSection 
                tasks={tasks} 
                setTasks={setTasks} 
                rewardPoints={rewardPoints} 
                setRewardPoints={setRewardPoints} 
                voiceEnabled={voiceEnabled} 
              />
            )}
            
            {activeTab === 'study' && (
              <StudySection 
                tasks={tasks} 
                topics={topics} 
                setTopics={setTopics} 
                rewardPoints={rewardPoints} 
                setRewardPoints={setRewardPoints} 
                voiceEnabled={voiceEnabled} 
              />
            )}

            {activeTab === 'health' && (
              <HealthSection 
                water={water} 
                setWater={setWater} 
                sleepHours={sleepHours} 
                setSleepHours={setSleepHours} 
                meditationMinutes={meditationMinutes} 
                setMeditationMinutes={setMeditationMinutes} 
                rewardPoints={rewardPoints} 
                setRewardPoints={setRewardPoints} 
                voiceEnabled={voiceEnabled} 
              />
            )}

            {activeTab === 'female' && (
              <FemaleSection />
            )}

            {activeTab === 'kids' && (
              <KidsSection 
                rewardPoints={rewardPoints} 
                setRewardPoints={setRewardPoints} 
                voiceEnabled={voiceEnabled} 
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsSection 
                tasks={tasks} 
                topics={topics} 
                rewardPoints={rewardPoints} 
                streak={streak} 
              />
            )}

            {activeTab === 'profile' && (
              <ProfileSection 
                userName={userName} 
                setUserName={setUserName} 
                voiceEnabled={voiceEnabled} 
                setVoiceEnabled={setVoiceEnabled} 
                sleepHours={sleepHours} 
                water={water} 
                tasksCompleted={tasks.filter(t => t.completed).length} 
                rewardPoints={rewardPoints} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
