/**
 * Module 5: ReturnPolicyFilter
 *
 * Execution Order: 5 (No dependencies - reads input only)
 * Input: returnPolicy.*, warranty.*
 * Output: returnPolicyAssessment.*
 *
 * Evaluates return policy terms and identifies risks.
 */
import type { BuyerInput, ModuleOutput, ReturnPolicyAssessmentResult } from '../schema';
/**
 * ReturnPolicyFilter.evaluate
 *
 * Pure function that evaluates return policy terms.
 */
export declare function evaluate(input: BuyerInput): ModuleOutput<ReturnPolicyAssessmentResult>;
export declare const ReturnPolicyFilter: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=return-policy-filter.d.ts.map