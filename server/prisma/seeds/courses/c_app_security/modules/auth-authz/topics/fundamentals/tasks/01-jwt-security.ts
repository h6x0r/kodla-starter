import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'sec-jwt-security',
	title: 'JWT Security: Token Validation and Best Practices',
	difficulty: 'medium',
	tags: ['security', 'jwt', 'authentication', 'tokens', 'typescript'],
	estimatedTime: '40m',
	isPremium: false,
	youtubeUrl: '',
	description: `Learn to implement secure JWT (JSON Web Token) handling - essential for modern authentication.

**What is JWT?**

JWT is a compact, URL-safe means of representing claims to be transferred between two parties. JWTs are commonly used for authentication and authorization.

**JWT Structure:**

\`\`\`
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  <- Header (Base64)
eyJzdWIiOiIxMjM0IiwibmFtZSI6IkpvaG4ifQ. <- Payload (Base64)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  <- Signature
\`\`\`

**Common JWT Vulnerabilities:**

1. **Algorithm Confusion** - "alg": "none" attack
2. **Weak Secrets** - Brute-forceable HMAC keys
3. **Missing Validation** - Not checking expiry, issuer, audience
4. **Key Confusion** - RSA public key used as HMAC secret
5. **Token Leakage** - Tokens in URLs, logs, or storage

**Your Task:**

Implement a \`JwtSecurityManager\` class that:

1. Validates JWT structure and claims securely
2. Detects common JWT attack patterns
3. Enforces security best practices
4. Provides secure token generation guidelines

**Example Usage:**

\`\`\`typescript
const jwtManager = new JwtSecurityManager();

// Validate token structure
jwtManager.validateStructure(token);
// { valid: true } or { valid: false, issue: 'description' }

// Check for attacks
jwtManager.detectAttacks(token);
// { safe: false, attacks: ['algorithm_none', 'expired'] }

// Validate claims
jwtManager.validateClaims(payload, { issuer: 'myapp', audience: 'web' });
\`\`\``,
	initialCode: `interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
}

interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  [key: string]: any;
}

interface ValidationOptions {
  issuer?: string;
  audience?: string;
  maxAge?: number; // Maximum token age in seconds
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
}

class JwtSecurityManager {
  private readonly WEAK_ALGORITHMS = ['none', 'HS256'];  // HS256 is weak if secret is weak
  private readonly SECURE_ALGORITHMS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];

  parseToken(token: string): { header: JwtHeader; payload: JwtPayload } | null {
    // TODO: Parse JWT token into header and payload
    // Do NOT validate signature here, just decode
    return null;
  }

  validateStructure(token: string): ValidationResult {
    // TODO: Validate JWT has correct structure (3 parts)
    // Check that header and payload are valid JSON
    return { valid: false, issues: [] };
  }

  validateClaims(payload: JwtPayload, options: ValidationOptions): ValidationResult {
    // TODO: Validate JWT claims
    // Check: exp, iat, nbf, iss, aud
    return { valid: false, issues: [] };
  }

  detectAttacks(token: string): { safe: boolean; attacks: string[] } {
    // TODO: Detect common JWT attacks
    // Algorithm none, expired tokens, suspicious claims
    return { safe: false, attacks: [] };
  }

  isAlgorithmSecure(algorithm: string): boolean {
    // TODO: Check if algorithm is secure
    return false;
  }

  generateSecureTokenGuidelines(): string[] {
    // TODO: Return list of best practices for JWT security
    return [];
  }
}

export { JwtSecurityManager, JwtHeader, JwtPayload, ValidationOptions, ValidationResult };`,
	solutionCode: `interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
}

interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  [key: string]: any;
}

interface ValidationOptions {
  issuer?: string;
  audience?: string;
  maxAge?: number; // Maximum token age in seconds
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
}

class JwtSecurityManager {
  private readonly WEAK_ALGORITHMS = ['none', 'HS256'];  // HS256 weak with short secrets
  private readonly SECURE_ALGORITHMS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];

  // Parse JWT token into header and payload
  parseToken(token: string): { header: JwtHeader; payload: JwtPayload } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode header and payload (Base64URL)
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      return { header, payload };
    } catch {
      return null;
    }
  }

  // Validate JWT structure
  validateStructure(token: string): ValidationResult {
    const issues: string[] = [];

    // Check format
    const parts = token.split('.');
    if (parts.length !== 3) {
      issues.push('JWT must have 3 parts separated by dots');
      return { valid: false, issues };
    }

    // Try to parse header
    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      if (!header.alg) {
        issues.push('Missing algorithm in header');
      }
    } catch {
      issues.push('Invalid header encoding');
    }

    // Try to parse payload
    try {
      JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      issues.push('Invalid payload encoding');
    }

    // Check signature exists
    if (parts[2].length === 0) {
      issues.push('Missing signature');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // Validate JWT claims
  validateClaims(payload: JwtPayload, options: ValidationOptions): ValidationResult {
    const issues: string[] = [];
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    if (payload.exp !== undefined) {
      if (payload.exp < now) {
        issues.push('Token has expired');
      }
    } else {
      issues.push('Missing expiration claim (exp)');
    }

    // Check not before
    if (payload.nbf !== undefined && payload.nbf > now) {
      issues.push('Token not yet valid (nbf)');
    }

    // Check issued at
    if (payload.iat !== undefined) {
      if (payload.iat > now) {
        issues.push('Token issued in the future');
      }
      if (options.maxAge && (now - payload.iat) > options.maxAge) {
        issues.push('Token exceeds maximum age');
      }
    }

    // Check issuer
    if (options.issuer && payload.iss !== options.issuer) {
      issues.push(\`Invalid issuer: expected \${options.issuer}\`);
    }

    // Check audience
    if (options.audience) {
      const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!audiences.includes(options.audience)) {
        issues.push(\`Invalid audience: expected \${options.audience}\`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // Detect common JWT attacks
  detectAttacks(token: string): { safe: boolean; attacks: string[] } {
    const attacks: string[] = [];
    const parsed = this.parseToken(token);

    if (!parsed) {
      attacks.push('malformed_token');
      return { safe: false, attacks };
    }

    const { header, payload } = parsed;

    // Algorithm "none" attack
    if (header.alg.toLowerCase() === 'none') {
      attacks.push('algorithm_none');
    }

    // Weak algorithm
    if (this.WEAK_ALGORITHMS.includes(header.alg.toUpperCase()) && header.alg.toLowerCase() !== 'none') {
      attacks.push('weak_algorithm');
    }

    // Expired token
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      attacks.push('expired_token');
    }

    // Very long expiration (more than 24 hours suspicious for access tokens)
    if (payload.exp && payload.iat) {
      const lifetime = payload.exp - payload.iat;
      if (lifetime > 86400 * 7) {  // 7 days
        attacks.push('excessive_expiration');
      }
    }

    // Missing sub claim (who the token is for)
    if (!payload.sub) {
      attacks.push('missing_subject');
    }

    // Suspicious algorithm change (kid present but alg is HMAC)
    if (header.kid && header.alg.startsWith('HS')) {
      attacks.push('potential_key_confusion');
    }

    return {
      safe: attacks.length === 0,
      attacks,
    };
  }

  // Check if algorithm is secure
  isAlgorithmSecure(algorithm: string): boolean {
    return this.SECURE_ALGORITHMS.includes(algorithm.toUpperCase());
  }

  // Return list of best practices for JWT security
  generateSecureTokenGuidelines(): string[] {
    return [
      'Use RS256 or ES256 algorithms instead of HS256',
      'Set short expiration times (15 min for access tokens)',
      'Include iss (issuer) and aud (audience) claims',
      'Use unique jti (JWT ID) to prevent replay attacks',
      'Store tokens securely (httpOnly cookies, not localStorage)',
      'Validate all claims on every request',
      'Use strong secrets (256+ bits) if using HMAC',
      'Implement token refresh mechanism',
      'Revoke tokens on logout (use blacklist or short expiry)',
      'Never put sensitive data in JWT payload',
    ];
  }
}

export { JwtSecurityManager, JwtHeader, JwtPayload, ValidationOptions, ValidationResult };`,
	hint1: `For parseToken, split by '.', then decode each Base64URL part. Remember to replace '-' with '+' and '_' with '/' before using atob(). Wrap in try-catch for error handling.`,
	hint2: `For detectAttacks, parse the token first, then check: algorithm 'none', weak algorithms, expired tokens, missing subject, and suspicious patterns like HMAC with kid header.`,
	testCode: `import { JwtSecurityManager } from './solution';

// Valid test token (you can generate at jwt.io)
const validToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoibXlhcHAiLCJhdWQiOiJ3ZWIiLCJleHAiOjk5OTk5OTk5OTksImlhdCI6MTYwMDAwMDAwMH0.signature';
const expiredToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjM0IiwiZXhwIjoxMDAwMDAwMDAwfQ.sig';
const noneToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0In0.';

// Test1: parseToken extracts header and payload
test('Test1', () => {
  const manager = new JwtSecurityManager();
  const result = manager.parseToken(validToken);
  expect(result).not.toBeNull();
  expect(result?.header.alg).toBe('RS256');
});

// Test2: validateStructure rejects invalid format
test('Test2', () => {
  const manager = new JwtSecurityManager();
  const result = manager.validateStructure('not.a.valid.jwt.token');
  expect(result.valid).toBe(false);
});

// Test3: validateStructure accepts valid format
test('Test3', () => {
  const manager = new JwtSecurityManager();
  const result = manager.validateStructure(validToken);
  expect(result.valid).toBe(true);
});

// Test4: detectAttacks finds algorithm none
test('Test4', () => {
  const manager = new JwtSecurityManager();
  const result = manager.detectAttacks(noneToken);
  expect(result.safe).toBe(false);
  expect(result.attacks).toContain('algorithm_none');
});

// Test5: detectAttacks finds expired token
test('Test5', () => {
  const manager = new JwtSecurityManager();
  const result = manager.detectAttacks(expiredToken);
  expect(result.attacks).toContain('expired_token');
});

// Test6: isAlgorithmSecure returns true for RS256
test('Test6', () => {
  const manager = new JwtSecurityManager();
  expect(manager.isAlgorithmSecure('RS256')).toBe(true);
});

// Test7: isAlgorithmSecure returns false for none
test('Test7', () => {
  const manager = new JwtSecurityManager();
  expect(manager.isAlgorithmSecure('none')).toBe(false);
});

// Test8: validateClaims checks issuer
test('Test8', () => {
  const manager = new JwtSecurityManager();
  const payload = { sub: '123', iss: 'other', exp: 9999999999 };
  const result = manager.validateClaims(payload, { issuer: 'myapp' });
  expect(result.valid).toBe(false);
  expect(result.issues.some(i => i.includes('issuer'))).toBe(true);
});

// Test9: validateClaims checks expiration
test('Test9', () => {
  const manager = new JwtSecurityManager();
  const payload = { sub: '123', exp: 1000000000 };
  const result = manager.validateClaims(payload, {});
  expect(result.valid).toBe(false);
  expect(result.issues.some(i => i.includes('expired'))).toBe(true);
});

// Test10: generateSecureTokenGuidelines returns recommendations
test('Test10', () => {
  const manager = new JwtSecurityManager();
  const guidelines = manager.generateSecureTokenGuidelines();
  expect(guidelines.length).toBeGreaterThan(5);
  expect(guidelines.some(g => g.includes('RS256') || g.includes('ES256'))).toBe(true);
});`,
	whyItMatters: `JWT vulnerabilities have led to authentication bypasses in major applications.

**Real-World JWT Incidents:**

**1. Auth0 Libraries (2015)**
\`\`\`
Vulnerability: Algorithm confusion attack
Impact: Authentication bypass in thousands of apps
Method: Changing alg to "none" or using public key as HMAC secret
Fix: Libraries updated to validate algorithms strictly
\`\`\`

**2. Microsoft Azure AD (2021)**
\`\`\`
Vulnerability: JWT signature validation bypass
Impact: Could forge tokens for any Azure AD tenant
Method: Crafted tokens with specific claims
Severity: Critical (CVSS 10.0)
\`\`\`

**JWT Security Checklist:**

| Check | Risk | Mitigation |
|-------|------|------------|
| Algorithm "none" | Token forgery | Reject none algorithm |
| Weak HMAC secrets | Brute force | Use 256-bit+ secrets |
| Missing exp | Eternal tokens | Always set expiration |
| Token in URL | Leakage via logs | Use headers only |
| localStorage | XSS theft | Use httpOnly cookies |

**Secure JWT Implementation:**

\`\`\`typescript
// ❌ BAD: Accept any algorithm
const decoded = jwt.verify(token, secret);

// ✅ GOOD: Specify allowed algorithms
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256', 'ES256'],
  issuer: 'myapp.com',
  audience: 'web',
  maxAge: '15m',
});

// ❌ BAD: Store in localStorage (XSS vulnerable)
localStorage.setItem('token', token);

// ✅ GOOD: httpOnly cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// ❌ BAD: Long-lived access tokens
{ exp: Date.now() + (7 * 24 * 60 * 60 * 1000) }  // 7 days

// ✅ GOOD: Short-lived with refresh
{
  accessToken: { exp: 15 * 60 },      // 15 minutes
  refreshToken: { exp: 7 * 24 * 60 * 60 }  // 7 days, different endpoint
}
\`\`\`

**Token Lifecycle:**
1. Generate with short expiration (15 min)
2. Include all necessary claims (sub, iss, aud, exp, iat)
3. Sign with strong algorithm (RS256/ES256)
4. Transmit via HTTPS only
5. Validate ALL claims on every request
6. Implement refresh token rotation
7. Revoke on logout (blacklist or short expiry)`,
	order: 0,
	translations: {
		ru: {
			title: 'Безопасность JWT: Валидация токенов и лучшие практики',
			description: `Научитесь реализовывать безопасную работу с JWT (JSON Web Token) - необходимую для современной аутентификации.

**Что такое JWT?**

JWT - компактный, URL-безопасный способ передачи утверждений между двумя сторонами. JWT широко используются для аутентификации и авторизации.

**Ваша задача:**

Реализуйте класс \`JwtSecurityManager\`:

1. Безопасная валидация структуры JWT и claims
2. Обнаружение типичных атак на JWT
3. Соблюдение лучших практик безопасности
4. Рекомендации по безопасной генерации токенов`,
			hint1: `Для parseToken разделите по '.', затем декодируйте каждую Base64URL часть. Замените '-' на '+' и '_' на '/' перед atob().`,
			hint2: `Для detectAttacks сначала распарсите токен, затем проверьте: algorithm 'none', слабые алгоритмы, просроченные токены, отсутствующий subject.`,
			whyItMatters: `Уязвимости JWT привели к обходу аутентификации в крупных приложениях.`
		},
		uz: {
			title: 'JWT xavfsizligi: Token validatsiyasi va eng yaxshi amaliyotlar',
			description: `JWT (JSON Web Token) bilan xavfsiz ishlashni amalga oshirishni o'rganing - zamonaviy autentifikatsiya uchun zarur.

**JWT nima?**

JWT - ikki tomon o'rtasida da'volarni uzatishning ixcham, URL-xavfsiz usuli. JWT autentifikatsiya va avtorizatsiya uchun keng qo'llaniladi.

**Sizning vazifangiz:**

\`JwtSecurityManager\` klassini amalga oshiring:

1. JWT strukturasi va claims ni xavfsiz tasdiqlash
2. Umumiy JWT hujumlarini aniqlash
3. Xavfsizlik eng yaxshi amaliyotlarini ta'minlash
4. Xavfsiz token yaratish bo'yicha tavsiyalar`,
			hint1: `parseToken uchun '.' bo'yicha ajrating, keyin har bir Base64URL qismini depractixng.`,
			hint2: `detectAttacks uchun avval tokenni parsing qiling, keyin tekshiring: algorithm 'none', zaif algoritmlar, muddati o'tgan tokenlar.`,
			whyItMatters: `JWT zaifliklari yirik ilovalarda autentifikatsiyani chetlab o'tishga olib keldi.`
		}
	}
};

export default task;
