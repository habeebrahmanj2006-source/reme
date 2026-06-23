import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import GlassCard from './GlassCard';
import { Plus, Trash, Check, Clock, Search, Filter, Mic, MicOff, Star, AlertTriangle, MessageSquareCode, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskSectionProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  rewardPoints: number;
  setRewardPoints: React.Dispatch<React.SetStateAction<number>>;
  voiceEnabled: boolean;
}

export default function TaskSection({ tasks, setTasks, rewardPoints, setRewardPoints, voiceEnabled }: TaskSectionProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [category, setCategory] = useState<Task['category']>('Work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [filterPriority, setFilterPriority] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Study' | 'Health' | 'Work' | 'Personal'>('All');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceInput = () => {
    if (!speechSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTitle(transcript);
      if (voiceEnabled) {
        speakText(`Captured: ${transcript}`);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      // Edit existing
      setTasks(prev => prev.map(t => t.id === editingId ? {
        ...t,
        title: title.trim(),
        priority,
        category,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        dueTime: dueTime || '12:00'
      } : t));
      setEditingId(null);
      if (voiceEnabled) speakText(`Task updated, ${title}`);
    } else {
      // Add new
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        priority,
        category,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        dueTime: dueTime || '12:00',
        completed: false
      };
      setTasks(prev => [newTask, ...prev]);
      if (voiceEnabled) speakText(`New task added: ${title}`);
    }

    setTitle('');
    setDueDate('');
    setDueTime('');
  };

  const handleDelete = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete && voiceEnabled) {
      speakText(`Deleted: ${taskToDelete.title}`);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          setRewardPoints(points => points + 15); // Reward 15 points
          if (voiceEnabled) speakText(`Well done! Task completed: ${t.title}`);
        } else {
          setRewardPoints(points => Math.max(0, points - 15));
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    }));
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setPriority(task.priority);
    setCategory(task.category);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime);
  };

  const triggerVoiceReminder = (task: Task) => {
    speakText(`Reminder for task: ${task.title}. Priority ${task.priority}. Due on ${task.dueDate} at ${task.dueTime}`);
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' 
      ? true 
      : filterStatus === 'Completed' ? t.completed : !t.completed;
    const matchesPriority = filterPriority === 'All' ? true : t.priority === filterPriority;
    const matchesCategory = filterCategory === 'All' ? true : t.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Task Form */}
        <div className="md:col-span-1">
          <GlassCard className="border-purple-500/20 bg-zinc-950/60 sticky top-24">
            <h3 className="text-xl font-bold font-display text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400 animate-pulse" />
              {editingId ? 'Edit Task' : 'Smart Task Reminder'}
            </h3>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Task Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter what to do..."
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 pl-4 pr-12 focus:outline-none focus:border-purple-500/50 text-slate-100 transition-all text-sm"
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isListening ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'text-zinc-500 hover:text-purple-400 hover:bg-zinc-800'
                      }`}
                      title="Speak Task"
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                  )}
                </div>
                {isListening && (
                  <div className="flex items-center gap-1 mt-2 justify-center py-1 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-semibold animate-pulse">
                    <span>Listening now... Speak your task</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500/50 text-slate-100 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Task['category'])}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500/50 text-slate-100 text-sm"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Time</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setTitle('');
                      setDueDate('');
                      setDueTime('');
                    }}
                    className="flex-1 border border-zinc-805 hover:border-zinc-700 hover:bg-zinc-950 text-zinc-400 py-3 rounded-xl transition-all text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:brightness-110 shadow-purple-500/20 text-sm flex items-center justify-center gap-1 cursor-pointer border border-purple-400/25"
                >
                  <Plus size={16} />
                  {editingId ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Task List Container with Searching & Filtering */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="border-zinc-800/80 bg-zinc-950/40 p-5">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reminders..."
                  className="w-full bg-zinc-900/60 border border-zinc-805 rounded-2xl px-5 py-3 pl-12 text-slate-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/40 text-sm transition-all shadow-inner"
                />
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Filter size={10} /> Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full bg-zinc-900/60 border border-[#27272a] rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500/35"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <AlertTriangle size={10} /> Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="w-full bg-zinc-900/60 border border-[#27272a] rounded-xl px-2.5 py-2 text-xs text-slate-305 focus:outline-none focus:border-purple-500/35"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <MessageSquareCode size={10} /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="w-full bg-zinc-900/60 border border-[#27272a] rounded-xl px-2.5 py-2 text-xs text-slate-305 focus:outline-none focus:border-purple-500/35"
                  >
                    <option value="All">All Categories</option>
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* List display */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl"
                >
                  <Clock className="mx-auto text-zinc-700 mb-4" size={40} />
                  <p className="text-zinc-500 text-sm">No scheduled tasks match your parameters.</p>
                </motion.div>
              ) : (
                filteredTasks.map((t) => {
                  let badgeColor = 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
                  if (t.priority === 'High') badgeColor = 'bg-rose-500/10 text-rose-500/90 border-rose-500/20';
                  if (t.priority === 'Medium') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  if (t.priority === 'Low') badgeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 10, opacity: 0 }}
                      className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        t.completed
                          ? 'bg-zinc-900/10 border-zinc-900/30 opacity-55 shadow-none'
                          : 'bg-zinc-900/50 border-zinc-805 hover:border-purple-500/40 shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(t.id)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                            t.completed
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-zinc-750 hover:border-purple-500'
                          }`}
                        >
                          {t.completed && <Check size={14} className="stroke-[3]" />}
                        </button>

                        <div>
                          <p className={`font-semibold text-sm ${t.completed ? 'line-through text-zinc-500' : 'text-slate-100'}`}>
                            {t.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 px-0.5">
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full uppercase font-bold border border-zinc-700">
                              {t.category}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${badgeColor}`}>
                              {t.priority}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                              <Clock size={11} />
                              <span>{t.dueDate} @ {t.dueTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerVoiceReminder(t)}
                          className="p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
                          title="Speak Reminder"
                        >
                          <Volume2 size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800/80 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
