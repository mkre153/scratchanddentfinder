/**
 * Module 1: DamageClassifier
 *
 * Execution Order: 1 (No dependencies)
 * Input: damage.locations[], installation.*
 * Output: damageAssessment.*
 *
 * Classifies damage into tiers based on visibility in the buyer's
 * installation context.
 */
import { DAMAGE_TIER_ASSIGNMENT_V1, DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1, TIER1_LOCATIONS, TIER3_LOCATIONS, } from '../rules';
/**
 * Maps damage locations to the visible side of the appliance
 */
function mapLocationToSide(location) {
    const mapping = {
        front_door: 'front',
        front_panel: 'front',
        control_panel: 'front',
        handle: 'front',
        left_side: 'left',
        right_side: 'right',
        back: null, // Back is never visible in normal installations
        top: 'top',
        bottom: null, // Bottom is never visible
    };
    return mapping[location];
}
/**
 * Determines damage tier based on damage locations
 * Tier 1: Hidden when installed (back, bottom, top)
 * Tier 2: Partially visible (sides)
 * Tier 3: Prominently visible (front areas)
 */
function calculateTier(locations) {
    // If all damage is in hidden locations → Tier 1
    const allHidden = locations.every((loc) => TIER1_LOCATIONS.includes(loc));
    if (allHidden) {
        return 1;
    }
    // If any damage is in prominent locations → Tier 3
    const anyProminent = locations.some((loc) => TIER3_LOCATIONS.includes(loc));
    if (anyProminent) {
        return 3;
    }
    // Otherwise → Tier 2 (sides)
    return 2;
}
/**
 * Gets the human-readable label for a damage tier
 */
function getTierLabel(tier) {
    const labels = {
        1: 'Hidden',
        2: 'Partially Visible',
        3: 'Prominently Visible',
    };
    return labels[tier];
}
/**
 * Determines visibility impact based on tier
 */
function getVisibilityImpact(tier) {
    const impacts = {
        1: 'minimal',
        2: 'moderate',
        3: 'significant',
    };
    return impacts[tier];
}
/**
 * Checks if any damage location will be visible given the installation context
 */
function checkVisibilityInInstallation(locations, visibleSides) {
    return locations.some((loc) => {
        const side = mapLocationToSide(loc);
        return side !== null && visibleSides.includes(side);
    });
}
/**
 * DamageClassifier.evaluate
 *
 * Pure function that classifies damage based on location and installation context.
 */
export function evaluate(input) {
    const rules = [];
    const { damage, installation } = input;
    // Rule: DAMAGE.TIER.ASSIGNMENT_V1
    const tier = calculateTier(damage.locations);
    const tierLabel = getTierLabel(tier);
    const visibilityImpact = getVisibilityImpact(tier);
    rules.push({
        ruleId: DAMAGE_TIER_ASSIGNMENT_V1,
        severity: 'info',
        passed: true,
        message: `Damage classified as Tier ${tier} (${tierLabel})`,
        inputsUsed: ['damage.locations'],
        outputsAffected: ['damageAssessment.tier', 'damageAssessment.tierLabel', 'damageAssessment.visibilityImpact'],
    });
    // Rule: DAMAGE.VISIBILITY.INSTALLATION_CHECK_V1
    const visibleInInstallation = checkVisibilityInInstallation(damage.locations, installation.visibleSides);
    const acceptableForInstallation = !visibleInInstallation || tier === 1;
    if (visibleInInstallation) {
        rules.push({
            ruleId: DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1,
            severity: 'warning',
            passed: false,
            message: 'Damage will be visible in your installation configuration',
            inputsUsed: ['damage.locations', 'installation.visibleSides'],
            outputsAffected: ['damageAssessment.acceptableForInstallation'],
        });
    }
    else {
        rules.push({
            ruleId: DAMAGE_VISIBILITY_INSTALLATION_CHECK_V1,
            severity: 'warning',
            passed: true,
            message: 'Damage will not be visible in your installation configuration',
            inputsUsed: ['damage.locations', 'installation.visibleSides'],
            outputsAffected: ['damageAssessment.acceptableForInstallation'],
        });
    }
    return {
        result: {
            tier,
            tierLabel,
            visibilityImpact,
            acceptableForInstallation,
        },
        rules,
    };
}
export const DamageClassifier = { evaluate };
//# sourceMappingURL=damage-classifier.js.map