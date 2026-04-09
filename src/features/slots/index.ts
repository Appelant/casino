/**
 * Barrel export — Feature Machine à Sous (Slots)
 */

// Components
export { SlotsTable } from './components/SlotsTable';
export { ReelDisplay } from './components/ReelDisplay';
export { BetPanel } from './components/BetPanel';
export { ResultBanner } from './components/ResultBanner';

// Hooks
export { useSlotsEngine } from './hooks/useSlotsEngine';
export type { SlotsStatus } from './hooks/useSlotsEngine';

// Utils
export * from './utils/slotsConstants';
export {
  spinAndResolve,
  resolveSlotsSpin,
  generateSpinResult,
  spinReel,
  isValidBet,
} from './utils/slotsResolver';
