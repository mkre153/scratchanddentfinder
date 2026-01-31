/**
 * Module 7: LogisticsSolver
 *
 * Execution Order: 7 (No dependencies - reads input only)
 * Input: appliance.type, installation.*
 * Output: logistics.*
 *
 * Provides delivery and transport recommendations based on appliance type.
 */
import { LOGISTICS_DELIVERY_REFRIGERATOR_V1, LOGISTICS_DELIVERY_STACKED_V1, LOGISTICS_DELIVERY_GAS_V1, LOGISTICS_DELIVERY_DEFAULT_V1, LOGISTICS_TRANSPORT_REFRIGERATOR_V1, LOGISTICS_TRANSPORT_WASHER_V1, LOGISTICS_TRANSPORT_RANGE_V1, LOGISTICS_INSTALLATION_NOTES_V1, } from '../rules';
/**
 * Determines delivery recommendation based on appliance type and installation
 */
function determineDelivery(applianceType, installationType) {
    // Stacked units always require professional
    if (installationType === 'stacked') {
        return {
            recommendation: 'professional',
            reason: 'Stacked units require professional installation for safety',
            ruleId: LOGISTICS_DELIVERY_STACKED_V1,
        };
    }
    // Refrigerators are heavy and require careful handling
    if (applianceType === 'refrigerator') {
        return {
            recommendation: 'professional',
            reason: 'Refrigerators are heavy and require careful handling to avoid compressor damage',
            ruleId: LOGISTICS_DELIVERY_REFRIGERATOR_V1,
        };
    }
    // Ranges (especially gas) need professional installation
    if (applianceType === 'range') {
        return {
            recommendation: 'professional',
            reason: 'Ranges require proper gas or electrical hookup — professional recommended',
            ruleId: LOGISTICS_DELIVERY_GAS_V1,
        };
    }
    // Default for other appliances
    return {
        recommendation: 'either',
        reason: 'Self-transport possible if you have appropriate vehicle and help',
        ruleId: LOGISTICS_DELIVERY_DEFAULT_V1,
    };
}
/**
 * Generates transport requirements based on appliance type
 */
function getTransportRequirements(applianceType) {
    const requirements = [];
    switch (applianceType) {
        case 'refrigerator':
            requirements.push('Keep upright during transport');
            requirements.push('If tilted more than 45°, wait 24 hours before plugging in');
            requirements.push('Secure doors with tape or straps');
            requirements.push('Protect exterior with moving blankets');
            break;
        case 'washer':
            requirements.push('Install transit bolts before moving (check if included)');
            requirements.push('Disconnect and drain all hoses');
            requirements.push('Secure drum to prevent damage');
            break;
        case 'dryer':
            requirements.push('Disconnect power and vent');
            requirements.push('Clean lint trap and vent before moving');
            break;
        case 'range':
            requirements.push('Disconnect gas line (requires shutoff)');
            requirements.push('Cap gas line before transport');
            requirements.push('Secure oven door');
            requirements.push('Remove loose grates and burner covers');
            break;
        case 'dishwasher':
            requirements.push('Disconnect water supply and drain');
            requirements.push('Run empty cycle before disconnecting');
            requirements.push('Secure door latch');
            break;
        case 'microwave':
            requirements.push('Remove turntable and secure separately');
            requirements.push('Pack in original box if available');
            break;
    }
    // Common requirements
    requirements.push('Measure doorways and pathways before delivery');
    return requirements;
}
/**
 * Generates installation notes based on appliance type and installation context
 */
function getInstallationNotes(applianceType, installationType) {
    const notes = [];
    if (installationType === 'built_in') {
        notes.push('Verify cabinet opening dimensions match appliance specs');
        notes.push('Check ventilation requirements for built-in installation');
    }
    if (installationType === 'stacked') {
        notes.push('Verify floor can support combined weight');
        notes.push('Install stacking kit (may be sold separately)');
        notes.push('Ensure proper electrical connections for both units');
    }
    switch (applianceType) {
        case 'refrigerator':
            notes.push('Allow 1" clearance on sides and top for ventilation');
            notes.push('Level the unit using adjustable feet');
            notes.push('Wait 24 hours before loading food if unit was tilted');
            break;
        case 'washer':
            notes.push('Level washer to prevent excessive vibration');
            notes.push('Use braided stainless steel hoses (not rubber)');
            notes.push('Ensure drain standpipe is 30-36" high');
            break;
        case 'dryer':
            notes.push('Use rigid metal vent (not flexible foil)');
            notes.push('Keep vent run under 25 feet with minimal turns');
            notes.push('Clean vent path before connecting');
            break;
        case 'range':
            notes.push('Verify gas/electric matches your hookup');
            notes.push('Install anti-tip bracket (required by code)');
            notes.push('Test all burners and oven after installation');
            break;
        case 'dishwasher':
            notes.push('Install air gap or high loop on drain line');
            notes.push('Verify hot water supply is at least 120°F');
            notes.push('Level unit for proper door alignment');
            break;
    }
    return notes;
}
/**
 * LogisticsSolver.evaluate
 *
 * Pure function that provides delivery and transport guidance.
 */
export function evaluate(input) {
    const rules = [];
    const { appliance, installation } = input;
    // Determine delivery recommendation
    const delivery = determineDelivery(appliance.type, installation.type);
    rules.push({
        ruleId: delivery.ruleId,
        severity: 'info',
        passed: true,
        message: delivery.reason,
        inputsUsed: ['appliance.type', 'installation.type'],
        outputsAffected: ['logistics.deliveryRecommendation', 'logistics.deliveryReason'],
    });
    // Get transport requirements
    const transportRequirements = getTransportRequirements(appliance.type);
    // Add transport rule based on appliance type
    const transportRuleId = appliance.type === 'refrigerator'
        ? LOGISTICS_TRANSPORT_REFRIGERATOR_V1
        : appliance.type === 'washer'
            ? LOGISTICS_TRANSPORT_WASHER_V1
            : appliance.type === 'range'
                ? LOGISTICS_TRANSPORT_RANGE_V1
                : LOGISTICS_TRANSPORT_REFRIGERATOR_V1; // Default to refrigerator rule for other types
    rules.push({
        ruleId: transportRuleId,
        severity: 'info',
        passed: true,
        message: `${transportRequirements.length} transport requirements for ${appliance.type}`,
        inputsUsed: ['appliance.type'],
        outputsAffected: ['logistics.transportRequirements'],
    });
    // Get installation notes
    const installationNotes = getInstallationNotes(appliance.type, installation.type);
    rules.push({
        ruleId: LOGISTICS_INSTALLATION_NOTES_V1,
        severity: 'info',
        passed: true,
        message: `${installationNotes.length} installation notes for ${installation.type} ${appliance.type}`,
        inputsUsed: ['appliance.type', 'installation.type'],
        outputsAffected: ['logistics.installationNotes'],
    });
    return {
        result: {
            deliveryRecommendation: delivery.recommendation,
            deliveryReason: delivery.reason,
            transportRequirements,
            installationNotes,
        },
        rules,
    };
}
export const LogisticsSolver = { evaluate };
//# sourceMappingURL=logistics-solver.js.map