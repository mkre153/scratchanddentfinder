/**
 * Module 6: NegotiationEngine
 *
 * Execution Order: 6 (Depends on: DamageClassifier, PricingEngine)
 * Input: retailer.*, damageAssessment.*, financial.*
 * Output: negotiation.*
 *
 * Determines negotiation potential and suggests strategies.
 */
import type { BuyerInput, DamageAssessmentResult, FinancialResult, ModuleOutput, NegotiationResult } from '../schema';
/**
 * NegotiationEngine.evaluate
 *
 * Pure function that calculates negotiation potential and strategies.
 */
export declare function evaluate(input: BuyerInput, damageAssessment: DamageAssessmentResult, financial: FinancialResult): ModuleOutput<NegotiationResult>;
export declare const NegotiationEngine: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=negotiation-engine.d.ts.map