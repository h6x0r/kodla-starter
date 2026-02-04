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
 * Judge0 Language Runtime
 */
export interface Judge0Language {
  id: number;
  name: string;
}

/**
 * Judge0 Submission Request
 */
export interface Judge0SubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  wall_time_limit?: number;
  memory_limit?: number;
  compiler_options?: string;
}

/**
 * Judge0 Submission Response
 */
export interface Judge0SubmissionResponse {
  token?: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code: number | null;
  exit_signal: number | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  wall_time: string | null;
  memory: number | null;
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
  judge0Id: number;
  name: string;
  extension: string;
  monacoId: string;
  timeLimit: number;
  memoryLimit: number;
}

// Judge0 Language IDs (CE edition)
// https://ce.judge0.com/languages
// Note: max_cpu_time_limit=15, max_wall_time_limit=20 in default Judge0 config
export const LANGUAGES: Record<string, LanguageConfig> = {
  go: {
    judge0Id: 60, // Go (1.13.5)
    name: "Go",
    extension: ".go",
    monacoId: "go",
    timeLimit: 30, // Go needs extra time for compilation
    memoryLimit: 512000, // 512MB in KB
  },
  java: {
    judge0Id: 62, // Java (OpenJDK 13.0.1)
    name: "Java",
    extension: ".java",
    monacoId: "java",
    timeLimit: 30, // Java/JVM needs extra time for compilation
    memoryLimit: 512000,
  },
  javascript: {
    judge0Id: 63, // JavaScript (Node.js 12.14.0)
    name: "JavaScript",
    extension: ".js",
    monacoId: "javascript",
    timeLimit: 10,
    memoryLimit: 256000,
  },
  typescript: {
    judge0Id: 74, // TypeScript (3.7.4)
    name: "TypeScript",
    extension: ".ts",
    monacoId: "typescript",
    timeLimit: 15,
    memoryLimit: 256000,
  },
  python: {
    judge0Id: 71, // Python (3.8.1)
    name: "Python",
    extension: ".py",
    monacoId: "python",
    timeLimit: 15,
    memoryLimit: 256000,
  },
  rust: {
    judge0Id: 73, // Rust (1.40.0)
    name: "Rust",
    extension: ".rs",
    monacoId: "rust",
    timeLimit: 15,
    memoryLimit: 256000,
  },
  cpp: {
    judge0Id: 54, // C++ (GCC 9.2.0)
    name: "C++",
    extension: ".cpp",
    monacoId: "cpp",
    timeLimit: 10,
    memoryLimit: 256000,
  },
  c: {
    judge0Id: 50, // C (GCC 9.2.0)
    name: "C",
    extension: ".c",
    monacoId: "c",
    timeLimit: 10,
    memoryLimit: 256000,
  },
};

// Judge0 Status IDs
const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

@Injectable()
export class Judge0Service implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Judge0Service.name);
  private readonly client: AxiosInstance;
  private readonly judge0Url: string;
  private readonly httpAgent: http.Agent;
  private readonly httpsAgent: https.Agent;
  private availableLanguages: Judge0Language[] = [];
  private isAvailable = false;

  constructor(private config: ConfigService) {
    this.judge0Url = this.config.get("JUDGE0_URL") || "http://judge0:2358";

    this.httpAgent = new http.Agent({
      keepAlive: true,
      maxSockets: 20,
      maxFreeSockets: 10,
      timeout: 60000,
    });

    this.httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: 20,
      maxFreeSockets: 10,
      timeout: 60000,
    });

    this.client = axios.create({
      baseURL: this.judge0Url,
      timeout: 120000, // 2 minutes for long compilations
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.logger.log(`Judge0 configured: ${this.judge0Url}`);
  }

  async onModuleDestroy() {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
    this.logger.log("HTTP agents destroyed");
  }

  async onModuleInit() {
    await this.loadLanguages();
  }

  /**
   * Load available languages from Judge0
   */
  async loadLanguages(): Promise<void> {
    try {
      const response = await this.client.get<Judge0Language[]>("/languages");
      this.availableLanguages = response.data;
      this.isAvailable = true;
      this.logger.log(
        `Judge0 ready: ${this.availableLanguages.length} languages available`,
      );
    } catch (error) {
      this.isAvailable = false;
      this.logger.warn("Judge0 not available - code execution disabled");
    }
  }

  /**
   * Check if Judge0 is available
   */
  async checkHealth(): Promise<boolean> {
    if (this.isAvailable && this.availableLanguages.length > 0) {
      return true;
    }
    await this.loadLanguages();
    return this.isAvailable && this.availableLanguages.length > 0;
  }

  /**
   * Check if a specific language is available
   */
  isLanguageAvailable(language: string): boolean {
    const langConfig = this.getLanguageConfig(language);
    if (!langConfig) return false;
    return this.availableLanguages.some((l) => l.id === langConfig.judge0Id);
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
   * Execute code with tests via Judge0
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

    const available = await this.checkHealth();
    if (!available) {
      return this.serviceUnavailableResult();
    }

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
   * Execute code via Judge0 (synchronous mode with wait=true)
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

    const available = await this.checkHealth();
    if (!available) {
      return this.serviceUnavailableResult();
    }

    try {
      const startTime = Date.now();

      const request: Judge0SubmissionRequest = {
        source_code: code,
        language_id: langConfig.judge0Id,
        stdin: stdin || "",
        cpu_time_limit: Math.min(langConfig.timeLimit, 30), // Judge0 configured with 30s max
        wall_time_limit: Math.min(langConfig.timeLimit * 2, 60), // Judge0 configured with 60s max
        memory_limit: Math.min(langConfig.memoryLimit, 512000), // max 512MB
      };

      this.logger.debug(
        `Executing ${langConfig.name} via Judge0 (timeout=${langConfig.timeLimit}s)`,
      );

      // Use synchronous mode with wait=true
      const response = await this.client.post<Judge0SubmissionResponse>(
        "/submissions?base64_encoded=false&wait=true",
        request,
      );

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);
      return this.parseResponse(response.data, elapsed);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as any)?.code;
      const statusCode = (error as any)?.response?.status;

      this.logger.error(`Judge0 execution failed: ${errorMessage}`);

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

      if (errorCode === "ECONNREFUSED" || errorCode === "ENOTFOUND") {
        return this.serviceUnavailableResult();
      }

      return this.serviceUnavailableResult();
    }
  }

  /**
   * Parse Judge0 response to normalized format
   */
  private parseResponse(
    response: Judge0SubmissionResponse,
    fallbackTime: string,
  ): ExecutionResult {
    const status = response.status;
    const time = response.time || fallbackTime;
    const memory = response.memory || 0;

    // Compilation error
    if (status.id === STATUS.COMPILATION_ERROR) {
      return {
        status: "compileError",
        statusId: 6,
        description: "Compilation Error",
        stdout: "",
        stderr: "",
        compileOutput: this.truncateOutput(response.compile_output || ""),
        time: "-",
        memory: 0,
        exitCode: null,
        message: "Compilation failed",
      };
    }

    // Time limit exceeded
    if (status.id === STATUS.TIME_LIMIT_EXCEEDED) {
      return {
        status: "timeout",
        statusId: 5,
        description: "Time Limit Exceeded",
        stdout: this.truncateOutput(response.stdout || ""),
        stderr: "",
        compileOutput: "",
        time,
        memory,
        exitCode: null,
        message: "Your code took too long to execute",
      };
    }

    // Runtime errors (SIGSEGV, SIGFPE, etc.)
    if (
      status.id >= STATUS.RUNTIME_ERROR_SIGSEGV &&
      status.id <= STATUS.RUNTIME_ERROR_OTHER
    ) {
      return {
        status: "error",
        statusId: status.id,
        description: status.description,
        stdout: this.truncateOutput(response.stdout || ""),
        stderr: this.truncateOutput(response.stderr || ""),
        compileOutput: this.truncateOutput(response.compile_output || ""),
        time,
        memory,
        exitCode: response.exit_code,
        message: response.message || status.description,
      };
    }

    // Internal error
    if (status.id === STATUS.INTERNAL_ERROR) {
      return this.serviceUnavailableResult();
    }

    // Accepted (success)
    return {
      status: "passed",
      statusId: 3,
      description: "Accepted",
      stdout: this.truncateOutput(response.stdout || ""),
      stderr: this.truncateOutput(response.stderr || ""),
      compileOutput: this.truncateOutput(response.compile_output || ""),
      time,
      memory,
      exitCode: response.exit_code,
    };
  }

  /**
   * Build Python test code
   */
  private buildPythonTestCode(
    solutionCode: string,
    testCode: string,
    maxTests?: number,
  ): string {
    const cleanedTestCode = testCode
      .replace(/^import pytest.*$/gm, "")
      .replace(/^from pytest import.*$/gm, "")
      .replace(/^from solution import.*$/gm, "")
      .replace(/^import solution.*$/gm, "")
      .replace(
        /if\s+__name__\s*==\s*['"]__main__['"]\s*:\s*\n?\s*unittest\.main\(\)/gm,
        "",
      );

    const maxTestsLimit = maxTests
      ? `methods = methods[:${maxTests}]  # Quick mode`
      : "";

    return `# Solution code
${solutionCode}

# Test code
${cleanedTestCode}

import json
import sys
import re

if __name__ == "__main__":
    test_class = None
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

        for method_name in methods:
            test_result = {"name": method_name, "passed": False}
            # Call setUp() before each test if it exists
            if hasattr(instance, 'setUp'):
                instance.setUp()
            method = getattr(instance, method_name)
            try:
                method()
                test_result["passed"] = True
                results.append(test_result)
            except AssertionError as e:
                test_result["error"] = str(e)
                results.append(test_result)
                print(json.dumps({"tests": results, "passed": len([r for r in results if r["passed"]]), "total": total_tests}))
                sys.exit(1)
            except Exception as e:
                test_result["error"] = f"{type(e).__name__}: {e}"
                results.append(test_result)
                print(json.dumps({"tests": results, "passed": len([r for r in results if r["passed"]]), "total": total_tests}))
                sys.exit(1)

        print(json.dumps({"tests": results, "passed": len(results), "total": total_tests}))
        sys.exit(0)
    else:
        print(json.dumps({"error": "No test class found", "tests": [], "passed": 0, "total": 0}))
        sys.exit(1)
`;
  }

  /**
   * Build Go test code
   */
  private buildGoTestCode(
    solutionCode: string,
    testCode: string,
    maxTests?: number,
  ): string {
    const cleanSolution = solutionCode
      .replace(/^package\s+\w+\s*$/gm, "")
      .replace(/import\s*\([\s\S]*?\)/g, "")
      .replace(/import\s+"[^"]+"/g, "")
      .replace(/\*testing\.T/g, "*T")
      .trim();

    const cleanTests = testCode
      .replace(/^package\s+\w+\s*$/gm, "")
      .replace(/import\s*\([\s\S]*?\)/g, "")
      .replace(/import\s+"[^"]+"/g, "")
      .replace(/\*testing\.T/g, "*T")
      .trim();

    const solutionImports = this.extractGoImports(solutionCode);
    const testImports = this.extractGoImports(testCode);
    const candidateImports = [...new Set([...solutionImports, ...testImports])];

    const combinedCode = cleanSolution + "\n" + cleanTests;
    const additionalImports = candidateImports.filter((imp) => {
      const pkgName = imp.split("/").pop() || imp;
      const usagePattern = new RegExp(`\\b${pkgName}\\.`, "g");
      return usagePattern.test(combinedCode);
    });

    const testFunctions = this.extractGoTestFunctions(testCode);
    const testsToRun = maxTests
      ? testFunctions.slice(0, maxTests)
      : testFunctions;

    const testCalls = testsToRun
      .map((name) => `    runTest("${name}", ${name}, "")`)
      .join("\n");

    const baseImports = ["encoding/json", "fmt", "os", "regexp"];
    const allImports = [...new Set([...baseImports, ...additionalImports])];
    const importBlock = allImports.map((i) => `    "${i}"`).join("\n");

    return `package main

import (
${importBlock}
)

type TestResult struct {
    Name     string \`json:"name"\`
    Passed   bool   \`json:"passed"\`
    Error    string \`json:"error,omitempty"\`
    Expected string \`json:"expected,omitempty"\`
    Output   string \`json:"output,omitempty"\`
}

type TestOutput struct {
    Tests  []TestResult \`json:"tests"\`
    Passed int          \`json:"passed"\`
    Total  int          \`json:"total"\`
}

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
func (t *T) Helper() {}
func (t *T) Parallel() {}
func (t *T) Cleanup(f func()) { defer f() }
func (t *T) Run(name string, f func(*T)) bool {
    subT := &T{name: t.name + "/" + name}
    defer func() {
        if r := recover(); r != nil {
            subT.failed = true
        }
        if subT.failed {
            t.failed = true
            t.errorMsg = subT.errorMsg
        }
    }()
    f(subT)
    return !subT.failed
}

type B struct { N int }
func (b *B) ResetTimer() {}
func (b *B) StopTimer() {}
func (b *B) StartTimer() {}

// Solution code
${cleanSolution}

// Test code
${cleanTests}

var testResults []TestResult
var totalTests = 0

func parseError(errMsg string) (expected, output string) {
    re := regexp.MustCompile(\`(?i)(?:expected|want)[:\\s]+(.+?)[,\\s]+(?:got|but got|actual)[:\\s]+(.+)\`)
    matches := re.FindStringSubmatch(errMsg)
    if len(matches) >= 3 {
        return matches[1], matches[2]
    }
    return "", ""
}

func runTest(name string, fn func(*T), description string) bool {
    totalTests++
    t := &T{name: name}
    result := TestResult{Name: name, Passed: false}

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
   * Build Java test code
   */
  private buildJavaTestCode(solutionCode: string, testCode: string): string {
    const testClasses = this.extractJavaTestClasses(testCode);
    const additionalImports = this.extractJavaImports(testCode);

    const cleanSolution = solutionCode
      .replace(/import\s+java\.util\.\*;/gm, "")
      .replace(/import\s+java\.util\.\w+;/gm, "")
      .trim();

    const cleanTests = testCode
      .replace(/import\s+org\.junit.*$/gm, "")
      .replace(/import\s+static\s+org\.junit.*$/gm, "")
      .replace(/import\s+java\.\w+(\.\w+)*(\.\*)?;/gm, "")
      .replace(/class\s+(Test\d+)\s*\{/g, "class $1 implements Testable {")
      .replace(/@Test\s*/g, "")
      .replace(/(?<!Assert\.)assertEquals\(/g, "Assert.assertEquals(")
      .replace(/(?<!Assert\.)assertTrue\(/g, "Assert.assertTrue(")
      .replace(/(?<!Assert\.)assertFalse\(/g, "Assert.assertFalse(")
      .replace(/(?<!Assert\.)assertNull\(/g, "Assert.assertNull(")
      .replace(/(?<!Assert\.)assertNotNull\(/g, "Assert.assertNotNull(")
      .trim();

    const testCalls = testClasses
      .map((name) => `        runTest("${name}", new ${name}());`)
      .join("\n");

    const baseImports = ["java.util.ArrayList", "java.util.List"];
    const allImports = [...new Set([...baseImports, ...additionalImports])];
    const importBlock = allImports.map((imp) => `import ${imp};`).join("\n");

    return `${importBlock}

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
            results.add("{\\"name\\":\\"" + esc(name) + "\\",\\"passed\\":true}");
        } catch (AssertionError e) {
            String err = e.getMessage() != null ? e.getMessage() : "Assertion failed";
            results.add("{\\"name\\":\\"" + esc(name) + "\\",\\"passed\\":false,\\"error\\":\\"" + esc(err) + "\\"}");
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
        return s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n");
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
    static void assertEquals(Object expected, Object actual) {
        if (!java.util.Objects.equals(expected, actual))
            throw new AssertionError("Expected: " + expected + ", Got: " + actual);
    }
    static void assertEquals(int expected, int actual) {
        if (expected != actual) throw new AssertionError("Expected: " + expected + ", Got: " + actual);
    }
    static void assertTrue(boolean condition) {
        if (!condition) throw new AssertionError("Expected true but got false");
    }
    static void assertFalse(boolean condition) {
        if (condition) throw new AssertionError("Expected false but got true");
    }
    static void assertNull(Object obj) {
        if (obj != null) throw new AssertionError("Expected null but got: " + obj);
    }
    static void assertNotNull(Object obj) {
        if (obj == null) throw new AssertionError("Expected not null but got null");
    }
    static void reset() {}
}

// Test classes
${cleanTests}
`;
  }

  private extractGoImports(code: string): string[] {
    const imports: string[] = [];
    const multiImportMatch = code.match(/import\s*\(([\s\S]*?)\)/);
    if (multiImportMatch) {
      const packageMatches = multiImportMatch[1].match(/"([^"]+)"/g);
      if (packageMatches) {
        packageMatches.forEach((pkg) => {
          const cleanPkg = pkg.replace(/"/g, "");
          if (cleanPkg !== "testing") imports.push(cleanPkg);
        });
      }
    }
    const singleImportMatches = code.match(/import\s+"([^"]+)"/g);
    if (singleImportMatches) {
      singleImportMatches.forEach((match) => {
        const pkgMatch = match.match(/"([^"]+)"/);
        if (pkgMatch && pkgMatch[1] !== "testing") imports.push(pkgMatch[1]);
      });
    }
    return imports;
  }

  private extractGoTestFunctions(testCode: string): string[] {
    const functions: string[] = [];
    const regex = /func\s+(Test\w+)\s*\(/g;
    let match;
    while ((match = regex.exec(testCode)) !== null) {
      if (/^Test[A-Za-z0-9_]+$/.test(match[1])) {
        functions.push(match[1]);
      }
    }
    return functions;
  }

  private extractJavaTestClasses(testCode: string): string[] {
    const classes: string[] = [];
    const classRegex = /class\s+(Test\d+)\s*\{/g;
    let match;
    while ((match = classRegex.exec(testCode)) !== null) {
      classes.push(match[1]);
    }
    return classes;
  }

  private extractJavaImports(testCode: string): string[] {
    const imports: string[] = [];
    // Match both specific imports (java.lang.reflect.Method) and wildcards (java.lang.reflect.*)
    const importRegex = /import\s+(java\.\w+(?:\.\w+)*(?:\.\*)?);/g;
    let match;
    while ((match = importRegex.exec(testCode)) !== null) {
      // Skip java.util.* imports as they're handled separately
      if (
        !match[1].startsWith("java.util.") &&
        !match[1].startsWith("java.util")
      ) {
        imports.push(match[1]);
      }
    }
    return imports;
  }

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
      message: "Code execution service is temporarily unavailable.",
    };
  }

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

  private truncateOutput(output: string, maxLength = 10000): string {
    if (!output) return "";
    if (output.length <= maxLength) return output;
    return output.substring(0, maxLength) + "\n\n... [Output truncated]";
  }
}
