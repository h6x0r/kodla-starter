import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import * as http from "http";
import * as https from "https";

/**
 * Piston Language Runtime Configuration
 */
export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

/**
 * Piston Execution Request
 */
export interface PistonExecuteRequest {
  language: string;
  version?: string;
  files: { name?: string; content: string }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

/**
 * Piston Execution Response
 */
export interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
    memory?: number; // Memory usage in bytes
    cpu_time?: number; // CPU time in milliseconds
    wall_time?: number; // Wall clock time in milliseconds
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
    memory?: number;
    cpu_time?: number;
    wall_time?: number;
  };
}

/**
 * Normalized execution result (compatible with existing API)
 */
export interface ExecutionResult {
  status: "passed" | "failed" | "error" | "timeout" | "compileError";
  statusId: number;
  description: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  time: string;
  memory: number;
  exitCode: number | null;
  message?: string;
}

/**
 * Language configuration mapping
 */
export interface LanguageConfig {
  pistonName: string;
  version?: string;
  name: string;
  extension: string;
  monacoId: string;
  timeLimit: number;
  memoryLimit: number;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  go: {
    pistonName: "go",
    name: "Go",
    extension: ".go",
    monacoId: "go",
    timeLimit: 180000, // Go 1.21+ on ARM emulation needs ~60s for compilation
    memoryLimit: 512 * 1024 * 1024, // 512MB for Go 1.21+ compiler
  },
  java: {
    pistonName: "java",
    name: "Java",
    extension: ".java",
    monacoId: "java",
    timeLimit: 60000, // Java needs more time for compilation on ARM
    memoryLimit: 512 * 1024 * 1024,
  },
  javascript: {
    pistonName: "javascript",
    name: "JavaScript",
    extension: ".js",
    monacoId: "javascript",
    timeLimit: 5000,
    memoryLimit: 256 * 1024 * 1024,
  },
  typescript: {
    pistonName: "typescript",
    name: "TypeScript",
    extension: ".ts",
    monacoId: "typescript",
    timeLimit: 10000,
    memoryLimit: 256 * 1024 * 1024,
  },
  python: {
    pistonName: "python",
    name: "Python",
    extension: ".py",
    monacoId: "python",
    timeLimit: 10000,
    memoryLimit: 256 * 1024 * 1024,
  },
  rust: {
    pistonName: "rust",
    name: "Rust",
    extension: ".rs",
    monacoId: "rust",
    timeLimit: 10000,
    memoryLimit: 256 * 1024 * 1024,
  },
  cpp: {
    pistonName: "c++",
    name: "C++",
    extension: ".cpp",
    monacoId: "cpp",
    timeLimit: 5000,
    memoryLimit: 256 * 1024 * 1024,
  },
  c: {
    pistonName: "c",
    name: "C",
    extension: ".c",
    monacoId: "c",
    timeLimit: 5000,
    memoryLimit: 256 * 1024 * 1024,
  },
};

/**
 * Piston server limits (detected at runtime)
 */
export interface PistonLimits {
  compileTimeout: number; // Max compile timeout in ms
  runTimeout: number; // Max run timeout in ms
  memoryLimit: number; // Max memory limit in bytes
  detected: boolean; // Whether limits were successfully detected
}

/**
 * Default Piston limits (conservative fallback)
 * These are used when we can't detect the actual Piston limits
 */
const DEFAULT_PISTON_LIMITS: PistonLimits = {
  compileTimeout: 10000, // 10 seconds - safe default
  runTimeout: 10000, // 10 seconds - safe default
  memoryLimit: 256 * 1024 * 1024, // 256MB
  detected: false,
};

/**
 * Recommended Piston limits for production
 * Used for logging warnings when actual limits are lower
 */
const RECOMMENDED_PISTON_LIMITS = {
  compileTimeout: 180000, // 180 seconds for Go/Java compilation
  runTimeout: 60000, // 60 seconds for test execution
  memoryLimit: 512 * 1024 * 1024, // 512MB
};

@Injectable()
export class PistonService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PistonService.name);
  private readonly client: AxiosInstance;
  private readonly pistonUrl: string;
  private readonly httpAgent: http.Agent;
  private readonly httpsAgent: https.Agent;
  private availableRuntimes: PistonRuntime[] = [];
  private isAvailable = false;
  private pistonLimits: PistonLimits = { ...DEFAULT_PISTON_LIMITS };

  constructor(private config: ConfigService) {
    this.pistonUrl = this.config.get("PISTON_URL") || "http://piston:2000";

    // Create HTTP agents with connection pooling for better performance
    this.httpAgent = new http.Agent({
      keepAlive: true,
      maxSockets: 10, // Max concurrent connections
      maxFreeSockets: 5, // Max idle connections to keep open
      timeout: 60000, // Socket timeout
    });

    this.httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: 60000,
    });

    this.client = axios.create({
      baseURL: `${this.pistonUrl}/api/v2`,
      timeout: 60000,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.logger.log(
      `Piston configured: ${this.pistonUrl} (connection pooling enabled)`,
    );
  }

  async onModuleDestroy() {
    // Destroy HTTP agents to close all open connections
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
    this.logger.log("HTTP agents destroyed");
  }

  async onModuleInit() {
    await this.loadRuntimes();
    await this.detectPistonLimits();
  }

  /**
   * Load available runtimes from Piston
   */
  async loadRuntimes(): Promise<void> {
    try {
      const response = await this.client.get<PistonRuntime[]>("/runtimes");
      this.availableRuntimes = response.data;
      this.isAvailable = true;
      this.logger.log(
        `Piston ready: ${this.availableRuntimes.length} runtimes available`,
      );
    } catch (error) {
      this.isAvailable = false;
      this.logger.warn("Piston not available - will use mock mode");
    }
  }

  /**
   * Detect Piston server limits by making test requests
   * Uses incremental testing to find the actual compile_timeout limit
   */
  async detectPistonLimits(): Promise<void> {
    if (!this.isAvailable) {
      this.logger.warn("Piston not available, using default limits");
      return;
    }

    try {
      // Test with increasing timeouts to find the limit
      // Piston returns 400 if timeout exceeds configured limit
      const testTimeouts = [10000, 30000, 60000, 120000, 180000, 300000];
      let maxCompileTimeout = DEFAULT_PISTON_LIMITS.compileTimeout;
      let maxRunTimeout = DEFAULT_PISTON_LIMITS.runTimeout;

      for (const timeout of testTimeouts) {
        try {
          // Test with a simple Python print to minimize execution time
          await this.client.post("/execute", {
            language: "python",
            version: "*",
            files: [{ content: 'print("limit_test")' }],
            compile_timeout: timeout,
            run_timeout: timeout,
          });
          maxCompileTimeout = timeout;
          maxRunTimeout = timeout;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || "";
          // If we get "cannot exceed" error, we found the limit
          if (errorMessage.includes("cannot exceed")) {
            break;
          }
          // Other errors - continue testing
          if (error?.response?.status !== 400) {
            break;
          }
        }
      }

      this.pistonLimits = {
        compileTimeout: maxCompileTimeout,
        runTimeout: maxRunTimeout,
        memoryLimit: RECOMMENDED_PISTON_LIMITS.memoryLimit,
        detected: true,
      };

      this.logger.log(
        `Piston limits detected: compile=${maxCompileTimeout}ms, run=${maxRunTimeout}ms`,
      );

      // Warn if limits are lower than recommended
      if (maxCompileTimeout < RECOMMENDED_PISTON_LIMITS.compileTimeout) {
        this.logger.warn(
          `⚠️ Piston compile_timeout (${maxCompileTimeout}ms) is lower than recommended ` +
            `(${RECOMMENDED_PISTON_LIMITS.compileTimeout}ms). Go and Java compilation may timeout. ` +
            `Set PISTON_COMPILE_TIMEOUT=${RECOMMENDED_PISTON_LIMITS.compileTimeout} in Piston container.`,
        );
      }
      if (maxRunTimeout < RECOMMENDED_PISTON_LIMITS.runTimeout) {
        this.logger.warn(
          `⚠️ Piston run_timeout (${maxRunTimeout}ms) is lower than recommended ` +
            `(${RECOMMENDED_PISTON_LIMITS.runTimeout}ms). Complex tests may timeout. ` +
            `Set PISTON_RUN_TIMEOUT=${RECOMMENDED_PISTON_LIMITS.runTimeout} in Piston container.`,
        );
      }
    } catch (error) {
      this.logger.warn("Failed to detect Piston limits, using defaults");
    }
  }

  /**
   * Get current Piston limits (for health checks and debugging)
   */
  getPistonLimits(): PistonLimits {
    return { ...this.pistonLimits };
  }

  /**
   * Calculate effective timeout for a language
   * Returns the minimum of desired timeout and Piston limit
   */
  private getEffectiveTimeout(language: string): {
    compile: number;
    run: number;
  } {
    const langConfig = this.getLanguageConfig(language);
    const desiredTimeout = langConfig?.timeLimit || 10000;

    return {
      compile: Math.min(desiredTimeout, this.pistonLimits.compileTimeout),
      run: Math.min(desiredTimeout, this.pistonLimits.runTimeout),
    };
  }

  /**
   * Check if Piston is available with runtimes
   */
  async checkHealth(): Promise<boolean> {
    if (this.isAvailable && this.availableRuntimes.length > 0) {
      return true;
    }
    await this.loadRuntimes();
    return this.isAvailable && this.availableRuntimes.length > 0;
  }

  /**
   * Check if a specific language runtime is available
   */
  isLanguageAvailable(language: string): boolean {
    const langConfig = this.getLanguageConfig(language);
    if (!langConfig) return false;

    return this.availableRuntimes.some(
      (runtime) =>
        runtime.language === langConfig.pistonName ||
        runtime.aliases?.includes(langConfig.pistonName),
    );
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Object.values(LANGUAGES);
  }

  /**
   * Get language config by name/key
   */
  getLanguageConfig(language: string): LanguageConfig | null {
    const key = language.toLowerCase().replace(/\s+/g, "");

    if (LANGUAGES[key]) return LANGUAGES[key];

    // Alias matching
    if (key.includes("java") && !key.includes("script")) return LANGUAGES.java;
    if (key.includes("go") || key === "golang") return LANGUAGES.go;
    if (key.includes("python") || key === "py") return LANGUAGES.python;
    if (key.includes("javascript") || key === "js" || key === "node")
      return LANGUAGES.javascript;
    if (key.includes("typescript") || key === "ts") return LANGUAGES.typescript;
    if (key.includes("rust") || key === "rs") return LANGUAGES.rust;
    if (key === "c++" || key === "cpp") return LANGUAGES.cpp;
    if (key === "c") return LANGUAGES.c;

    return null;
  }

  /**
   * Execute code with tests via Piston
   * Combines user solution with test code for validation
   * @param maxTests - Optional limit on number of tests to run (for quick mode)
   */
  async executeWithTests(
    solutionCode: string,
    testCode: string,
    language: string,
    maxTests?: number,
  ): Promise<ExecutionResult> {
    const langConfig = this.getLanguageConfig(language);
    if (!langConfig) {
      return this.errorResult(`Unsupported language: ${language}`);
    }

    // Check availability first - return user-friendly error if unavailable
    const available = await this.checkHealth();
    if (!available) {
      this.logger.warn(
        "Piston unavailable, returning service unavailable error",
      );
      return this.serviceUnavailableResult();
    }

    // Build combined code based on language
    let combinedCode: string;

    if (language === "python" || language === "py") {
      combinedCode = this.buildPythonTestCode(solutionCode, testCode, maxTests);
    } else if (language === "go" || language === "golang") {
      combinedCode = this.buildGoTestCode(solutionCode, testCode, maxTests);
    } else if (language === "java") {
      combinedCode = this.buildJavaTestCode(solutionCode, testCode);
    } else {
      combinedCode = solutionCode;
    }

    return this.execute(combinedCode, language);
  }

  /**
   * Extract test method names from test code
   */
  private extractTestNames(testCode: string): string[] {
    const testNames: string[] = [];

    // Python: def test_xxx(self): or def test_xxx():
    const pythonMatches = testCode.match(/def\s+(test_\w+)/g);
    if (pythonMatches) {
      pythonMatches.forEach((m) => {
        const name = m.replace(/def\s+/, "");
        testNames.push(name);
      });
    }

    // Go: func TestXxx(t *testing.T)
    const goMatches = testCode.match(/func\s+(Test\w+)/g);
    if (goMatches) {
      goMatches.forEach((m) => {
        const name = m.replace(/func\s+/, "");
        testNames.push(name);
      });
    }

    // Java: @Test methods or void test methods
    const javaMatches = testCode.match(
      /@Test[\s\S]*?(?:public|private|protected)?\s*void\s+(\w+)/g,
    );
    if (javaMatches) {
      javaMatches.forEach((m) => {
        const nameMatch = m.match(/void\s+(\w+)/);
        if (nameMatch) testNames.push(nameMatch[1]);
      });
    }

    return testNames.length > 0 ? testNames : ["test_1", "test_2", "test_3"];
  }

  /**
   * Build Python code that runs tests without pytest dependency
   * Tests run sequentially and STOP on first failure
   * Output is clean JSON for parsing
   * @param maxTests - Optional limit on number of tests to run
   */
  private buildPythonTestCode(
    solutionCode: string,
    testCode: string,
    maxTests?: number,
  ): string {
    // Remove pytest/solution imports and unittest.main() block from test code
    const cleanedTestCode = testCode
      .replace(/^import pytest.*$/gm, "")
      .replace(/^from pytest import.*$/gm, "")
      .replace(/^from solution import.*$/gm, "")
      .replace(/^import solution.*$/gm, "")
      // Remove if __name__ == '__main__': unittest.main() block (single or multi-line)
      .replace(
        /if\s+__name__\s*==\s*['"]__main__['"]\s*:\s*\n?\s*unittest\.main\(\)/gm,
        "",
      )
      .replace(
        /if\s+__name__\s*==\s*['"]__main__['"]\s*:\s*unittest\.main\(\)/gm,
        "",
      );

    const maxTestsLimit = maxTests
      ? `methods = methods[:${maxTests}]  # Quick mode: limit to ${maxTests} tests`
      : "";

    // Escape strings for Python multiline strings
    // Replace backslashes first, then triple quotes
    const escapePython = (s: string) =>
      s.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');

    const escapedTestCode = escapePython(cleanedTestCode);
    const escapedSolutionCode = escapePython(solutionCode);

    return `# Solution code
${solutionCode}

# Test code
${cleanedTestCode}

import re

# Pre-parsed test sources (generated at build time)
_TEST_SOURCES = {}
_current_method = None
_method_lines = []
_test_code_str = """${escapedTestCode}
"""
for _line in _test_code_str.split('\\n'):
    _stripped = _line.strip()
    if _stripped.startswith('def test_'):
        if _current_method:
            _TEST_SOURCES[_current_method] = '\\n'.join(_method_lines)
        _current_method = _stripped.split('(')[0].replace('def ', '')
        _method_lines = [_line]
    elif _current_method:
        _method_lines.append(_line)
if _current_method:
    _TEST_SOURCES[_current_method] = '\\n'.join(_method_lines)

# Extract function parameter names from solution code
_SOLUTION_CODE = """${escapedSolutionCode}
"""
_FUNC_PARAMS = {}
for _match in re.finditer(r'def\\s+(\\w+)\\s*\\(([^)]*)', _SOLUTION_CODE):
    _fname = _match.group(1)
    _params_str = _match.group(2)
    # Parse parameter names (handle type hints)
    _params = []
    for _p in _params_str.split(','):
        _p = _p.strip()
        if not _p or _p == 'self':
            continue
        # Remove type hints: "nums: List[int]" -> "nums"
        _pname = _p.split(':')[0].split('=')[0].strip()
        if _pname:
            _params.append(_pname)
    _FUNC_PARAMS[_fname] = _params

# Run tests sequentially - STOP on first failure
if __name__ == "__main__":
    import sys
    import json

    def extract_args_balanced(text, start_idx):
        """Extract content between balanced parentheses starting at start_idx"""
        if start_idx >= len(text) or text[start_idx] != '(':
            return None
        depth = 0
        for i in range(start_idx, len(text)):
            if text[i] == '(':
                depth += 1
            elif text[i] == ')':
                depth -= 1
                if depth == 0:
                    return text[start_idx+1:i]
        return None

    def split_args_top_level(args_str):
        """Split arguments at top-level commas (not inside brackets or strings)"""
        args = []
        current = []
        depth = 0
        in_string = None  # None, '"', or "'"
        i = 0
        while i < len(args_str):
            char = args_str[i]
            # Handle string literals
            if char in '"\\'' and in_string is None:
                in_string = char
                current.append(char)
            elif char == in_string and (i == 0 or args_str[i-1] != '\\\\'):
                in_string = None
                current.append(char)
            elif in_string:
                current.append(char)
            elif char in '([{':
                depth += 1
                current.append(char)
            elif char in ')]}':
                depth -= 1
                current.append(char)
            elif char == ',' and depth == 0:
                args.append(''.join(current).strip())
                current = []
            else:
                current.append(char)
            i += 1
        if current:
            args.append(''.join(current).strip())
        return args

    def extract_input_from_source(source):
        """Extract function call arguments with parameter names"""
        try:
            func_name = None
            args_str = None

            # Pattern 1: result = func_name(args)
            match = re.search(r'(?:result|res|output|out)\\s*=\\s*(\\w+)\\s*\\(', source)
            if match:
                func_name = match.group(1)
                start = match.end() - 1
                args_str = extract_args_balanced(source, start)

            # Pattern 2: assert func_name(args) == expected (skip sorted/len)
            if not args_str:
                for match in re.finditer(r'assert\\s+(\\w+)\\s*\\(', source):
                    fname = match.group(1)
                    if fname in ('sorted', 'len', 'list', 'set', 'tuple', 'str', 'int', 'float', 'bool'):
                        continue
                    func_name = fname
                    start = match.end() - 1
                    args_str = extract_args_balanced(source, start)
                    if args_str:
                        break

            # Pattern 3: self.assertEqual(func_name(args), expected) - unittest format
            if not args_str:
                for match in re.finditer(r'self\\.assert(?:Equal|IsNone|True|False)\\s*\\(\\s*(\\w+)\\s*\\(', source):
                    fname = match.group(1)
                    if fname in ('sorted', 'len', 'list', 'set', 'tuple', 'str', 'int', 'float', 'bool'):
                        continue
                    func_name = fname
                    # Find start of function call (after assertEqual()
                    paren_idx = source.find('(', match.start())
                    if paren_idx != -1:
                        inner_start = source.find('(', paren_idx + 1)
                        if inner_start != -1:
                            args_str = extract_args_balanced(source, inner_start)
                            if args_str:
                                break

            if not args_str:
                return None

            # Get parameter names for this function
            param_names = _FUNC_PARAMS.get(func_name, [])
            if not param_names:
                return args_str.strip()

            # Split arguments and pair with parameter names
            arg_values = split_args_top_level(args_str)
            formatted = []
            for i, val in enumerate(arg_values):
                if i < len(param_names):
                    formatted.append(f"{param_names[i]} = {val.strip()}")
                else:
                    formatted.append(val.strip())

            return '\\n'.join(formatted)
        except:
            pass
        return None

    test_class = None

    # Find test class
    for name, obj in list(globals().items()):
        if isinstance(obj, type) and name.startswith('Test'):
            test_class = obj
            break

    if test_class:
        instance = test_class()
        methods = sorted([m for m in dir(instance) if m.startswith('test_')])
        ${maxTestsLimit}
        total_tests = len(methods)
        results = []

        for i, method_name in enumerate(methods, 1):
            test_result = {"name": method_name, "passed": False}
            method = getattr(instance, method_name)

            # Extract input from pre-parsed test source
            if method_name in _TEST_SOURCES:
                input_args = extract_input_from_source(_TEST_SOURCES[method_name])
                if input_args:
                    test_result["input"] = input_args

            try:
                method()
                test_result["passed"] = True

                # Extract expected/actual for passed tests too
                if method_name in _TEST_SOURCES:
                    source_lines = _TEST_SOURCES[method_name].split('\\n')
                    for line in source_lines:
                        stripped = line.strip()
                        # Handle 'assert X == Y' format
                        if stripped.startswith('assert ') and '==' in stripped:
                            # Parse: assert left == right
                            assertion = stripped[7:]  # Remove 'assert '
                            # Handle trailing comment
                            if '#' in assertion:
                                assertion = assertion[:assertion.index('#')]
                            parts = assertion.split('==')
                            if len(parts) == 2:
                                left_expr = parts[0].strip()
                                right_expr = parts[1].strip()
                                try:
                                    # Safely evaluate both parts
                                    local_vars = {'result': None, 'two_sum': two_sum, 'sorted': sorted, 'len': len, 'list': list}
                                    # Re-run the function call to get actual result
                                    func_match = re.search(r'result\\s*=\\s*(\\w+)\\s*\\(', _TEST_SOURCES[method_name])
                                    if func_match:
                                        result_line = re.search(r'result\\s*=\\s*(.+)', _TEST_SOURCES[method_name])
                                        if result_line:
                                            exec(result_line.group(0), globals(), local_vars)
                                    actual_val = eval(left_expr, globals(), local_vars)
                                    expected_val = eval(right_expr, globals(), local_vars)
                                    test_result["output"] = str(actual_val)
                                    test_result["expected"] = str(expected_val)
                                except:
                                    pass
                            break
                        # Handle 'assert X in Y' format (multiple valid answers)
                        elif stripped.startswith('assert ') and ' in ' in stripped and '==' not in stripped:
                            assertion = stripped[7:]  # Remove 'assert '
                            if '#' in assertion:
                                assertion = assertion[:assertion.index('#')]
                            # Split by ' in ' (with spaces to avoid matching 'in' inside variable names)
                            in_match = re.match(r'(.+?)\\s+in\\s+(.+)', assertion)
                            if in_match:
                                left_expr = in_match.group(1).strip()
                                right_expr = in_match.group(2).strip()
                                try:
                                    local_vars = {'result': None, 'two_sum': two_sum, 'sorted': sorted, 'len': len, 'list': list}
                                    func_match = re.search(r'result\\s*=\\s*(\\w+)\\s*\\(', _TEST_SOURCES[method_name])
                                    if func_match:
                                        result_line = re.search(r'result\\s*=\\s*(.+)', _TEST_SOURCES[method_name])
                                        if result_line:
                                            exec(result_line.group(0), globals(), local_vars)
                                    actual_val = eval(left_expr, globals(), local_vars)
                                    expected_val = eval(right_expr, globals(), local_vars)
                                    test_result["output"] = str(actual_val)
                                    # For 'in' operator, show all valid options
                                    test_result["expected"] = "one of: " + str(expected_val)
                                except:
                                    pass
                            break
                        # Handle unittest 'self.assertEqual(actual, expected)' format
                        elif 'self.assertEqual(' in stripped:
                            try:
                                # Extract arguments from assertEqual
                                eq_match = re.search(r'self\\.assertEqual\\s*\\((.+)\\)', stripped)
                                if eq_match:
                                    args_content = eq_match.group(1)
                                    # Split top-level arguments
                                    args_list = split_args_top_level(args_content)
                                    if len(args_list) >= 2:
                                        actual_expr = args_list[0].strip()
                                        expected_expr = args_list[1].strip()
                                        # Try to evaluate expected (usually a literal)
                                        try:
                                            expected_val = eval(expected_expr)
                                            test_result["expected"] = repr(expected_val)
                                        except:
                                            # Fallback: show as-is
                                            test_result["expected"] = expected_expr
                                        # Try to evaluate actual (function call)
                                        try:
                                            actual_val = eval(actual_expr, globals())
                                            test_result["output"] = repr(actual_val)
                                        except:
                                            # Fallback: for passed tests actual == expected
                                            if test_result.get("expected"):
                                                test_result["output"] = test_result["expected"]
                            except:
                                pass
                            break
                        # Handle unittest 'self.assertIsNone(actual)' format
                        elif 'self.assertIsNone(' in stripped:
                            try:
                                eq_match = re.search(r'self\\.assertIsNone\\s*\\((.+)\\)', stripped)
                                if eq_match:
                                    actual_expr = eq_match.group(1).strip()
                                    try:
                                        actual_val = eval(actual_expr, globals())
                                        test_result["output"] = repr(actual_val)
                                        test_result["expected"] = "None"
                                    except:
                                        pass
                            except:
                                pass
                            break

                results.append(test_result)
            except AssertionError as e:
                import traceback
                error_str = str(e)
                test_result["error"] = error_str

                # Try to extract expected/actual from assertion
                # Method 1: Parse error message if it has "expected X, got Y" pattern
                match = re.search(r'expected[:\\s]+(.+?)[,\\s]+(?:got|but got|actual)[:\\s]+(.+)', error_str, re.I)
                if match:
                    test_result["expected"] = match.group(1).strip()
                    test_result["output"] = match.group(2).strip()
                else:
                    # Method 2: Try "X != Y" pattern
                    match = re.search(r'(.+?)\\s*!=\\s*(.+)', error_str)
                    if match:
                        test_result["output"] = match.group(1).strip()
                        test_result["expected"] = match.group(2).strip()
                    else:
                        # Method 3: Extract from traceback and evaluate assertion parts
                        try:
                            tb = traceback.extract_tb(e.__traceback__)
                            if tb:
                                last_frame = tb[-1]
                                # Get the assertion line from test source
                                if method_name in _TEST_SOURCES:
                                    source_lines = _TEST_SOURCES[method_name].split('\\n')
                                    for line in source_lines:
                                        stripped = line.strip()
                                        # Handle 'assert X == Y' format
                                        if stripped.startswith('assert ') and '==' in stripped:
                                            # Parse: assert left == right
                                            assertion = stripped[7:]  # Remove 'assert '
                                            # Handle trailing comment
                                            if '#' in assertion:
                                                assertion = assertion[:assertion.index('#')]
                                            parts = assertion.split('==')
                                            if len(parts) == 2:
                                                left_expr = parts[0].strip()
                                                right_expr = parts[1].strip()
                                                try:
                                                    # Safely evaluate both parts
                                                    local_vars = {'result': None, 'two_sum': two_sum, 'sorted': sorted, 'len': len, 'list': list}
                                                    # Re-run the function call to get actual result
                                                    if method_name in _TEST_SOURCES:
                                                        func_match = re.search(r'result\\s*=\\s*(\\w+)\\s*\\(', _TEST_SOURCES[method_name])
                                                        if func_match:
                                                            result_line = re.search(r'result\\s*=\\s*(.+)', _TEST_SOURCES[method_name])
                                                            if result_line:
                                                                exec(result_line.group(0), globals(), local_vars)
                                                    actual_val = eval(left_expr, globals(), local_vars)
                                                    expected_val = eval(right_expr, globals(), local_vars)
                                                    test_result["output"] = str(actual_val)
                                                    test_result["expected"] = str(expected_val)
                                                except:
                                                    pass
                                            break
                                        # Handle 'assert X in Y' format (multiple valid answers)
                                        elif stripped.startswith('assert ') and ' in ' in stripped and '==' not in stripped:
                                            assertion = stripped[7:]  # Remove 'assert '
                                            if '#' in assertion:
                                                assertion = assertion[:assertion.index('#')]
                                            in_match = re.match(r'(.+?)\\s+in\\s+(.+)', assertion)
                                            if in_match:
                                                left_expr = in_match.group(1).strip()
                                                right_expr = in_match.group(2).strip()
                                                try:
                                                    local_vars = {'result': None, 'two_sum': two_sum, 'sorted': sorted, 'len': len, 'list': list}
                                                    func_match = re.search(r'result\\s*=\\s*(\\w+)\\s*\\(', _TEST_SOURCES[method_name])
                                                    if func_match:
                                                        result_line = re.search(r'result\\s*=\\s*(.+)', _TEST_SOURCES[method_name])
                                                        if result_line:
                                                            exec(result_line.group(0), globals(), local_vars)
                                                    actual_val = eval(left_expr, globals(), local_vars)
                                                    expected_val = eval(right_expr, globals(), local_vars)
                                                    test_result["output"] = str(actual_val)
                                                    test_result["expected"] = "one of: " + str(expected_val)
                                                except:
                                                    pass
                                            break
                        except:
                            pass
                results.append(test_result)
                # Output JSON and exit on first failure
                print(json.dumps({"tests": results, "passed": len([r for r in results if r["passed"]]), "total": total_tests}))
                sys.exit(1)
            except Exception as e:
                test_result["error"] = f"{type(e).__name__}: {e}"
                results.append(test_result)
                print(json.dumps({"tests": results, "passed": len([r for r in results if r["passed"]]), "total": total_tests}))
                sys.exit(1)

        # All tests passed
        print(json.dumps({"tests": results, "passed": len(results), "total": total_tests}))
        sys.exit(0)
    else:
        print(json.dumps({"error": "No test class found", "tests": [], "passed": 0, "total": 0}))
        sys.exit(1)
`;
  }

  /**
   * Build Go code that runs tests
   * Tests run sequentially and STOP on first failure
   * Output is clean JSON for parsing
   * @param maxTests - Optional limit on number of tests to run
   */
  private buildGoTestCode(
    solutionCode: string,
    testCode: string,
    maxTests?: number,
  ): string {
    // For Go, we need to combine into a single file with test runner
    // Remove package declarations AND all import statements from solution code
    // Replace testing types with our mock types
    // Note: Using Go 1.21+ which supports 'any' keyword natively
    const cleanSolution = solutionCode
      .replace(/^package\s+\w+\s*$/gm, "")
      .replace(/import\s*\([\s\S]*?\)/g, "") // Remove multi-line import blocks
      .replace(/import\s+"[^"]+"/g, "") // Remove single-line imports
      .replace(/\*testing\.T/g, "*T")
      .replace(/\*testing\.B/g, "*B")
      .replace(/\*testing\.M/g, "*M")
      .trim();

    // Remove package declaration AND all import statements from test code
    // Note: Using Go 1.21+ which supports 'any' keyword natively
    const cleanTests = testCode
      .replace(/^package\s+\w+\s*$/gm, "")
      .replace(/import\s*\([\s\S]*?\)/g, "") // Remove multi-line import blocks
      .replace(/import\s+"[^"]+"/g, "") // Remove single-line imports
      .replace(/\*testing\.T/g, "*T")
      .replace(/\*testing\.B/g, "*B")
      .replace(/\*testing\.M/g, "*M")
      .trim();

    // Extract imports from BOTH solution and test code (excluding "testing")
    const solutionImports = this.extractGoImports(solutionCode);
    const testImports = this.extractGoImports(testCode);
    const candidateImports = [...new Set([...solutionImports, ...testImports])];

    // Filter to only imports that are actually used in the cleaned code
    const combinedCode = cleanSolution + "\n" + cleanTests;
    const additionalImports = candidateImports.filter((imp) => {
      // Get the package name (last part of import path)
      const pkgName = imp.split("/").pop() || imp;
      // Check if package name is used in the code (as identifier)
      const usagePattern = new RegExp(`\\b${pkgName}\\.`, "g");
      return usagePattern.test(combinedCode);
    });

    // Extract test function names and descriptions from testCode
    const testFunctions = this.extractGoTestFunctionsWithDescriptions(testCode);

    // Apply maxTests limit
    const testsToRun = maxTests
      ? testFunctions.slice(0, maxTests)
      : testFunctions;

    // Generate runTest calls with descriptions
    const testCalls = testsToRun
      .map((t) => {
        const escapedDesc = t.description.replace(/"/g, '\\"');
        return `    runTest("${t.name}", ${t.name}, "${escapedDesc}")`;
      })
      .join("\n");

    // Build complete import list (base + additional from tests)
    const baseImports = ["encoding/json", "fmt", "os", "regexp"];
    const allImports = [...new Set([...baseImports, ...additionalImports])];
    const importBlock = allImports.map((i) => `    "${i}"`).join("\n");

    return `package main

import (
${importBlock}
)

// Test result structure
type TestResult struct {
    Name     string \`json:"name"\`
    Passed   bool   \`json:"passed"\`
    Error    string \`json:"error,omitempty"\`
    Expected string \`json:"expected,omitempty"\`
    Output   string \`json:"output,omitempty"\`
    Input    string \`json:"input,omitempty"\`
}

type TestOutput struct {
    Tests  []TestResult \`json:"tests"\`
    Passed int          \`json:"passed"\`
    Total  int          \`json:"total"\`
}

// Mock testing.T with error capture
type T struct {
    failed   bool
    name     string
    errorMsg string
}

func (t *T) Errorf(format string, args ...interface{}) {
    t.failed = true
    t.errorMsg = fmt.Sprintf(format, args...)
}

func (t *T) Error(args ...interface{}) {
    t.failed = true
    t.errorMsg = fmt.Sprint(args...)
}

func (t *T) Fatalf(format string, args ...interface{}) {
    t.failed = true
    t.errorMsg = fmt.Sprintf(format, args...)
    panic("test failed")
}

func (t *T) Fatal(args ...interface{}) {
    t.failed = true
    t.errorMsg = fmt.Sprint(args...)
    panic("test failed")
}

func (t *T) Logf(format string, args ...interface{}) {}
func (t *T) Log(args ...interface{}) {}
func (t *T) Helper() {} // no-op for test helpers
func (t *T) Parallel() {} // no-op - tests run sequentially in sandbox
func (t *T) Cleanup(f func()) { defer f() } // register cleanup function
func (t *T) Run(name string, f func(*T)) bool {
    subT := &T{name: t.name + "/" + name}
    defer func() {
        if r := recover(); r != nil {
            subT.failed = true
            if subT.errorMsg == "" {
                subT.errorMsg = fmt.Sprintf("%v", r)
            }
        }
        if subT.failed {
            t.failed = true
            t.errorMsg = subT.errorMsg
        }
    }()
    f(subT)
    return !subT.failed
}

// Mock testing.B for benchmarks (simplified - runs once instead of N times)
type B struct {
    N int
    failed bool
    name string
}

func (b *B) ResetTimer() {}
func (b *B) StopTimer() {}
func (b *B) StartTimer() {}
func (b *B) ReportAllocs() {}
func (b *B) SetBytes(n int64) {}
func (b *B) SetParallelism(p int) {}
func (b *B) Run(name string, f func(*B)) bool {
    subB := &B{N: 1, name: b.name + "/" + name}
    f(subB)
    return !subB.failed
}
func (b *B) RunParallel(body func(*PB)) {
    pb := &PB{done: false}
    body(pb)
}

// Mock testing.PB for parallel benchmarks
type PB struct {
    done bool
    count int
}

func (pb *PB) Next() bool {
    if pb.count >= 1 {
        return false
    }
    pb.count++
    return true
}

// Mock testing.M for TestMain
type M struct {
    exitCode int
}

func (m *M) Run() int {
    // In our sandbox, tests are run by the framework after TestMain
    // This is a simplified mock that just returns 0
    return 0
}

// Global testDir variable for TestMain tasks
var testDir string

// Solution code
${cleanSolution}

// Test code
${cleanTests}

var testResults []TestResult
var totalTests = 0

// Parse error message to extract expected/actual
func parseError(errMsg string) (expected, output string) {
    // Pattern: "expected X, got Y" or "want X, got Y"
    re := regexp.MustCompile(\`(?i)(?:expected|want)[:\\s]+(.+?)[,\\s]+(?:got|but got|actual)[:\\s]+(.+)\`)
    matches := re.FindStringSubmatch(errMsg)
    if len(matches) >= 3 {
        return matches[1], matches[2]
    }
    // Pattern: "X != Y"
    re2 := regexp.MustCompile(\`(.+?)\\s*!=\\s*(.+)\`)
    matches2 := re2.FindStringSubmatch(errMsg)
    if len(matches2) >= 3 {
        return matches2[2], matches2[1]
    }
    return "", ""
}

// Run single test - returns true if passed, false if failed
func runTest(name string, fn func(*T), description string) bool {
    totalTests++
    t := &T{name: name}
    result := TestResult{Name: name, Passed: false}
    if description != "" {
        result.Input = description
    }

    defer func() {
        if r := recover(); r != nil {
            if t.errorMsg == "" {
                t.errorMsg = fmt.Sprintf("%v", r)
            }
            result.Error = t.errorMsg
            result.Expected, result.Output = parseError(t.errorMsg)
            testResults = append(testResults, result)
        }
    }()

    fn(t)

    if t.failed {
        result.Error = t.errorMsg
        result.Expected, result.Output = parseError(t.errorMsg)
        testResults = append(testResults, result)
        return false
    }

    result.Passed = true
    testResults = append(testResults, result)
    return true
}

func printResults() {
    passed := 0
    for _, r := range testResults {
        if r.Passed {
            passed++
        }
    }
    output := TestOutput{Tests: testResults, Passed: passed, Total: totalTests}
    jsonBytes, _ := json.Marshal(output)
    fmt.Println(string(jsonBytes))
}

func main() {
    // Run all test functions
${testCalls}

    printResults()
    passed := 0
    for _, r := range testResults {
        if r.Passed {
            passed++
        }
    }
    if passed < totalTests {
        os.Exit(1)
    }
}
`;
  }

  /**
   * Extract Go imports from code (excluding "testing")
   */
  private extractGoImports(code: string): string[] {
    const imports: string[] = [];

    // Match multi-line import blocks: import ( "pkg1" "pkg2" )
    const multiImportMatch = code.match(/import\s*\(([\s\S]*?)\)/);
    if (multiImportMatch) {
      const importBlock = multiImportMatch[1];
      const packageMatches = importBlock.match(/"([^"]+)"/g);
      if (packageMatches) {
        packageMatches.forEach((pkg) => {
          const cleanPkg = pkg.replace(/"/g, "");
          if (cleanPkg !== "testing") {
            imports.push(cleanPkg);
          }
        });
      }
    }

    // Match single-line imports: import "pkg"
    const singleImportMatches = code.match(/import\s+"([^"]+)"/g);
    if (singleImportMatches) {
      singleImportMatches.forEach((match) => {
        const pkgMatch = match.match(/"([^"]+)"/);
        if (pkgMatch && pkgMatch[1] !== "testing") {
          imports.push(pkgMatch[1]);
        }
      });
    }

    return imports;
  }

  /**
   * Extract Go test function names from test code
   * Validates function names to prevent code injection
   */
  private extractGoTestFunctions(testCode: string): string[] {
    return this.extractGoTestFunctionsWithDescriptions(testCode).map(
      (t) => t.name,
    );
  }

  /**
   * Extract Go test function names with descriptions from comments
   * Validates function names to prevent code injection
   */
  private extractGoTestFunctionsWithDescriptions(
    testCode: string,
  ): { name: string; description: string }[] {
    const functions: { name: string; description: string }[] = [];
    // Match comments followed by test functions
    const regex = /(?:\/\/\s*(.+?)\s*\n\s*)?func\s+(Test\w+)\s*\(/g;
    // Whitelist pattern: only alphanumeric and underscore, must start with Test
    const validNamePattern = /^Test[A-Za-z0-9_]+$/;
    // Blacklist dangerous keywords that could indicate injection attempts
    const dangerousPatterns = [
      /os\./i,
      /exec\./i,
      /syscall\./i,
      /unsafe\./i,
      /runtime\./i,
      /reflect\./i,
      /eval/i,
      /import/i,
    ];

    let match;
    while ((match = regex.exec(testCode)) !== null) {
      const comment = match[1] || "";
      const funcName = match[2];

      // Validate function name format
      if (!validNamePattern.test(funcName)) {
        this.logger.warn(`Invalid test function name rejected: ${funcName}`);
        continue;
      }

      // Check for dangerous patterns in function name
      const hasDangerousPattern = dangerousPatterns.some((pattern) =>
        pattern.test(funcName),
      );
      if (hasDangerousPattern) {
        this.logger.warn(
          `Potentially dangerous test function name rejected: ${funcName}`,
        );
        continue;
      }

      // Limit function name length to prevent buffer overflow attempts
      if (funcName.length > 100) {
        this.logger.warn(
          `Test function name too long, rejected: ${funcName.substring(0, 20)}...`,
        );
        continue;
      }

      // Extract description from comment (remove Test1: prefix if present)
      let description = comment;
      const colonIdx = comment.indexOf(":");
      if (colonIdx > 0 && colonIdx < 10) {
        description = comment.substring(colonIdx + 1).trim();
      }

      functions.push({ name: funcName, description });
    }
    return functions;
  }

  /**
   * Build Java code that runs tests with JSON output
   * Tests run sequentially and STOP on first failure
   * Output is clean JSON for parsing
   */
  private buildJavaTestCode(solutionCode: string, testCode: string): string {
    // Extract test class names from test code
    const testClasses = this.extractJavaTestClasses(testCode);
    this.logger.debug(`Java test classes found: ${testClasses.join(", ")}`);

    // Clean imports from solution code (we add them in the template)
    const cleanSolution = solutionCode
      .replace(/import\s+java\.util\.\*;/gm, "")
      .replace(/import\s+java\.util\.ArrayList;/gm, "")
      .replace(/import\s+java\.util\.List;/gm, "")
      .replace(/import\s+java\.util\.Map;/gm, "")
      .replace(/import\s+java\.util\.HashMap;/gm, "")
      .replace(/import\s+java\.util\.Set;/gm, "")
      .replace(/import\s+java\.util\.HashSet;/gm, "")
      .trim();

    // Clean imports and annotations from test code
    // Also make test classes implement Testable interface
    // And redirect assertion calls to our Assert class
    const cleanTests = testCode
      .replace(/import\s+org\.junit.*$/gm, "")
      .replace(/import\s+static\s+org\.junit.*$/gm, "")
      .replace(/import\s+java\.util\.\*;/gm, "")
      .replace(/import\s+java\.util\.List;/gm, "")
      .replace(/import\s+java\.util\.ArrayList;/gm, "")
      .replace(/class\s+(Test\d+)\s*\{/g, "class $1 implements Testable {")
      .replace(/@Test\s*/g, "")
      // Replace assertion calls with Assert.* (only if not already prefixed)
      .replace(/(?<!Assert\.)assertEquals\(/g, "Assert.assertEquals(")
      .replace(/(?<!Assert\.)assertTrue\(/g, "Assert.assertTrue(")
      .replace(/(?<!Assert\.)assertFalse\(/g, "Assert.assertFalse(")
      .replace(/(?<!Assert\.)assertNull\(/g, "Assert.assertNull(")
      .replace(/(?<!Assert\.)assertNotNull\(/g, "Assert.assertNotNull(")
      .trim();

    // Generate test execution calls
    const testCalls = testClasses
      .map((name) => `        runTest("${name}", new ${name}());`)
      .join("\n");

    // IMPORTANT: public class Main MUST be first for Piston to find main() method
    // Simplified test runner with JSON output and expected/output capture
    const result = `import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<String> results = new ArrayList<>();
    static int totalTests = 0;
    static int passed = 0;

    static void runTest(String name, Testable t) {
        totalTests++;
        Assert.reset();
        try {
            t.test();
            passed++;
            String exp = Assert.lastExpected != null ? Assert.lastExpected : "";
            String act = Assert.lastActual != null ? Assert.lastActual : "";
            results.add("{\\"name\\":\\"" + esc(name) + "\\",\\"passed\\":true,\\"expected\\":\\"" + esc(exp) + "\\",\\"output\\":\\"" + esc(act) + "\\"}");
        } catch (AssertionError e) {
            String exp = Assert.lastExpected != null ? Assert.lastExpected : "";
            String act = Assert.lastActual != null ? Assert.lastActual : "";
            String err = e.getMessage() != null ? e.getMessage() : "Assertion failed";
            results.add("{\\"name\\":\\"" + esc(name) + "\\",\\"passed\\":false,\\"error\\":\\"" + esc(err) + "\\",\\"expected\\":\\"" + esc(exp) + "\\",\\"output\\":\\"" + esc(act) + "\\"}");
            printResults();
            System.exit(1);
        } catch (Exception e) {
            String err = e.getClass().getSimpleName() + ": " + e.getMessage();
            results.add("{\\"name\\":\\"" + esc(name) + "\\",\\"passed\\":false,\\"error\\":\\"" + esc(err) + "\\"}");
            printResults();
            System.exit(1);
        }
    }

    static String esc(String s) {
        if (s == null) return "";
        return s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n").replace("\\r", "\\\\r");
    }

    static void printResults() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\\"tests\\":[");
        for (int i = 0; i < results.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(results.get(i));
        }
        sb.append("],\\"passed\\":").append(passed).append(",\\"total\\":").append(totalTests).append("}");
        System.out.println(sb.toString());
    }

    public static void main(String[] args) {
${testCalls}
        printResults();
        System.exit(0);
    }
}

// Solution code
${cleanSolution}

interface Testable { void test() throws Exception; }

class Assert {
    static String lastExpected = null;
    static String lastActual = null;

    static void assertEquals(Object expected, Object actual) {
        lastExpected = String.valueOf(expected);
        lastActual = String.valueOf(actual);
        if (!java.util.Objects.equals(expected, actual))
            throw new AssertionError("Expected: " + expected + ", Got: " + actual);
    }

    static void assertEquals(int expected, int actual) {
        lastExpected = String.valueOf(expected);
        lastActual = String.valueOf(actual);
        if (expected != actual) throw new AssertionError("Expected: " + expected + ", Got: " + actual);
    }

    static void assertEquals(long expected, long actual) {
        lastExpected = String.valueOf(expected);
        lastActual = String.valueOf(actual);
        if (expected != actual) throw new AssertionError("Expected: " + expected + ", Got: " + actual);
    }

    static void assertEquals(double expected, double actual, double delta) {
        lastExpected = String.valueOf(expected);
        lastActual = String.valueOf(actual);
        if (Math.abs(expected - actual) > delta) throw new AssertionError("Expected: " + expected + ", Got: " + actual);
    }

    static void assertTrue(boolean condition) {
        lastExpected = "true";
        lastActual = String.valueOf(condition);
        if (!condition) throw new AssertionError("Expected true but got false");
    }

    static void assertTrue(String message, boolean condition) {
        lastExpected = "true";
        lastActual = String.valueOf(condition);
        if (!condition) throw new AssertionError(message);
    }

    static void assertFalse(boolean condition) {
        lastExpected = "false";
        lastActual = String.valueOf(condition);
        if (condition) throw new AssertionError("Expected false but got true");
    }

    static void assertFalse(String message, boolean condition) {
        lastExpected = "false";
        lastActual = String.valueOf(condition);
        if (condition) throw new AssertionError(message);
    }

    static void assertNull(Object obj) {
        lastExpected = "null";
        lastActual = String.valueOf(obj);
        if (obj != null) throw new AssertionError("Expected null but got: " + obj);
    }

    static void assertNotNull(Object obj) {
        lastExpected = "not null";
        lastActual = obj == null ? "null" : String.valueOf(obj);
        if (obj == null) throw new AssertionError("Expected not null but got null");
    }

    static void reset() { lastExpected = null; lastActual = null; }
}

// Test classes
${cleanTests}
`;
    // Debug: log generated code length
    this.logger.debug(
      `Generated Java code length: ${result.length} chars, test calls: ${testCalls.length} chars`,
    );
    return result;
  }

  /**
   * Extract Java test class names from test code
   * Looks for classes like Test1, Test2, etc. that contain @Test methods
   */
  private extractJavaTestClasses(testCode: string): string[] {
    const classes: string[] = [];
    // Pattern: class TestN { ... @Test ... }
    const classRegex = /class\s+(Test\d+)\s*\{/g;
    let match;
    while ((match = classRegex.exec(testCode)) !== null) {
      classes.push(match[1]);
    }
    return classes;
  }

  /**
   * Execute code via Piston
   */
  async execute(
    code: string,
    language: string,
    stdin?: string,
  ): Promise<ExecutionResult> {
    const langConfig = this.getLanguageConfig(language);
    if (!langConfig) {
      return this.errorResult(`Unsupported language: ${language}`);
    }

    // Check availability - return user-friendly error if unavailable
    const available = await this.checkHealth();
    if (!available) {
      this.logger.warn(
        "Piston unavailable, returning service unavailable error",
      );
      return this.serviceUnavailableResult();
    }

    try {
      const startTime = Date.now();

      // Get effective timeouts respecting Piston server limits
      const effectiveTimeout = this.getEffectiveTimeout(language);
      const effectiveMemory = Math.min(
        langConfig.memoryLimit,
        this.pistonLimits.memoryLimit,
      );

      const request: PistonExecuteRequest = {
        language: langConfig.pistonName,
        version: "*", // Use latest available version
        files: [{ content: code }],
        stdin: stdin || "",
        compile_timeout: effectiveTimeout.compile,
        run_timeout: effectiveTimeout.run,
        run_memory_limit: effectiveMemory,
      };

      this.logger.debug(
        `Executing ${langConfig.name} code via Piston ` +
          `(compile=${effectiveTimeout.compile}ms, run=${effectiveTimeout.run}ms)`,
      );

      const response = await this.client.post<PistonExecuteResponse>(
        "/execute",
        request,
      );

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);
      return this.parseResponse(response.data, elapsed);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as any)?.code;
      const statusCode = (error as any)?.response?.status;
      this.logger.error(`Piston execution failed: ${errorMessage}`);

      // Check for timeout
      if (errorCode === "ECONNABORTED" || errorMessage?.includes("timeout")) {
        return {
          status: "timeout",
          statusId: 5,
          description: "Time Limit Exceeded",
          stdout: "",
          stderr: "Your code took too long to execute",
          compileOutput: "",
          time: "-",
          memory: 0,
          exitCode: null,
          message: "Execution timed out. Try optimizing your code.",
        };
      }

      // Check for 400 error (usually means language not available)
      if (statusCode === 400) {
        this.logger.warn(`Language runtime not available: ${langConfig.name}`);
        return this.errorResult(
          `Language ${langConfig.name} is temporarily unavailable. Please try again later.`,
        );
      }

      // Connection errors - return user-friendly message
      if (errorCode === "ECONNREFUSED" || errorCode === "ENOTFOUND") {
        this.logger.warn(`Piston connection failed`);
        return this.serviceUnavailableResult();
      }

      // Generic error with user-friendly message
      return this.serviceUnavailableResult();
    }
  }

  /**
   * Return user-friendly error when service is unavailable
   * No mock execution - honest feedback to user
   */
  private serviceUnavailableResult(): ExecutionResult {
    return {
      status: "error",
      statusId: 13,
      description: "Service Temporarily Unavailable",
      stdout: "",
      stderr: "",
      compileOutput: "",
      time: "-",
      memory: 0,
      exitCode: null,
      message:
        "Code execution service is temporarily unavailable. Please try again in a few minutes.",
    };
  }

  /**
   * Parse Piston response to normalized format
   */
  private parseResponse(
    response: PistonExecuteResponse,
    fallbackTime: string,
  ): ExecutionResult {
    const run = response.run;
    const compile = response.compile;

    // Use Piston's wall_time if available, otherwise fallback to measured time
    // wall_time is in milliseconds, convert to seconds
    const time = run.wall_time
      ? (run.wall_time / 1000).toFixed(3)
      : fallbackTime;

    // Memory is in bytes, we'll pass it as-is and format in the submission service
    const memory = run.memory || 0;

    // Check for compilation error
    if (compile && compile.code !== 0) {
      return {
        status: "compileError",
        statusId: 6,
        description: "Compilation Error",
        stdout: "",
        stderr: "",
        compileOutput: this.truncateOutput(compile.stderr || compile.output),
        time: "-",
        memory: 0,
        exitCode: compile.code,
        message: "Compilation failed",
      };
    }

    // Check for runtime error
    // Special case: If we got valid output before timeout/kill, treat as success
    // This handles cases like numpy imports that produce output but get killed during cleanup
    const hasValidOutput = run.stdout && run.stdout.trim().length > 0;
    const isTimeoutWithOutput = run.signal === "SIGKILL" && hasValidOutput;

    if ((run.code !== 0 || run.signal) && !isTimeoutWithOutput) {
      return {
        status: "error",
        statusId: 11,
        description: run.signal ? `Signal: ${run.signal}` : "Runtime Error",
        stdout: this.truncateOutput(run.stdout),
        stderr: this.truncateOutput(run.stderr),
        compileOutput: compile?.output
          ? this.truncateOutput(compile.output)
          : "",
        time,
        memory,
        exitCode: run.code,
        message: run.stderr || `Exit code: ${run.code}`,
      };
    }

    // Success
    return {
      status: "passed",
      statusId: 3,
      description: "Accepted",
      stdout: this.truncateOutput(run.stdout),
      stderr: this.truncateOutput(run.stderr),
      compileOutput: compile?.output ? this.truncateOutput(compile.output) : "",
      time,
      memory,
      exitCode: run.code,
    };
  }

  /**
   * Helper: Create error result
   */
  private errorResult(message: string): ExecutionResult {
    return {
      status: "error",
      statusId: 13,
      description: "Error",
      stdout: "",
      stderr: message,
      compileOutput: "",
      time: "-",
      memory: 0,
      exitCode: null,
      message,
    };
  }

  /**
   * Helper: Truncate long output
   */
  private truncateOutput(output: string, maxLength = 10000): string {
    if (!output) return "";
    if (output.length <= maxLength) return output;
    return output.substring(0, maxLength) + "\n\n... [Output truncated]";
  }
}
