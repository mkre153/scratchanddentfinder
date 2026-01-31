/**
 * ScratchAndDentFinder Buyer's Tool — Main Compiler
 *
 * This is the orchestrator that executes all modules in the correct order,
 * handles early exits on blockers, and assembles the final output.
 *
 * CRITICAL: This compiler is deterministic. Given the same input and timestamp,
 * it ALWAYS produces the same output.
 */
import type { BuyerInput, CompilerOptions, CompilerOutput } from './schema';
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
export declare function compile(input: BuyerInput, options: CompilerOptions): CompilerOutput;
export { COMPILER_VERSION, SCHEMA_VERSION, RULESET_VERSION } from './schema';
export type { BuyerInput, CompilerOutput, CompilerOptions } from './schema';
//# sourceMappingURL=compiler.d.ts.map