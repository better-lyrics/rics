export type {
  CompilerConfig,
  CompileResult,
  CompileError,
  CompileWarning,
  SourceLocation,
} from "./types";

export { ErrorCode } from "./types";

export {
  compile,
  compileWithDetails,
  compileAsync,
  createCompiler,
  defaultConfig,
} from "./compiler";

export const version = "0.1.0";
