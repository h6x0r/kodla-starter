import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'secure-error-handling',
	title: 'Secure Error Handling',
	difficulty: 'easy',
	tags: ['security', 'secure-coding', 'error-handling', 'typescript'],
	estimatedTime: '25m',
	isPremium: false,
	youtubeUrl: '',
	description: `Learn to handle errors securely without leaking sensitive information.

**The Problem:**

Error messages often reveal:
- Database schemas and queries
- File paths and server structure
- Technology stack and versions
- Business logic details

**Information Disclosure Examples:**

\`\`\`
BAD: "SQL Error: SELECT * FROM users WHERE id='1' OR '1'='1'"
     → Reveals SQL injection is possible

BAD: "File not found: /var/www/app/config/database.yml"
     → Reveals file structure

BAD: "NullPointerException at com.app.UserService.java:142"
     → Reveals technology stack
\`\`\`

**Secure Error Handling:**

| Environment | User Message | Logging |
|-------------|--------------|---------|
| Production | Generic message | Full details |
| Development | Full details | Full details |

**Your Task:**

Implement a \`SecureErrorHandler\` class for safe error handling.`,
	initialCode: `interface ErrorContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  timestamp?: Date;
}

interface SanitizedError {
  message: string;
  code: string;
  requestId?: string;
  timestamp: Date;
}

interface ErrorLogEntry {
  originalError: Error;
  sanitized: SanitizedError;
  context: ErrorContext;
  stackTrace?: string;
  sensitive: boolean;
}

class SecureErrorHandler {
  private isProduction: boolean;
  private sensitivePatterns: RegExp[] = [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /authorization/i,
    /credit[_-]?card/i,
    /ssn/i,
  ];

  constructor(isProduction: boolean = true) {
    this.isProduction = isProduction;
  }

  handleError(error: Error, context: ErrorContext = {}): SanitizedError {
    // TODO: Sanitize error for user response
    // Log full details, return safe message
    return { message: '', code: '', timestamp: new Date() };
  }

  sanitizeMessage(message: string): string {
    // TODO: Remove sensitive information from message
    return '';
  }

  getErrorCode(error: Error): string {
    // TODO: Map error to safe error code
    return '';
  }

  getUserMessage(errorCode: string): string {
    // TODO: Get user-friendly message for error code
    return '';
  }

  containsSensitiveData(text: string): boolean {
    // TODO: Check if text contains sensitive patterns
    return false;
  }

  redactSensitiveData(text: string): string {
    // TODO: Replace sensitive data with [REDACTED]
    return '';
  }

  logError(error: Error, context: ErrorContext): ErrorLogEntry {
    // TODO: Create log entry with full details for internal logging
    return {} as ErrorLogEntry;
  }

  formatForEnvironment(error: Error): string {
    // TODO: Return detailed error in dev, generic in prod
    return '';
  }
}

export { SecureErrorHandler, ErrorContext, SanitizedError, ErrorLogEntry };`,
	solutionCode: `interface ErrorContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  timestamp?: Date;
}

interface SanitizedError {
  message: string;
  code: string;
  requestId?: string;
  timestamp: Date;
}

interface ErrorLogEntry {
  originalError: Error;
  sanitized: SanitizedError;
  context: ErrorContext;
  stackTrace?: string;
  sensitive: boolean;
}

class SecureErrorHandler {
  private isProduction: boolean;
  private sensitivePatterns: RegExp[] = [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /authorization/i,
    /credit[_-]?card/i,
    /ssn/i,
  ];

  private errorMessages: Record<string, string> = {
    'AUTH_001': 'Authentication failed. Please check your credentials.',
    'AUTH_002': 'Session expired. Please log in again.',
    'PERM_001': 'You do not have permission to perform this action.',
    'VALID_001': 'Invalid input. Please check your data.',
    'NOTFOUND_001': 'The requested resource was not found.',
    'SERVER_001': 'An unexpected error occurred. Please try again later.',
    'RATE_001': 'Too many requests. Please slow down.',
  };

  constructor(isProduction: boolean = true) {
    this.isProduction = isProduction;
  }

  handleError(error: Error, context: ErrorContext = {}): SanitizedError {
    const errorCode = this.getErrorCode(error);
    const sanitized: SanitizedError = {
      message: this.getUserMessage(errorCode),
      code: errorCode,
      requestId: context.requestId,
      timestamp: new Date(),
    };

    // Log full details internally
    this.logError(error, context);

    return sanitized;
  }

  sanitizeMessage(message: string): string {
    // Remove file paths
    let sanitized = message.replace(/\\/[\\w\\/.-]+/g, '[PATH]');

    // Remove SQL queries
    sanitized = sanitized.replace(/SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/gi, '[SQL]');

    // Remove stack traces
    sanitized = sanitized.replace(/at\\s+[\\w.]+\\s*\\([^)]+\\)/g, '[STACK]');

    // Redact sensitive data
    sanitized = this.redactSensitiveData(sanitized);

    return sanitized;
  }

  getErrorCode(error: Error): string {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('unauthorized') || message.includes('authentication')) {
      return 'AUTH_001';
    }
    if (message.includes('expired') || message.includes('session')) {
      return 'AUTH_002';
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return 'PERM_001';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALID_001';
    }
    if (message.includes('not found') || name.includes('notfound')) {
      return 'NOTFOUND_001';
    }
    if (message.includes('rate limit') || message.includes('throttle')) {
      return 'RATE_001';
    }

    return 'SERVER_001';
  }

  getUserMessage(errorCode: string): string {
    return this.errorMessages[errorCode] || this.errorMessages['SERVER_001'];
  }

  containsSensitiveData(text: string): boolean {
    return this.sensitivePatterns.some(pattern => pattern.test(text));
  }

  redactSensitiveData(text: string): string {
    let redacted = text;

    for (const pattern of this.sensitivePatterns) {
      // Match the pattern word and anything that looks like a value after it
      const fullPattern = new RegExp(
        \`(\${pattern.source})[\\\\s:=]*["']?[^"'\\\\s]+["']?\`,
        'gi'
      );
      redacted = redacted.replace(fullPattern, '$1=[REDACTED]');
    }

    // Also redact things that look like tokens/keys
    redacted = redacted.replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]');

    return redacted;
  }

  logError(error: Error, context: ErrorContext): ErrorLogEntry {
    const sanitized = this.handleError ? {
      message: this.getUserMessage(this.getErrorCode(error)),
      code: this.getErrorCode(error),
      timestamp: new Date(),
    } : { message: '', code: '', timestamp: new Date() };

    const entry: ErrorLogEntry = {
      originalError: error,
      sanitized,
      context: {
        ...context,
        timestamp: context.timestamp || new Date(),
      },
      stackTrace: error.stack,
      sensitive: this.containsSensitiveData(error.message),
    };

    // In real app, send to secure logging service
    if (!this.isProduction) {
      console.error('Error logged:', entry);
    }

    return entry;
  }

  formatForEnvironment(error: Error): string {
    if (this.isProduction) {
      const code = this.getErrorCode(error);
      return this.getUserMessage(code);
    } else {
      return \`\${error.name}: \${error.message}\\n\${error.stack || ''}\`;
    }
  }
}

export { SecureErrorHandler, ErrorContext, SanitizedError, ErrorLogEntry };`,
	hint1: `For getErrorCode, check error message for keywords like 'unauthorized', 'permission', 'not found', 'validation' and map to appropriate codes.`,
	hint2: `For redactSensitiveData, use the sensitivePatterns array to find and replace sensitive keywords and their values with [REDACTED].`,
	testCode: `import { SecureErrorHandler } from './solution';

// Test1: handleError returns sanitized error
test('Test1', () => {
  const handler = new SecureErrorHandler(true);
  const error = new Error('Database connection failed');
  const result = handler.handleError(error, { requestId: 'req-123' });
  expect(result.code).toBeTruthy();
  expect(result.requestId).toBe('req-123');
  expect(result.timestamp).toBeTruthy();
});

// Test2: Production hides details
test('Test2', () => {
  const handler = new SecureErrorHandler(true);
  const error = new Error('SQL Error: SELECT * FROM users');
  const result = handler.formatForEnvironment(error);
  expect(result).not.toContain('SELECT');
  expect(result).not.toContain('SQL Error');
});

// Test3: Development shows details
test('Test3', () => {
  const handler = new SecureErrorHandler(false);
  const error = new Error('Detailed error message');
  const result = handler.formatForEnvironment(error);
  expect(result).toContain('Detailed error message');
});

// Test4: getErrorCode maps auth errors
test('Test4', () => {
  const handler = new SecureErrorHandler(true);
  const error = new Error('Unauthorized access');
  expect(handler.getErrorCode(error)).toBe('AUTH_001');
});

// Test5: getErrorCode maps not found
test('Test5', () => {
  const handler = new SecureErrorHandler(true);
  const error = new Error('Resource not found');
  expect(handler.getErrorCode(error)).toBe('NOTFOUND_001');
});

// Test6: containsSensitiveData detects passwords
test('Test6', () => {
  const handler = new SecureErrorHandler(true);
  expect(handler.containsSensitiveData('password=secret123')).toBe(true);
  expect(handler.containsSensitiveData('Hello world')).toBe(false);
});

// Test7: redactSensitiveData replaces sensitive values
test('Test7', () => {
  const handler = new SecureErrorHandler(true);
  const result = handler.redactSensitiveData('apiKey=abc123secret');
  expect(result).toContain('[REDACTED]');
  expect(result).not.toContain('abc123secret');
});

// Test8: getUserMessage returns friendly message
test('Test8', () => {
  const handler = new SecureErrorHandler(true);
  const message = handler.getUserMessage('AUTH_001');
  expect(message).toContain('credentials');
});

// Test9: logError creates entry with context
test('Test9', () => {
  const handler = new SecureErrorHandler(true);
  const error = new Error('Test error');
  const entry = handler.logError(error, { userId: 'user1', path: '/api/data' });
  expect(entry.originalError).toBe(error);
  expect(entry.context.userId).toBe('user1');
});

// Test10: sanitizeMessage removes paths
test('Test10', () => {
  const handler = new SecureErrorHandler(true);
  const result = handler.sanitizeMessage('Error in /var/www/app/secret.js');
  expect(result).not.toContain('/var/www');
});`,
	whyItMatters: `Error messages are a goldmine for attackers when they reveal internal details.

**Information Leakage Examples:**

\`\`\`
Stack Trace:
"java.sql.SQLException: Column 'password_hash' not found"
→ Attacker now knows the column name!

File Path:
"Error loading /home/ubuntu/app/config/secrets.yml"
→ Attacker knows the server structure!

Database Error:
"ERROR: syntax error at or near 'OR'"
→ Confirms SQL injection possibility!
\`\`\`

**Famous Error Disclosure Incidents:**

| Company | Leaked | Impact |
|---------|--------|--------|
| Various | Stack traces | Internal architecture exposed |
| Banks | SQL errors | Schema revealed |
| Healthcare | Debug info | PHI in error messages |

**Best Practices:**

1. Generic messages to users
2. Full logging internally
3. Unique error IDs for correlation
4. Never expose stack traces in prod
5. Sanitize before logging (PII, secrets)
6. Different verbosity per environment`,
	order: 2,
	translations: {
		ru: {
			title: 'Безопасная обработка ошибок',
			description: `Научитесь обрабатывать ошибки безопасно, не раскрывая конфиденциальную информацию.

**Проблема:**

Сообщения об ошибках часто раскрывают:
- Схемы баз данных и запросы
- Пути к файлам и структуру сервера
- Технологический стек и версии
- Детали бизнес-логики

**Безопасная обработка:**

| Окружение | Пользователю | Логирование |
|-----------|--------------|-------------|
| Production | Общее сообщение | Полные детали |
| Development | Полные детали | Полные детали |

**Ваша задача:**

Реализуйте класс \`SecureErrorHandler\`.`,
			hint1: `Для getErrorCode проверьте сообщение об ошибке на ключевые слова: 'unauthorized', 'permission', 'not found' и сопоставьте с кодами.`,
			hint2: `Для redactSensitiveData используйте sensitivePatterns для поиска и замены чувствительных данных на [REDACTED].`,
			whyItMatters: `Сообщения об ошибках - золотая жила для атакующих, когда раскрывают внутренние детали.`
		},
		uz: {
			title: 'Xavfsiz xatolarni qayta ishlash',
			description: `Maxfiy ma'lumotlarni oshkor qilmasdan xatolarni xavfsiz qayta ishlashni o'rganing.

**Muammo:**

Xato xabarlari ko'pincha ochib beradi:
- Ma'lumotlar bazasi sxemalari va so'rovlar
- Fayl yo'llari va server tuzilishi
- Texnologiya steki va versiyalar

**Sizning vazifangiz:**

\`SecureErrorHandler\` klassini amalga oshiring.`,
			hint1: `getErrorCode uchun xato xabarini 'unauthorized', 'permission', 'not found' kalit so'zlariga tekshiring va practixrga moslashtiring.`,
			hint2: `redactSensitiveData uchun sensitivePatterns massividan sezgir ma'lumotlarni topish va [REDACTED] bilan almashtirish uchun foydalaning.`,
			whyItMatters: `Xato xabarlari ichki tafsilotlarni oshkor qilganda tajovuzkorlar uchun oltin kon.`
		}
	}
};

export default task;
