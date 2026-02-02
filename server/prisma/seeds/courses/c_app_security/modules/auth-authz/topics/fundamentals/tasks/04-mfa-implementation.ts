import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'sec-mfa-implementation',
	title: 'Multi-Factor Authentication (MFA) Implementation',
	difficulty: 'medium',
	tags: ['security', 'mfa', '2fa', 'totp', 'authentication', 'typescript'],
	estimatedTime: '40m',
	isPremium: false,
	youtubeUrl: '',
	description: `Learn to implement Multi-Factor Authentication - essential for strong security.

**What is MFA?**

Multi-Factor Authentication requires users to provide two or more verification factors. Factors are categorized as:

1. **Something you know** - Password, PIN
2. **Something you have** - Phone, security key
3. **Something you are** - Biometrics (fingerprint, face)

**Common MFA Methods:**

1. **TOTP** (Time-based One-Time Password) - Google Authenticator, Authy
2. **SMS/Email OTP** - Less secure, vulnerable to SIM swap
3. **Push Notifications** - Approve on device
4. **Hardware Keys** - YubiKey, FIDO2/WebAuthn

**Your Task:**

Implement an \`MfaManager\` class that:

1. Generates and validates TOTP codes
2. Manages backup codes
3. Handles MFA enrollment flow
4. Validates MFA attempts with rate limiting

**Example Usage:**

\`\`\`typescript
const mfa = new MfaManager();

// Generate TOTP secret for user
const { secret, qrCodeUrl } = mfa.generateTotpSecret('user@email.com');

// Validate TOTP code
mfa.validateTotp(secret, '123456'); // true/false

// Generate backup codes
const backupCodes = mfa.generateBackupCodes(8);
// ['ABCD-1234', 'EFGH-5678', ...]

// Validate backup code (one-time use)
mfa.validateBackupCode('user123', 'ABCD-1234');
\`\`\``,
	initialCode: `interface TotpSecret {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface MfaConfig {
  totpWindow?: number;  // Time window for code validation
  backupCodeCount?: number;
  maxAttempts?: number;
  lockoutDuration?: number;
}

class MfaManager {
  private config: Required<MfaConfig>;
  private backupCodes: Map<string, Set<string>> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  constructor(config?: MfaConfig) {
    this.config = {
      totpWindow: config?.totpWindow || 1,
      backupCodeCount: config?.backupCodeCount || 8,
      maxAttempts: config?.maxAttempts || 5,
      lockoutDuration: config?.lockoutDuration || 900000, // 15 min
    };
  }

  generateTotpSecret(email: string): TotpSecret {
    // TODO: Generate TOTP secret
    // Create QR code URL for authenticator apps
    // Generate backup codes
    return { secret: '', qrCodeUrl: '', backupCodes: [] };
  }

  validateTotp(secret: string, code: string): boolean {
    // TODO: Validate TOTP code
    // Consider time window for clock drift
    return false;
  }

  generateBackupCodes(count?: number): string[] {
    // TODO: Generate secure backup codes
    // Format: XXXX-XXXX (alphanumeric)
    return [];
  }

  storeBackupCodes(userId: string, codes: string[]): void {
    // TODO: Store backup codes for user
    // Should be hashed in production
  }

  validateBackupCode(userId: string, code: string): boolean {
    // TODO: Validate and consume backup code
    // One-time use - remove after successful use
    return false;
  }

  isLocked(userId: string): boolean {
    // TODO: Check if user is locked out
    return false;
  }

  recordFailedAttempt(userId: string): void {
    // TODO: Record failed MFA attempt
    // Implement rate limiting
  }

  clearFailedAttempts(userId: string): void {
    // TODO: Clear failed attempts on success
  }

  private generateOtp(secret: string, time: number): string {
    // TODO: Generate TOTP code
    // Simplified version - real implementation uses HMAC-SHA1
    return '';
  }
}

export { MfaManager, TotpSecret, MfaConfig };`,
	solutionCode: `interface TotpSecret {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface MfaConfig {
  totpWindow?: number;  // Time window for code validation
  backupCodeCount?: number;
  maxAttempts?: number;
  lockoutDuration?: number;
}

class MfaManager {
  private config: Required<MfaConfig>;
  private backupCodes: Map<string, Set<string>> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  constructor(config?: MfaConfig) {
    this.config = {
      totpWindow: config?.totpWindow || 1,
      backupCodeCount: config?.backupCodeCount || 8,
      maxAttempts: config?.maxAttempts || 5,
      lockoutDuration: config?.lockoutDuration || 900000, // 15 min
    };
  }

  // Generate TOTP secret and QR code URL
  generateTotpSecret(email: string): TotpSecret {
    // Generate random secret (20 bytes for base32)
    const secretArray = new Uint8Array(20);
    crypto.getRandomValues(secretArray);
    const secret = this.toBase32(secretArray);

    // Create otpauth:// URL for QR code
    const issuer = encodeURIComponent('MyApp');
    const account = encodeURIComponent(email);
    const qrCodeUrl = \`otpauth://totp/\${issuer}:\${account}?secret=\${secret}&issuer=\${issuer}&algorithm=SHA1&digits=6&period=30\`;

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(this.config.backupCodeCount);

    return { secret, qrCodeUrl, backupCodes };
  }

  // Validate TOTP code with time window
  validateTotp(secret: string, code: string): boolean {
    // Validate code format
    if (!/^\\d{6}$/.test(code)) {
      return false;
    }

    const now = Math.floor(Date.now() / 30000);  // 30-second periods

    // Check current and adjacent time windows for clock drift
    for (let i = -this.config.totpWindow; i <= this.config.totpWindow; i++) {
      const expectedCode = this.generateOtp(secret, now + i);
      if (expectedCode === code) {
        return true;
      }
    }

    return false;
  }

  // Generate secure backup codes
  generateBackupCodes(count?: number): string[] {
    const numCodes = count || this.config.backupCodeCount;
    const codes: string[] = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < numCodes; i++) {
      let code = '';
      const array = new Uint8Array(8);
      crypto.getRandomValues(array);

      for (let j = 0; j < 8; j++) {
        code += chars[array[j] % chars.length];
        if (j === 3) code += '-';  // Add separator
      }
      codes.push(code);
    }

    return codes;
  }

  // Store backup codes for user (in production, hash these)
  storeBackupCodes(userId: string, codes: string[]): void {
    this.backupCodes.set(userId, new Set(codes.map(c => c.toUpperCase())));
  }

  // Validate and consume backup code (one-time use)
  validateBackupCode(userId: string, code: string): boolean {
    const userCodes = this.backupCodes.get(userId);

    if (!userCodes) {
      return false;
    }

    const normalizedCode = code.toUpperCase();

    if (userCodes.has(normalizedCode)) {
      // Remove used code
      userCodes.delete(normalizedCode);
      return true;
    }

    return false;
  }

  // Check if user is locked out
  isLocked(userId: string): boolean {
    const attempts = this.failedAttempts.get(userId);

    if (!attempts) {
      return false;
    }

    // Check if lockout has expired
    if (Date.now() - attempts.lastAttempt > this.config.lockoutDuration) {
      this.failedAttempts.delete(userId);
      return false;
    }

    return attempts.count >= this.config.maxAttempts;
  }

  // Record failed MFA attempt
  recordFailedAttempt(userId: string): void {
    const current = this.failedAttempts.get(userId);
    const now = Date.now();

    if (current) {
      // Reset if lockout expired
      if (now - current.lastAttempt > this.config.lockoutDuration) {
        this.failedAttempts.set(userId, { count: 1, lastAttempt: now });
      } else {
        current.count++;
        current.lastAttempt = now;
      }
    } else {
      this.failedAttempts.set(userId, { count: 1, lastAttempt: now });
    }
  }

  // Clear failed attempts on successful auth
  clearFailedAttempts(userId: string): void {
    this.failedAttempts.delete(userId);
  }

  // Generate TOTP code (simplified - real uses HMAC-SHA1)
  private generateOtp(secret: string, counter: number): string {
    // Simplified hash for demonstration
    // Real implementation uses HMAC-SHA1 with secret and counter
    let hash = 0;
    const input = secret + counter.toString();

    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash = hash & hash;
    }

    // Get 6 digits
    const code = Math.abs(hash) % 1000000;
    return code.toString().padStart(6, '0');
  }

  // Convert bytes to base32
  private toBase32(bytes: Uint8Array): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of bytes) {
      value = (value << 8) | byte;
      bits += 8;

      while (bits >= 5) {
        bits -= 5;
        result += alphabet[(value >> bits) & 0x1f];
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 0x1f];
    }

    return result;
  }
}

export { MfaManager, TotpSecret, MfaConfig };`,
	hint1: `For generateTotpSecret, generate 20 random bytes and convert to Base32. The QR URL format is: otpauth://totp/ISSUER:ACCOUNT?secret=SECRET&issuer=ISSUER&algorithm=SHA1&digits=6&period=30`,
	hint2: `For validateBackupCode, normalize the code to uppercase, check if it exists in the user's code set, and remove it after successful use (one-time codes).`,
	testCode: `import { MfaManager } from './solution';

// Test1: generateTotpSecret returns secret and QR URL
test('Test1', () => {
  const mfa = new MfaManager();
  const result = mfa.generateTotpSecret('user@example.com');
  expect(result.secret.length).toBeGreaterThan(0);
  expect(result.qrCodeUrl).toContain('otpauth://totp/');
});

// Test2: generateTotpSecret includes backup codes
test('Test2', () => {
  const mfa = new MfaManager({ backupCodeCount: 8 });
  const result = mfa.generateTotpSecret('user@example.com');
  expect(result.backupCodes.length).toBe(8);
});

// Test3: generateBackupCodes creates formatted codes
test('Test3', () => {
  const mfa = new MfaManager();
  const codes = mfa.generateBackupCodes(4);
  expect(codes.length).toBe(4);
  expect(codes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});

// Test4: validateBackupCode works once
test('Test4', () => {
  const mfa = new MfaManager();
  const codes = mfa.generateBackupCodes(2);
  mfa.storeBackupCodes('user1', codes);
  expect(mfa.validateBackupCode('user1', codes[0])).toBe(true);
  expect(mfa.validateBackupCode('user1', codes[0])).toBe(false); // Used
});

// Test5: validateBackupCode is case insensitive
test('Test5', () => {
  const mfa = new MfaManager();
  mfa.storeBackupCodes('user1', ['ABCD-1234']);
  expect(mfa.validateBackupCode('user1', 'abcd-1234')).toBe(true);
});

// Test6: isLocked returns false initially
test('Test6', () => {
  const mfa = new MfaManager();
  expect(mfa.isLocked('user1')).toBe(false);
});

// Test7: isLocked returns true after max attempts
test('Test7', () => {
  const mfa = new MfaManager({ maxAttempts: 3 });
  for (let i = 0; i < 3; i++) {
    mfa.recordFailedAttempt('user1');
  }
  expect(mfa.isLocked('user1')).toBe(true);
});

// Test8: clearFailedAttempts unlocks user
test('Test8', () => {
  const mfa = new MfaManager({ maxAttempts: 2 });
  mfa.recordFailedAttempt('user1');
  mfa.recordFailedAttempt('user1');
  expect(mfa.isLocked('user1')).toBe(true);
  mfa.clearFailedAttempts('user1');
  expect(mfa.isLocked('user1')).toBe(false);
});

// Test9: validateTotp rejects non-6-digit codes
test('Test9', () => {
  const mfa = new MfaManager();
  expect(mfa.validateTotp('secret', '12345')).toBe(false);
  expect(mfa.validateTotp('secret', 'abcdef')).toBe(false);
});

// Test10: Backup codes are unique
test('Test10', () => {
  const mfa = new MfaManager();
  const codes = mfa.generateBackupCodes(10);
  const unique = new Set(codes);
  expect(unique.size).toBe(10);
});`,
	whyItMatters: `MFA significantly reduces account compromise risk.

**MFA Effectiveness Statistics:**

\`\`\`
Microsoft: MFA blocks 99.9% of automated attacks
Google: Security keys stopped 100% of phishing attacks
Verizon: 80% of breaches involve stolen/weak passwords
\`\`\`

**MFA Method Comparison:**

| Method | Security | Usability | Cost |
|--------|----------|-----------|------|
| Hardware Key (FIDO2) | Best | Low | $20-50 |
| TOTP App | Great | Medium | Free |
| Push Notification | Good | High | Medium |
| SMS OTP | Poor | High | Low |
| Email OTP | Poor | High | Free |

**Why SMS MFA is Weak:**

1. **SIM Swap** - Attacker transfers your number
2. **SS7 Attacks** - Intercept SMS at network level
3. **Phishing** - User gives code to attacker site
4. **Social Engineering** - Carrier tricks

**TOTP Implementation:**

\`\`\`typescript
// Generate Secret
const secret = crypto.randomBytes(20).toString('base32');

// QR Code URL (for authenticator app)
const url = \`otpauth://totp/MyApp:user@email.com?secret=\${secret}&issuer=MyApp\`;

// Verify Code
import * as speakeasy from 'speakeasy';

const verified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: userCode,
  window: 1,  // Allow 30 seconds drift
});

// WebAuthn (Most Secure)
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: serverChallenge,
    rp: { name: 'My App' },
    user: {
      id: userId,
      name: email,
      displayName: name,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform',
      userVerification: 'required',
    },
  },
});
\`\`\`

**Backup Codes Best Practices:**
1. Generate 8-10 codes
2. Use alphanumeric format (XXXX-XXXX)
3. Hash before storing
4. One-time use only
5. Show only once at generation
6. Allow regeneration (invalidates old)`,
	order: 3,
	translations: {
		ru: {
			title: 'Реализация многофакторной аутентификации (MFA)',
			description: `Научитесь реализовывать многофакторную аутентификацию - необходимую для сильной безопасности.

**Что такое MFA?**

Многофакторная аутентификация требует от пользователей предоставления двух или более факторов верификации:

1. **Что вы знаете** - Пароль, PIN
2. **Что у вас есть** - Телефон, ключ безопасности
3. **Кто вы есть** - Биометрия

**Ваша задача:**

Реализуйте класс \`MfaManager\`:

1. Генерация и валидация TOTP кодов
2. Управление резервными кодами
3. Обработка процесса включения MFA
4. Валидация попыток с ограничением частоты`,
			hint1: `Для generateTotpSecret сгенерируйте 20 случайных байтов и конвертируйте в Base32. URL формат: otpauth://totp/ISSUER:ACCOUNT?secret=SECRET&issuer=ISSUER`,
			hint2: `Для validateBackupCode нормализуйте код в uppercase, проверьте наличие в наборе кодов пользователя и удалите после успешного использования.`,
			whyItMatters: `MFA значительно снижает риск компрометации аккаунта.`
		},
		uz: {
			title: 'Ko\'p faktorli autentifikatsiya (MFA) amalga oshirish',
			description: `Ko'p faktorli autentifikatsiyani amalga oshirishni o'rganing - kuchli xavfsizlik uchun zarur.

**MFA nima?**

Ko'p faktorli autentifikatsiya foydalanuvchilardan ikki yoki undan ko'p tasdiqlash faktorlarini talab qiladi:

1. **Siz bilasiz** - Parol, PIN
2. **Sizda bor** - Telefon, xavfsizlik kaliti
3. **Siz kim** - Biometrika

**Sizning vazifangiz:**

\`MfaManager\` klassini amalga oshiring:

1. TOTP practixrini yaratish va tasdiqlash
2. Zaxira practixrni boshqarish
3. MFA yoqish jarayonini boshqarish
4. Urinishlarni tezlik cheklash bilan tasdiqlash`,
			hint1: `generateTotpSecret uchun 20 tasodifiy bayt yarating va Base32 ga aylantiring.`,
			hint2: `validateBackupCode uchun kodni uppercase ga normalizatsiya qiling, foydalanuvchi practixr to'plamida mavjudligini tekshiring va muvaffaqiyatli foydalanishdan keyin o'chiring.`,
			whyItMatters: `MFA akkaunt buzilish xavfini sezilarli darajada kamaytiradi.`
		}
	}
};

export default task;
