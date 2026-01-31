/**
 * Module 8: VerdictCompiler
 *
 * Execution Order: 8 (Depends on: ALL prior modules)
 * Input: All prior module outputs + aggregated RuleResults, buyer context
 * Output: verdict.*
 *
 * Aggregates all rule results and produces final recommendation.
 */
import { THRESHOLDS, VERDICT_THRESHOLD_BLOCKER_COUNT_V1, VERDICT_THRESHOLD_WARNING_SKIP_V1, VERDICT_THRESHOLD_WARNING_CAUTION_V1, VERDICT_RISK_TOLERANCE_ADJUSTMENT_V1, VERDICT_DECIDE_WALK_AWAY_V1, VERDICT_DECIDE_SKIP_V1, VERDICT_DECIDE_CAUTION_V1, VERDICT_DECIDE_PROCEED_V1, } from '../rules';
/**
 * Filters rules to find failed blockers
 */
function getFailedBlockers(rules) {
    return rules.filter((r) => r.severity === 'blocker' && !r.passed);
}
/**
 * Filters rules to find failed warnings
 */
function getFailedWarnings(rules) {
    return rules.filter((r) => r.severity === 'warning' && !r.passed);
}
/**
 * Risk tolerance threshold adjustments
 * These are explicit, addressable configurations — not hidden logic
 */
const RISK_TOLERANCE_ADJUSTMENTS = {
    low: {
        skipThreshold: 2, // Stricter: Skip with fewer warnings
        cautionThreshold: 1, // Same as base
    },
    moderate: {
        skipThreshold: 3, // Base threshold
        cautionThreshold: 1, // Base threshold
    },
    high: {
        skipThreshold: 4, // More lenient: Allow more warnings
        cautionThreshold: 1, // Same as base
    },
};
/**
 * Returns thresholds based on risk tolerance
 * All values come from the explicit RISK_TOLERANCE_ADJUSTMENTS table
 */
function getAdjustedThresholds(riskTolerance) {
    const adjustment = RISK_TOLERANCE_ADJUSTMENTS[riskTolerance];
    return {
        [VERDICT_THRESHOLD_BLOCKER_COUNT_V1]: THRESHOLDS[VERDICT_THRESHOLD_BLOCKER_COUNT_V1],
        [VERDICT_THRESHOLD_WARNING_SKIP_V1]: adjustment.skipThreshold,
        [VERDICT_THRESHOLD_WARNING_CAUTION_V1]: adjustment.cautionThreshold,
    };
}
/**
 * Generates a human-readable summary of the verdict
 */
function generateSummary(recommendation, blockers, warnings) {
    switch (recommendation) {
        case 'WALK_AWAY':
            if (blockers.length === 1 && blockers[0]) {
                return `Cannot proceed: ${blockers[0].message}`;
            }
            return `Cannot proceed: ${blockers.length} safety issues identified`;
        case 'SKIP':
            return `Too many concerns: ${warnings.length} issues identified`;
        case 'PROCEED_WITH_CAUTION':
            if (warnings.length === 1 && warnings[0]) {
                return `Caution advised: ${warnings[0].message}`;
            }
            return `Caution advised: ${warnings.map((w) => w.message).join('; ')}`;
        case 'PROCEED':
            return 'All checks passed — this appears to be a good deal';
    }
}
/**
 * Determines confidence level based on warning count
 */
function getConfidence(recommendation, warningCount) {
    if (recommendation === 'WALK_AWAY') {
        return 'high'; // We're very confident you should walk away
    }
    if (recommendation === 'PROCEED') {
        return 'high'; // We're very confident it's a good deal
    }
    // For SKIP and PROCEED_WITH_CAUTION, confidence decreases with more warnings
    if (warningCount === 1) {
        return 'medium';
    }
    return 'low';
}
/**
 * VerdictCompiler.evaluate
 *
 * Pure function that aggregates all rules and produces final recommendation.
 */
export function evaluate(allRules, buyer) {
    const rules = [];
    // Get failed blockers and warnings
    const blockers = getFailedBlockers(allRules);
    const warnings = getFailedWarnings(allRules);
    // Get thresholds (adjusted for risk tolerance via explicit table)
    const thresholds = getAdjustedThresholds(buyer.riskTolerance);
    const baseSkipThreshold = THRESHOLDS[VERDICT_THRESHOLD_WARNING_SKIP_V1];
    const adjustedSkipThreshold = thresholds[VERDICT_THRESHOLD_WARNING_SKIP_V1];
    // Document risk tolerance adjustment if thresholds changed
    if (buyer.riskTolerance !== 'moderate') {
        rules.push({
            ruleId: VERDICT_RISK_TOLERANCE_ADJUSTMENT_V1,
            severity: 'info',
            passed: true,
            message: `Risk tolerance "${buyer.riskTolerance}" adjusted skip threshold: ${baseSkipThreshold} → ${adjustedSkipThreshold}`,
            inputsUsed: ['buyer.riskTolerance'],
            outputsAffected: ['verdict.recommendation'],
        });
    }
    // Document threshold rules
    rules.push({
        ruleId: VERDICT_THRESHOLD_BLOCKER_COUNT_V1,
        severity: 'info',
        passed: true,
        message: `Blocker threshold: ${thresholds[VERDICT_THRESHOLD_BLOCKER_COUNT_V1]} (found: ${blockers.length})`,
        inputsUsed: ['buyer.riskTolerance'],
        outputsAffected: [],
    });
    rules.push({
        ruleId: VERDICT_THRESHOLD_WARNING_SKIP_V1,
        severity: 'info',
        passed: true,
        message: `Warning skip threshold: ${thresholds[VERDICT_THRESHOLD_WARNING_SKIP_V1]} (found: ${warnings.length})`,
        inputsUsed: ['buyer.riskTolerance'],
        outputsAffected: [],
    });
    rules.push({
        ruleId: VERDICT_THRESHOLD_WARNING_CAUTION_V1,
        severity: 'info',
        passed: true,
        message: `Warning caution threshold: ${thresholds[VERDICT_THRESHOLD_WARNING_CAUTION_V1]} (found: ${warnings.length})`,
        inputsUsed: ['buyer.riskTolerance'],
        outputsAffected: [],
    });
    // Decision logic
    let recommendation;
    let decisionRuleId;
    let decisionMessage;
    // VERDICT.DECIDE.WALK_AWAY_V1
    if (blockers.length >= thresholds[VERDICT_THRESHOLD_BLOCKER_COUNT_V1]) {
        recommendation = 'WALK_AWAY';
        decisionRuleId = VERDICT_DECIDE_WALK_AWAY_V1;
        decisionMessage = `${blockers.length} blocker(s) found — recommending WALK_AWAY`;
    }
    // VERDICT.DECIDE.SKIP_V1
    else if (warnings.length >= thresholds[VERDICT_THRESHOLD_WARNING_SKIP_V1]) {
        recommendation = 'SKIP';
        decisionRuleId = VERDICT_DECIDE_SKIP_V1;
        decisionMessage = `${warnings.length} warnings (threshold: ${thresholds[VERDICT_THRESHOLD_WARNING_SKIP_V1]}) — recommending SKIP`;
    }
    // VERDICT.DECIDE.CAUTION_V1
    else if (warnings.length >= thresholds[VERDICT_THRESHOLD_WARNING_CAUTION_V1]) {
        recommendation = 'PROCEED_WITH_CAUTION';
        decisionRuleId = VERDICT_DECIDE_CAUTION_V1;
        decisionMessage = `${warnings.length} warning(s) found — recommending PROCEED_WITH_CAUTION`;
    }
    // VERDICT.DECIDE.PROCEED_V1
    else {
        recommendation = 'PROCEED';
        decisionRuleId = VERDICT_DECIDE_PROCEED_V1;
        decisionMessage = 'All checks passed — recommending PROCEED';
    }
    const confidence = getConfidence(recommendation, warnings.length);
    const summary = generateSummary(recommendation, blockers, warnings);
    // Add decision rule
    rules.push({
        ruleId: decisionRuleId,
        severity: 'info',
        passed: true,
        message: decisionMessage,
        inputsUsed: blockers.map((b) => b.ruleId).concat(warnings.map((w) => w.ruleId)),
        outputsAffected: ['verdict.recommendation', 'verdict.confidence', 'verdict.summary'],
    });
    return {
        result: {
            recommendation,
            confidence,
            summary,
        },
        rules,
    };
}
export const VerdictCompiler = { evaluate };
//# sourceMappingURL=verdict-compiler.js.map