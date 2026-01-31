/**
 * Module 4: WarrantyEvaluator
 *
 * Execution Order: 4 (Depends on: PricingEngine)
 * Input: warranty.*, financial.savingsVsNew
 * Output: warrantyEvaluation.*
 *
 * Evaluates warranty coverage quality and identifies gaps.
 */
import { WARRANTY_SCORE_EXCELLENT_V1, WARRANTY_SCORE_ACCEPTABLE_V1, WARRANTY_SCORE_LIMITED_V1, WARRANTY_SCORE_UNACCEPTABLE_V1, WARRANTY_WARNING_LIMITED_COVERAGE_V1, WARRANTY_WARNING_NO_LABOR_INCLUDED_V1, WARRANTY_WARNING_UNKNOWN_MFG_V1, } from '../rules';
// Typical repair costs for warranty evaluation
const TYPICAL_REPAIR_COST = 300;
/**
 * Determines warranty score based on coverage details
 */
function calculateWarrantyScore(manufacturerCovered, retailerWarrantyMonths, laborIncluded) {
    // Excellent: Full manufacturer + 12mo+ retailer + labor
    if (manufacturerCovered === true &&
        retailerWarrantyMonths >= 12 &&
        laborIncluded) {
        return 'excellent';
    }
    // Acceptable: Some manufacturer OR decent retailer with labor
    if (manufacturerCovered === true ||
        (retailerWarrantyMonths >= 6 && laborIncluded)) {
        return 'acceptable';
    }
    // Limited: Short retailer warranty without labor
    if (retailerWarrantyMonths >= 3) {
        return 'limited';
    }
    // Unacceptable: Very short or no warranty
    return 'unacceptable';
}
/**
 * Determines risk level based on warranty score
 */
function getRiskLevel(score) {
    const riskMap = {
        excellent: 'low',
        acceptable: 'low',
        limited: 'medium',
        unacceptable: 'high',
    };
    return riskMap[score];
}
/**
 * Identifies coverage gaps in the warranty
 */
function identifyCoverageGaps(manufacturerCovered, retailerWarrantyMonths, laborIncluded, partsIncluded) {
    const gaps = [];
    if (manufacturerCovered === 'unknown') {
        gaps.push('Manufacturer warranty status unknown');
    }
    else if (manufacturerCovered === false) {
        gaps.push('No manufacturer warranty coverage');
    }
    if (retailerWarrantyMonths === 0) {
        gaps.push('No retailer warranty');
    }
    else if (retailerWarrantyMonths < 6) {
        gaps.push(`Short retailer warranty (${retailerWarrantyMonths} months)`);
    }
    if (!laborIncluded) {
        gaps.push('Labor costs not covered');
    }
    if (!partsIncluded) {
        gaps.push('Parts not covered');
    }
    return gaps;
}
/**
 * WarrantyEvaluator.evaluate
 *
 * Pure function that evaluates warranty coverage and identifies risks.
 */
export function evaluate(input, financial) {
    const rules = [];
    const { warranty } = input;
    const { savingsVsNew } = financial;
    // Calculate warranty score
    const score = calculateWarrantyScore(warranty.manufacturerCovered, warranty.retailerWarrantyMonths, warranty.laborIncluded);
    // Identify coverage gaps
    const coverageGaps = identifyCoverageGaps(warranty.manufacturerCovered, warranty.retailerWarrantyMonths, warranty.laborIncluded, warranty.partsIncluded);
    // Determine risk level
    const riskLevel = getRiskLevel(score);
    // Add score rule based on result
    const scoreRuleId = score === 'excellent'
        ? WARRANTY_SCORE_EXCELLENT_V1
        : score === 'acceptable'
            ? WARRANTY_SCORE_ACCEPTABLE_V1
            : score === 'limited'
                ? WARRANTY_SCORE_LIMITED_V1
                : WARRANTY_SCORE_UNACCEPTABLE_V1;
    rules.push({
        ruleId: scoreRuleId,
        severity: 'info',
        passed: true,
        message: `Warranty rated as "${score}"`,
        inputsUsed: [
            'warranty.manufacturerCovered',
            'warranty.retailerWarrantyMonths',
            'warranty.laborIncluded',
        ],
        outputsAffected: ['warrantyEvaluation.score'],
    });
    // Warning: Limited coverage with insufficient savings
    const savingsJustifiesRisk = savingsVsNew >= TYPICAL_REPAIR_COST * 3;
    if (warranty.retailerWarrantyMonths < 6 && !warranty.laborIncluded) {
        rules.push({
            ruleId: WARRANTY_WARNING_LIMITED_COVERAGE_V1,
            severity: 'warning',
            passed: savingsJustifiesRisk,
            message: savingsJustifiesRisk
                ? `Limited warranty, but savings ($${savingsVsNew}) justify the risk`
                : `Limited warranty may not justify savings if repairs needed`,
            inputsUsed: [
                'warranty.retailerWarrantyMonths',
                'warranty.laborIncluded',
                'financial.savingsVsNew',
            ],
            outputsAffected: ['warrantyEvaluation.riskLevel'],
        });
    }
    // Warning: No labor included
    if (!warranty.laborIncluded && warranty.retailerWarrantyMonths > 0) {
        rules.push({
            ruleId: WARRANTY_WARNING_NO_LABOR_INCLUDED_V1,
            severity: 'warning',
            passed: false,
            message: 'Warranty does not include labor — repair visits will cost extra',
            inputsUsed: ['warranty.laborIncluded'],
            outputsAffected: ['warrantyEvaluation.coverageGaps'],
        });
    }
    // Warning: Unknown manufacturer coverage
    if (warranty.manufacturerCovered === 'unknown') {
        rules.push({
            ruleId: WARRANTY_WARNING_UNKNOWN_MFG_V1,
            severity: 'warning',
            passed: false,
            message: 'Manufacturer warranty status unknown — verify before purchase',
            inputsUsed: ['warranty.manufacturerCovered'],
            outputsAffected: ['warrantyEvaluation.coverageGaps'],
        });
    }
    return {
        result: {
            score,
            coverageGaps,
            riskLevel,
        },
        rules,
    };
}
export const WarrantyEvaluator = { evaluate };
//# sourceMappingURL=warranty-evaluator.js.map