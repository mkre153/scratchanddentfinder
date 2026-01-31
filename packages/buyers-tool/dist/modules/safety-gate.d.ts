/**
 * Module 3: SafetyGate
 *
 * Execution Order: 3 (No dependencies - reads input only)
 * Input: inspection.*
 * Output: safetyGate.*
 *
 * Evaluates safety-related inspection results.
 * BLOCKER rules from this module halt execution immediately.
 */
import type { BuyerInput, ModuleOutput, SafetyGateResult } from '../schema';
/**
 * SafetyGate.evaluate
 *
 * Pure function that evaluates inspection results for safety concerns.
 * Returns blockers that should halt evaluation and warnings for caution.
 */
export declare function evaluate(input: BuyerInput): ModuleOutput<SafetyGateResult>;
export declare const SafetyGate: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=safety-gate.d.ts.map