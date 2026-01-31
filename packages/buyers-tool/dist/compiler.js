/**
 * ScratchAndDentFinder Buyer's Tool — Main Compiler
 *
 * This is the orchestrator that executes all modules in the correct order,
 * handles early exits on blockers, and assembles the final output.
 *
 * CRITICAL: This compiler is deterministic. Given the same input and timestamp,
 * it ALWAYS produces the same output.
 */
import { COMPILER_VERSION, SCHEMA_VERSION, RULESET_VERSION } from './schema';
import { DamageClassifier } from './modules/damage-classifier';
import { PricingEngine } from './modules/pricing-engine';
import { SafetyGate } from './modules/safety-gate';
import { WarrantyEvaluator } from './modules/warranty-evaluator';
import { ReturnPolicyFilter } from './modules/return-policy-filter';
import { NegotiationEngine } from './modules/negotiation-engine';
import { LogisticsSolver } from './modules/logistics-solver';
import { VerdictCompiler } from './modules/verdict-compiler';
/**
 * Computes a deterministic hash of the input for caching/dedup.
 * Uses a simple string-based hash for portability.
 */
function computeInputHash(input) {
    const str = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to hex and ensure positive
    return Math.abs(hash).toString(16).padStart(8, '0');
}
/**
 * Creates default (empty) result objects for modules that didn't run
 * (used when execution halts early due to blockers)
 */
function createDefaultWarrantyEvaluation() {
    return {
        score: 'unacceptable',
        coverageGaps: ['Evaluation not completed due to safety blockers'],
        riskLevel: 'high',
    };
}
function createDefaultReturnPolicyAssessment() {
    return {
        rating: 'red_flag',
        concerns: ['Evaluation not completed due to safety blockers'],
    };
}
function createDefaultNegotiation() {
    return {
        possible: false,
        probability: 'unlikely',
        suggestedTargetPrice: 0,
        leveragePoints: [],
        alternativeAsks: [],
    };
}
function createDefaultLogistics() {
    return {
        deliveryRecommendation: 'professional',
        deliveryReason: 'Evaluation not completed due to safety blockers',
        transportRequirements: [],
        installationNotes: [],
    };
}
/**
 * The main compile function.
 *
 * Executes all modules in order, halting on blockers.
 * Produces a complete, traceable output.
 *
 * @param input - The buyer's input data
 * @param options - Compiler options (must include timestamp for determinism)
 * @returns Complete compiler output with verdict and trace
 */
export function compile(input, options) {
    const allRules = [];
    const executionOrder = [];
    let haltedAtModule = null;
    let haltedByRuleId = null;
    // Compute input hash for caching/dedup
    const inputHash = computeInputHash(input);
    // ─────────────────────────────────────────────────────────────
    // Module 1: DamageClassifier (No dependencies)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('DamageClassifier');
    const damageOutput = DamageClassifier.evaluate(input);
    allRules.push(...damageOutput.rules);
    // ─────────────────────────────────────────────────────────────
    // Module 2: PricingEngine (Depends on: DamageClassifier)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('PricingEngine');
    const pricingOutput = PricingEngine.evaluate(input, damageOutput.result);
    allRules.push(...pricingOutput.rules);
    // ─────────────────────────────────────────────────────────────
    // Module 3: SafetyGate (No dependencies - reads input only)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('SafetyGate');
    const safetyOutput = SafetyGate.evaluate(input);
    allRules.push(...safetyOutput.rules);
    // ⚠️ EARLY EXIT: Check for blockers
    const firstBlocker = safetyOutput.rules.find((r) => r.severity === 'blocker' && !r.passed);
    if (firstBlocker) {
        haltedAtModule = 'SafetyGate';
        haltedByRuleId = firstBlocker.ruleId;
        // Create WALK_AWAY verdict
        const walkAwayVerdict = {
            recommendation: 'WALK_AWAY',
            confidence: 'high',
            summary: `Cannot proceed: ${firstBlocker.message}`,
        };
        return {
            verdict: walkAwayVerdict,
            financial: pricingOutput.result,
            damageAssessment: damageOutput.result,
            warrantyEvaluation: createDefaultWarrantyEvaluation(),
            safetyGate: safetyOutput.result,
            negotiation: createDefaultNegotiation(),
            logistics: createDefaultLogistics(),
            returnPolicyAssessment: createDefaultReturnPolicyAssessment(),
            _trace: {
                rules: allRules,
                executionOrder,
                haltedAtModule,
                haltedByRuleId,
                compilerVersion: COMPILER_VERSION,
                schemaVersion: SCHEMA_VERSION,
                rulesetVersion: RULESET_VERSION,
                timestamp: options.timestamp,
                inputHash,
            },
        };
    }
    // ─────────────────────────────────────────────────────────────
    // Module 4: WarrantyEvaluator (Depends on: PricingEngine)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('WarrantyEvaluator');
    const warrantyOutput = WarrantyEvaluator.evaluate(input, pricingOutput.result);
    allRules.push(...warrantyOutput.rules);
    // ─────────────────────────────────────────────────────────────
    // Module 5: ReturnPolicyFilter (No dependencies - reads input only)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('ReturnPolicyFilter');
    const returnPolicyOutput = ReturnPolicyFilter.evaluate(input);
    allRules.push(...returnPolicyOutput.rules);
    // ⚠️ Check for return policy blockers (final sale + no warranty)
    const returnBlocker = returnPolicyOutput.rules.find((r) => r.severity === 'blocker' && !r.passed);
    if (returnBlocker) {
        haltedAtModule = 'ReturnPolicyFilter';
        haltedByRuleId = returnBlocker.ruleId;
        const walkAwayVerdict = {
            recommendation: 'WALK_AWAY',
            confidence: 'high',
            summary: `Cannot proceed: ${returnBlocker.message}`,
        };
        return {
            verdict: walkAwayVerdict,
            financial: pricingOutput.result,
            damageAssessment: damageOutput.result,
            warrantyEvaluation: warrantyOutput.result,
            safetyGate: safetyOutput.result,
            negotiation: createDefaultNegotiation(),
            logistics: createDefaultLogistics(),
            returnPolicyAssessment: returnPolicyOutput.result,
            _trace: {
                rules: allRules,
                executionOrder,
                haltedAtModule,
                haltedByRuleId,
                compilerVersion: COMPILER_VERSION,
                schemaVersion: SCHEMA_VERSION,
                rulesetVersion: RULESET_VERSION,
                timestamp: options.timestamp,
                inputHash,
            },
        };
    }
    // ─────────────────────────────────────────────────────────────
    // Module 6: NegotiationEngine (Depends on: DamageClassifier, PricingEngine)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('NegotiationEngine');
    const negotiationOutput = NegotiationEngine.evaluate(input, damageOutput.result, pricingOutput.result);
    allRules.push(...negotiationOutput.rules);
    // ─────────────────────────────────────────────────────────────
    // Module 7: LogisticsSolver (No dependencies - reads input only)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('LogisticsSolver');
    const logisticsOutput = LogisticsSolver.evaluate(input);
    allRules.push(...logisticsOutput.rules);
    // ─────────────────────────────────────────────────────────────
    // Module 8: VerdictCompiler (Depends on: ALL prior modules)
    // ─────────────────────────────────────────────────────────────
    executionOrder.push('VerdictCompiler');
    const verdictOutput = VerdictCompiler.evaluate(allRules, input.buyer);
    allRules.push(...verdictOutput.rules);
    // ─────────────────────────────────────────────────────────────
    // Assemble final output
    // ─────────────────────────────────────────────────────────────
    return {
        verdict: verdictOutput.result,
        financial: pricingOutput.result,
        damageAssessment: damageOutput.result,
        warrantyEvaluation: warrantyOutput.result,
        safetyGate: safetyOutput.result,
        negotiation: negotiationOutput.result,
        logistics: logisticsOutput.result,
        returnPolicyAssessment: returnPolicyOutput.result,
        _trace: {
            rules: allRules,
            executionOrder,
            haltedAtModule: null,
            haltedByRuleId: null,
            compilerVersion: COMPILER_VERSION,
            schemaVersion: SCHEMA_VERSION,
            rulesetVersion: RULESET_VERSION,
            timestamp: options.timestamp,
            inputHash,
        },
    };
}
// Re-export types and constants for convenience
export { COMPILER_VERSION, SCHEMA_VERSION, RULESET_VERSION } from './schema';
//# sourceMappingURL=compiler.js.map