import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Threat level classification
 */
export enum ThreatLevel {
  NONE = 'none',
  LOW = 'low',       // Suspicious but might be legitimate
  MEDIUM = 'medium', // Likely malicious
  HIGH = 'high',     // Definitely malicious
  CRITICAL = 'critical', // Dangerous system-level access
}

/**
 * Scan result for submitted code
 */
export interface CodeScanResult {
  isSafe: boolean;
  threatLevel: ThreatLevel;
  threats: ThreatMatch[];
  message?: string;
}

/**
 * A matched threat pattern
 */
export interface ThreatMatch {
  pattern: string;
  description: string;
  threatLevel: ThreatLevel;
  lineNumber?: number;
  snippet?: string;
}

/**
 * Pattern definition for threat detection
 */
interface ThreatPattern {
  pattern: RegExp;
  description: string;
  threatLevel: ThreatLevel;
  languages?: string[]; // Optional language filter
}

/**
 * Code Scanner Service
 * Detects potentially malicious patterns in submitted code
 *
 * This is a defense-in-depth layer - Piston already provides sandboxing,
 * but this prevents obviously malicious code from even being executed.
 */
@Injectable()
export class CodeScannerService {
  private readonly logger = new Logger(CodeScannerService.name);
  private readonly enabled: boolean;

  // Patterns organized by category
  private readonly threatPatterns: ThreatPattern[] = [
    // ===========================================
    // CRITICAL: System-level access
    // ===========================================
    {
      pattern: /\b(os\.system|subprocess\.call|subprocess\.run|subprocess\.Popen|exec\s*\(|shell_exec|system\s*\()\b/gi,
      description: 'System command execution',
      threatLevel: ThreatLevel.CRITICAL,
    },
    {
      pattern: /\bRuntime\.getRuntime\(\)\.exec\b/gi,
      description: 'Java system command execution',
      threatLevel: ThreatLevel.CRITICAL,
      languages: ['java'],
    },
    {
      pattern: /\bos\/exec\b.*\bCommand\b/gi,
      description: 'Go system command execution',
      threatLevel: ThreatLevel.CRITICAL,
      languages: ['go'],
    },
    {
      pattern: /\bprocess\.exit\s*\(/gi,
      description: 'Process termination',
      threatLevel: ThreatLevel.CRITICAL,
    },
    {
      pattern: /\bos\.Exit\s*\(/gi,
      description: 'Go process termination',
      threatLevel: ThreatLevel.HIGH,
      languages: ['go'],
    },
    {
      pattern: /\bSystem\.exit\s*\(/gi,
      description: 'Java process termination',
      threatLevel: ThreatLevel.HIGH,
      languages: ['java'],
    },

    // ===========================================
    // HIGH: File system access
    // ===========================================
    {
      pattern: /\b(open\s*\(|fopen|file\s*\(|readFile|writeFile|fs\.|os\.open|ioutil\.ReadFile|ioutil\.WriteFile)\b/gi,
      description: 'File system access',
      threatLevel: ThreatLevel.HIGH,
    },
    {
      pattern: /\bFileWriter|FileReader|FileOutputStream|FileInputStream|Files\.(read|write|delete|copy|move)\b/gi,
      description: 'Java file access',
      threatLevel: ThreatLevel.HIGH,
      languages: ['java'],
    },
    {
      pattern: /\bos\.(Remove|RemoveAll|Rename|Mkdir|MkdirAll|Create|OpenFile)\b/gi,
      description: 'Go file system modification',
      threatLevel: ThreatLevel.HIGH,
      languages: ['go'],
    },
    {
      pattern: /\brm\s+-rf|rmdir|del\s+\/|format\s+[a-z]:/gi,
      description: 'Destructive file operations in strings',
      threatLevel: ThreatLevel.CRITICAL,
    },
    {
      pattern: /\/(etc|proc|sys|dev|root|home|var)\//gi,
      description: 'Access to sensitive system directories',
      threatLevel: ThreatLevel.HIGH,
    },

    // ===========================================
    // HIGH: Network access
    // ===========================================
    {
      pattern: /\b(socket|urllib|requests\.|http\.client|httplib|ftplib|net\.Dial|net\.Listen|http\.Get|http\.Post)\b/gi,
      description: 'Network access',
      threatLevel: ThreatLevel.HIGH,
    },
    {
      pattern: /\bHttpURLConnection|URLConnection|Socket\s*\(|ServerSocket|DatagramSocket\b/gi,
      description: 'Java network access',
      threatLevel: ThreatLevel.HIGH,
      languages: ['java'],
    },
    {
      pattern: /\bnet\/http\b.*\b(Get|Post|Do|Client)\b/gi,
      description: 'Go HTTP client',
      threatLevel: ThreatLevel.HIGH,
      languages: ['go'],
    },
    {
      pattern: /\bfetch\s*\(|XMLHttpRequest|axios|superagent\b/gi,
      description: 'JavaScript HTTP requests',
      threatLevel: ThreatLevel.HIGH,
      languages: ['javascript', 'typescript'],
    },

    // ===========================================
    // MEDIUM: Environment and reflection
    // ===========================================
    {
      pattern: /\b(os\.environ|process\.env|getenv|System\.getenv|os\.Getenv)\b/gi,
      description: 'Environment variable access',
      threatLevel: ThreatLevel.MEDIUM,
    },
    {
      pattern: /\b(eval\s*\(|exec\s*\(|compile\s*\()\b(?!\.)/gi,
      description: 'Dynamic code execution',
      threatLevel: ThreatLevel.MEDIUM,
    },
    {
      pattern: /\breflect\.(Value|Type|Method|Field)|Class\.forName|getDeclaredMethod|getMethod\b/gi,
      description: 'Reflection usage',
      threatLevel: ThreatLevel.MEDIUM,
    },
    {
      pattern: /\bunsafe\./gi,
      description: 'Go unsafe package',
      threatLevel: ThreatLevel.MEDIUM,
      languages: ['go'],
    },

    // ===========================================
    // MEDIUM: Resource exhaustion
    // ===========================================
    {
      pattern: /while\s*\(\s*true\s*\)|while\s*\(\s*1\s*\)|for\s*\(\s*;\s*;\s*\)|loop\s*\{/gi,
      description: 'Potential infinite loop',
      threatLevel: ThreatLevel.LOW, // Low because might be intentional with break
    },
    {
      pattern: /\b(fork|spawn|Thread|threading|goroutine|go\s+func)\b.*\bfor\b|\bfor\b.*\b(fork|spawn|Thread|threading|go\s+func)\b/gi,
      description: 'Fork bomb pattern',
      threatLevel: ThreatLevel.CRITICAL,
    },
    {
      pattern: /\[\s*\]\s*\*\s*\d{6,}|\*\s*\d{7,}/gi,
      description: 'Large memory allocation',
      threatLevel: ThreatLevel.MEDIUM,
    },

    // ===========================================
    // MEDIUM: Cryptographic operations (might be trying to mine)
    // ===========================================
    {
      pattern: /\b(hashlib|crypto|sha256|md5|bcrypt|scrypt|pbkdf2)\b.*\bwhile\b|\bfor\b.*\b(hashlib|crypto|sha256)\b/gi,
      description: 'Repeated cryptographic operations (potential mining)',
      threatLevel: ThreatLevel.MEDIUM,
    },

    // ===========================================
    // LOW: Suspicious patterns
    // ===========================================
    {
      pattern: /\b(__import__|importlib\.import_module|require\s*\(['"`]child_process)\b/gi,
      description: 'Dynamic module import',
      threatLevel: ThreatLevel.LOW,
    },
    {
      pattern: /\b(ctypes|cffi|cgo|JNI|native)\b/gi,
      description: 'Native code interface',
      threatLevel: ThreatLevel.LOW,
    },
    {
      pattern: /\bpickle\.(load|loads)|yaml\.load|json\.loads.*eval\b/gi,
      description: 'Potential deserialization vulnerability',
      threatLevel: ThreatLevel.MEDIUM,
    },

    // ===========================================
    // DATA EXFILTRATION PATTERNS
    // ===========================================
    {
      pattern: /base64\.(b64encode|encode|b64decode)|btoa|atob/gi,
      description: 'Base64 encoding (potential data exfiltration)',
      threatLevel: ThreatLevel.LOW,
    },
    {
      pattern: /\b(curl|wget|nc|netcat)\s+/gi,
      description: 'Command-line network tools in code',
      threatLevel: ThreatLevel.HIGH,
    },
  ];

  constructor(private configService: ConfigService) {
    const configValue = this.configService.get<string>('MALICIOUS_CODE_CHECK', 'true');
    this.enabled = configValue !== 'false' && configValue !== '0';
    this.logger.log(`Code scanner ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Scan code for malicious patterns
   */
  scan(code: string, language: string): CodeScanResult {
    if (!this.enabled) {
      return {
        isSafe: true,
        threatLevel: ThreatLevel.NONE,
        threats: [],
      };
    }

    const normalizedLanguage = language.toLowerCase();
    const threats: ThreatMatch[] = [];
    const lines = code.split('\n');

    for (const threatPattern of this.threatPatterns) {
      // Skip patterns that don't apply to this language
      if (threatPattern.languages && !threatPattern.languages.includes(normalizedLanguage)) {
        continue;
      }

      // Check entire code for pattern
      const matches = code.match(threatPattern.pattern);
      if (matches) {
        // Find line number for first match
        let lineNumber: number | undefined;
        let snippet: string | undefined;

        for (let i = 0; i < lines.length; i++) {
          if (threatPattern.pattern.test(lines[i])) {
            lineNumber = i + 1;
            snippet = lines[i].trim().substring(0, 100);
            break;
          }
          // Reset lastIndex for global patterns
          threatPattern.pattern.lastIndex = 0;
        }

        threats.push({
          pattern: threatPattern.pattern.source,
          description: threatPattern.description,
          threatLevel: threatPattern.threatLevel,
          lineNumber,
          snippet,
        });
      }

      // Reset lastIndex for global patterns
      threatPattern.pattern.lastIndex = 0;
    }

    // Determine overall threat level
    const maxThreatLevel = this.getMaxThreatLevel(threats);

    // Code is considered unsafe if threat level is MEDIUM or higher
    const isSafe = maxThreatLevel === ThreatLevel.NONE || maxThreatLevel === ThreatLevel.LOW;

    const result: CodeScanResult = {
      isSafe,
      threatLevel: maxThreatLevel,
      threats,
    };

    if (!isSafe) {
      result.message = `Code contains potentially dangerous patterns: ${threats
        .filter(t => t.threatLevel !== ThreatLevel.LOW)
        .map(t => t.description)
        .join(', ')}`;

      this.logger.warn(`Malicious code detected: ${result.message}`, {
        language,
        threatCount: threats.length,
        maxThreatLevel,
      });
    }

    return result;
  }

  /**
   * Get the highest threat level from a list of threats
   */
  private getMaxThreatLevel(threats: ThreatMatch[]): ThreatLevel {
    const levels = [ThreatLevel.NONE, ThreatLevel.LOW, ThreatLevel.MEDIUM, ThreatLevel.HIGH, ThreatLevel.CRITICAL];

    let maxIndex = 0;
    for (const threat of threats) {
      const index = levels.indexOf(threat.threatLevel);
      if (index > maxIndex) {
        maxIndex = index;
      }
    }

    return levels[maxIndex];
  }

  /**
   * Async scan for non-blocking operation
   * Uses setImmediate to yield to event loop for large code samples
   */
  async scanAsync(code: string, language: string): Promise<CodeScanResult> {
    // For short code (< 10KB), scan synchronously - overhead of async not worth it
    if (code.length < 10000) {
      return this.scan(code, language);
    }

    // For larger code, use setImmediate to not block event loop
    return new Promise((resolve) => {
      setImmediate(() => {
        resolve(this.scan(code, language));
      });
    });
  }

  /**
   * Batch scan for multiple code submissions (non-blocking)
   * Useful for queue processing
   */
  async scanBatch(
    submissions: Array<{ code: string; language: string }>,
  ): Promise<CodeScanResult[]> {
    const results: CodeScanResult[] = [];

    for (let i = 0; i < submissions.length; i++) {
      const { code, language } = submissions[i];
      const result = await this.scanAsync(code, language);
      results.push(result);

      // Yield to event loop every 5 scans
      if (i % 5 === 4) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    return results;
  }

  /**
   * Quick check if code is definitely safe (no patterns matched)
   */
  isDefinitelySafe(code: string, language: string): boolean {
    const result = this.scan(code, language);
    return result.isSafe && result.threats.length === 0;
  }

  /**
   * Get human-readable threat level description
   */
  getThreatLevelDescription(level: ThreatLevel): string {
    switch (level) {
      case ThreatLevel.NONE:
        return 'No threats detected';
      case ThreatLevel.LOW:
        return 'Minor concerns (usually safe)';
      case ThreatLevel.MEDIUM:
        return 'Suspicious patterns detected';
      case ThreatLevel.HIGH:
        return 'Dangerous patterns detected';
      case ThreatLevel.CRITICAL:
        return 'Critical security threat';
      default:
        return 'Unknown';
    }
  }
}
