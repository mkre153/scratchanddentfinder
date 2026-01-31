/**
 * ScratchAndDentFinder Buyer's Tool — Rule Registry
 *
 * Every rule has a stable, addressable ID using the format:
 * {MODULE}.{CATEGORY}.{NAME}_V{VERSION}
 *
 * Rule IDs are never reused after removal — deprecate, don't delete.
 */
// ============================================================================
// RULE ID CONSTANTS
// ============================================================================
// Damage Classifier Rules
export const DAMAGE_TIER_ASSIGNMENT_V1 = 'DAMAGE.TIER.ASSIGNMENT_V1';
export const DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1 = 'DAMAGE.VISIBILITY.INSTALLATION_CHECK_V1';
// Pricing Engine Rules
export const PRICING_DISCOUNT_CALCULATE_V1 = 'PRICING.DISCOUNT.CALCULATE_V1';
export const PRICING_DISCOUNT_RATING_V1 = 'PRICING.DISCOUNT.RATING_V1';
export const PRICING_DISCOUNT_EXPECTED_RANGE_V1 = 'PRICING.DISCOUNT.EXPECTED_RANGE_V1';
// Safety Gate Rules (Blockers)
export const SAFETY_BLOCKER_RUST_DETECTED_V1 = 'SAFETY.BLOCKER.RUST_DETECTED_V1';
export const SAFETY_BLOCKER_WATER_DAMAGE_V1 = 'SAFETY.BLOCKER.WATER_DAMAGE_V1';
export const SAFETY_BLOCKER_CORD_DAMAGED_V1 = 'SAFETY.BLOCKER.CORD_DAMAGED_V1';
export const SAFETY_BLOCKER_ODOR_DETECTED_V1 = 'SAFETY.BLOCKER.ODOR_DETECTED_V1';
export const SAFETY_BLOCKER_MISSING_PARTS_V1 = 'SAFETY.BLOCKER.MISSING_PARTS_V1';
export const SAFETY_WARNING_PRIOR_REPAIRS_V1 = 'SAFETY.WARNING.PRIOR_REPAIRS_V1';
export const SAFETY_WARNING_UNUSUAL_SOUNDS_V1 = 'SAFETY.WARNING.UNUSUAL_SOUNDS_V1';
export const SAFETY_INFO_POWER_ON_WORKS_V1 = 'SAFETY.INFO.POWER_ON_WORKS_V1';
// Warranty Evaluator Rules
export const WARRANTY_SCORE_EXCELLENT_V1 = 'WARRANTY.SCORE.EXCELLENT_V1';
export const WARRANTY_SCORE_ACCEPTABLE_V1 = 'WARRANTY.SCORE.ACCEPTABLE_V1';
export const WARRANTY_SCORE_LIMITED_V1 = 'WARRANTY.SCORE.LIMITED_V1';
export const WARRANTY_SCORE_UNACCEPTABLE_V1 = 'WARRANTY.SCORE.UNACCEPTABLE_V1';
export const WARRANTY_WARNING_LIMITED_COVERAGE_V1 = 'WARRANTY.WARNING.LIMITED_COVERAGE_V1';
export const WARRANTY_WARNING_NO_LABOR_INCLUDED_V1 = 'WARRANTY.WARNING.NO_LABOR_INCLUDED_V1';
export const WARRANTY_WARNING_UNKNOWN_MFG_V1 = 'WARRANTY.WARNING.UNKNOWN_MFG_V1';
// Return Policy Filter Rules
export const RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1 = 'RETURN.BLOCKER.FINAL_SALE_NO_WARRANTY_V1';
export const RETURN_WARNING_FINAL_SALE_V1 = 'RETURN.WARNING.FINAL_SALE_V1';
export const RETURN_WARNING_SHORT_WINDOW_V1 = 'RETURN.WARNING.SHORT_WINDOW_V1';
export const RETURN_INFO_RESTOCKING_FEE_V1 = 'RETURN.INFO.RESTOCKING_FEE_V1';
export const RETURN_RATING_V1 = 'RETURN.RATING.ASSESSMENT_V1';
// Negotiation Engine Rules
export const NEGOTIATION_POSSIBLE_RETAILER_TYPE_V1 = 'NEGOTIATION.POSSIBLE.RETAILER_TYPE_V1';
export const NEGOTIATION_LEVERAGE_INVENTORY_AGE_V1 = 'NEGOTIATION.LEVERAGE.INVENTORY_AGE_V1';
export const NEGOTIATION_LEVERAGE_VISIBLE_DAMAGE_V1 = 'NEGOTIATION.LEVERAGE.VISIBLE_DAMAGE_V1';
export const NEGOTIATION_TARGET_CALCULATE_V1 = 'NEGOTIATION.TARGET.CALCULATE_V1';
export const NEGOTIATION_ALTERNATIVES_V1 = 'NEGOTIATION.ALTERNATIVES.CALCULATE_V1';
// Logistics Solver Rules
export const LOGISTICS_DELIVERY_REFRIGERATOR_V1 = 'LOGISTICS.DELIVERY.REFRIGERATOR_V1';
export const LOGISTICS_DELIVERY_STACKED_V1 = 'LOGISTICS.DELIVERY.STACKED_V1';
export const LOGISTICS_DELIVERY_GAS_V1 = 'LOGISTICS.DELIVERY.GAS_V1';
export const LOGISTICS_DELIVERY_DEFAULT_V1 = 'LOGISTICS.DELIVERY.DEFAULT_V1';
export const LOGISTICS_TRANSPORT_REFRIGERATOR_V1 = 'LOGISTICS.TRANSPORT.REFRIGERATOR_V1';
export const LOGISTICS_TRANSPORT_WASHER_V1 = 'LOGISTICS.TRANSPORT.WASHER_V1';
export const LOGISTICS_TRANSPORT_RANGE_V1 = 'LOGISTICS.TRANSPORT.RANGE_V1';
export const LOGISTICS_INSTALLATION_NOTES_V1 = 'LOGISTICS.INSTALLATION.NOTES_V1';
// Verdict Compiler Rules
export const VERDICT_THRESHOLD_BLOCKER_COUNT_V1 = 'VERDICT.THRESHOLD.BLOCKER_COUNT_V1';
export const VERDICT_THRESHOLD_WARNING_SKIP_V1 = 'VERDICT.THRESHOLD.WARNING_SKIP_V1';
export const VERDICT_THRESHOLD_WARNING_CAUTION_V1 = 'VERDICT.THRESHOLD.WARNING_CAUTION_V1';
export const VERDICT_RISK_TOLERANCE_ADJUSTMENT_V1 = 'VERDICT.RISK_TOLERANCE.ADJUSTMENT_V1';
export const VERDICT_DECIDE_WALK_AWAY_V1 = 'VERDICT.DECIDE.WALK_AWAY_V1';
export const VERDICT_DECIDE_SKIP_V1 = 'VERDICT.DECIDE.SKIP_V1';
export const VERDICT_DECIDE_CAUTION_V1 = 'VERDICT.DECIDE.CAUTION_V1';
export const VERDICT_DECIDE_PROCEED_V1 = 'VERDICT.DECIDE.PROCEED_V1';
// ============================================================================
// ALL RULE IDS (for coverage testing)
// ============================================================================
export const ALL_RULE_IDS = [
    // Damage Classifier
    DAMAGE_TIER_ASSIGNMENT_V1,
    DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1,
    // Pricing Engine
    PRICING_DISCOUNT_CALCULATE_V1,
    PRICING_DISCOUNT_RATING_V1,
    PRICING_DISCOUNT_EXPECTED_RANGE_V1,
    // Safety Gate
    SAFETY_BLOCKER_RUST_DETECTED_V1,
    SAFETY_BLOCKER_WATER_DAMAGE_V1,
    SAFETY_BLOCKER_CORD_DAMAGED_V1,
    SAFETY_BLOCKER_ODOR_DETECTED_V1,
    SAFETY_BLOCKER_MISSING_PARTS_V1,
    SAFETY_WARNING_PRIOR_REPAIRS_V1,
    SAFETY_WARNING_UNUSUAL_SOUNDS_V1,
    SAFETY_INFO_POWER_ON_WORKS_V1,
    // Warranty Evaluator
    WARRANTY_SCORE_EXCELLENT_V1,
    WARRANTY_SCORE_ACCEPTABLE_V1,
    WARRANTY_SCORE_LIMITED_V1,
    WARRANTY_SCORE_UNACCEPTABLE_V1,
    WARRANTY_WARNING_LIMITED_COVERAGE_V1,
    WARRANTY_WARNING_NO_LABOR_INCLUDED_V1,
    WARRANTY_WARNING_UNKNOWN_MFG_V1,
    // Return Policy Filter
    RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1,
    RETURN_WARNING_FINAL_SALE_V1,
    RETURN_WARNING_SHORT_WINDOW_V1,
    RETURN_INFO_RESTOCKING_FEE_V1,
    RETURN_RATING_V1,
    // Negotiation Engine
    NEGOTIATION_POSSIBLE_RETAILER_TYPE_V1,
    NEGOTIATION_LEVERAGE_INVENTORY_AGE_V1,
    NEGOTIATION_LEVERAGE_VISIBLE_DAMAGE_V1,
    NEGOTIATION_TARGET_CALCULATE_V1,
    NEGOTIATION_ALTERNATIVES_V1,
    // Logistics Solver
    LOGISTICS_DELIVERY_REFRIGERATOR_V1,
    LOGISTICS_DELIVERY_STACKED_V1,
    LOGISTICS_DELIVERY_GAS_V1,
    LOGISTICS_DELIVERY_DEFAULT_V1,
    LOGISTICS_TRANSPORT_REFRIGERATOR_V1,
    LOGISTICS_TRANSPORT_WASHER_V1,
    LOGISTICS_TRANSPORT_RANGE_V1,
    LOGISTICS_INSTALLATION_NOTES_V1,
    // Verdict Compiler
    VERDICT_THRESHOLD_BLOCKER_COUNT_V1,
    VERDICT_THRESHOLD_WARNING_SKIP_V1,
    VERDICT_THRESHOLD_WARNING_CAUTION_V1,
    VERDICT_RISK_TOLERANCE_ADJUSTMENT_V1,
    VERDICT_DECIDE_WALK_AWAY_V1,
    VERDICT_DECIDE_SKIP_V1,
    VERDICT_DECIDE_CAUTION_V1,
    VERDICT_DECIDE_PROCEED_V1,
];
// ============================================================================
// BLOCKER RULE IDS
// ============================================================================
export const BLOCKER_RULES = [
    SAFETY_BLOCKER_RUST_DETECTED_V1,
    SAFETY_BLOCKER_WATER_DAMAGE_V1,
    SAFETY_BLOCKER_CORD_DAMAGED_V1,
    SAFETY_BLOCKER_ODOR_DETECTED_V1,
    SAFETY_BLOCKER_MISSING_PARTS_V1,
    RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1,
];
// ============================================================================
// WARNING RULE IDS
// ============================================================================
export const WARNING_RULES = [
    SAFETY_WARNING_PRIOR_REPAIRS_V1,
    SAFETY_WARNING_UNUSUAL_SOUNDS_V1,
    WARRANTY_WARNING_LIMITED_COVERAGE_V1,
    WARRANTY_WARNING_NO_LABOR_INCLUDED_V1,
    WARRANTY_WARNING_UNKNOWN_MFG_V1,
    RETURN_WARNING_FINAL_SALE_V1,
    RETURN_WARNING_SHORT_WINDOW_V1,
    PRICING_DISCOUNT_EXPECTED_RANGE_V1,
    DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1,
];
export const RULE_METADATA = {
    // Damage Classifier
    [DAMAGE_TIER_ASSIGNMENT_V1]: {
        id: DAMAGE_TIER_ASSIGNMENT_V1,
        severity: 'info',
        module: 'DamageClassifier',
        description: 'Classifies damage into Tier 1/2/3 based on location',
    },
    [DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1]: {
        id: DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1,
        severity: 'warning',
        module: 'DamageClassifier',
        description: 'Checks if damage will be visible in buyer installation context',
    },
    // Pricing Engine
    [PRICING_DISCOUNT_CALCULATE_V1]: {
        id: PRICING_DISCOUNT_CALCULATE_V1,
        severity: 'info',
        module: 'PricingEngine',
        description: 'Calculates discount percentage',
    },
    [PRICING_DISCOUNT_RATING_V1]: {
        id: PRICING_DISCOUNT_RATING_V1,
        severity: 'info',
        module: 'PricingEngine',
        description: 'Rates discount as excellent/good/fair/poor',
    },
    [PRICING_DISCOUNT_EXPECTED_RANGE_V1]: {
        id: PRICING_DISCOUNT_EXPECTED_RANGE_V1,
        severity: 'warning',
        module: 'PricingEngine',
        description: 'Warns if discount below expected for damage tier',
    },
    // Safety Gate
    [SAFETY_BLOCKER_RUST_DETECTED_V1]: {
        id: SAFETY_BLOCKER_RUST_DETECTED_V1,
        severity: 'blocker',
        module: 'SafetyGate',
        description: 'Rust detected on unit',
    },
    [SAFETY_BLOCKER_WATER_DAMAGE_V1]: {
        id: SAFETY_BLOCKER_WATER_DAMAGE_V1,
        severity: 'blocker',
        module: 'SafetyGate',
        description: 'Water damage signs present',
    },
    [SAFETY_BLOCKER_CORD_DAMAGED_V1]: {
        id: SAFETY_BLOCKER_CORD_DAMAGED_V1,
        severity: 'blocker',
        module: 'SafetyGate',
        description: 'Electrical cord is damaged',
    },
    [SAFETY_BLOCKER_ODOR_DETECTED_V1]: {
        id: SAFETY_BLOCKER_ODOR_DETECTED_V1,
        severity: 'blocker',
        module: 'SafetyGate',
        description: 'Unusual odors detected (burning/mold)',
    },
    [SAFETY_BLOCKER_MISSING_PARTS_V1]: {
        id: SAFETY_BLOCKER_MISSING_PARTS_V1,
        severity: 'blocker',
        module: 'SafetyGate',
        description: 'Parts or components missing',
    },
    [SAFETY_WARNING_PRIOR_REPAIRS_V1]: {
        id: SAFETY_WARNING_PRIOR_REPAIRS_V1,
        severity: 'warning',
        module: 'SafetyGate',
        description: 'Prior repairs evident on unit',
    },
    [SAFETY_WARNING_UNUSUAL_SOUNDS_V1]: {
        id: SAFETY_WARNING_UNUSUAL_SOUNDS_V1,
        severity: 'warning',
        module: 'SafetyGate',
        description: 'Unusual sounds during operation',
    },
    [SAFETY_INFO_POWER_ON_WORKS_V1]: {
        id: SAFETY_INFO_POWER_ON_WORKS_V1,
        severity: 'info',
        module: 'SafetyGate',
        description: 'Power-on test result',
    },
    // Warranty Evaluator
    [WARRANTY_SCORE_EXCELLENT_V1]: {
        id: WARRANTY_SCORE_EXCELLENT_V1,
        severity: 'info',
        module: 'WarrantyEvaluator',
        description: 'Warranty rated as excellent',
    },
    [WARRANTY_SCORE_ACCEPTABLE_V1]: {
        id: WARRANTY_SCORE_ACCEPTABLE_V1,
        severity: 'info',
        module: 'WarrantyEvaluator',
        description: 'Warranty rated as acceptable',
    },
    [WARRANTY_SCORE_LIMITED_V1]: {
        id: WARRANTY_SCORE_LIMITED_V1,
        severity: 'info',
        module: 'WarrantyEvaluator',
        description: 'Warranty rated as limited',
    },
    [WARRANTY_SCORE_UNACCEPTABLE_V1]: {
        id: WARRANTY_SCORE_UNACCEPTABLE_V1,
        severity: 'info',
        module: 'WarrantyEvaluator',
        description: 'Warranty rated as unacceptable',
    },
    [WARRANTY_WARNING_LIMITED_COVERAGE_V1]: {
        id: WARRANTY_WARNING_LIMITED_COVERAGE_V1,
        severity: 'warning',
        module: 'WarrantyEvaluator',
        description: 'Limited warranty coverage may not justify savings',
    },
    [WARRANTY_WARNING_NO_LABOR_INCLUDED_V1]: {
        id: WARRANTY_WARNING_NO_LABOR_INCLUDED_V1,
        severity: 'warning',
        module: 'WarrantyEvaluator',
        description: 'Warranty does not include labor costs',
    },
    [WARRANTY_WARNING_UNKNOWN_MFG_V1]: {
        id: WARRANTY_WARNING_UNKNOWN_MFG_V1,
        severity: 'warning',
        module: 'WarrantyEvaluator',
        description: 'Manufacturer warranty status unknown',
    },
    // Return Policy Filter
    [RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1]: {
        id: RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1,
        severity: 'blocker',
        module: 'ReturnPolicyFilter',
        description: 'Final sale with no warranty — no recourse if unit fails',
    },
    [RETURN_WARNING_FINAL_SALE_V1]: {
        id: RETURN_WARNING_FINAL_SALE_V1,
        severity: 'warning',
        module: 'ReturnPolicyFilter',
        description: 'Final sale (but has warranty)',
    },
    [RETURN_WARNING_SHORT_WINDOW_V1]: {
        id: RETURN_WARNING_SHORT_WINDOW_V1,
        severity: 'warning',
        module: 'ReturnPolicyFilter',
        description: 'Very short return window increases risk',
    },
    [RETURN_INFO_RESTOCKING_FEE_V1]: {
        id: RETURN_INFO_RESTOCKING_FEE_V1,
        severity: 'info',
        module: 'ReturnPolicyFilter',
        description: 'Restocking fee applies to returns',
    },
    [RETURN_RATING_V1]: {
        id: RETURN_RATING_V1,
        severity: 'info',
        module: 'ReturnPolicyFilter',
        description: 'Overall return policy rating',
    },
    // Negotiation Engine
    [NEGOTIATION_POSSIBLE_RETAILER_TYPE_V1]: {
        id: NEGOTIATION_POSSIBLE_RETAILER_TYPE_V1,
        severity: 'info',
        module: 'NegotiationEngine',
        description: 'Determines if negotiation is possible based on retailer type',
    },
    [NEGOTIATION_LEVERAGE_INVENTORY_AGE_V1]: {
        id: NEGOTIATION_LEVERAGE_INVENTORY_AGE_V1,
        severity: 'info',
        module: 'NegotiationEngine',
        description: 'Inventory age increases negotiation leverage',
    },
    [NEGOTIATION_LEVERAGE_VISIBLE_DAMAGE_V1]: {
        id: NEGOTIATION_LEVERAGE_VISIBLE_DAMAGE_V1,
        severity: 'info',
        module: 'NegotiationEngine',
        description: 'Visible damage increases negotiation leverage',
    },
    [NEGOTIATION_TARGET_CALCULATE_V1]: {
        id: NEGOTIATION_TARGET_CALCULATE_V1,
        severity: 'info',
        module: 'NegotiationEngine',
        description: 'Calculates suggested target price',
    },
    [NEGOTIATION_ALTERNATIVES_V1]: {
        id: NEGOTIATION_ALTERNATIVES_V1,
        severity: 'info',
        module: 'NegotiationEngine',
        description: 'Suggests alternative asks if price is firm',
    },
    // Logistics Solver
    [LOGISTICS_DELIVERY_REFRIGERATOR_V1]: {
        id: LOGISTICS_DELIVERY_REFRIGERATOR_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Refrigerator delivery recommendation',
    },
    [LOGISTICS_DELIVERY_STACKED_V1]: {
        id: LOGISTICS_DELIVERY_STACKED_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Stacked unit delivery recommendation',
    },
    [LOGISTICS_DELIVERY_GAS_V1]: {
        id: LOGISTICS_DELIVERY_GAS_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Gas appliance delivery recommendation',
    },
    [LOGISTICS_DELIVERY_DEFAULT_V1]: {
        id: LOGISTICS_DELIVERY_DEFAULT_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Default delivery recommendation',
    },
    [LOGISTICS_TRANSPORT_REFRIGERATOR_V1]: {
        id: LOGISTICS_TRANSPORT_REFRIGERATOR_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Refrigerator transport requirements',
    },
    [LOGISTICS_TRANSPORT_WASHER_V1]: {
        id: LOGISTICS_TRANSPORT_WASHER_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Washer transport requirements',
    },
    [LOGISTICS_TRANSPORT_RANGE_V1]: {
        id: LOGISTICS_TRANSPORT_RANGE_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Range transport requirements',
    },
    [LOGISTICS_INSTALLATION_NOTES_V1]: {
        id: LOGISTICS_INSTALLATION_NOTES_V1,
        severity: 'info',
        module: 'LogisticsSolver',
        description: 'Installation notes for appliance type',
    },
    // Verdict Compiler
    [VERDICT_THRESHOLD_BLOCKER_COUNT_V1]: {
        id: VERDICT_THRESHOLD_BLOCKER_COUNT_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Blocker count threshold for WALK_AWAY',
    },
    [VERDICT_THRESHOLD_WARNING_SKIP_V1]: {
        id: VERDICT_THRESHOLD_WARNING_SKIP_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Warning count threshold for SKIP',
    },
    [VERDICT_THRESHOLD_WARNING_CAUTION_V1]: {
        id: VERDICT_THRESHOLD_WARNING_CAUTION_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Warning count threshold for CAUTION',
    },
    [VERDICT_RISK_TOLERANCE_ADJUSTMENT_V1]: {
        id: VERDICT_RISK_TOLERANCE_ADJUSTMENT_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Threshold adjustment based on buyer risk tolerance',
    },
    [VERDICT_DECIDE_WALK_AWAY_V1]: {
        id: VERDICT_DECIDE_WALK_AWAY_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Decision: WALK_AWAY',
    },
    [VERDICT_DECIDE_SKIP_V1]: {
        id: VERDICT_DECIDE_SKIP_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Decision: SKIP',
    },
    [VERDICT_DECIDE_CAUTION_V1]: {
        id: VERDICT_DECIDE_CAUTION_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Decision: PROCEED_WITH_CAUTION',
    },
    [VERDICT_DECIDE_PROCEED_V1]: {
        id: VERDICT_DECIDE_PROCEED_V1,
        severity: 'info',
        module: 'VerdictCompiler',
        description: 'Decision: PROCEED',
    },
};
// ============================================================================
// CONFIGURABLE THRESHOLDS
// ============================================================================
export const THRESHOLDS = {
    [VERDICT_THRESHOLD_BLOCKER_COUNT_V1]: 1,
    [VERDICT_THRESHOLD_WARNING_SKIP_V1]: 3,
    [VERDICT_THRESHOLD_WARNING_CAUTION_V1]: 1,
};
// ============================================================================
// EXPECTED DISCOUNT RANGES BY DAMAGE TIER
// ============================================================================
export const EXPECTED_DISCOUNT_BY_TIER = {
    1: [15, 25], // Hidden damage
    2: [25, 35], // Partial visibility
    3: [35, 50], // Prominent damage
};
// ============================================================================
// DAMAGE TIER LOCATION CLASSIFICATIONS
// ============================================================================
export const TIER1_LOCATIONS = ['back', 'bottom', 'top'];
export const TIER3_LOCATIONS = ['front_door', 'front_panel', 'control_panel', 'handle'];
// ============================================================================
// EXECUTION ORDER
// ============================================================================
export const EXECUTION_ORDER = [
    'DamageClassifier',
    'PricingEngine',
    'SafetyGate',
    'WarrantyEvaluator',
    'ReturnPolicyFilter',
    'NegotiationEngine',
    'LogisticsSolver',
    'VerdictCompiler',
];
//# sourceMappingURL=rules.js.map