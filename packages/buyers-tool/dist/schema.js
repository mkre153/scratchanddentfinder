/**
 * ScratchAndDentFinder Buyer's Tool — Type Definitions
 *
 * This file contains all TypeScript interfaces for the deterministic
 * decision compiler. The compiler takes BuyerInput and produces
 * CompilerOutput through explicit, auditable rules.
 */
// ============================================================================
// VERSION CONSTANTS
// ============================================================================
/**
 * COMPILER_VERSION — The execution engine version
 * Bump when: module ordering, trace format, halt behavior, or orchestration changes
 * Does NOT change when rules/thresholds are updated
 */
export const COMPILER_VERSION = '1.0.0';
/**
 * SCHEMA_VERSION — The input/output schema version
 * Bump when: BuyerInput or CompilerOutput shape changes
 */
export const SCHEMA_VERSION = '1.0.0';
/**
 * RULESET_VERSION — The business rules version
 * Format: {domain}-{year}-{quarter} e.g., "pricing-2026-q1"
 * Bump when: thresholds, expected discounts, blocker conditions, or rule logic changes
 * This allows rule updates without compiler changes
 */
export const RULESET_VERSION = 'default-2026-q1';
// ============================================================================
// TYPE GUARDS
// ============================================================================
export function isBlocker(rule) {
    return rule.severity === 'blocker' && !rule.passed;
}
export function isWarning(rule) {
    return rule.severity === 'warning' && !rule.passed;
}
export function isInfo(rule) {
    return rule.severity === 'info';
}
//# sourceMappingURL=schema.js.map