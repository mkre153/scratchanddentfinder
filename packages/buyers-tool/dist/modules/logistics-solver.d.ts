/**
 * Module 7: LogisticsSolver
 *
 * Execution Order: 7 (No dependencies - reads input only)
 * Input: appliance.type, installation.*
 * Output: logistics.*
 *
 * Provides delivery and transport recommendations based on appliance type.
 */
import type { BuyerInput, LogisticsResult, ModuleOutput } from '../schema';
/**
 * LogisticsSolver.evaluate
 *
 * Pure function that provides delivery and transport guidance.
 */
export declare function evaluate(input: BuyerInput): ModuleOutput<LogisticsResult>;
export declare const LogisticsSolver: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=logistics-solver.d.ts.map