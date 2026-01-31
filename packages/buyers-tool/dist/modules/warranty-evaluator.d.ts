/**
 * Module 4: WarrantyEvaluator
 *
 * Execution Order: 4 (Depends on: PricingEngine)
 * Input: warranty.*, financial.savingsVsNew
 * Output: warrantyEvaluation.*
 *
 * Evaluates warranty coverage quality and identifies gaps.
 */
import type { BuyerInput, FinancialResult, ModuleOutput, WarrantyEvaluationResult } from '../schema';
/**
 * WarrantyEvaluator.evaluate
 *
 * Pure function that evaluates warranty coverage and identifies risks.
 */
export declare function evaluate(input: BuyerInput, financial: FinancialResult): ModuleOutput<WarrantyEvaluationResult>;
export declare const WarrantyEvaluator: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=warranty-evaluator.d.ts.map