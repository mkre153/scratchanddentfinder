/**
 * Module 8: VerdictCompiler
 *
 * Execution Order: 8 (Depends on: ALL prior modules)
 * Input: All prior module outputs + aggregated RuleResults, buyer context
 * Output: verdict.*
 *
 * Aggregates all rule results and produces final recommendation.
 */
import type { BuyerContext, ModuleOutput, RuleResult, VerdictResult } from '../schema';
/**
 * VerdictCompiler.evaluate
 *
 * Pure function that aggregates all rules and produces final recommendation.
 */
export declare function evaluate(allRules: RuleResult[], buyer: BuyerContext): ModuleOutput<VerdictResult>;
export declare const VerdictCompiler: {
    evaluate: typeof evaluate;
};
//# sourceMappingURL=verdict-compiler.d.ts.map