/**
 * Trace Summarization Utility
 *
 * Converts the raw compiler trace into human-readable explanations.
 * Useful for UI display, debugging, and audit logs.
 */
const DEFAULT_OPTIONS = {
    includeInfo: false,
    includePassed: false,
    maxItems: 10,
};
/**
 * Groups rules by their module (extracted from rule ID)
 */
function getModuleFromRuleId(ruleId) {
    const parts = ruleId.split('.');
    return parts[0] ?? 'UNKNOWN';
}
/**
 * Formats a rule result into a human-readable line
 */
function formatRule(rule) {
    const icon = rule.passed ? '✓' : rule.severity === 'blocker' ? '✗' : '⚠';
    const severityLabel = rule.severity.toUpperCase();
    return `${icon} [${severityLabel}] ${rule.message}`;
}
/**
 * Summarizes a compiler trace into human-readable lines.
 *
 * @param trace - The compiler trace from CompilerOutput._trace
 * @param options - Summary options
 * @returns Array of human-readable summary lines
 *
 * @example
 * ```typescript
 * const output = compile(input, { timestamp: '...' });
 * const summary = summarizeTrace(output._trace);
 * summary.forEach(line => console.log(line));
 * ```
 */
export function summarizeTrace(trace, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const lines = [];
    // Header with version info
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('                    DECISION TRACE SUMMARY                  ');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Compiler: v${trace.compilerVersion}  Schema: v${trace.schemaVersion}  Ruleset: ${trace.rulesetVersion}`);
    lines.push(`Timestamp: ${trace.timestamp}`);
    lines.push(`Input Hash: ${trace.inputHash}`);
    lines.push('');
    // Execution status
    if (trace.haltedAtModule) {
        lines.push('⛔ EXECUTION HALTED');
        lines.push(`   Module: ${trace.haltedAtModule}`);
        lines.push(`   Rule: ${trace.haltedByRuleId}`);
        lines.push('');
    }
    else {
        lines.push(`✓ Completed all ${trace.executionOrder.length} modules`);
        lines.push('');
    }
    // Separate rules by outcome
    const blockers = trace.rules.filter(r => r.severity === 'blocker' && !r.passed);
    const warnings = trace.rules.filter(r => r.severity === 'warning' && !r.passed);
    const passedBlockers = trace.rules.filter(r => r.severity === 'blocker' && r.passed);
    const passedWarnings = trace.rules.filter(r => r.severity === 'warning' && r.passed);
    const infoRules = trace.rules.filter(r => r.severity === 'info');
    // Blockers section (always show if any)
    if (blockers.length > 0) {
        lines.push('───────────────────────────────────────────────────────────');
        lines.push(`🚫 BLOCKERS (${blockers.length}) — These prevent purchase`);
        lines.push('───────────────────────────────────────────────────────────');
        blockers.slice(0, opts.maxItems).forEach(rule => {
            lines.push(formatRule(rule));
            lines.push(`   Rule ID: ${rule.ruleId}`);
        });
        if (blockers.length > opts.maxItems) {
            lines.push(`   ... and ${blockers.length - opts.maxItems} more`);
        }
        lines.push('');
    }
    // Warnings section (always show if any)
    if (warnings.length > 0) {
        lines.push('───────────────────────────────────────────────────────────');
        lines.push(`⚠️  WARNINGS (${warnings.length}) — Proceed with caution`);
        lines.push('───────────────────────────────────────────────────────────');
        warnings.slice(0, opts.maxItems).forEach(rule => {
            lines.push(formatRule(rule));
            lines.push(`   Rule ID: ${rule.ruleId}`);
        });
        if (warnings.length > opts.maxItems) {
            lines.push(`   ... and ${warnings.length - opts.maxItems} more`);
        }
        lines.push('');
    }
    // Passed checks (optional)
    if (opts.includePassed) {
        const passedCount = passedBlockers.length + passedWarnings.length;
        if (passedCount > 0) {
            lines.push('───────────────────────────────────────────────────────────');
            lines.push(`✅ PASSED CHECKS (${passedCount})`);
            lines.push('───────────────────────────────────────────────────────────');
            [...passedBlockers, ...passedWarnings].slice(0, opts.maxItems).forEach(rule => {
                lines.push(formatRule(rule));
            });
            if (passedCount > opts.maxItems) {
                lines.push(`   ... and ${passedCount - opts.maxItems} more`);
            }
            lines.push('');
        }
    }
    // Info rules (optional)
    if (opts.includeInfo && infoRules.length > 0) {
        lines.push('───────────────────────────────────────────────────────────');
        lines.push(`ℹ️  INFO (${infoRules.length}) — Informational`);
        lines.push('───────────────────────────────────────────────────────────');
        infoRules.slice(0, opts.maxItems).forEach(rule => {
            lines.push(`  ${rule.message}`);
        });
        if (infoRules.length > opts.maxItems) {
            lines.push(`   ... and ${infoRules.length - opts.maxItems} more`);
        }
        lines.push('');
    }
    // Module execution order
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('📋 EXECUTION ORDER');
    lines.push('───────────────────────────────────────────────────────────');
    trace.executionOrder.forEach((module, idx) => {
        const isHaltPoint = module === trace.haltedAtModule;
        const marker = isHaltPoint ? ' ← HALTED' : '';
        lines.push(`  ${idx + 1}. ${module}${marker}`);
    });
    lines.push('');
    // Summary stats
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('📊 SUMMARY');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`  Total rules evaluated: ${trace.rules.length}`);
    lines.push(`  Blockers triggered: ${blockers.length}`);
    lines.push(`  Warnings triggered: ${warnings.length}`);
    lines.push(`  Safety checks passed: ${passedBlockers.length}`);
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    return lines;
}
/**
 * Returns a compact one-line summary of the trace.
 * Useful for logging.
 */
export function summarizeTraceCompact(trace) {
    const blockers = trace.rules.filter(r => r.severity === 'blocker' && !r.passed).length;
    const warnings = trace.rules.filter(r => r.severity === 'warning' && !r.passed).length;
    const halted = trace.haltedAtModule ? ` HALTED@${trace.haltedAtModule}` : '';
    return `[${trace.rulesetVersion}] ${trace.rules.length} rules, ${blockers} blockers, ${warnings} warnings${halted} (${trace.inputHash})`;
}
/**
 * Returns only the failed rules with their messages.
 * Useful for error displays.
 */
export function getFailedRuleSummaries(trace) {
    return trace.rules
        .filter(r => !r.passed && r.severity !== 'info')
        .map(r => `[${r.severity.toUpperCase()}] ${r.message}`);
}
/**
 * Groups rules by module for structured display.
 */
export function groupRulesByModule(trace) {
    const grouped = {};
    for (const rule of trace.rules) {
        const module = getModuleFromRuleId(rule.ruleId);
        const moduleRules = grouped[module] ?? [];
        moduleRules.push(rule);
        grouped[module] = moduleRules;
    }
    return grouped;
}
//# sourceMappingURL=summarize-trace.js.map