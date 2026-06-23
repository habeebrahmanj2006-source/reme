import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Calendar, Heart, AlertCircle, Plus, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PeriodRecord {
  id: string;
  startDate: string;
  duration: number;
  mood: string;
  symptoms: string[];
}

export default function FemaleSection() {
  const [records, setRecords] = useState<PeriodRecord[]>(() => {
    const saved = localStorage.getItem('reme_period_records');
    if (saved) return JSON.parse(saved);
    // Initial seeds
    return [
      { id: '1', startDate: '2026-05-10', duration: 5, mood: 'Calm', symptoms: ['Mild Cramps'] },
      { id: '2', startDate: '2026-04-12', duration: 5, mood: 'Energetic', symptoms: ['None'] }
    ];
  });

  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(5);
  const [mood, setMood] = useState('Calm');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [cycleLength, setCycleLength] = useState(28);

  // Symptoms choices
  const symptomChoices = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Tender Breasts', 'Acne'];

  useEffect(() => {
    localStorage.setItem('reme_period_records', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    const newRecord: PeriodRecord = {
      id: crypto.randomUUID(),
      startDate,
      duration,
      mood,
      symptoms
    };

    setRecords(prev => [newRecord, ...prev]);
    setStartDate('');
    setSymptoms([]);
  };

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]);
  };

  // Predict Next Cycle Dates
  const getNextPeriodPrediction = () => {
    if (records.length === 0) return 'No logged data';
    // Sort records to find latest
    const sorted = [...records].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const latest = sorted[0];
    const latestDate = new Date(latest.startDate);
    
    // Add cycle length
    latestDate.setDate(latestDate.getDate() + cycleLength);
    return latestDate.toISOString().split('T')[0];
  };

  const predictedDateStr = getNextPeriodPrediction();

  // Fertile Window prediction (typical cycle window is Day 11 to Day 16 of the count)
  const getFertilePeriodPrediction = () => {
    if (records.length === 0) return { start: 'N/A', end: 'N/A' };
    const sorted = [...records].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const latest = sorted[0];
    const baseDate = new Date(latest.startDate);
    
    const startFertile = new Date(baseDate);
    const endFertile = new Date(baseDate);

    startFertile.setDate(baseDate.getDate() + (cycleLength - 14 - 3)); // 11 days typical
    endFertile.setDate(baseDate.getDate() + (cycleLength - 14 + 2)); // 16 days typical

    return {
      start: startFertile.toISOString().split('T')[0],
      end: endFertile.toISOString().split('T')[0]
    };
  };

  const fertileWindow = getFertilePeriodPrediction();

  // SVG parameters for standard 28-day circle graph
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main calculation log form - 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="border-purple-500/10 bg-zinc-950/60 p-6">
            <h3 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Menstrual Cycle Log
            </h3>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">Cycle Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-purple-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">Period Length (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">Cycle Interval (Days)</label>
                  <input
                    type="number"
                    min="20"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">Daily Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500/40"
                  >
                    <option value="Calm">Calm & Centered</option>
                    <option value="Energetic">Energetic & Productive</option>
                    <option value="Irritable">Irritable / Cramps</option>
                    <option value="Sensitive">Tired / Sensitive</option>
                  </select>
                </div>
              </div>

              {/* Symptoms Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-sans">Select Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {symptomChoices.map(s => {
                    const active = symptoms.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          active 
                            ? 'bg-purple-600 text-white border-purple-500 font-semibold' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25 border border-purple-500/10 flex items-center justify-center gap-1.5 hover:brightness-110 cursor-pointer"
                >
                  <Plus size={16} />
                  Log Period Starter
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Prediction visualization panel - 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="border-purple-500/10 bg-zinc-950/40 p-6 flex flex-col justify-between min-h-[396px] text-center">
            
            <div>
              <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="text-purple-400 w-5 h-5 animate-pulse" />
                Cycle Predictions
              </h3>
              <p className="text-xs text-zinc-500 mb-6 font-sans">Precise calculations based on standard follicle cycles.</p>

              {/* Predictor Dashboard stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-855">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">Expected Period</span>
                  <span className="text-sm font-bold text-rose-400">{predictedDateStr}</span>
                </div>
                <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-855">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">Fertile Window</span>
                  <span className="text-xs font-semibold text-purple-400">{fertileWindow.start} to {fertileWindow.end}</span>
                </div>
              </div>

              {/* Dynamic SVG Cycle Circular visual representation */}
              <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Outer circle representing empty cycle */}
                  <circle
                    className="text-zinc-805"
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius + 10}
                    cy={radius + 10}
                  />
                  {/* Highlight segment representing fertile phase (Day 11-16 / 28 = 21% duration ratio) */}
                  <circle
                    className="text-purple-500/80"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (0.21 * circumference)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius + 10}
                    cy={radius + 10}
                    style={{ transform: `rotate(140deg)`, transformOrigin: '50% 50%' }}
                  />
                  {/* Segment representing active flow duration (First 5 days / 28 = 18% ratio) */}
                  <circle
                    className="text-rose-500"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (0.18 * circumference)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius + 10}
                    cy={radius + 10}
                  />
                </svg>
                {/* Center caption info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Heart className="h-6 w-6 text-rose-500 animate-pulse mb-1" />
                  <span className="text-xs font-bold text-rose-450 leading-none">Day 1</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Cycle clock</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center py-2 bg-purple-500/5 rounded-xl border border-purple-500/10 text-purple-400 text-xs font-semibold">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span className="font-sans">Predictions are clinical estimations. Consult physicians.</span>
            </div>

          </GlassCard>
        </div>

      </div>

      {/* History table log list */}
      <GlassCard className="border-zinc-800 bg-zinc-950/40 p-6">
        <h3 className="text-md font-bold text-zinc-300 mb-4 flex items-center gap-1">
          <Calendar size={18} /> Cycle History Records log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-black text-[10px]">
                <th className="pb-3">Start Date</th>
                <th className="pb-3">Flow Length</th>
                <th className="pb-3">Cycle Duration</th>
                <th className="pb-3">Logged Mood</th>
                <th className="pb-3">Associated Symptoms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/20">
                  <td className="py-3 font-mono font-bold text-rose-400">{r.startDate}</td>
                  <td className="py-3">{r.duration} Active days</td>
                  <td className="py-3">{cycleLength} day tracking</td>
                  <td className="py-3">
                    <span className="bg-zinc-900 text-zinc-400 px-2 py-1 rounded-lg border border-zinc-800 text-xs font-semibold">
                      {r.mood}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-zinc-400">
                    {r.symptoms.length > 0 ? r.symptoms.join(', ') : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
