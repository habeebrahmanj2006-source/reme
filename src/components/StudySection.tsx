import React, { useState, useEffect, useRef } from 'react';
import { Topic, Task } from '../types';
import GlassCard from './GlassCard';
import { Play, Pause, RotateCcw, Plus, Trash, Check, ClipboardList, BookOpen, Brain, Sparkles, Copy, Loader, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudySectionProps {
  tasks: Task[];
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  rewardPoints: number;
  setRewardPoints: React.Dispatch<React.SetStateAction<number>>;
  voiceEnabled: boolean;
}

export default function StudySection({ tasks, topics, setTopics, rewardPoints, setRewardPoints, voiceEnabled }: StudySectionProps) {
  // Pomodoro States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'short' | 'long'>('study');
  
  // Topic Planner States
  const [topicName, setTopicName] = useState('');
  const [subjectName, setSubjectName] = useState('');

  // AI Notes Summarizer States
  const [notesInput, setNotesInput] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  // Audio elements or standard synthesis warning for alerts
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete!
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, minutes]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if ('speechSynthesis' in window && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(
        timerMode === 'study' 
          ? "Great job! Time for a well-deserved break." 
          : "Break is over. Let's focus on your study target now."
      );
      window.speechSynthesis.speak(utterance);
    } else {
      alert(timerMode === 'study' ? "🍎 Study Session Completed! Take a break." : "☘️ Break ended! Ready to focus?");
    }

    // Award rewards points for completed study interval!
    if (timerMode === 'study') {
      setRewardPoints(p => p + 50); // huge points!
    }

    // Reset default
    resetTimer(timerMode);
  };

  const handleModeChange = (mode: 'study' | 'short' | 'long') => {
    setTimerMode(mode);
    setIsActive(false);
    resetTimer(mode);
  };

  const resetTimer = (mode: 'study' | 'short' | 'long') => {
    if (mode === 'study') {
      setMinutes(25);
    } else if (mode === 'short') {
      setMinutes(5);
    } else {
      setMinutes(15);
    }
    setSeconds(0);
  };

  // Add a Topic checklist item
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !subjectName.trim()) return;

    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name: topicName.trim(),
      subject: subjectName.trim(),
      completed: false
    };

    setTopics(prev => [...prev, newTopic]);
    setTopicName('');
    setSubjectName('');
  };

  const handleToggleTopic = (id: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        const payload = !t.completed;
        if (payload) {
          setRewardPoints(p => p + 25); // Topics award 25 points
        } else {
          setRewardPoints(p => Math.max(0, p - 25));
        }
        return { ...t, completed: payload };
      }
      return t;
    }));
  };

  const handleDeleteTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  // call server-side endpoint for summarizing
  const handleSummarize = async () => {
    if (!notesInput.trim()) return;
    setLoadingSummary(true);
    setAiSummary('');

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: notesInput, format: "bullet points with conceptual headers" })
      });

      if (!response.ok) {
        throw new Error("AI summarizing failed.");
      }

      const data = await response.json();
      setAiSummary(data.summary);
      setRewardPoints(p => p + 15); // reward points for using AI!
    } catch (err: any) {
      console.error(err);
      setAiSummary("Error generating AI Summary. Check connection and ensure your Gemini API Key is configured in the AI Studio Settings secrets tab.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Study Progress
  const completedTopicsCount = topics.filter(t => t.completed).length;
  const progressRatio = topics.length > 0 ? (completedTopicsCount / topics.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pomodoro Timer - 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="border-purple-500/20 bg-zinc-950/60 p-8 text-center flex flex-col justify-between min-h-[460px]">
            <div>
              <h3 className="text-xl font-bold font-display text-white mb-6 flex items-center justify-center gap-2">
                <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                Focus Pomodoro
              </h3>

              {/* Preset Selector */}
              <div className="flex justify-center bg-zinc-900/60 border border-[#27272a] p-1 rounded-2xl mb-8 max-w-sm mx-auto">
                <button
                  onClick={() => handleModeChange('study')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    timerMode === 'study' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Focus Time
                </button>
                <button
                  onClick={() => handleModeChange('short')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    timerMode === 'short' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Short Break
                </button>
                <button
                  onClick={() => handleModeChange('long')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    timerMode === 'long' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Long Break
                </button>
              </div>

              {/* Timer Circle */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center rounded-full border-4 border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950 shadow-2xl mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/10 animate-pulse"></div>
                <div>
                  <h2 className="text-5xl font-mono font-bold text-white tracking-widest">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </h2>
                  <p className="text-[10px] text-zinc-500 tracking-widest uppercase font-bold mt-1.5 font-sans">
                    {timerMode === 'study' ? 'Deep Study' : 'Relaxing'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => resetTimer(timerMode)}
                className="p-3 border border-zinc-805 hover:border-zinc-700 hover:bg-zinc-900/60 rounded-2xl text-zinc-400 hover:text-purple-400 transition-all disabled:opacity-50 cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`py-4 px-10 rounded-2xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg cursor-pointer ${
                  isActive 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/10' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-purple-500/15 border border-purple-400/20'
                }`}
              >
                {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                {isActive ? 'Pause' : 'Focus'}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Topic Planner & Checklists - 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="border-purple-500/10 bg-zinc-950/40 p-6">
            <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
              <BookOpen className="text-purple-400 w-5 h-5 animate-pulse" />
              Syllabus Study Planner
            </h3>

            {/* Study Progress Indicator */}
            <div className="bg-zinc-900/40 border border-[#27272a] p-4 rounded-2xl mb-6 flex items-center justify-between shadow-inner">
              <div className="flex-1 mr-4">
                <span className="text-xs text-zinc-400 font-bold mb-1.5 block uppercase tracking-widest">General Study Completion</span>
                <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressRatio}%` }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-bold text-purple-400 font-mono leading-none block">{Math.round(progressRatio)}%</span>
                <span className="text-[10px] text-zinc-500 block uppercase font-bold mt-1 font-sans">{completedTopicsCount}/{topics.length} Done</span>
              </div>
            </div>

            {/* Add Topic Code snippet */}
            <form onSubmit={handleAddTopic} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
              <input
                type="text"
                placeholder="Subject (e.g. Physics)"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="sm:col-span-4 bg-zinc-90 w-full border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-105 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
              />
              <input
                type="text"
                placeholder="Topic desc..."
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="sm:col-span-6 bg-zinc-90 w-full border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-105 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
              />
              <button
                type="submit"
                className="sm:col-span-2 bg-zinc-900 hover:bg-zinc-850 hover:text-purple-400 text-zinc-400 py-2.5 rounded-xl transition-all border border-zinc-800 flex items-center justify-center cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </form>

            {/* List scroll */}
            <div className="max-h-[190px] overflow-y-auto space-y-2 pr-1">
              <AnimatePresence initial={false}>
                {topics.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-xs font-semibold">
                    No syllabus topics defined yet. Create some targets.
                  </div>
                ) : (
                  topics.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-[#27272a] shadow-sm hover:border-purple-550/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTopic(t.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                            t.completed ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-750 hover:border-purple-500'
                          }`}
                        >
                          {t.completed && <Check size={12} className="stroke-[3]" />}
                        </button>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-purple-400 block opacity-85 leading-none mb-1 shadow-sm font-mono">
                            {t.subject}
                          </span>
                          <span className={`text-sm ${t.completed ? 'line-through text-zinc-500' : 'text-slate-200'}`}>
                            {t.name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTopic(t.id)}
                        className="p-1 text-zinc-600 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash size={15} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* AI NOTES SUMMARIZER MODULE */}
      <GlassCard className="border-purple-500/20 bg-zinc-950/60 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Sparkles className="text-purple-400 h-5 w-5 animate-pulse" />
              AI Notes Summarizer
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-medium font-sans">
              Input lecture notes, code snippets, or textbook excerpts to generate immediate high-yield summaries via Gemini.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => setNotesInput('')}
              className="px-4 py-2 text-xs font-bold border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Clear Raw Input
            </button>
            <button
              onClick={handleSummarize}
              disabled={loadingSummary || !notesInput.trim()}
              className="flex-1 md:flex-none px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:brightness-110 shadow-purple-500/20 disabled:opacity-50 cursor-pointer border border-purple-500/20"
            >
              {loadingSummary ? <Loader className="animate-spin" size={14} /> : <Sparkles size={14} />}
              {loadingSummary ? 'Parsing...' : 'Summarize Notes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes Input Area */}
          <div>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Paste your general textbook segments, lecture transcripts, or draft outline here..."
              className="w-full h-80 bg-zinc-900/40 border border-zinc-805 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 resize-none font-sans"
            />
          </div>

          {/* AI Output Result Box */}
          <div className="flex flex-col h-80 bg-zinc-950/40 border border-zinc-805 rounded-2xl overflow-hidden relative">
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-805 flex-shrink-0">
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-1.5 font-sans">
                <Brain size={12} className="text-purple-400" />
                Gemini Summary Output
              </span>
              {aiSummary && (
                <button
                  onClick={copyToClipboard}
                  className="p-1 px-2.5 text-[10px] bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  {copied ? <CheckCircle2 size={12} className="text-purple-400" /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div className="flex-1 p-5 overflow-y-auto text-sm text-zinc-300 leading-relaxed font-sans prose prose-invert max-w-none">
              {loadingSummary ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
                  <Loader className="animate-spin text-purple-400" size={32} />
                  <span className="text-xs font-semibold animate-pulse">Consulting Gemini to format high-yield notes summaries...</span>
                </div>
              ) : aiSummary ? (
                <div className="whitespace-pre-wrap select-text">{aiSummary}</div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8 text-zinc-600 text-xs font-semibold">
                  Click 'Summarize Notes' to review insights formatted beautifully.
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
