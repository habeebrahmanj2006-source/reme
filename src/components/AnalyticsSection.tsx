import React from 'react';
import { Task, Topic } from '../types';
import GlassCard from './GlassCard';
import { BarChart3, TrendingUp, Calendar, Zap, CheckSquare, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsSectionProps {
  tasks: Task[];
  topics: Topic[];
  rewardPoints: number;
  streak: number;
}

export default function AnalyticsSection({ tasks, topics, rewardPoints, streak }: AnalyticsSectionProps) {
  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.completed).length;

  // Productivity Score logic (weighted calculation out of 100)
  const calculateProductivityScore = () => {
    if (totalTasks === 0 && totalTopics === 0) return 0;
    
    const taskRatio = totalTasks > 0 ? (completedTasks / totalTasks) * 70 : 0; // Tasks are 70% weight
    const topicRatio = totalTopics > 0 ? (completedTopics / totalTopics) * 30 : 0; // Topics are 30% weight
    
    return Math.round(taskRatio + topicRatio);
  };

  const productivityScore = calculateProductivityScore();

  // Custom data segments representing weekly completions
  // In a real app these compile dynamically, we render them as custom SVG bar visual heights.
  const weeklyCompletions = [
    { day: 'Mon', count: Math.min(5, Math.ceil(completedTasks * 0.4)) },
    { day: 'Tue', count: Math.min(7, Math.ceil(completedTasks * 0.6)) },
    { day: 'Wed', count: Math.min(4, Math.ceil(completedTasks * 0.3)) },
    { day: 'Thu', count: Math.min(9, Math.ceil(completedTasks * 0.8)) },
    { day: 'Fri', count: completedTasks },
    { day: 'Sat', count: Math.min(6, Math.ceil(completedTasks * 0.5)) },
    { day: 'Sun', count: Math.min(3, Math.ceil(completedTasks * 0.2)) }
  ];

  const maxVal = Math.max(...weeklyCompletions.map(w => w.count), 1);

  return (
    <div className="space-y-8">
      
      {/* Analytics stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Productivity Score */}
        <GlassCard className="border-emerald-500/20 bg-zinc-950/60 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Productivity Rating</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">{productivityScore}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${productivityScore}%` }}
                className="bg-emerald-500 h-full rounded-full"
              />
            </div>
          </div>
        </GlassCard>

        {/* Total completed Tasks */}
        <GlassCard className="border-zinc-800 bg-zinc-950/30 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Items Completed</span>
              <span className="text-3xl font-black text-white font-mono">{completedTasks}</span>
              <span className="text-xs text-zinc-500 block mt-1">{pendingTasks} pending schedules</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800">
              <CheckSquare size={20} />
            </div>
          </div>
        </GlassCard>

        {/* Reward milestones points */}
        <GlassCard className="border-zinc-800 bg-zinc-950/30 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Rank Points</span>
              <span className="text-3xl font-black text-white font-mono">{rewardPoints}</span>
              <span className="text-xs text-zinc-500 block mt-1">Level Progress: {rewardPoints % 500}/500</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800">
              <Award size={20} />
            </div>
          </div>
        </GlassCard>

        {/* Daily activities consecutive Streak */}
        <GlassCard className="border-zinc-800 bg-zinc-950/30 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Daily Streak</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">🔥 {streak}</span>
              <span className="text-xs text-zinc-500 block mt-1">Consecutive login days</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
              <Zap size={20} />
            </div>
          </div>
        </GlassCard>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SVG Weekly Completion Performance - 7 Columns */}
        <div className="lg:col-span-7">
          <GlassCard className="border-emerald-500/20 bg-zinc-950/60 p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <BarChart3 className="text-emerald-400 h-5 w-5" />
                Completions Analytics
              </h3>
              <p className="text-xs text-zinc-500 mb-6">Task volume metrics represented throughout the weekly calendar.</p>
            </div>

            {/* Custom SVG Column representation */}
            <div className="w-full h-44 flex items-end justify-between px-2 gap-2 mt-4">
              {weeklyCompletions.map((w) => {
                const ratio = (w.count / maxVal) * 100;
                return (
                  <div key={w.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] text-zinc-500 font-bold font-mono">{w.count}</span>
                    <div className="w-full bg-zinc-900/85 rounded-t-xl overflow-hidden hover:bg-zinc-850 transition-all border border-zinc-805 h-full relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${ratio}%` }}
                        className="bg-gradient-to-t from-emerald-600 to-emerald-400 w-full absolute bottom-0 rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 font-semibold">{w.day}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Productivity context indicators - 5 Columns */}
        <div className="lg:col-span-5">
          <GlassCard className="border-zinc-800 bg-zinc-950/30 p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-md font-bold text-zinc-300 mb-4 flex items-center gap-1">
                <Zap size={18} /> Performance Context
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl border border-zinc-850">
                  <span className="text-xs text-zinc-400">Task Completion Rate</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {totalTasks > 0 ? `${Math.round((completedTasks/totalTasks)*100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl border border-zinc-850">
                  <span className="text-xs text-zinc-400">Syllabus Milestones Completed</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {totalTopics > 0 ? `${Math.round((completedTopics/totalTopics)*100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl border border-zinc-850">
                  <span className="text-xs text-zinc-400">Total Available Goals Logged</span>
                  <span className="text-sm font-bold text-emerald-400">{totalTasks + totalTopics} items</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-850/60 pb-1 text-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                <Calendar size={11} fill="currentColor" /> telemetry synched
              </span>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
