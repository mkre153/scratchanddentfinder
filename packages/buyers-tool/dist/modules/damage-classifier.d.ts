/**
 * Module 1: DamageClassifier
 *
 * Execution Order: 1 (No dependencies)
 * Input: damage.locations[], installation.*
 * Output: damageAssessment.*
 *
 * Classifies damage into tiers based on visibility in the buyer's
 * installation context.
 */
import type { BuyerInput, DamageAssessmentResult, ModuleOutput } from '../schema';
/**
 * DamageClassifier.evaluate
 *
 * Pure function that classifies damage based on location and installation context.
 */
export declare function evaluate(input: BuyerInput): ModuleOutput<DamageAssessmentResult>;
export declare const DamageClassifier: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=damage-classifier.d.ts.map