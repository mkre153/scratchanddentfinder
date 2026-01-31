/**
 * ScratchAndDentFinder Buyer's Tool — Public API
 *
 * This is the main entry point for the Buyer's Tool compiler.
 * Import from this file to use the compiler in your application.
 *
 * @example
 * ```typescript
 * import { compile, type BuyerInput } from './engine/buyers-tool';
 *
 * const input: BuyerInput = {
 *   appliance: { ... },
 *   damage: { ... },
 *   // ...
 * };
 *
 * const output = compile(input, { timestamp: new Date().toISOString() });
 * console.log(output.verdict.recommendation);
 * ```
 */
export { compile } from './compiler';
export { summarizeTrace, summarizeTraceCompact, getFailedRuleSummaries, groupRulesByModule, } from './utils/summarize-trace';
export type { TraceSummaryOptions } from './utils/summarize-trace';
export { COMPILER_VERSION, SCHEMA_VERSION, RULESET_VERSION } from './schema';
export type { BuyerInput, CompilerOutput, CompilerOptions, CompilerTrace, } from './schema';
export type { ApplianceInfo, DamageInfo, RetailerInfo, WarrantyInfo, ReturnPolicyInfo, InstallationInfo, BuyerContext, InspectionResults, } from './schema';
export type { VerdictResult, FinancialResult, DamageAssessmentResult, WarrantyEvaluationResult, SafetyGateResult, NegotiationResult, LogisticsResult, ReturnPolicyAssessmentResult, } from './schema';
export type { RuleResult, ModuleOutput, } from './schema';
export type { ApplianceType, DamageLocation, DamageSeverity, DamageType, RetailerType, InstallationType, VisibleSide, BuyerPurpose, RiskTolerance, PriceFlexibility, RuleSeverity, Recommendation, Confidence, DiscountRating, DamageTier, TierLabel, VisibilityImpact, WarrantyScore, RiskLevel, NegotiationProbability, DeliveryRecommendation, ReturnPolicyRating, ModuleName, } from './schema';
export { isBlocker, isWarning, isInfo } from './schema';
export { ALL_RULE_IDS, BLOCKER_RULES, WARNING_RULES, RULE_METADATA, THRESHOLDS, EXPECTED_DISCOUNT_BY_TIER, EXECUTION_ORDER, } from './rules';
export { DAMAGE_TIER_ASSIGNMENT_V1, DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1, PRICING_DISCOUNT_CALCULATE_V1, PRICING_DISCOUNT_RATING_V1, PRICING_DISCOUNT_EXPECTED_RANGE_V1, SAFETY_BLOCKER_RUST_DETECTED_V1, SAFETY_BLOCKER_WATER_DAMAGE_V1, SAFETY_BLOCKER_CORD_DAMAGED_V1, SAFETY_BLOCKER_ODOR_DETECTED_V1, SAFETY_BLOCKER_MISSING_PARTS_V1, SAFETY_WARNING_PRIOR_REPAIRS_V1, SAFETY_WARNING_UNUSUAL_SOUNDS_V1, SAFETY_INFO_POWER_ON_WORKS_V1, WARRANTY_SCORE_EXCELLENT_V1, WARRANTY_SCORE_ACCEPTABLE_V1, WARRANTY_SCORE_LIMITED_V1, WARRANTY_SCORE_UNACCEPTABLE_V1, WARRANTY_WARNING_LIMITED_COVERAGE_V1, WARRANTY_WARNING_NO_LABOR_INCLUDED_V1, WARRANTY_WARNING_UNKNOWN_MFG_V1, RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1, RETURN_WARNING_FINAL_SALE_V1, RETURN_WARNING_SHORT_WINDOW_V1, RETURN_INFO_RESTOCKING_FEE_V1, RETURN_RATING_V1, NEGOTIATION_POSSIBLE_RETAILER_TYPE_V1, NEGOTIATION_LEVERAGE_INVENTORY_AGE_V1, NEGOTIATION_LEVERAGE_VISIBLE_DAMAGE_V1, NEGOTIATION_TARGET_CALCULATE_V1, NEGOTIATION_ALTERNATIVES_V1, LOGISTICS_DELIVERY_REFRIGERATOR_V1, LOGISTICS_DELIVERY_STACKED_V1, LOGISTICS_DELIVERY_GAS_V1, LOGISTICS_DELIVERY_DEFAULT_V1, LOGISTICS_TRANSPORT_REFRIGERATOR_V1, LOGISTICS_TRANSPORT_WASHER_V1, LOGISTICS_TRANSPORT_RANGE_V1, LOGISTICS_INSTALLATION_NOTES_V1, VERDICT_THRESHOLD_BLOCKER_COUNT_V1, VERDICT_THRESHOLD_WARNING_SKIP_V1, VERDICT_THRESHOLD_WARNING_CAUTION_V1, VERDICT_RISK_TOLERANCE_ADJUSTMENT_V1, VERDICT_DECIDE_WALK_AWAY_V1, VERDICT_DECIDE_SKIP_V1, VERDICT_DECIDE_CAUTION_V1, VERDICT_DECIDE_PROCEED_V1, } from './rules';
//# sourceMappingURL=index.d.ts.map