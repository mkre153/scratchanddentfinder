/**
 * Module 6: NegotiationEngine
 *
 * Execution Order: 6 (Depends on: DamageClassifier, PricingEngine)
 * Input: retailer.*, damageAssessment.*, financial.*
 * Output: negotiation.*
 *
 * Determines negotiation potential and suggests strategies.
 */
import { NEGOTIATION_POSSIBLE_RETAILER_TYPE_V1, NEGOTIATION_LEVERAGE_INVENTORY_AGE_V1, NEGOTIATION_LEVERAGE_VISIBLE_DAMAGE_V1, NEGOTIATION_TARGET_CALCULATE_V1, NEGOTIATION_ALTERNATIVES_V1, EXPECTED_DISCOUNT_BY_TIER, } from '../rules';
/**
 * Determines if negotiation is possible based on retailer type
 */
function isNegotiationPossible(retailerType) {
    return retailerType !== 'big_box';
}
/**
 * Calculates negotiation probability based on multiple factors
 */
function calculateProbability(retailerType, inventoryAgeDays, tier, currentDiscountPercent, expectedMinDiscount) {
    if (retailerType === 'big_box') {
        return 'unlikely';
    }
    let score = 0;
    // Retailer type factor
    if (retailerType === 'independent' || retailerType === 'liquidation') {
        score += 2;
    }
    else if (retailerType === 'outlet') {
        score += 1;
    }
    // Inventory age factor
    if (inventoryAgeDays !== undefined) {
        if (inventoryAgeDays > 60)
            score += 2;
        else if (inventoryAgeDays > 30)
            score += 1;
    }
    // Visible damage factor
    if (tier === 3)
        score += 2;
    else if (tier === 2)
        score += 1;
    // Pricing factor (if below expected, more room to negotiate)
    if (currentDiscountPercent < expectedMinDiscount) {
        score += 2;
    }
    if (score >= 5)
        return 'high';
    if (score >= 3)
        return 'medium';
    if (score >= 1)
        return 'low';
    return 'unlikely';
}
/**
 * Calculates suggested target price
 */
function calculateTargetPrice(retailPrice, tier) {
    const [minDiscount, maxDiscount] = EXPECTED_DISCOUNT_BY_TIER[tier];
    const targetDiscount = (minDiscount + maxDiscount) / 2;
    return Math.round(retailPrice * (1 - targetDiscount / 100));
}
/**
 * Generates leverage points for negotiation
 */
function generateLeveragePoints(inventoryAgeDays, tier, currentDiscountPercent, expectedMinDiscount) {
    const points = [];
    if (inventoryAgeDays !== undefined && inventoryAgeDays > 30) {
        points.push(`Item has been on floor for ${inventoryAgeDays} days — retailer may want to move it`);
    }
    if (tier === 3) {
        points.push('Prominently visible damage reduces desirability for most buyers');
    }
    else if (tier === 2) {
        points.push('Side damage may deter some buyers');
    }
    if (currentDiscountPercent < expectedMinDiscount) {
        points.push(`Current discount (${currentDiscountPercent.toFixed(1)}%) is below typical range for this damage level`);
    }
    if (points.length === 0) {
        points.push('Be polite but firm — scratches and dents reduce resale value');
    }
    return points;
}
/**
 * Generates alternative asks if price is firm
 */
function generateAlternativeAsks() {
    return [
        'Free delivery/installation',
        'Extended warranty at no cost',
        'Waived restocking fee on return policy',
        'Free haul-away of old appliance',
        'Accessories included (ice maker kit, stacking kit, etc.)',
    ];
}
/**
 * NegotiationEngine.evaluate
 *
 * Pure function that calculates negotiation potential and strategies.
 */
export function evaluate(input, damageAssessment, financial) {
    const rules = [];
    const { retailer, appliance } = input;
    const { tier } = damageAssessment;
    const { discountPercent } = financial;
    const expectedMinDiscount = EXPECTED_DISCOUNT_BY_TIER[tier][0];
    // Rule: NEGOTIATION.POSSIBLE.RETAILER_TYPE_V1
    const possible = isNegotiationPossible(retailer.type);
    rules.push({
        ruleId: NEGOTIATION_POSSIBLE_RETAILER_TYPE_V1,
        severity: 'info',
        passed: true,
        message: possible
            ? `Negotiation likely possible at ${retailer.type} retailer`
            : `Negotiation unlikely at ${retailer.type} — prices typically fixed`,
        inputsUsed: ['retailer.type'],
        outputsAffected: ['negotiation.possible', 'negotiation.probability'],
    });
    // Rule: NEGOTIATION.LEVERAGE.INVENTORY_AGE_V1
    if (retailer.inventoryAgeDays !== undefined && retailer.inventoryAgeDays > 30) {
        rules.push({
            ruleId: NEGOTIATION_LEVERAGE_INVENTORY_AGE_V1,
            severity: 'info',
            passed: true,
            message: `Item on floor for ${retailer.inventoryAgeDays} days — increases negotiation leverage`,
            inputsUsed: ['retailer.inventoryAgeDays'],
            outputsAffected: ['negotiation.leveragePoints'],
        });
    }
    // Rule: NEGOTIATION.LEVERAGE.VISIBLE_DAMAGE_V1
    if (tier >= 2) {
        rules.push({
            ruleId: NEGOTIATION_LEVERAGE_VISIBLE_DAMAGE_V1,
            severity: 'info',
            passed: true,
            message: `Tier ${tier} damage provides negotiation leverage`,
            inputsUsed: ['damageAssessment.tier'],
            outputsAffected: ['negotiation.leveragePoints'],
        });
    }
    // Calculate probability
    const probability = calculateProbability(retailer.type, retailer.inventoryAgeDays, tier, discountPercent, expectedMinDiscount);
    // Rule: NEGOTIATION.TARGET.CALCULATE_V1
    const suggestedTargetPrice = calculateTargetPrice(appliance.retailPrice, tier);
    rules.push({
        ruleId: NEGOTIATION_TARGET_CALCULATE_V1,
        severity: 'info',
        passed: true,
        message: `Suggested target price: $${suggestedTargetPrice}`,
        inputsUsed: ['appliance.retailPrice', 'damageAssessment.tier'],
        outputsAffected: ['negotiation.suggestedTargetPrice'],
    });
    // Generate leverage points and alternatives
    const leveragePoints = generateLeveragePoints(retailer.inventoryAgeDays, tier, discountPercent, expectedMinDiscount);
    const alternativeAsks = generateAlternativeAsks();
    // Rule: NEGOTIATION.ALTERNATIVES.CALCULATE_V1
    rules.push({
        ruleId: NEGOTIATION_ALTERNATIVES_V1,
        severity: 'info',
        passed: true,
        message: 'Alternative asks generated for if price is firm',
        inputsUsed: [],
        outputsAffected: ['negotiation.alternativeAsks'],
    });
    return {
        result: {
            possible,
            probability,
            suggestedTargetPrice,
            leveragePoints,
            alternativeAsks,
        },
        rules,
    };
}
export const NegotiationEngine = { evaluate };
//# sourceMappingURL=negotiation-engine.js.map