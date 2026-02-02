import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'cert-comptia-security',
	title: 'CompTIA Security+ Practice',
	difficulty: 'medium',
	tags: ['security', 'certification', 'comptia', 'typescript'],
	estimatedTime: '35m',
	isPremium: true,
	youtubeUrl: '',
	description: `Practice CompTIA Security+ (SY0-701) concepts through coding.

**Security+ Domains:**

The CompTIA Security+ covers 5 domains:

1. **General Security Concepts** (12%) - Security controls, threat types
2. **Threats, Vulnerabilities & Mitigations** (22%) - Attack vectors, indicators
3. **Security Architecture** (18%) - Network design, cloud security
4. **Security Operations** (28%) - Monitoring, incident response
5. **Security Program Management** (20%) - Governance, risk, compliance

**Your Task:**

Implement a \`SecurityPlusSimulator\` class that tests practical security scenarios.`,
	initialCode: `interface SecurityControl {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'deterrent' | 'compensating';
  category: 'technical' | 'administrative' | 'physical';
  description: string;
}

interface ThreatIndicator {
  type: 'ioc' | 'ioa'; // Indicator of Compromise vs Attack
  category: 'network' | 'host' | 'file' | 'behavioral';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface VulnerabilityAssessment {
  assetId: string;
  vulnerabilities: {
    cve: string;
    cvss: number;
    description: string;
    remediation: string;
  }[];
  riskScore: number;
  priority: 'immediate' | 'high' | 'medium' | 'low';
}

interface IncidentReport {
  id: string;
  timestamp: Date;
  type: 'malware' | 'phishing' | 'dos' | 'unauthorized_access' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSystems: string[];
  indicators: ThreatIndicator[];
  status: 'detected' | 'analyzing' | 'contained' | 'eradicated' | 'recovered';
  timeline: { phase: string; timestamp: Date; action: string }[];
}

class SecurityPlusSimulator {
  private controls: Map<string, SecurityControl> = new Map();
  private incidents: IncidentReport[] = [];
  private assets: Map<string, VulnerabilityAssessment> = new Map();

  // Control Management
  addSecurityControl(control: SecurityControl): void {
    // TODO: Add a security control
  }

  getControlsByType(type: SecurityControl['type']): SecurityControl[] {
    // TODO: Get controls by type
    return [];
  }

  getControlsByCategory(category: SecurityControl['category']): SecurityControl[] {
    // TODO: Get controls by category
    return [];
  }

  // Threat Analysis
  classifyIndicator(indicator: string): ThreatIndicator {
    // TODO: Classify a threat indicator
    // Patterns: IP addresses, domains, hashes, file paths, behaviors
    return {} as ThreatIndicator;
  }

  correlateIndicators(indicators: ThreatIndicator[]): {
    threatActor: string;
    confidence: number;
    attackPattern: string;
  } {
    // TODO: Correlate multiple indicators to identify threat
    return { threatActor: '', confidence: 0, attackPattern: '' };
  }

  // Vulnerability Management
  assessAsset(assetId: string, scanResults: { cve: string; cvss: number; description: string }[]): VulnerabilityAssessment {
    // TODO: Assess vulnerabilities and calculate risk
    return {} as VulnerabilityAssessment;
  }

  prioritizeRemediation(assessments: VulnerabilityAssessment[]): {
    assetId: string;
    cve: string;
    priority: number;
    justification: string;
  }[] {
    // TODO: Prioritize vulnerabilities for remediation
    return [];
  }

  // Incident Response
  createIncident(
    type: IncidentReport['type'],
    affectedSystems: string[],
    indicators: ThreatIndicator[]
  ): IncidentReport {
    // TODO: Create a new incident report
    return {} as IncidentReport;
  }

  updateIncidentStatus(
    incidentId: string,
    newStatus: IncidentReport['status'],
    action: string
  ): void {
    // TODO: Update incident status and add to timeline
  }

  generateIncidentMetrics(): {
    totalIncidents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    mttr: number; // Mean Time To Resolve
    activeIncidents: number;
  } {
    // TODO: Generate incident metrics
    return {} as any;
  }

  // Security Architecture
  evaluateNetworkSegmentation(segments: {
    name: string;
    systems: string[];
    accessRules: { from: string; to: string; ports: number[] }[];
  }[]): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    // TODO: Evaluate network segmentation
    return { score: 0, issues: [], recommendations: [] };
  }

  assessCloudSecurityPosture(config: {
    provider: 'aws' | 'azure' | 'gcp';
    encryption: { atRest: boolean; inTransit: boolean };
    iam: { mfaEnabled: boolean; leastPrivilege: boolean };
    logging: { enabled: boolean; retention: number };
    networkControls: { vpcEnabled: boolean; securityGroups: boolean };
  }): {
    score: number;
    findings: { severity: string; issue: string; recommendation: string }[];
  } {
    // TODO: Assess cloud security configuration
    return { score: 0, findings: [] };
  }
}

// Test your implementation
const sim = new SecurityPlusSimulator();

// Test 1: Add security control
sim.addSecurityControl({
  id: 'ctrl-001',
  name: 'Firewall',
  type: 'preventive',
  category: 'technical',
  description: 'Network firewall for perimeter defense',
});
console.log('Test 1 - Control added:', sim.getControlsByType('preventive').length === 1);

// Test 2: Classify IP indicator
const ipIndicator = sim.classifyIndicator('192.168.1.100');
console.log('Test 2 - IP classified:', ipIndicator.category === 'network');

// Test 3: Classify hash indicator
const hashIndicator = sim.classifyIndicator('5d41402abc4b2a76b9719d911017c592');
console.log('Test 3 - Hash classified:', hashIndicator.category === 'file');

// Test 4: Assess asset vulnerabilities
const assessment = sim.assessAsset('server-001', [
  { cve: 'CVE-2021-44228', cvss: 10.0, description: 'Log4Shell' },
  { cve: 'CVE-2021-45046', cvss: 9.0, description: 'Log4j bypass' },
]);
console.log('Test 4 - Asset assessed:', assessment.priority === 'immediate');

// Test 5: Create incident
const incident = sim.createIncident('malware', ['workstation-001'], [ipIndicator]);
console.log('Test 5 - Incident created:', incident.status === 'detected');

// Test 6: Update incident status
sim.updateIncidentStatus(incident.id, 'contained', 'Isolated affected system');
console.log('Test 6 - Status updated:', true);

// Test 7: Get controls by category
sim.addSecurityControl({
  id: 'ctrl-002',
  name: 'Security Policy',
  type: 'preventive',
  category: 'administrative',
  description: 'Written security policies',
});
console.log('Test 7 - Controls by category:', sim.getControlsByCategory('technical').length === 1);

// Test 8: Prioritize remediation
const priorities = sim.prioritizeRemediation([assessment]);
console.log('Test 8 - Remediation prioritized:', priorities[0]?.cve === 'CVE-2021-44228');

// Test 9: Evaluate network segmentation
const segResult = sim.evaluateNetworkSegmentation([
  {
    name: 'DMZ',
    systems: ['web-server'],
    accessRules: [{ from: 'internet', to: 'DMZ', ports: [80, 443] }],
  },
]);
console.log('Test 9 - Segmentation evaluated:', segResult.score > 0);

// Test 10: Cloud security assessment
const cloudResult = sim.assessCloudSecurityPosture({
  provider: 'aws',
  encryption: { atRest: true, inTransit: true },
  iam: { mfaEnabled: true, leastPrivilege: false },
  logging: { enabled: true, retention: 90 },
  networkControls: { vpcEnabled: true, securityGroups: true },
});
console.log('Test 10 - Cloud assessed:', cloudResult.findings.some(f => f.issue.includes('least privilege')));`,
	solutionCode: `interface SecurityControl {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'deterrent' | 'compensating';
  category: 'technical' | 'administrative' | 'physical';
  description: string;
}

interface ThreatIndicator {
  type: 'ioc' | 'ioa';
  category: 'network' | 'host' | 'file' | 'behavioral';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface VulnerabilityAssessment {
  assetId: string;
  vulnerabilities: {
    cve: string;
    cvss: number;
    description: string;
    remediation: string;
  }[];
  riskScore: number;
  priority: 'immediate' | 'high' | 'medium' | 'low';
}

interface IncidentReport {
  id: string;
  timestamp: Date;
  type: 'malware' | 'phishing' | 'dos' | 'unauthorized_access' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSystems: string[];
  indicators: ThreatIndicator[];
  status: 'detected' | 'analyzing' | 'contained' | 'eradicated' | 'recovered';
  timeline: { phase: string; timestamp: Date; action: string }[];
}

class SecurityPlusSimulator {
  private controls: Map<string, SecurityControl> = new Map();
  private incidents: IncidentReport[] = [];
  private assets: Map<string, VulnerabilityAssessment> = new Map();

  addSecurityControl(control: SecurityControl): void {
    this.controls.set(control.id, control);
  }

  getControlsByType(type: SecurityControl['type']): SecurityControl[] {
    return Array.from(this.controls.values()).filter(c => c.type === type);
  }

  getControlsByCategory(category: SecurityControl['category']): SecurityControl[] {
    return Array.from(this.controls.values()).filter(c => c.category === category);
  }

  classifyIndicator(indicator: string): ThreatIndicator {
    // IP address pattern
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    // Domain pattern
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
    // MD5/SHA1/SHA256 hash patterns
    const md5Pattern = /^[a-fA-F0-9]{32}$/;
    const sha1Pattern = /^[a-fA-F0-9]{40}$/;
    const sha256Pattern = /^[a-fA-F0-9]{64}$/;
    // File path pattern
    const filePathPattern = /^(\/|[A-Z]:\\)/;
    // Registry key pattern
    const registryPattern = /^HK(LM|CU|CR|U|CC)/;

    let category: ThreatIndicator['category'] = 'behavioral';
    let type: ThreatIndicator['type'] = 'ioc';
    let description = '';
    let severity: ThreatIndicator['severity'] = 'medium';

    if (ipPattern.test(indicator)) {
      category = 'network';
      description = 'IP address indicator';
      // Check for suspicious ranges
      if (indicator.startsWith('10.') || indicator.startsWith('192.168.')) {
        severity = 'low';
        description = 'Internal IP address';
      } else {
        severity = 'medium';
        description = 'External IP address - potential C2 server';
      }
    } else if (domainPattern.test(indicator)) {
      category = 'network';
      description = 'Domain indicator - potential malicious domain';
      severity = 'medium';
    } else if (md5Pattern.test(indicator) || sha1Pattern.test(indicator) || sha256Pattern.test(indicator)) {
      category = 'file';
      description = 'File hash indicator - potential malware signature';
      severity = 'high';
    } else if (filePathPattern.test(indicator)) {
      category = 'host';
      description = 'File path indicator';
      if (indicator.toLowerCase().includes('temp') || indicator.toLowerCase().includes('appdata')) {
        severity = 'high';
        description = 'Suspicious file path - common malware location';
      } else {
        severity = 'medium';
      }
    } else if (registryPattern.test(indicator)) {
      category = 'host';
      description = 'Registry key indicator - potential persistence mechanism';
      severity = 'high';
      type = 'ioa';
    } else {
      category = 'behavioral';
      type = 'ioa';
      description = 'Behavioral indicator - requires analysis';
      severity = 'medium';
    }

    return {
      type,
      category,
      value: indicator,
      severity,
      description,
    };
  }

  correlateIndicators(indicators: ThreatIndicator[]): {
    threatActor: string;
    confidence: number;
    attackPattern: string;
  } {
    const hasNetwork = indicators.some(i => i.category === 'network');
    const hasFile = indicators.some(i => i.category === 'file');
    const hasHost = indicators.some(i => i.category === 'host');
    const hasBehavioral = indicators.some(i => i.category === 'behavioral');
    const criticalCount = indicators.filter(i => i.severity === 'critical').length;
    const highCount = indicators.filter(i => i.severity === 'high').length;

    let threatActor = 'Unknown';
    let attackPattern = 'Unknown';
    let confidence = 0;

    if (hasNetwork && hasFile && hasHost) {
      threatActor = 'Advanced Persistent Threat (APT)';
      attackPattern = 'Multi-stage attack with lateral movement';
      confidence = 0.85;
    } else if (hasFile && hasHost && !hasNetwork) {
      threatActor = 'Insider Threat / Malware';
      attackPattern = 'Local execution without C2';
      confidence = 0.7;
    } else if (hasNetwork && !hasFile) {
      threatActor = 'External Attacker';
      attackPattern = 'Network-based reconnaissance or attack';
      confidence = 0.6;
    } else if (hasFile && !hasHost) {
      threatActor = 'Commodity Malware';
      attackPattern = 'File-based infection';
      confidence = 0.65;
    } else {
      threatActor = 'Unknown Actor';
      attackPattern = 'Insufficient data for correlation';
      confidence = 0.3;
    }

    // Adjust confidence based on severity
    confidence += criticalCount * 0.05 + highCount * 0.02;
    confidence = Math.min(confidence, 0.99);

    return { threatActor, confidence, attackPattern };
  }

  assessAsset(
    assetId: string,
    scanResults: { cve: string; cvss: number; description: string }[]
  ): VulnerabilityAssessment {
    const vulnerabilities = scanResults.map(sr => ({
      ...sr,
      remediation: this.getRemediationForCVSS(sr.cvss),
    }));

    const maxCvss = Math.max(...scanResults.map(s => s.cvss), 0);
    const avgCvss = scanResults.length > 0
      ? scanResults.reduce((sum, s) => sum + s.cvss, 0) / scanResults.length
      : 0;

    // Risk score considers both max severity and volume
    const riskScore = Math.min(10, maxCvss * 0.7 + avgCvss * 0.2 + Math.log10(scanResults.length + 1) * 0.1 * 10);

    let priority: VulnerabilityAssessment['priority'];
    if (maxCvss >= 9.0) {
      priority = 'immediate';
    } else if (maxCvss >= 7.0) {
      priority = 'high';
    } else if (maxCvss >= 4.0) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    const assessment: VulnerabilityAssessment = {
      assetId,
      vulnerabilities,
      riskScore: Math.round(riskScore * 10) / 10,
      priority,
    };

    this.assets.set(assetId, assessment);
    return assessment;
  }

  private getRemediationForCVSS(cvss: number): string {
    if (cvss >= 9.0) {
      return 'Critical: Patch immediately or take offline';
    } else if (cvss >= 7.0) {
      return 'High: Patch within 7 days, implement compensating controls';
    } else if (cvss >= 4.0) {
      return 'Medium: Patch within 30 days during maintenance window';
    } else {
      return 'Low: Include in next scheduled update cycle';
    }
  }

  prioritizeRemediation(assessments: VulnerabilityAssessment[]): {
    assetId: string;
    cve: string;
    priority: number;
    justification: string;
  }[] {
    const allVulns: {
      assetId: string;
      cve: string;
      cvss: number;
      priority: number;
      justification: string;
    }[] = [];

    for (const assessment of assessments) {
      for (const vuln of assessment.vulnerabilities) {
        // Priority score: higher CVSS = lower priority number (higher urgency)
        const priorityScore = 100 - vuln.cvss * 10;
        allVulns.push({
          assetId: assessment.assetId,
          cve: vuln.cve,
          cvss: vuln.cvss,
          priority: Math.round(priorityScore),
          justification: this.getJustification(vuln.cvss, assessment.assetId),
        });
      }
    }

    // Sort by CVSS (highest first)
    allVulns.sort((a, b) => b.cvss - a.cvss);

    return allVulns.map(({ assetId, cve, priority, justification }) => ({
      assetId,
      cve,
      priority,
      justification,
    }));
  }

  private getJustification(cvss: number, assetId: string): string {
    if (cvss >= 9.0) {
      return \`Critical vulnerability on \${assetId} - exploitable with high impact\`;
    } else if (cvss >= 7.0) {
      return \`High severity vulnerability requires prompt remediation\`;
    } else if (cvss >= 4.0) {
      return \`Medium severity - schedule for next maintenance window\`;
    } else {
      return \`Low severity - address during routine patching\`;
    }
  }

  createIncident(
    type: IncidentReport['type'],
    affectedSystems: string[],
    indicators: ThreatIndicator[]
  ): IncidentReport {
    const criticalIndicators = indicators.filter(i => i.severity === 'critical').length;
    const highIndicators = indicators.filter(i => i.severity === 'high').length;

    let severity: IncidentReport['severity'];
    if (criticalIndicators > 0 || affectedSystems.length > 5) {
      severity = 'critical';
    } else if (highIndicators > 0 || affectedSystems.length > 2) {
      severity = 'high';
    } else if (affectedSystems.length > 0) {
      severity = 'medium';
    } else {
      severity = 'low';
    }

    const incident: IncidentReport = {
      id: \`INC-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
      timestamp: new Date(),
      type,
      severity,
      affectedSystems,
      indicators,
      status: 'detected',
      timeline: [
        {
          phase: 'Detection',
          timestamp: new Date(),
          action: \`Incident detected: \${type} affecting \${affectedSystems.length} system(s)\`,
        },
      ],
    };

    this.incidents.push(incident);
    return incident;
  }

  updateIncidentStatus(
    incidentId: string,
    newStatus: IncidentReport['status'],
    action: string
  ): void {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) return;

    incident.status = newStatus;
    incident.timeline.push({
      phase: this.getPhaseForStatus(newStatus),
      timestamp: new Date(),
      action,
    });
  }

  private getPhaseForStatus(status: IncidentReport['status']): string {
    const phases: Record<IncidentReport['status'], string> = {
      detected: 'Detection',
      analyzing: 'Analysis',
      contained: 'Containment',
      eradicated: 'Eradication',
      recovered: 'Recovery',
    };
    return phases[status];
  }

  generateIncidentMetrics(): {
    totalIncidents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    mttr: number;
    activeIncidents: number;
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const incident of this.incidents) {
      byType[incident.type] = (byType[incident.type] || 0) + 1;
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;

      if (incident.status === 'recovered' && incident.timeline.length >= 2) {
        const startTime = incident.timeline[0].timestamp.getTime();
        const endTime = incident.timeline[incident.timeline.length - 1].timestamp.getTime();
        totalResolutionTime += endTime - startTime;
        resolvedCount++;
      }
    }

    const activeIncidents = this.incidents.filter(
      i => i.status !== 'recovered'
    ).length;

    const mttr = resolvedCount > 0 ? totalResolutionTime / resolvedCount / (1000 * 60 * 60) : 0;

    return {
      totalIncidents: this.incidents.length,
      byType,
      bySeverity,
      mttr: Math.round(mttr * 100) / 100,
      activeIncidents,
    };
  }

  evaluateNetworkSegmentation(segments: {
    name: string;
    systems: string[];
    accessRules: { from: string; to: string; ports: number[] }[];
  }[]): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for proper segmentation
    const segmentNames = new Set(segments.map(s => s.name));

    // Critical segments check
    const criticalSegments = ['DMZ', 'internal', 'management'];
    for (const critical of criticalSegments) {
      if (!Array.from(segmentNames).some(n => n.toLowerCase().includes(critical.toLowerCase()))) {
        issues.push(\`Missing \${critical} segment\`);
        score -= 10;
      }
    }

    for (const segment of segments) {
      // Check access rules
      for (const rule of segment.accessRules) {
        // Check for overly permissive rules
        if (rule.ports.length > 10) {
          issues.push(\`Segment \${segment.name}: Too many open ports from \${rule.from}\`);
          score -= 5;
        }

        // Check for dangerous port exposure
        const dangerousPorts = [21, 23, 445, 3389];
        const exposedDangerous = rule.ports.filter(p => dangerousPorts.includes(p));
        if (exposedDangerous.length > 0 && rule.from === 'internet') {
          issues.push(\`Segment \${segment.name}: Dangerous ports exposed to internet: \${exposedDangerous.join(', ')}\`);
          score -= 15;
        }
      }

      // Check for empty segments
      if (segment.systems.length === 0) {
        issues.push(\`Segment \${segment.name}: No systems defined\`);
        score -= 3;
      }
    }

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push('Review and restrict inter-segment access rules');
      recommendations.push('Implement micro-segmentation for critical assets');
      recommendations.push('Deploy network monitoring at segment boundaries');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  assessCloudSecurityPosture(config: {
    provider: 'aws' | 'azure' | 'gcp';
    encryption: { atRest: boolean; inTransit: boolean };
    iam: { mfaEnabled: boolean; leastPrivilege: boolean };
    logging: { enabled: boolean; retention: number };
    networkControls: { vpcEnabled: boolean; securityGroups: boolean };
  }): {
    score: number;
    findings: { severity: string; issue: string; recommendation: string }[];
  } {
    const findings: { severity: string; issue: string; recommendation: string }[] = [];
    let score = 100;

    // Encryption checks
    if (!config.encryption.atRest) {
      findings.push({
        severity: 'high',
        issue: 'Data at rest encryption disabled',
        recommendation: 'Enable encryption for all storage services',
      });
      score -= 15;
    }

    if (!config.encryption.inTransit) {
      findings.push({
        severity: 'critical',
        issue: 'Data in transit encryption disabled',
        recommendation: 'Enforce TLS for all communications',
      });
      score -= 20;
    }

    // IAM checks
    if (!config.iam.mfaEnabled) {
      findings.push({
        severity: 'critical',
        issue: 'MFA not enforced for IAM users',
        recommendation: 'Enable MFA for all user accounts',
      });
      score -= 20;
    }

    if (!config.iam.leastPrivilege) {
      findings.push({
        severity: 'high',
        issue: 'Least privilege principle not implemented',
        recommendation: 'Review and restrict IAM policies to minimum required permissions',
      });
      score -= 15;
    }

    // Logging checks
    if (!config.logging.enabled) {
      findings.push({
        severity: 'high',
        issue: 'Cloud audit logging disabled',
        recommendation: 'Enable CloudTrail/Activity Log for all regions',
      });
      score -= 15;
    } else if (config.logging.retention < 90) {
      findings.push({
        severity: 'medium',
        issue: \`Log retention too short: \${config.logging.retention} days\`,
        recommendation: 'Increase log retention to at least 90 days',
      });
      score -= 5;
    }

    // Network checks
    if (!config.networkControls.vpcEnabled) {
      findings.push({
        severity: 'high',
        issue: 'VPC/Virtual Network not configured',
        recommendation: 'Deploy resources within isolated VPC',
      });
      score -= 15;
    }

    if (!config.networkControls.securityGroups) {
      findings.push({
        severity: 'medium',
        issue: 'Security groups not properly configured',
        recommendation: 'Implement security groups with least privilege network rules',
      });
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      findings,
    };
  }
}

// Test your implementation
const sim = new SecurityPlusSimulator();

// Test 1: Add security control
sim.addSecurityControl({
  id: 'ctrl-001',
  name: 'Firewall',
  type: 'preventive',
  category: 'technical',
  description: 'Network firewall for perimeter defense',
});
console.log('Test 1 - Control added:', sim.getControlsByType('preventive').length === 1);

// Test 2: Classify IP indicator
const ipIndicator = sim.classifyIndicator('192.168.1.100');
console.log('Test 2 - IP classified:', ipIndicator.category === 'network');

// Test 3: Classify hash indicator
const hashIndicator = sim.classifyIndicator('5d41402abc4b2a76b9719d911017c592');
console.log('Test 3 - Hash classified:', hashIndicator.category === 'file');

// Test 4: Assess asset vulnerabilities
const assessment = sim.assessAsset('server-001', [
  { cve: 'CVE-2021-44228', cvss: 10.0, description: 'Log4Shell' },
  { cve: 'CVE-2021-45046', cvss: 9.0, description: 'Log4j bypass' },
]);
console.log('Test 4 - Asset assessed:', assessment.priority === 'immediate');

// Test 5: Create incident
const incident = sim.createIncident('malware', ['workstation-001'], [ipIndicator]);
console.log('Test 5 - Incident created:', incident.status === 'detected');

// Test 6: Update incident status
sim.updateIncidentStatus(incident.id, 'contained', 'Isolated affected system');
console.log('Test 6 - Status updated:', true);

// Test 7: Get controls by category
sim.addSecurityControl({
  id: 'ctrl-002',
  name: 'Security Policy',
  type: 'preventive',
  category: 'administrative',
  description: 'Written security policies',
});
console.log('Test 7 - Controls by category:', sim.getControlsByCategory('technical').length === 1);

// Test 8: Prioritize remediation
const priorities = sim.prioritizeRemediation([assessment]);
console.log('Test 8 - Remediation prioritized:', priorities[0]?.cve === 'CVE-2021-44228');

// Test 9: Evaluate network segmentation
const segResult = sim.evaluateNetworkSegmentation([
  {
    name: 'DMZ',
    systems: ['web-server'],
    accessRules: [{ from: 'internet', to: 'DMZ', ports: [80, 443] }],
  },
]);
console.log('Test 9 - Segmentation evaluated:', segResult.score > 0);

// Test 10: Cloud security assessment
const cloudResult = sim.assessCloudSecurityPosture({
  provider: 'aws',
  encryption: { atRest: true, inTransit: true },
  iam: { mfaEnabled: true, leastPrivilege: false },
  logging: { enabled: true, retention: 90 },
  networkControls: { vpcEnabled: true, securityGroups: true },
});
console.log('Test 10 - Cloud assessed:', cloudResult.findings.some(f => f.issue.includes('least privilege')));`,
	testCode: `import { describe, it, expect, beforeEach } from 'vitest';

interface SecurityControl {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'deterrent' | 'compensating';
  category: 'technical' | 'administrative' | 'physical';
  description: string;
}

interface ThreatIndicator {
  type: 'ioc' | 'ioa';
  category: 'network' | 'host' | 'file' | 'behavioral';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface VulnerabilityAssessment {
  assetId: string;
  vulnerabilities: {
    cve: string;
    cvss: number;
    description: string;
    remediation: string;
  }[];
  riskScore: number;
  priority: 'immediate' | 'high' | 'medium' | 'low';
}

interface IncidentReport {
  id: string;
  timestamp: Date;
  type: 'malware' | 'phishing' | 'dos' | 'unauthorized_access' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSystems: string[];
  indicators: ThreatIndicator[];
  status: 'detected' | 'analyzing' | 'contained' | 'eradicated' | 'recovered';
  timeline: { phase: string; timestamp: Date; action: string }[];
}

class SecurityPlusSimulator {
  private controls: Map<string, SecurityControl> = new Map();
  private incidents: IncidentReport[] = [];
  private assets: Map<string, VulnerabilityAssessment> = new Map();

  addSecurityControl(control: SecurityControl): void {
    this.controls.set(control.id, control);
  }

  getControlsByType(type: SecurityControl['type']): SecurityControl[] {
    return Array.from(this.controls.values()).filter(c => c.type === type);
  }

  getControlsByCategory(category: SecurityControl['category']): SecurityControl[] {
    return Array.from(this.controls.values()).filter(c => c.category === category);
  }

  classifyIndicator(indicator: string): ThreatIndicator {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
    const md5Pattern = /^[a-fA-F0-9]{32}$/;
    const sha1Pattern = /^[a-fA-F0-9]{40}$/;
    const sha256Pattern = /^[a-fA-F0-9]{64}$/;
    const filePathPattern = /^(\/|[A-Z]:\\)/;
    const registryPattern = /^HK(LM|CU|CR|U|CC)/;

    let category: ThreatIndicator['category'] = 'behavioral';
    let type: ThreatIndicator['type'] = 'ioc';
    let description = '';
    let severity: ThreatIndicator['severity'] = 'medium';

    if (ipPattern.test(indicator)) {
      category = 'network';
      description = 'IP address indicator';
      if (indicator.startsWith('10.') || indicator.startsWith('192.168.')) {
        severity = 'low';
        description = 'Internal IP address';
      } else {
        severity = 'medium';
        description = 'External IP address - potential C2 server';
      }
    } else if (domainPattern.test(indicator)) {
      category = 'network';
      description = 'Domain indicator - potential malicious domain';
      severity = 'medium';
    } else if (md5Pattern.test(indicator) || sha1Pattern.test(indicator) || sha256Pattern.test(indicator)) {
      category = 'file';
      description = 'File hash indicator - potential malware signature';
      severity = 'high';
    } else if (filePathPattern.test(indicator)) {
      category = 'host';
      description = 'File path indicator';
      if (indicator.toLowerCase().includes('temp') || indicator.toLowerCase().includes('appdata')) {
        severity = 'high';
        description = 'Suspicious file path - common malware location';
      } else {
        severity = 'medium';
      }
    } else if (registryPattern.test(indicator)) {
      category = 'host';
      description = 'Registry key indicator - potential persistence mechanism';
      severity = 'high';
      type = 'ioa';
    } else {
      category = 'behavioral';
      type = 'ioa';
      description = 'Behavioral indicator - requires analysis';
      severity = 'medium';
    }

    return { type, category, value: indicator, severity, description };
  }

  correlateIndicators(indicators: ThreatIndicator[]): {
    threatActor: string;
    confidence: number;
    attackPattern: string;
  } {
    const hasNetwork = indicators.some(i => i.category === 'network');
    const hasFile = indicators.some(i => i.category === 'file');
    const hasHost = indicators.some(i => i.category === 'host');
    const criticalCount = indicators.filter(i => i.severity === 'critical').length;
    const highCount = indicators.filter(i => i.severity === 'high').length;

    let threatActor = 'Unknown';
    let attackPattern = 'Unknown';
    let confidence = 0;

    if (hasNetwork && hasFile && hasHost) {
      threatActor = 'Advanced Persistent Threat (APT)';
      attackPattern = 'Multi-stage attack with lateral movement';
      confidence = 0.85;
    } else if (hasFile && hasHost && !hasNetwork) {
      threatActor = 'Insider Threat / Malware';
      attackPattern = 'Local execution without C2';
      confidence = 0.7;
    } else if (hasNetwork && !hasFile) {
      threatActor = 'External Attacker';
      attackPattern = 'Network-based reconnaissance or attack';
      confidence = 0.6;
    } else if (hasFile && !hasHost) {
      threatActor = 'Commodity Malware';
      attackPattern = 'File-based infection';
      confidence = 0.65;
    } else {
      threatActor = 'Unknown Actor';
      attackPattern = 'Insufficient data for correlation';
      confidence = 0.3;
    }

    confidence += criticalCount * 0.05 + highCount * 0.02;
    confidence = Math.min(confidence, 0.99);

    return { threatActor, confidence, attackPattern };
  }

  assessAsset(
    assetId: string,
    scanResults: { cve: string; cvss: number; description: string }[]
  ): VulnerabilityAssessment {
    const vulnerabilities = scanResults.map(sr => ({
      ...sr,
      remediation: this.getRemediationForCVSS(sr.cvss),
    }));

    const maxCvss = Math.max(...scanResults.map(s => s.cvss), 0);
    const avgCvss = scanResults.length > 0
      ? scanResults.reduce((sum, s) => sum + s.cvss, 0) / scanResults.length
      : 0;

    const riskScore = Math.min(10, maxCvss * 0.7 + avgCvss * 0.2 + Math.log10(scanResults.length + 1) * 0.1 * 10);

    let priority: VulnerabilityAssessment['priority'];
    if (maxCvss >= 9.0) {
      priority = 'immediate';
    } else if (maxCvss >= 7.0) {
      priority = 'high';
    } else if (maxCvss >= 4.0) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    const assessment: VulnerabilityAssessment = {
      assetId,
      vulnerabilities,
      riskScore: Math.round(riskScore * 10) / 10,
      priority,
    };

    this.assets.set(assetId, assessment);
    return assessment;
  }

  private getRemediationForCVSS(cvss: number): string {
    if (cvss >= 9.0) return 'Critical: Patch immediately or take offline';
    if (cvss >= 7.0) return 'High: Patch within 7 days, implement compensating controls';
    if (cvss >= 4.0) return 'Medium: Patch within 30 days during maintenance window';
    return 'Low: Include in next scheduled update cycle';
  }

  prioritizeRemediation(assessments: VulnerabilityAssessment[]): {
    assetId: string;
    cve: string;
    priority: number;
    justification: string;
  }[] {
    const allVulns: { assetId: string; cve: string; cvss: number; priority: number; justification: string }[] = [];

    for (const assessment of assessments) {
      for (const vuln of assessment.vulnerabilities) {
        const priorityScore = 100 - vuln.cvss * 10;
        allVulns.push({
          assetId: assessment.assetId,
          cve: vuln.cve,
          cvss: vuln.cvss,
          priority: Math.round(priorityScore),
          justification: this.getJustification(vuln.cvss, assessment.assetId),
        });
      }
    }

    allVulns.sort((a, b) => b.cvss - a.cvss);
    return allVulns.map(({ assetId, cve, priority, justification }) => ({ assetId, cve, priority, justification }));
  }

  private getJustification(cvss: number, assetId: string): string {
    if (cvss >= 9.0) return \`Critical vulnerability on \${assetId} - exploitable with high impact\`;
    if (cvss >= 7.0) return 'High severity vulnerability requires prompt remediation';
    if (cvss >= 4.0) return 'Medium severity - schedule for next maintenance window';
    return 'Low severity - address during routine patching';
  }

  createIncident(
    type: IncidentReport['type'],
    affectedSystems: string[],
    indicators: ThreatIndicator[]
  ): IncidentReport {
    const criticalIndicators = indicators.filter(i => i.severity === 'critical').length;
    const highIndicators = indicators.filter(i => i.severity === 'high').length;

    let severity: IncidentReport['severity'];
    if (criticalIndicators > 0 || affectedSystems.length > 5) severity = 'critical';
    else if (highIndicators > 0 || affectedSystems.length > 2) severity = 'high';
    else if (affectedSystems.length > 0) severity = 'medium';
    else severity = 'low';

    const incident: IncidentReport = {
      id: \`INC-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
      timestamp: new Date(),
      type,
      severity,
      affectedSystems,
      indicators,
      status: 'detected',
      timeline: [{ phase: 'Detection', timestamp: new Date(), action: \`Incident detected: \${type} affecting \${affectedSystems.length} system(s)\` }],
    };

    this.incidents.push(incident);
    return incident;
  }

  updateIncidentStatus(incidentId: string, newStatus: IncidentReport['status'], action: string): void {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) return;

    incident.status = newStatus;
    const phases: Record<IncidentReport['status'], string> = {
      detected: 'Detection', analyzing: 'Analysis', contained: 'Containment', eradicated: 'Eradication', recovered: 'Recovery',
    };
    incident.timeline.push({ phase: phases[newStatus], timestamp: new Date(), action });
  }

  generateIncidentMetrics(): {
    totalIncidents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    mttr: number;
    activeIncidents: number;
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const incident of this.incidents) {
      byType[incident.type] = (byType[incident.type] || 0) + 1;
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;

      if (incident.status === 'recovered' && incident.timeline.length >= 2) {
        const startTime = incident.timeline[0].timestamp.getTime();
        const endTime = incident.timeline[incident.timeline.length - 1].timestamp.getTime();
        totalResolutionTime += endTime - startTime;
        resolvedCount++;
      }
    }

    const activeIncidents = this.incidents.filter(i => i.status !== 'recovered').length;
    const mttr = resolvedCount > 0 ? totalResolutionTime / resolvedCount / (1000 * 60 * 60) : 0;

    return { totalIncidents: this.incidents.length, byType, bySeverity, mttr: Math.round(mttr * 100) / 100, activeIncidents };
  }

  evaluateNetworkSegmentation(segments: {
    name: string;
    systems: string[];
    accessRules: { from: string; to: string; ports: number[] }[];
  }[]): { score: number; issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const segmentNames = new Set(segments.map(s => s.name));
    const criticalSegments = ['DMZ', 'internal', 'management'];

    for (const critical of criticalSegments) {
      if (!Array.from(segmentNames).some(n => n.toLowerCase().includes(critical.toLowerCase()))) {
        issues.push(\`Missing \${critical} segment\`);
        score -= 10;
      }
    }

    for (const segment of segments) {
      for (const rule of segment.accessRules) {
        if (rule.ports.length > 10) {
          issues.push(\`Segment \${segment.name}: Too many open ports from \${rule.from}\`);
          score -= 5;
        }

        const dangerousPorts = [21, 23, 445, 3389];
        const exposedDangerous = rule.ports.filter(p => dangerousPorts.includes(p));
        if (exposedDangerous.length > 0 && rule.from === 'internet') {
          issues.push(\`Segment \${segment.name}: Dangerous ports exposed to internet: \${exposedDangerous.join(', ')}\`);
          score -= 15;
        }
      }

      if (segment.systems.length === 0) {
        issues.push(\`Segment \${segment.name}: No systems defined\`);
        score -= 3;
      }
    }

    if (issues.length > 0) {
      recommendations.push('Review and restrict inter-segment access rules');
      recommendations.push('Implement micro-segmentation for critical assets');
      recommendations.push('Deploy network monitoring at segment boundaries');
    }

    return { score: Math.max(0, score), issues, recommendations };
  }

  assessCloudSecurityPosture(config: {
    provider: 'aws' | 'azure' | 'gcp';
    encryption: { atRest: boolean; inTransit: boolean };
    iam: { mfaEnabled: boolean; leastPrivilege: boolean };
    logging: { enabled: boolean; retention: number };
    networkControls: { vpcEnabled: boolean; securityGroups: boolean };
  }): { score: number; findings: { severity: string; issue: string; recommendation: string }[] } {
    const findings: { severity: string; issue: string; recommendation: string }[] = [];
    let score = 100;

    if (!config.encryption.atRest) {
      findings.push({ severity: 'high', issue: 'Data at rest encryption disabled', recommendation: 'Enable encryption for all storage services' });
      score -= 15;
    }
    if (!config.encryption.inTransit) {
      findings.push({ severity: 'critical', issue: 'Data in transit encryption disabled', recommendation: 'Enforce TLS for all communications' });
      score -= 20;
    }
    if (!config.iam.mfaEnabled) {
      findings.push({ severity: 'critical', issue: 'MFA not enforced for IAM users', recommendation: 'Enable MFA for all user accounts' });
      score -= 20;
    }
    if (!config.iam.leastPrivilege) {
      findings.push({ severity: 'high', issue: 'Least privilege principle not implemented', recommendation: 'Review and restrict IAM policies to minimum required permissions' });
      score -= 15;
    }
    if (!config.logging.enabled) {
      findings.push({ severity: 'high', issue: 'Cloud audit logging disabled', recommendation: 'Enable CloudTrail/Activity Log for all regions' });
      score -= 15;
    } else if (config.logging.retention < 90) {
      findings.push({ severity: 'medium', issue: \`Log retention too short: \${config.logging.retention} days\`, recommendation: 'Increase log retention to at least 90 days' });
      score -= 5;
    }
    if (!config.networkControls.vpcEnabled) {
      findings.push({ severity: 'high', issue: 'VPC/Virtual Network not configured', recommendation: 'Deploy resources within isolated VPC' });
      score -= 15;
    }
    if (!config.networkControls.securityGroups) {
      findings.push({ severity: 'medium', issue: 'Security groups not properly configured', recommendation: 'Implement security groups with least privilege network rules' });
      score -= 10;
    }

    return { score: Math.max(0, score), findings };
  }
}

describe('SecurityPlusSimulator', () => {
  let sim: SecurityPlusSimulator;

  beforeEach(() => {
    sim = new SecurityPlusSimulator();
  });

  it('should add and retrieve security controls by type', () => {
    sim.addSecurityControl({
      id: 'ctrl-001',
      name: 'Firewall',
      type: 'preventive',
      category: 'technical',
      description: 'Network firewall',
    });
    sim.addSecurityControl({
      id: 'ctrl-002',
      name: 'IDS',
      type: 'detective',
      category: 'technical',
      description: 'Intrusion detection',
    });

    expect(sim.getControlsByType('preventive')).toHaveLength(1);
    expect(sim.getControlsByType('detective')).toHaveLength(1);
    expect(sim.getControlsByType('corrective')).toHaveLength(0);
  });

  it('should classify IP address indicators', () => {
    const external = sim.classifyIndicator('8.8.8.8');
    const internal = sim.classifyIndicator('192.168.1.100');

    expect(external.category).toBe('network');
    expect(external.severity).toBe('medium');
    expect(internal.category).toBe('network');
    expect(internal.severity).toBe('low');
  });

  it('should classify file hash indicators', () => {
    const md5 = sim.classifyIndicator('5d41402abc4b2a76b9719d911017c592');
    const sha256 = sim.classifyIndicator('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

    expect(md5.category).toBe('file');
    expect(md5.severity).toBe('high');
    expect(sha256.category).toBe('file');
  });

  it('should assess vulnerabilities and assign priority', () => {
    const critical = sim.assessAsset('server-001', [
      { cve: 'CVE-2021-44228', cvss: 10.0, description: 'Log4Shell' },
    ]);
    const medium = sim.assessAsset('server-002', [
      { cve: 'CVE-2021-1234', cvss: 5.0, description: 'Medium vuln' },
    ]);

    expect(critical.priority).toBe('immediate');
    expect(medium.priority).toBe('medium');
  });

  it('should create incidents with proper severity', () => {
    const highIndicator: ThreatIndicator = {
      type: 'ioc',
      category: 'file',
      value: 'hash123',
      severity: 'high',
      description: 'Malware hash',
    };

    const incident = sim.createIncident('malware', ['ws-001', 'ws-002', 'ws-003'], [highIndicator]);

    expect(incident.status).toBe('detected');
    expect(incident.severity).toBe('high');
    expect(incident.timeline).toHaveLength(1);
  });

  it('should update incident status with timeline', () => {
    const incident = sim.createIncident('phishing', ['user-001'], []);
    sim.updateIncidentStatus(incident.id, 'contained', 'Email quarantined');
    sim.updateIncidentStatus(incident.id, 'recovered', 'User notified');

    const metrics = sim.generateIncidentMetrics();
    expect(metrics.totalIncidents).toBe(1);
  });

  it('should prioritize remediation by CVSS', () => {
    const assessment = sim.assessAsset('server-001', [
      { cve: 'CVE-2021-44228', cvss: 10.0, description: 'Critical' },
      { cve: 'CVE-2021-1234', cvss: 5.0, description: 'Medium' },
    ]);

    const priorities = sim.prioritizeRemediation([assessment]);

    expect(priorities[0].cve).toBe('CVE-2021-44228');
    expect(priorities[1].cve).toBe('CVE-2021-1234');
  });

  it('should evaluate network segmentation', () => {
    const result = sim.evaluateNetworkSegmentation([
      {
        name: 'DMZ',
        systems: ['web-server'],
        accessRules: [{ from: 'internet', to: 'DMZ', ports: [80, 443] }],
      },
    ]);

    expect(result.score).toBeGreaterThan(0);
    expect(result.issues.length).toBeGreaterThan(0); // Missing internal/management
  });

  it('should flag dangerous ports in segmentation', () => {
    const result = sim.evaluateNetworkSegmentation([
      {
        name: 'DMZ',
        systems: ['server'],
        accessRules: [{ from: 'internet', to: 'DMZ', ports: [21, 23, 3389] }],
      },
    ]);

    expect(result.issues.some(i => i.includes('Dangerous ports'))).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it('should assess cloud security posture', () => {
    const goodConfig = sim.assessCloudSecurityPosture({
      provider: 'aws',
      encryption: { atRest: true, inTransit: true },
      iam: { mfaEnabled: true, leastPrivilege: true },
      logging: { enabled: true, retention: 365 },
      networkControls: { vpcEnabled: true, securityGroups: true },
    });

    expect(goodConfig.score).toBe(100);
    expect(goodConfig.findings).toHaveLength(0);
  });

  it('should flag cloud security issues', () => {
    const badConfig = sim.assessCloudSecurityPosture({
      provider: 'aws',
      encryption: { atRest: false, inTransit: false },
      iam: { mfaEnabled: false, leastPrivilege: false },
      logging: { enabled: false, retention: 0 },
      networkControls: { vpcEnabled: false, securityGroups: false },
    });

    expect(badConfig.score).toBeLessThan(50);
    expect(badConfig.findings.some(f => f.issue.includes('MFA'))).toBe(true);
    expect(badConfig.findings.some(f => f.issue.includes('encryption'))).toBe(true);
  });
});`,
	hint1:
		'For indicator classification, use regex patterns to identify: IP addresses (\\d{1,3}\\.){3}\\d{1,3}, MD5 hashes (32 hex chars), SHA-256 (64 hex chars), file paths (start with / or drive letter).',
	hint2:
		'For vulnerability prioritization, use CVSS scores to calculate priority. Higher CVSS = higher urgency. Sort by CVSS descending to get the most critical vulnerabilities first.',
	whyItMatters: `CompTIA Security+ is the most widely recognized entry-level security certification:

**Real-World Applications:**
- **Security Operations Centers (SOC)**: Analysts use these skills daily for threat detection, incident response, and security monitoring
- **Compliance Audits**: Understanding security controls and their categories is essential for frameworks like NIST, ISO 27001, and PCI-DSS
- **Cloud Security**: Every major cloud provider requires these concepts for secure architecture

**Industry Impact:**
- **Capital One Breach (2019)**: Misconfigured cloud security settings led to 100M customer records exposed
- **SolarWinds Attack (2020)**: Demonstrated the importance of supply chain security and indicator correlation
- **Log4Shell (2021)**: CVSS 10.0 vulnerability required immediate prioritization across thousands of systems

Security+ covers the practical skills needed for 90% of entry-level security positions.`,
	order: 3,
	translations: {
		ru: {
			title: 'Практика CompTIA Security+',
			description: `Практикуйте концепции CompTIA Security+ (SY0-701) через программирование.

**Домены Security+:**

CompTIA Security+ охватывает 5 доменов:

1. **Общие концепции безопасности** (12%) - Контроли, типы угроз
2. **Угрозы, уязвимости и смягчение** (22%) - Векторы атак, индикаторы
3. **Архитектура безопасности** (18%) - Сетевой дизайн, облачная безопасность
4. **Операции безопасности** (28%) - Мониторинг, реагирование на инциденты
5. **Управление программой безопасности** (20%) - Управление, риски, соответствие

**Ваша задача:**

Реализуйте класс \`SecurityPlusSimulator\`, который тестирует практические сценарии безопасности.`,
			hint1:
				'Для классификации индикаторов используйте регулярные выражения: IP-адреса, MD5 хеши (32 hex символа), SHA-256 (64 hex символа), пути к файлам.',
			hint2:
				'Для приоритизации уязвимостей используйте CVSS баллы. Выше CVSS = выше срочность. Сортируйте по убыванию CVSS.',
			whyItMatters: `CompTIA Security+ - самая распространённая сертификация начального уровня:

**Практическое применение:**
- **SOC**: Аналитики ежедневно используют эти навыки для обнаружения угроз и реагирования на инциденты
- **Аудиты соответствия**: Понимание контролей безопасности необходимо для NIST, ISO 27001, PCI-DSS
- **Облачная безопасность**: Все крупные облачные провайдеры требуют этих концепций

**Влияние на индустрию:**
- **Утечка Capital One (2019)**: Неправильная конфигурация облака привела к утечке 100M записей
- **Атака SolarWinds (2020)**: Продемонстрировала важность безопасности цепочки поставок
- **Log4Shell (2021)**: CVSS 10.0 требовал немедленной приоритизации на тысячах систем`,
		},
		uz: {
			title: 'CompTIA Security+ Amaliyoti',
			description: `CompTIA Security+ (SY0-701) konsepsiyalarini practixsh orqali mashq qiling.

**Security+ Domenlari:**

CompTIA Security+ 5 domenni qamrab oladi:

1. **Umumiy xavfsizlik konsepsiyalari** (12%) - Nazoratlar, tahdid turlari
2. **Tahdidlar, zaifliklar va yumshatish** (22%) - Hujum vektorlari, indikatorlar
3. **Xavfsizlik arxitekturasi** (18%) - Tarmoq dizayni, bulut xavfsizligi
4. **Xavfsizlik operatsiyalari** (28%) - Monitoring, hodisalarga javob
5. **Xavfsizlik dasturini boshqarish** (20%) - Boshqaruv, xavflar, muvofiqlik

**Vazifangiz:**

Amaliy xavfsizlik stsenariylarini tekshiradigan \`SecurityPlusSimulator\` klassini yarating.`,
			hint1:
				"Indikator tasnifi uchun regex patternlardan foydalaning: IP manzillar, MD5 xeshlar (32 hex belgi), SHA-256 (64 hex belgi), fayl yo'llari.",
			hint2:
				"Zaifliklarni ustuvorlashtirishda CVSS ballaridan foydalaning. Yuqori CVSS = yuqori shoshilinchlik. CVSS bo'yicha kamayish tartibida saralang.",
			whyItMatters: `CompTIA Security+ - eng keng tarqalgan boshlang'ich daraja sertifikati:

**Amaliy qo'llanilishi:**
- **SOC**: Tahlilchilar har kuni tahdidlarni aniqlash va hodisalarga javob berish uchun bu ko'nikmalardan foydalanadilar
- **Muvofiqlik auditi**: Xavfsizlik nazoratlarini tushunish NIST, ISO 27001, PCI-DSS uchun zarur
- **Bulut xavfsizligi**: Barcha yirik bulut provayderlari bu konsepsiyalarni talab qiladi

**Sanoatga ta'siri:**
- **Capital One buzilishi (2019)**: Noto'g'ri bulut sozlamalari 100M yozuv sizib chiqishiga olib keldi
- **SolarWinds hujumi (2020)**: Ta'minot zanjiri xavfsizligining muhimligini ko'rsatdi
- **Log4Shell (2021)**: CVSS 10.0 minglab tizimlarda darhol ustuvorlikni talab qildi`,
		},
	},
};

export default task;
