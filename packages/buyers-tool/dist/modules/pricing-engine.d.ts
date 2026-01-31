/**
 * Module 2: PricingEngine
 *
 * Execution Order: 2 (Depends on: DamageClassifier)
 * Input: appliance.retailPrice, appliance.askingPrice, damageAssessment.tier
 * Output: financial.*
 *
 * Calculates discount percentages, ratings, and fair price estimates.
 */
import type { BuyerInput, DamageAssessmentResult, FinancialResult, ModuleOutput } from '../schema';
/**
 * PricingEngine.evaluate
 *
 * Pure function that calculates financial metrics based on pricing and damage tier.
 */
export declare function evaluate(input: BuyerInput, damageAssessment: DamageAssessmentResult): ModuleOutput<FinancialResult>;
export declare const PricingEngine: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=pricing-engine.d.ts.map