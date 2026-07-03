import { create } from "zustand";
import type { DemoStep } from "@/types";

interface SimulatorState {
  // Power state
  serviceLevel: number; // 0-100
  status: "active" | "grace" | "suspended" | "restored";

  // Appliances
  appliances: ApplianceState[];

  // Actions
  setServiceLevel: (level: number) => void;
  setStatus: (status: SimulatorState["status"]) => void;
  setApplianceState: (id: string, enabled: boolean) => void;
  resetSimulator: () => void;
  applyGraceMode: (allowedFeatures: string[]) => void;
  applyFullPower: () => void;
  applySuspension: () => void;
}

export interface ApplianceState {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  essential: boolean; // Essential appliances stay on during grace mode
  powerDraw: number; // Watts
}

const DEFAULT_APPLIANCES: ApplianceState[] = [
  { id: "lights", name: "Lights", icon: "Lightbulb", enabled: true, essential: true, powerDraw: 60 },
  { id: "phone_charger", name: "Phone Charger", icon: "DeviceMobile", enabled: true, essential: true, powerDraw: 20 },
  { id: "fan", name: "Ceiling Fan", icon: "Fan", enabled: true, essential: true, powerDraw: 75 },
  { id: "tv", name: "Television", icon: "Television", enabled: true, essential: false, powerDraw: 150 },
  { id: "refrigerator", name: "Refrigerator", icon: "Thermometer", enabled: true, essential: false, powerDraw: 200 },
  { id: "ac", name: "Air Conditioner", icon: "Snowflake", enabled: true, essential: false, powerDraw: 1500 },
  { id: "water_heater", name: "Water Heater", icon: "Drop", enabled: true, essential: false, powerDraw: 2000 },
  { id: "microwave", name: "Microwave", icon: "CookingPot", enabled: true, essential: false, powerDraw: 1000 },
];

export const useSimulatorStore = create<SimulatorState>((set) => ({
  serviceLevel: 100,
  status: "active",
  appliances: DEFAULT_APPLIANCES.map((a) => ({ ...a })),

  setServiceLevel: (level) => set({ serviceLevel: level }),
  setStatus: (status) => set({ status }),
  setApplianceState: (id, enabled) =>
    set((state) => ({
      appliances: state.appliances.map((a) =>
        a.id === id ? { ...a, enabled } : a
      ),
    })),

  resetSimulator: () =>
    set({
      serviceLevel: 100,
      status: "active",
      appliances: DEFAULT_APPLIANCES.map((a) => ({ ...a, enabled: true })),
    }),

  applyGraceMode: (allowedFeatures) =>
    set((state) => ({
      serviceLevel: 50,
      status: "grace",
      appliances: state.appliances.map((a) => ({
        ...a,
        enabled: a.essential || allowedFeatures.includes(a.name),
      })),
    })),

  applyFullPower: () =>
    set({
      serviceLevel: 100,
      status: "active",
      appliances: DEFAULT_APPLIANCES.map((a) => ({ ...a, enabled: true })),
    }),

  applySuspension: () =>
    set({
      serviceLevel: 0,
      status: "suspended",
      appliances: DEFAULT_APPLIANCES.map((a) => ({ ...a, enabled: false })),
    }),
}));
