/**
 * Module 2: PricingEngine
 *
 * Execution Order: 2 (Depends on: DamageClassifier)
 * Input: appliance.retailPrice, appliance.askingPrice, damageAssessment.tier
 * Output: financial.*
 *
 * Calculates discount percentages, ratings, and fair price estimates.
 */
import { PRICING_DISCOUNT_CALCULATE_V1, PRICING_DISCOUNT_RATING_V1, PRICING_DISCOUNT_EXPECTED_RANGE_V1, EXPECTED_DISCOUNT_BY_TIER, } from '../rules';
/**
 * Calculates the discount percentage
 */
function calculateDiscountPercent(retailPrice, askingPrice) {
    if (retailPrice <= 0)
        return 0;
    return ((retailPrice - askingPrice) / retailPrice) * 100;
}
/**
 * Maps discount percentage to a rating
 */
function getDiscountRating(discountPercent) {
    if (discountPercent >= 40)
        return 'excellent';
    if (discountPercent >= 30)
        return 'good';
    if (discountPercent >= 20)
        return 'fair';
    return 'poor';
}
/**
 * Calculates fair price estimate range based on damage tier
 */
function calculateFairPriceRange(retailPrice, tier) {
    const [minDiscount, maxDiscount] = EXPECTED_DISCOUNT_BY_TIER[tier];
    const maxFairPrice = retailPrice * (1 - minDiscount / 100);
    const minFairPrice = retailPrice * (1 - maxDiscount / 100);
    return [Math.round(minFairPrice), Math.round(maxFairPrice)];
}
/**
 * PricingEngine.evaluate
 *
 * Pure function that calculates financial metrics based on pricing and damage tier.
 */
export function evaluate(input, damageAssessment) {
    const rules = [];
    const { appliance } = input;
    const { tier } = damageAssessment;
    // Rule: PRICING.DISCOUNT.CALCULATE_V1
    const discountPercent = calculateDiscountPercent(appliance.retailPrice, appliance.askingPrice);
    const savingsVsNew = appliance.retailPrice - appliance.askingPrice;
    rules.push({
        ruleId: PRICING_DISCOUNT_CALCULATE_V1,
        severity: 'info',
        passed: true,
        message: `Discount is ${discountPercent.toFixed(1)}% ($${savingsVsNew} savings)`,
        inputsUsed: ['appliance.retailPrice', 'appliance.askingPrice'],
        outputsAffected: ['financial.discountPercent', 'financial.savingsVsNew'],
    });
    // Rule: PRICING.DISCOUNT.RATING_V1
    const discountRating = getDiscountRating(discountPercent);
    rules.push({
        ruleId: PRICING_DISCOUNT_RATING_V1,
        severity: 'info',
        passed: true,
        message: `Discount rated as "${discountRating}"`,
        inputsUsed: ['financial.discountPercent'],
        outputsAffected: ['financial.discountRating'],
    });
    // Rule: PRICING.DISCOUNT.EXPECTED_RANGE_V1
    const expectedDiscountRange = EXPECTED_DISCOUNT_BY_TIER[tier];
    const fairPriceEstimate = calculateFairPriceRange(appliance.retailPrice, tier);
    const isBelowExpected = discountPercent < expectedDiscountRange[0];
    if (isBelowExpected) {
        rules.push({
            ruleId: PRICING_DISCOUNT_EXPECTED_RANGE_V1,
            severity: 'warning',
            passed: false,
            message: `Discount (${discountPercent.toFixed(1)}%) is below typical range (${expectedDiscountRange[0]}-${expectedDiscountRange[1]}%) for Tier ${tier} damage`,
            inputsUsed: ['financial.discountPercent', 'damageAssessment.tier'],
            outputsAffected: ['financial.expectedDiscountRange'],
        });
    }
    else {
        rules.push({
            ruleId: PRICING_DISCOUNT_EXPECTED_RANGE_V1,
            severity: 'warning',
            passed: true,
            message: `Discount (${discountPercent.toFixed(1)}%) is within expected range (${expectedDiscountRange[0]}-${expectedDiscountRange[1]}%) for Tier ${tier} damage`,
            inputsUsed: ['financial.discountPercent', 'damageAssessment.tier'],
            outputsAffected: ['financial.expectedDiscountRange'],
        });
    }
    return {
        result: {
            discountPercent: Math.round(discountPercent * 10) / 10,
            discountRating,
            expectedDiscountRange,
            savingsVsNew,
            fairPriceEstimate,
        },
        rules,
    };
}
export const PricingEngine = { evaluate };
//# sourceMappingURL=pricing-engine.js.map