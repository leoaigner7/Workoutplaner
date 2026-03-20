export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'hamstrings'
  | 'calves'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full-body'
  | 'ankle';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'resistance-band'
  | 'pull-up-bar'
  | 'bench'
  | 'machine'
  | 'cable'
  | 'foam-roller'
  | 'balance-board';

export type ExerciseTag =
  | 'football'
  | 'injury-prevention'
  | 'eccentric'
  | 'plyometric'
  | 'proprioception'
  | 'strength'
  | 'mobility'
  | 'stability';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  difficulty: Difficulty;
  equipment: Equipment;
  description: string;
  instructions: string[];
  tips: string[];
  calsBurnedPerMin: number;
  emoji: string;
  tags: ExerciseTag[];
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  durationSeconds: number;
  restSeconds: number;
  sets: number;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt: Date;
}

export type AppView = 'library' | 'builder' | 'runner';
export type FilterCategory = 'all' | 'football' | 'injury-prevention' | 'strength';
