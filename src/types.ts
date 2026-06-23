export interface Task {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Study' | 'Health' | 'Work' | 'Personal';
  dueDate: string;
  dueTime: string;
  completed: boolean;
  notified?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  subject: string;
  completed: boolean;
}

export interface PeriodRecord {
  id: string;
  startDate: string;
  duration: number; // in days
  symptoms: string[];
  mood: string;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  completed: boolean;
}

export interface KidHabit {
  id: string;
  name: string;
  completedToday: boolean;
  streak: number;
}
