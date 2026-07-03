import { create } from "zustand";
import type { DemoStep } from "@/types";

interface DemoState {
  // Demo scenario state
  isRunning: boolean;
  currentStepIndex: number;
  completedSteps: number[];
  isPaused: boolean;

  // Actions
  startDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  stopDemo: () => void;
  nextStep: () => void;
  setStepIndex: (index: number) => void;
  completeStep: (index: number) => void;
  resetDemo: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isRunning: false,
  currentStepIndex: -1,
  completedSteps: [],
  isPaused: false,

  startDemo: () =>
    set({
      isRunning: true,
      currentStepIndex: 0,
      completedSteps: [],
      isPaused: false,
    }),

  pauseDemo: () => set({ isPaused: true }),
  resumeDemo: () => set({ isPaused: false }),

  stopDemo: () =>
    set({
      isRunning: false,
      currentStepIndex: -1,
      completedSteps: [],
      isPaused: false,
    }),

  nextStep: () =>
    set((state) => ({
      currentStepIndex: state.currentStepIndex + 1,
    })),

  setStepIndex: (index) => set({ currentStepIndex: index }),

  completeStep: (index) =>
    set((state) => ({
      completedSteps: [...state.completedSteps, index],
    })),

  resetDemo: () =>
    set({
      isRunning: false,
      currentStepIndex: -1,
      completedSteps: [],
      isPaused: false,
    }),
}));
