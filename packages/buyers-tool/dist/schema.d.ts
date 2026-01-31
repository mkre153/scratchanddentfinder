/**
 * ScratchAndDentFinder Buyer's Tool — Type Definitions
 *
 * This file contains all TypeScript interfaces for the deterministic
 * decision compiler. The compiler takes BuyerInput and produces
 * CompilerOutput through explicit, auditable rules.
 */
/**
 * COMPILER_VERSION — The execution engine version
 * Bump when: module ordering, trace format, halt behavior, or orchestration changes
 * Does NOT change when rules/thresholds are updated
 */
export declare const COMPILER_VERSION = "1.0.0";
/**
 * SCHEMA_VERSION — The input/output schema version
 * Bump when: BuyerInput or CompilerOutput shape changes
 */
export declare const SCHEMA_VERSION = "1.0.0";
/**
 * RULESET_VERSION — The business rules version
 * Format: {domain}-{year}-{quarter} e.g., "pricing-2026-q1"
 * Bump when: thresholds, expected discounts, blocker conditions, or rule logic changes
 * This allows rule updates without compiler changes
 */
export declare const RULESET_VERSION = "default-2026-q1";
export type ApplianceType = 'refrigerator' | 'washer' | 'dryer' | 'range' | 'dishwasher' | 'microwave';
export type DamageLocation = 'front_door' | 'front_panel' | 'control_panel' | 'handle' | 'left_side' | 'right_side' | 'back' | 'top' | 'bottom';
export type DamageSeverity = 'light' | 'moderate' | 'severe';
export type DamageType = 'scratch' | 'dent' | 'scuff' | 'discoloration';
export type RetailerType = 'big_box' | 'independent' | 'outlet' | 'online' | 'liquidation';
export type InstallationType = 'built_in' | 'freestanding' | 'stacked';
export type VisibleSide = 'front' | 'left' | 'right' | 'top';
export type BuyerPurpose = 'primary_home' | 'rental_property' | 'flip' | 'temporary';
export type RiskTolerance = 'low' | 'moderate' | 'high';
export type PriceFlexibility = 'firm' | 'negotiable';
export type RuleSeverity = 'blocker' | 'warning' | 'info';
export type Recommendation = 'PROCEED' | 'PROCEED_WITH_CAUTION' | 'SKIP' | 'WALK_AWAY';
export type Confidence = 'high' | 'medium' | 'low';
export type DiscountRating = 'excellent' | 'good' | 'fair' | 'poor';
export type DamageTier = 1 | 2 | 3;
export type TierLabel = 'Hidden' | 'Partially Visible' | 'Prominently Visible';
export type VisibilityImpact = 'minimal' | 'moderate' | 'significant';
export type WarrantyScore = 'excellent' | 'acceptable' | 'limited' | 'unacceptable';
export type RiskLevel = 'low' | 'medium' | 'high';
export type NegotiationProbability = 'high' | 'medium' | 'low' | 'unlikely';
export type DeliveryRecommendation = 'professional' | 'self_transport' | 'either';
export type ReturnPolicyRating = 'excellent' | 'acceptable' | 'risky' | 'red_flag';
export type ModuleName = 'DamageClassifier' | 'PricingEngine' | 'SafetyGate' | 'WarrantyEvaluator' | 'ReturnPolicyFilter' | 'NegotiationEngine' | 'LogisticsSolver' | 'VerdictCompiler';
export interface ApplianceInfo {
    type: ApplianceType;
    brand?: string;
    model?: string;
    retailPrice: number;
    askingPrice: number;
}
export interface DamageInfo {
    locations: DamageLocation[];
    severity: DamageSeverity;
    types: DamageType[];
}
export interface RetailerInfo {
    type: RetailerType;
    inventoryAgeDays?: number;
}
export interface WarrantyInfo {
    manufacturerCovered: boolean | 'unknown';
    retailerWarrantyMonths: number;
    laborIncluded: boolean;
    partsIncluded: boolean;
    extendedAvailable: boolean;
}
export interface ReturnPolicyInfo {
    windowDays: number;
    restockingFeePercent: number;
    finalSale: boolean;
}
export interface InstallationInfo {
    type: InstallationType;
    visibleSides: VisibleSide[];
}
export interface BuyerContext {
    purpose: BuyerPurpose;
    riskTolerance: RiskTolerance;
    priceFlexibility: PriceFlexibility;
}
export interface InspectionResults {
    powerOnWorks: boolean;
    unusualSounds: boolean;
    rustPresent: boolean;
    waterStains: boolean;
    cordDamaged: boolean;
    odorsPresent: boolean;
    missingParts: boolean;
    priorRepairsEvident: boolean;
}
export interface BuyerInput {
    appliance: ApplianceInfo;
    damage: DamageInfo;
    retailer: RetailerInfo;
    warranty: WarrantyInfo;
    returnPolicy: ReturnPolicyInfo;
    installation: InstallationInfo;
    buyer: BuyerContext;
    inspection?: InspectionResults;
}
export interface RuleResult {
    ruleId: string;
    severity: RuleSeverity;
    passed: boolean;
    message: string;
    inputsUsed: string[];
    outputsAffected: string[];
}
export interface ModuleOutput<T> {
    result: T;
    rules: RuleResult[];
}
export interface DamageAssessmentResult {
    tier: DamageTier;
    tierLabel: TierLabel;
    visibilityImpact: VisibilityImpact;
    acceptableForInstallation: boolean;
}
export interface FinancialResult {
    discountPercent: number;
    discountRating: DiscountRating;
    expectedDiscountRange: [number, number];
    savingsVsNew: number;
    fairPriceEstimate: [number, number];
}
export interface SafetyGateResult {
    passed: boolean;
    failures: string[];
    blockers: string[];
    warnings: string[];
}
export interface WarrantyEvaluationResult {
    score: WarrantyScore;
    coverageGaps: string[];
    riskLevel: RiskLevel;
}
export interface ReturnPolicyAssessmentResult {
    rating: ReturnPolicyRating;
    concerns: string[];
}
export interface NegotiationResult {
    possible: boolean;
    probability: NegotiationProbability;
    suggestedTargetPrice: number;
    leveragePoints: string[];
    alternativeAsks: string[];
}
export interface LogisticsResult {
    deliveryRecommendation: DeliveryRecommendation;
    deliveryReason: string;
    transportRequirements: string[];
    installationNotes: string[];
}
export interface VerdictResult {
    recommendation: Recommendation;
    confidence: Confidence;
    summary: string;
}
export interface CompilerTrace {
    rules: RuleResult[];
    executionOrder: ModuleName[];
    haltedAtModule: ModuleName | null;
    haltedByRuleId: string | null;
    /** Engine version — changes when orchestration/format changes */
    compilerVersion: string;
    /** Input/output shape version */
    schemaVersion: string;
    /** Business rules version — changes when thresholds/rules change */
    rulesetVersion: string;
    timestamp: string;
    inputHash: string;
}
export interface CompilerOutput {
    verdict: VerdictResult;
    financial: FinancialResult;
    damageAssessment: DamageAssessmentResult;
    warrantyEvaluation: WarrantyEvaluationResult;
    safetyGate: SafetyGateResult;
    negotiation: NegotiationResult;
    logistics: LogisticsResult;
    returnPolicyAssessment: ReturnPolicyAssessmentResult;
    _trace: CompilerTrace;
}
export interface CompilerOptions {
    timestamp: string;
}
export declare function isBlocker(rule: RuleResult): boolean;
export declare function isWarning(rule: RuleResult): boolean;
export declare function isInfo(rule: RuleResult): boolean;
//# sourceMappingURL=schema.d.ts.map