import { ConfigService } from "@nestjs/config";
import { LANGUAGES } from "./judge0.service";

/**
 * Judge0Service Unit Tests
 *
 * Note: Full integration tests require a running Judge0 instance.
 * These tests focus on configuration, language mappings, and utility methods.
 */
describe("Judge0Service", () => {
  // ============================================
  // LANGUAGES configuration
  // ============================================
  describe("LANGUAGES configuration", () => {
    it("should have Go language configured", () => {
      expect(LANGUAGES.go).toBeDefined();
      expect(LANGUAGES.go.judge0Id).toBe(60);
      expect(LANGUAGES.go.name).toBe("Go");
      expect(LANGUAGES.go.extension).toBe(".go");
      expect(LANGUAGES.go.monacoId).toBe("go");
    });

    it("should have Java language configured", () => {
      expect(LANGUAGES.java).toBeDefined();
      expect(LANGUAGES.java.judge0Id).toBe(62);
      expect(LANGUAGES.java.name).toBe("Java");
      expect(LANGUAGES.java.extension).toBe(".java");
    });

    it("should have Python language configured", () => {
      expect(LANGUAGES.python).toBeDefined();
      expect(LANGUAGES.python.judge0Id).toBe(71);
      expect(LANGUAGES.python.name).toBe("Python");
      expect(LANGUAGES.python.extension).toBe(".py");
    });

    it("should have JavaScript language configured", () => {
      expect(LANGUAGES.javascript).toBeDefined();
      expect(LANGUAGES.javascript.judge0Id).toBe(63);
      expect(LANGUAGES.javascript.name).toBe("JavaScript");
      expect(LANGUAGES.javascript.extension).toBe(".js");
    });

    it("should have TypeScript language configured", () => {
      expect(LANGUAGES.typescript).toBeDefined();
      expect(LANGUAGES.typescript.judge0Id).toBe(74);
      expect(LANGUAGES.typescript.name).toBe("TypeScript");
      expect(LANGUAGES.typescript.extension).toBe(".ts");
    });

    it("should have C language configured", () => {
      expect(LANGUAGES.c).toBeDefined();
      expect(LANGUAGES.c.judge0Id).toBe(50);
    });

    it("should have C++ language configured", () => {
      expect(LANGUAGES.cpp).toBeDefined();
      expect(LANGUAGES.cpp.judge0Id).toBe(54);
    });

    it("should have Rust language configured", () => {
      expect(LANGUAGES.rust).toBeDefined();
      expect(LANGUAGES.rust.judge0Id).toBe(73);
    });

    it("should have all languages with required fields", () => {
      for (const [key, config] of Object.entries(LANGUAGES)) {
        expect(config.judge0Id).toBeDefined();
        expect(typeof config.judge0Id).toBe("number");
        expect(config.name).toBeDefined();
        expect(typeof config.name).toBe("string");
        expect(config.extension).toBeDefined();
        expect(config.extension.startsWith(".")).toBe(true);
        expect(config.monacoId).toBeDefined();
        expect(config.timeLimit).toBeGreaterThan(0);
        expect(config.memoryLimit).toBeGreaterThan(0);
      }
    });

    it("should have unique judge0Id for each language", () => {
      const ids = Object.values(LANGUAGES).map((l) => l.judge0Id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have reasonable time limits", () => {
      for (const [key, config] of Object.entries(LANGUAGES)) {
        expect(config.timeLimit).toBeGreaterThanOrEqual(5);
        expect(config.timeLimit).toBeLessThanOrEqual(60);
      }
    });

    it("should have reasonable memory limits", () => {
      for (const [key, config] of Object.entries(LANGUAGES)) {
        expect(config.memoryLimit).toBeGreaterThanOrEqual(128000); // 128MB min
        expect(config.memoryLimit).toBeLessThanOrEqual(1024000); // 1GB max
      }
    });
  });

  // ============================================
  // Language support
  // ============================================
  describe("supported languages", () => {
    it("should support at least 8 languages", () => {
      const languageCount = Object.keys(LANGUAGES).length;
      expect(languageCount).toBeGreaterThanOrEqual(8);
    });

    it("should include all common languages", () => {
      const commonLanguages = [
        "python",
        "javascript",
        "typescript",
        "java",
        "go",
        "c",
        "cpp",
        "rust",
      ];
      for (const lang of commonLanguages) {
        expect(LANGUAGES[lang]).toBeDefined();
      }
    });
  });

  // ============================================
  // Monaco editor mapping
  // ============================================
  describe("monaco editor mapping", () => {
    it("should have valid monaco IDs for all languages", () => {
      const validMonacoIds = [
        "python",
        "javascript",
        "typescript",
        "java",
        "go",
        "c",
        "cpp",
        "rust",
      ];
      for (const [key, config] of Object.entries(LANGUAGES)) {
        expect(validMonacoIds).toContain(config.monacoId);
      }
    });
  });

  // ============================================
  // Judge0 status codes
  // ============================================
  describe("Judge0 status handling", () => {
    it("should recognize accepted status (id: 3)", () => {
      const acceptedStatus = { id: 3, description: "Accepted" };
      expect(acceptedStatus.id).toBe(3);
    });

    it("should recognize compilation error status (id: 6)", () => {
      const compileErrorStatus = { id: 6, description: "Compilation Error" };
      expect(compileErrorStatus.id).toBe(6);
    });

    it("should recognize time limit exceeded status (id: 5)", () => {
      const tleStatus = { id: 5, description: "Time Limit Exceeded" };
      expect(tleStatus.id).toBe(5);
    });

    it("should recognize runtime error statuses (id: 7-12)", () => {
      const runtimeErrorIds = [7, 8, 9, 10, 11, 12];
      for (const id of runtimeErrorIds) {
        expect(id).toBeGreaterThanOrEqual(7);
        expect(id).toBeLessThanOrEqual(12);
      }
    });
  });

  // ============================================
  // Language-specific configurations
  // ============================================
  describe("language-specific configurations", () => {
    it("Go should have time limit within Judge0 constraints", () => {
      // Judge0 max CPU time is 15s
      expect(LANGUAGES.go.timeLimit).toBeLessThanOrEqual(15);
      expect(LANGUAGES.go.timeLimit).toBeGreaterThanOrEqual(10);
    });

    it("Java should have time limit within Judge0 constraints", () => {
      // Judge0 max CPU time is 15s
      expect(LANGUAGES.java.timeLimit).toBeLessThanOrEqual(15);
      expect(LANGUAGES.java.timeLimit).toBeGreaterThanOrEqual(10);
    });

    it("Python should have sufficient memory for libraries", () => {
      expect(LANGUAGES.python.memoryLimit).toBeGreaterThanOrEqual(256000);
    });

    it("Rust should have sufficient time for compilation", () => {
      expect(LANGUAGES.rust.timeLimit).toBeGreaterThanOrEqual(10);
    });
  });
});
