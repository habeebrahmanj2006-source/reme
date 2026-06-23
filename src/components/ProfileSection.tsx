import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { User, Volume2, ShieldAlert, Sparkles, Loader, Terminal, HelpCircle, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileSectionProps {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  voiceEnabled: boolean;
  setVoiceEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  sleepHours: number;
  water: number;
  tasksCompleted: number;
  rewardPoints: number;
}

export default function ProfileSection({
  userName,
  setUserName,
  voiceEnabled,
  setVoiceEnabled,
  sleepHours,
  water,
  tasksCompleted,
  rewardPoints
}: ProfileSectionProps) {
  const [adviceText, setAdviceText] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const fetchAIAdvice = async () => {
    setLoadingAdvice(true);
    setAdviceText('');

    try {
      const stats = {
        name: userName,
        sleepLastNight: sleepHours,
        waterLog: water,
        tasksCompleted,
        totalRewards: rewardPoints
      };

      const res = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats })
      });

      if (!res.ok) throw new Error("Advice failed.");
      const data = await res.json();
      setAdviceText(data.advice);
    } catch (err: any) {
      console.error(err);
      setAdviceText("Unable to consult Gemini. Check connection or verify your GEMINI_API_KEY secret state inside settings.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const saveProfileData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setUserName(nameInput.trim());
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Profile updated. Hello, ${nameInput.trim()}`);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClearAll = () => {
    const doubleCheck = confirm("Are you sure you want to flush all REME Local Storage parameters? This cannot be undone.");
    if (doubleCheck) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Settings Form - 6 Columns */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="border-emerald-500/20 bg-zinc-950/65 p-6">
            <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Productivity Profile Settings
            </h3>

            <form onSubmit={saveProfileData} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter name..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Save size={14} /> Update
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="mt-6 pt-4 border-t border-zinc-850 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-850">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Synthesize System Voice Notifications</span>
                    <span className="text-[10px] text-zinc-500 leading-none">Verbally alerts you on task additions or timers completing.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      voiceEnabled 
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {voiceEnabled ? 'ACTIVE Voice' : 'Silent Mode'}
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>

          {/* Dangerous flush values card */}
          <GlassCard className="border-rose-900/20 bg-zinc-950/40 p-6 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 leading-none">
                <ShieldAlert size={16} /> Danger Zone
              </h4>
              <p className="text-[10px] text-zinc-500 mt-2 max-w-sm">
                Resetting deletes task checklists, health hydration states, periods logged, and daily reward streaks immediately.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="bg-rose-950/20 text-rose-400 border border-rose-900/40 px-4 py-2.5 rounded-xl font-black text-xs hover:bg-rose-500 hover:text-zinc-950 hover:border-trans transition-all shrink-0 font-sans"
            >
              Reset App Data
            </button>
          </GlassCard>
        </div>

        {/* AI Health Coach panel - 6 Columns */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="border-emerald-500/20 bg-zinc-950/60 p-6 flex flex-col justify-between min-h-[380px]">
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-emerald-400 h-5 w-5 animate-pulse" />
                  AI Productivity Consult
                </h3>
                <button
                  onClick={fetchAIAdvice}
                  disabled={loadingAdvice}
                  className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
                >
                  {loadingAdvice ? <Loader className="animate-spin" size={12} /> : <Sparkles size={11} />}
                  {loadingAdvice ? 'Generating...' : 'Get AI Tip'}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mb-6">
                Analyzing your logged stats (Hydration, sleep hours, completion indexes) to engineer customized habits advice.
              </p>

              {/* Advice Box */}
              <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl min-h-[160px] flex items-center justify-center text-sm leading-relaxed text-zinc-300">
                {loadingAdvice ? (
                  <div className="flex flex-col items-center gap-2 text-center text-zinc-500 text-xs">
                    <Loader className="animate-spin text-emerald-400" size={24} />
                    <span className="font-semibold animate-pulse">Consulting Gemini on personalized health and focus logs...</span>
                  </div>
                ) : adviceText ? (
                  <div className="font-sans italic select-text">“ {adviceText} ”</div>
                ) : (
                  <span className="text-xs font-semibold text-zinc-600 text-center">
                    No diagnostics requested. Click 'Get AI Tip' to pull down dynamic guidance tailored to your day's specs.
                  </span>
                )}
              </div>
            </div>

            {/* Micro warning indicator */}
            <div className="flex items-center gap-2 py-2 px-3 bg-zinc-900/40 rounded-xl border border-zinc-850 text-[10px] text-zinc-500 font-mono mt-4">
              <Terminal size={12} className="text-emerald-400" />
              <span>Diagnostic framework, engine: gemini-3.5-flash</span>
            </div>

          </GlassCard>
        </div>

      </div>
    </div>
  );
}
