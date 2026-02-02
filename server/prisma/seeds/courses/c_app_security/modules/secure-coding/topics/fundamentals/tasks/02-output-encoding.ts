import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'secure-output-encoding',
	title: 'Output Encoding for XSS Prevention',
	difficulty: 'medium',
	tags: ['security', 'secure-coding', 'xss', 'encoding', 'typescript'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Learn context-aware output encoding to prevent Cross-Site Scripting (XSS).

**The Key Insight:**

Input validation alone is NOT enough. You must encode output based on WHERE it goes.

**Encoding Contexts:**

| Context | Encoding | Example |
|---------|----------|---------|
| HTML Body | HTML entities | &lt;script&gt; |
| HTML Attribute | Attribute encode | &quot;onclick&quot; |
| JavaScript | JS escape | \\x3cscript\\x3e |
| URL | URL encode | %3Cscript%3E |
| CSS | CSS escape | \\3C script\\3E |

**XSS Attack Vectors:**

\`\`\`html
<!-- HTML context -->
<div>USER_INPUT</div>

<!-- Attribute context -->
<img src="USER_INPUT">

<!-- JavaScript context -->
<script>var x = "USER_INPUT";</script>

<!-- URL context -->
<a href="USER_INPUT">Click</a>
\`\`\`

**Your Task:**

Implement an \`OutputEncoder\` class with context-aware encoding methods.`,
	initialCode: `type EncodingContext = 'html' | 'attribute' | 'javascript' | 'url' | 'css';

interface EncodingResult {
  original: string;
  encoded: string;
  context: EncodingContext;
}

class OutputEncoder {
  encodeForHTML(input: string): string {
    // TODO: Encode for HTML body context
    // Replace: & < > " '
    return '';
  }

  encodeForAttribute(input: string): string {
    // TODO: Encode for HTML attribute context
    // More aggressive than HTML body
    return '';
  }

  encodeForJavaScript(input: string): string {
    // TODO: Encode for JavaScript string context
    // Use \\xHH encoding for non-alphanumeric
    return '';
  }

  encodeForURL(input: string): string {
    // TODO: URL encode the input
    return '';
  }

  encodeForCSS(input: string): string {
    // TODO: Encode for CSS context
    // Use \\HH format
    return '';
  }

  encode(input: string, context: EncodingContext): EncodingResult {
    // TODO: Encode based on context
    return { original: '', encoded: '', context };
  }

  detectContext(template: string, placeholder: string): EncodingContext | null {
    // TODO: Detect context based on surrounding template
    return null;
  }

  sanitizeURL(url: string): string {
    // TODO: Ensure URL is safe (no javascript: etc)
    return '';
  }

  isJavaScriptScheme(url: string): boolean {
    // TODO: Detect javascript: and other dangerous schemes
    return false;
  }

  encodeAllContexts(input: string): Record<EncodingContext, string> {
    // TODO: Return input encoded for all contexts
    return {} as Record<EncodingContext, string>;
  }
}

export { OutputEncoder, EncodingContext, EncodingResult };`,
	solutionCode: `type EncodingContext = 'html' | 'attribute' | 'javascript' | 'url' | 'css';

interface EncodingResult {
  original: string;
  encoded: string;
  context: EncodingContext;
}

class OutputEncoder {
  encodeForHTML(input: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };

    return input.replace(/[&<>"']/g, char => htmlEntities[char] || char);
  }

  encodeForAttribute(input: string): string {
    // More aggressive - encode everything except alphanumeric
    let result = '';
    for (const char of input) {
      if (/[a-zA-Z0-9]/.test(char)) {
        result += char;
      } else {
        result += '&#x' + char.charCodeAt(0).toString(16).padStart(2, '0') + ';';
      }
    }
    return result;
  }

  encodeForJavaScript(input: string): string {
    // Use \\xHH format for non-alphanumeric
    let result = '';
    for (const char of input) {
      if (/[a-zA-Z0-9 ]/.test(char)) {
        result += char;
      } else {
        const hex = char.charCodeAt(0).toString(16).padStart(2, '0');
        result += '\\\\x' + hex;
      }
    }
    return result;
  }

  encodeForURL(input: string): string {
    return encodeURIComponent(input);
  }

  encodeForCSS(input: string): string {
    // Use \\HH format for non-alphanumeric
    let result = '';
    for (const char of input) {
      if (/[a-zA-Z0-9]/.test(char)) {
        result += char;
      } else {
        result += '\\\\' + char.charCodeAt(0).toString(16) + ' ';
      }
    }
    return result;
  }

  encode(input: string, context: EncodingContext): EncodingResult {
    let encoded: string;

    switch (context) {
      case 'html':
        encoded = this.encodeForHTML(input);
        break;
      case 'attribute':
        encoded = this.encodeForAttribute(input);
        break;
      case 'javascript':
        encoded = this.encodeForJavaScript(input);
        break;
      case 'url':
        encoded = this.encodeForURL(input);
        break;
      case 'css':
        encoded = this.encodeForCSS(input);
        break;
      default:
        encoded = this.encodeForHTML(input);
    }

    return { original: input, encoded, context };
  }

  detectContext(template: string, placeholder: string): EncodingContext | null {
    const index = template.indexOf(placeholder);
    if (index === -1) return null;

    const before = template.slice(0, index).toLowerCase();

    // Check for JavaScript context
    if (before.includes('<script') && !before.includes('</script>')) {
      return 'javascript';
    }

    // Check for CSS context
    if (before.includes('<style') && !before.includes('</style>')) {
      return 'css';
    }

    // Check for URL context (href, src, action)
    if (/(?:href|src|action)\\s*=\\s*["']?$/.test(before)) {
      return 'url';
    }

    // Check for attribute context (inside tag, after =)
    if (/<[^>]*=\\s*["']?$/.test(before)) {
      return 'attribute';
    }

    // Default to HTML body
    return 'html';
  }

  sanitizeURL(url: string): string {
    if (this.isJavaScriptScheme(url)) {
      return '';
    }

    try {
      const parsed = new URL(url, 'https://example.com');
      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return url;
    } catch {
      // Relative URL - allow
      if (url.startsWith('/') || url.startsWith('./')) {
        return url;
      }
      return '';
    }
  }

  isJavaScriptScheme(url: string): boolean {
    const normalized = url.toLowerCase().trim();
    const dangerous = [
      'javascript:',
      'vbscript:',
      'data:text/html',
      'data:application/javascript',
    ];

    return dangerous.some(scheme => normalized.startsWith(scheme));
  }

  encodeAllContexts(input: string): Record<EncodingContext, string> {
    return {
      html: this.encodeForHTML(input),
      attribute: this.encodeForAttribute(input),
      javascript: this.encodeForJavaScript(input),
      url: this.encodeForURL(input),
      css: this.encodeForCSS(input),
    };
  }
}

export { OutputEncoder, EncodingContext, EncodingResult };`,
	hint1: `For encodeForHTML, replace these characters: & → &amp;, < → &lt;, > → &gt;, " → &quot;, ' → &#x27;`,
	hint2: `For encodeForAttribute, be more aggressive - encode ALL non-alphanumeric characters using &#xHH; format.`,
	testCode: `import { OutputEncoder } from './solution';

// Test1: encodeForHTML escapes basic chars
test('Test1', () => {
  const encoder = new OutputEncoder();
  const result = encoder.encodeForHTML('<script>alert("xss")</script>');
  expect(result).toContain('&lt;');
  expect(result).toContain('&gt;');
  expect(result).not.toContain('<script>');
});

// Test2: encodeForAttribute encodes non-alphanumeric
test('Test2', () => {
  const encoder = new OutputEncoder();
  const result = encoder.encodeForAttribute('onclick="alert(1)"');
  expect(result).not.toContain('"');
  expect(result).not.toContain('=');
});

// Test3: encodeForJavaScript uses hex encoding
test('Test3', () => {
  const encoder = new OutputEncoder();
  const result = encoder.encodeForJavaScript('<script>');
  expect(result).toContain('\\\\x');
  expect(result).not.toContain('<');
});

// Test4: encodeForURL percent encodes
test('Test4', () => {
  const encoder = new OutputEncoder();
  const result = encoder.encodeForURL('hello world?foo=bar');
  expect(result).toContain('%20');
  expect(result).toContain('%3F');
});

// Test5: encode routes to correct method
test('Test5', () => {
  const encoder = new OutputEncoder();
  const htmlResult = encoder.encode('<test>', 'html');
  expect(htmlResult.encoded).toContain('&lt;');
  expect(htmlResult.context).toBe('html');
});

// Test6: detectContext finds JavaScript
test('Test6', () => {
  const encoder = new OutputEncoder();
  const context = encoder.detectContext('<script>var x = "PLACEHOLDER";</script>', 'PLACEHOLDER');
  expect(context).toBe('javascript');
});

// Test7: detectContext finds attribute
test('Test7', () => {
  const encoder = new OutputEncoder();
  const context = encoder.detectContext('<img src="PLACEHOLDER">', 'PLACEHOLDER');
  expect(context).toBe('url');
});

// Test8: isJavaScriptScheme detects dangerous
test('Test8', () => {
  const encoder = new OutputEncoder();
  expect(encoder.isJavaScriptScheme('javascript:alert(1)')).toBe(true);
  expect(encoder.isJavaScriptScheme('https://safe.com')).toBe(false);
});

// Test9: sanitizeURL blocks javascript:
test('Test9', () => {
  const encoder = new OutputEncoder();
  expect(encoder.sanitizeURL('javascript:alert(1)')).toBe('');
  expect(encoder.sanitizeURL('https://example.com')).toBe('https://example.com');
});

// Test10: encodeAllContexts returns all encodings
test('Test10', () => {
  const encoder = new OutputEncoder();
  const result = encoder.encodeAllContexts('<test>');
  expect(result.html).toContain('&lt;');
  expect(result.url).toContain('%3C');
  expect(Object.keys(result).length).toBe(5);
});`,
	whyItMatters: `XSS is consistently in OWASP Top 10. Context-aware encoding is the primary defense.

**Why Context Matters:**

\`\`\`html
<!-- Same input, different contexts, different attacks -->

HTML Body: <div><script>alert(1)</script></div>
Fix: &lt;script&gt;

Attribute: <img src="x" onerror="alert(1)">
Fix: src="x&#x22;&#x20;onerror&#x3d;&#x22;alert(1)"

JavaScript: var x = "</script><script>alert(1)//";
Fix: var x = "\\x3c/script\\x3e\\x3cscript\\x3ealert(1)//";
\`\`\`

**Real XSS Attacks:**

| Target | Attack | Impact |
|--------|--------|--------|
| MySpace 2005 | Samy worm | 1M profiles in 20hrs |
| Twitter 2010 | onmouseover | Massive worm spread |
| eBay 2015-2016 | Persistent XSS | Redirect to phishing |

**Defense Strategy:**

1. Encode output based on context
2. Use Content Security Policy
3. Set HTTPOnly on cookies
4. Use frameworks with auto-encoding (React, Angular)
5. Never use innerHTML with untrusted data`,
	order: 1,
	translations: {
		ru: {
			title: 'Кодирование вывода для предотвращения XSS',
			description: `Изучите контекстно-зависимое кодирование вывода для предотвращения XSS.

**Ключевой инсайт:**

Валидации ввода недостаточно. Необходимо кодировать вывод в зависимости от контекста.

**Контексты кодирования:**

| Контекст | Кодировка | Пример |
|----------|-----------|--------|
| HTML Body | HTML entities | &lt;script&gt; |
| HTML Attribute | Attribute encode | &quot;onclick&quot; |
| JavaScript | JS escape | \\x3cscript\\x3e |
| URL | URL encode | %3Cscript%3E |

**Ваша задача:**

Реализуйте класс \`OutputEncoder\`.`,
			hint1: `Для encodeForHTML замените: & → &amp;, < → &lt;, > → &gt;, " → &quot;, ' → &#x27;`,
			hint2: `Для encodeForAttribute кодируйте ВСЕ не-алфавитно-цифровые символы в формате &#xHH;`,
			whyItMatters: `XSS постоянно входит в OWASP Top 10. Контекстное кодирование - основная защита.`
		},
		uz: {
			title: 'XSS ni oldini olish uchun chiqishni practixsh',
			description: `XSS ni oldini olish uchun kontekstga qarab chiqishni practixshni o'rganing.

**Asosiy tushuncha:**

Faqat kiritishni tekshirish yetarli emas. Chiqishni QAYERGA ketishiga qarab practixsh kerak.

**Sizning vazifangiz:**

\`OutputEncoder\` klassini amalga oshiring.`,
			hint1: `encodeForHTML uchun: & → &amp;, < → &lt;, > → &gt;, " → &quot;, ' → &#x27;`,
			hint2: `encodeForAttribute uchun BARCHA alfanumerik bo'lmagan belgilarni &#xHH; formatida practixng.`,
			whyItMatters: `XSS doimo OWASP Top 10 da. Kontekstli practixsh asosiy himoya.`
		}
	}
};

export default task;
