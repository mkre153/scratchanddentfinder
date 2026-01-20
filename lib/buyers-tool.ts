/**
 * Buyer's Tool Integration
 *
 * Re-exports the compile function and types from @scratch-and-dent/buyers-tool
 * for use throughout the scratchanddentfinder Next.js application.
 *
 * Usage:
 * ```typescript
 * import { compile, type BuyerInput, type CompilerOutput } from '@/lib/buyers-tool';
 * ```
 */

// Main compile function
export { compile } from '@scratch-and-dent/buyers-tool';

// Trace utilities
export {
  summarizeTrace,
  summarizeTraceCompact,
  getFailedRuleSummaries,
  groupRulesByModule,
} from '@scratch-and-dent/buyers-tool';
export type { TraceSummaryOptions } from '@scratch-and-dent/buyers-tool';

// Version constants
export {
  COMPILER_VERSION,
  SCHEMA_VERSION,
  RULESET_VERSION,
} from '@scratch-and-dent/buyers-tool';

// Type exports - Input/Output
export type {
  BuyerInput,
  CompilerOutput,
  CompilerOptions,
  CompilerTrace,
} from '@scratch-and-dent/buyers-tool';

// Type exports - Sub-schemas (Input)
export type {
  ApplianceInfo,
  DamageInfo,
  RetailerInfo,
  WarrantyInfo,
  ReturnPolicyInfo,
  InstallationInfo,
  BuyerContext,
  InspectionResults,
} from '@scratch-and-dent/buyers-tool';

// Type exports - Sub-schemas (Output)
export type {
  VerdictResult,
  FinancialResult,
  DamageAssessmentResult,
  WarrantyEvaluationResult,
  SafetyGateResult,
  NegotiationResult,
  LogisticsResult,
  ReturnPolicyAssessmentResult,
} from '@scratch-and-dent/buyers-tool';

// Type exports - Rules
export type { RuleResult, ModuleOutput } from '@scratch-and-dent/buyers-tool';

// Type exports - Enums/Literals
export type {
  ApplianceType,
  DamageLocation,
  DamageSeverity,
  DamageType,
  RetailerType,
  InstallationType,
  VisibleSide,
  BuyerPurpose,
  RiskTolerance,
  PriceFlexibility,
  RuleSeverity,
  Recommendation,
  Confidence,
  DiscountRating,
  DamageTier,
  TierLabel,
  VisibilityImpact,
  WarrantyScore,
  RiskLevel,
  NegotiationProbability,
  DeliveryRecommendation,
  ReturnPolicyRating,
  ModuleName,
} from '@scratch-and-dent/buyers-tool';

// Type guards
export {
  isBlocker,
  isWarning,
  isInfo,
} from '@scratch-and-dent/buyers-tool';

// Rule registry exports (for testing and debugging)
export {
  ALL_RULE_IDS,
  BLOCKER_RULES,
  WARNING_RULES,
  RULE_METADATA,
  THRESHOLDS,
  EXPECTED_DISCOUNT_BY_TIER,
  EXECUTION_ORDER,
} from '@scratch-and-dent/buyers-tool';
