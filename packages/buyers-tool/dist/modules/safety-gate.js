/**
 * Module 3: SafetyGate
 *
 * Execution Order: 3 (No dependencies - reads input only)
 * Input: inspection.*
 * Output: safetyGate.*
 *
 * Evaluates safety-related inspection results.
 * BLOCKER rules from this module halt execution immediately.
 */
import { SAFETY_BLOCKER_RUST_DETECTED_V1, SAFETY_BLOCKER_WATER_DAMAGE_V1, SAFETY_BLOCKER_CORD_DAMAGED_V1, SAFETY_BLOCKER_ODOR_DETECTED_V1, SAFETY_BLOCKER_MISSING_PARTS_V1, SAFETY_WARNING_PRIOR_REPAIRS_V1, SAFETY_WARNING_UNUSUAL_SOUNDS_V1, SAFETY_INFO_POWER_ON_WORKS_V1, } from '../rules';
/**
 * Blocker conditions - any one forces WALK_AWAY
 */
const BLOCKER_CONDITIONS = [
    {
        id: SAFETY_BLOCKER_RUST_DETECTED_V1,
        check: (insp) => insp.rustPresent,
        message: 'Rust detected on unit — indicates potential internal corrosion',
    },
    {
        id: SAFETY_BLOCKER_WATER_DAMAGE_V1,
        check: (insp) => insp.waterStains,
        message: 'Water damage signs present — risk of electrical hazard',
    },
    {
        id: SAFETY_BLOCKER_CORD_DAMAGED_V1,
        check: (insp) => insp.cordDamaged,
        message: 'Electrical cord is damaged — fire and shock hazard',
    },
    {
        id: SAFETY_BLOCKER_ODOR_DETECTED_V1,
        check: (insp) => insp.odorsPresent,
        message: 'Unusual odors detected — may indicate burning or mold',
    },
    {
        id: SAFETY_BLOCKER_MISSING_PARTS_V1,
        check: (insp) => insp.missingParts,
        message: 'Parts or components missing — unit may not function properly',
    },
];
/**
 * Warning conditions - proceed with caution
 */
const WARNING_CONDITIONS = [
    {
        id: SAFETY_WARNING_PRIOR_REPAIRS_V1,
        check: (insp) => insp.priorRepairsEvident,
        message: 'Prior repairs evident — unknown repair quality',
    },
    {
        id: SAFETY_WARNING_UNUSUAL_SOUNDS_V1,
        check: (insp) => insp.unusualSounds,
        message: 'Unusual sounds during operation — may indicate mechanical issues',
    },
];
/**
 * SafetyGate.evaluate
 *
 * Pure function that evaluates inspection results for safety concerns.
 * Returns blockers that should halt evaluation and warnings for caution.
 */
export function evaluate(input) {
    const rules = [];
    const blockers = [];
    const warnings = [];
    const failures = [];
    // If no inspection data provided, we can't assess safety
    if (!input.inspection) {
        return {
            result: {
                passed: true,
                failures: [],
                blockers: [],
                warnings: ['No inspection data provided — consider inspecting before purchase'],
            },
            rules: [],
        };
    }
    const inspection = input.inspection;
    // Evaluate blocker conditions
    for (const condition of BLOCKER_CONDITIONS) {
        const triggered = condition.check(inspection);
        if (triggered) {
            blockers.push(condition.message);
            failures.push(condition.message);
        }
        const rulePart = condition.id.split('.')[2] ?? 'issue';
        rules.push({
            ruleId: condition.id,
            severity: 'blocker',
            passed: !triggered,
            message: triggered ? condition.message : `No ${rulePart.toLowerCase().replace('_v1', '')} detected`,
            inputsUsed: ['inspection.*'],
            outputsAffected: ['safetyGate.passed', 'safetyGate.blockers'],
        });
    }
    // Evaluate warning conditions
    for (const condition of WARNING_CONDITIONS) {
        const triggered = condition.check(inspection);
        if (triggered) {
            warnings.push(condition.message);
        }
        const warningPart = condition.id.split('.')[2] ?? 'issue';
        rules.push({
            ruleId: condition.id,
            severity: 'warning',
            passed: !triggered,
            message: triggered ? condition.message : `No ${warningPart.toLowerCase().replace('_v1', '')} issues`,
            inputsUsed: ['inspection.*'],
            outputsAffected: ['safetyGate.warnings'],
        });
    }
    // Info: Power-on test result
    rules.push({
        ruleId: SAFETY_INFO_POWER_ON_WORKS_V1,
        severity: 'info',
        passed: inspection.powerOnWorks,
        message: inspection.powerOnWorks
            ? 'Unit powers on and operates correctly'
            : 'Unit failed power-on test',
        inputsUsed: ['inspection.powerOnWorks'],
        outputsAffected: ['safetyGate.passed'],
    });
    // If power-on fails, add to warnings (not a blocker, but concerning)
    if (!inspection.powerOnWorks) {
        warnings.push('Unit failed power-on test — request demonstration before purchase');
    }
    const passed = blockers.length === 0;
    return {
        result: {
            passed,
            failures,
            blockers,
            warnings,
        },
        rules,
    };
}
export const SafetyGate = { evaluate };
//# sourceMappingURL=safety-gate.js.map