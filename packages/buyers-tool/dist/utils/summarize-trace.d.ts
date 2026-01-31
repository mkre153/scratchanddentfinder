/**
 * Trace Summarization Utility
 *
 * Converts the raw compiler trace into human-readable explanations.
 * Useful for UI display, debugging, and audit logs.
 */
import type { CompilerTrace, RuleResult } from '../schema';
export interface TraceSummaryOptions {
    /** Include info-level rules (default: false) */
    includeInfo?: boolean;
    /** Include passed rules (default: false) */
    includePassed?: boolean;
    /** Maximum number of items per section (default: 10) */
    maxItems?: number;
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
export declare function summarizeTrace(trace: CompilerTrace, options?: TraceSummaryOptions): string[];
/**
 * Returns a compact one-line summary of the trace.
 * Useful for logging.
 */
export declare function summarizeTraceCompact(trace: CompilerTrace): string;
/**
 * Returns only the failed rules with their messages.
 * Useful for error displays.
 */
export declare function getFailedRuleSummaries(trace: CompilerTrace): string[];
/**
 * Groups rules by module for structured display.
 */
export declare function groupRulesByModule(trace: CompilerTrace): Record<string, RuleResult[]>;
//# sourceMappingURL=summarize-trace.d.ts.map