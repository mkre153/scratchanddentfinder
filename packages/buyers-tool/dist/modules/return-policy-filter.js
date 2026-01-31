/**
 * Module 5: ReturnPolicyFilter
 *
 * Execution Order: 5 (No dependencies - reads input only)
 * Input: returnPolicy.*, warranty.*
 * Output: returnPolicyAssessment.*
 *
 * Evaluates return policy terms and identifies risks.
 */
import { RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1, RETURN_WARNING_FINAL_SALE_V1, RETURN_WARNING_SHORT_WINDOW_V1, RETURN_INFO_RESTOCKING_FEE_V1, RETURN_RATING_V1, } from '../rules';
/**
 * Calculates overall return policy rating
 */
function calculateRating(windowDays, finalSale, restockingFeePercent, hasWarranty) {
    // Red flag: Final sale with no warranty
    if (finalSale && !hasWarranty) {
        return 'red_flag';
    }
    // Risky: Final sale (but has warranty) OR very short window
    if (finalSale || windowDays < 7) {
        return 'risky';
    }
    // Excellent: 30+ days, no restocking fee
    if (windowDays >= 30 && restockingFeePercent === 0) {
        return 'excellent';
    }
    // Acceptable: 14+ days OR 7+ with reasonable fee
    if (windowDays >= 14 || (windowDays >= 7 && restockingFeePercent <= 15)) {
        return 'acceptable';
    }
    return 'risky';
}
/**
 * Identifies concerns with the return policy
 */
function identifyConcerns(windowDays, finalSale, restockingFeePercent) {
    const concerns = [];
    if (finalSale) {
        concerns.push('Final sale — no returns accepted');
    }
    if (windowDays < 7 && !finalSale) {
        concerns.push(`Very short return window (${windowDays} days)`);
    }
    else if (windowDays < 14 && !finalSale) {
        concerns.push(`Limited return window (${windowDays} days)`);
    }
    if (restockingFeePercent > 0) {
        concerns.push(`${restockingFeePercent}% restocking fee applies`);
    }
    return concerns;
}
/**
 * ReturnPolicyFilter.evaluate
 *
 * Pure function that evaluates return policy terms.
 */
export function evaluate(input) {
    const rules = [];
    const { returnPolicy, warranty } = input;
    const hasWarranty = warranty.retailerWarrantyMonths > 0 ||
        warranty.manufacturerCovered === true;
    // Rule: RETURN.BLOCKER.FINAL_SALE_NO_WARRANTY_V1
    if (returnPolicy.finalSale && !hasWarranty) {
        rules.push({
            ruleId: RETURN_BLOCKER_FINAL_SALE_NO_WARRANTY_V1,
            severity: 'blocker',
            passed: false,
            message: 'Final sale with no warranty — no recourse if unit fails',
            inputsUsed: ['returnPolicy.finalSale', 'warranty.retailerWarrantyMonths', 'warranty.manufacturerCovered'],
            outputsAffected: ['returnPolicyAssessment.rating'],
        });
    }
    // Rule: RETURN.WARNING.FINAL_SALE_V1
    if (returnPolicy.finalSale && hasWarranty) {
        rules.push({
            ruleId: RETURN_WARNING_FINAL_SALE_V1,
            severity: 'warning',
            passed: false,
            message: 'Final sale — warranty provides some protection, but no returns for cosmetic issues',
            inputsUsed: ['returnPolicy.finalSale'],
            outputsAffected: ['returnPolicyAssessment.concerns'],
        });
    }
    // Rule: RETURN.WARNING.SHORT_WINDOW_V1
    if (!returnPolicy.finalSale && returnPolicy.windowDays < 7) {
        rules.push({
            ruleId: RETURN_WARNING_SHORT_WINDOW_V1,
            severity: 'warning',
            passed: false,
            message: `Very short return window (${returnPolicy.windowDays} days) — limited time to identify issues`,
            inputsUsed: ['returnPolicy.windowDays'],
            outputsAffected: ['returnPolicyAssessment.concerns'],
        });
    }
    // Rule: RETURN.INFO.RESTOCKING_FEE_V1
    if (returnPolicy.restockingFeePercent > 0) {
        rules.push({
            ruleId: RETURN_INFO_RESTOCKING_FEE_V1,
            severity: 'info',
            passed: true,
            message: `${returnPolicy.restockingFeePercent}% restocking fee applies to returns`,
            inputsUsed: ['returnPolicy.restockingFeePercent'],
            outputsAffected: ['returnPolicyAssessment.concerns'],
        });
    }
    // Calculate rating and concerns
    const rating = calculateRating(returnPolicy.windowDays, returnPolicy.finalSale, returnPolicy.restockingFeePercent, hasWarranty);
    const concerns = identifyConcerns(returnPolicy.windowDays, returnPolicy.finalSale, returnPolicy.restockingFeePercent);
    // Rule: RETURN.RATING.ASSESSMENT_V1
    rules.push({
        ruleId: RETURN_RATING_V1,
        severity: 'info',
        passed: true,
        message: `Return policy rated as "${rating}"`,
        inputsUsed: ['returnPolicy.*'],
        outputsAffected: ['returnPolicyAssessment.rating'],
    });
    return {
        result: {
            rating,
            concerns,
        },
        rules,
    };
}
export const ReturnPolicyFilter = { evaluate };
//# sourceMappingURL=return-policy-filter.js.map