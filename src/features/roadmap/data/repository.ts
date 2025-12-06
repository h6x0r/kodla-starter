
import { RoadmapEntity } from '../model/types';

// This acts as our "Database" of Roadmap Templates
// Note: We no longer hardcode 'colorTheme' here, as the Service layer assigns it dynamically.
// Note 2: These are TEMPLATES. When assigned to a user, a new RoadmapEntity is created with userId set.

const TEMPLATES: Record<string, RoadmapEntity> = {
  // 1. MID LEVEL GO (Existing)
  'backend-go-mid': {
    id: 'tpl_backend_go_mid', // Template ID
    userId: 'template', // Placeholder
    role: 'backend-go', // Added
    level: 'mid', // Added
    title: 'Backend Developer (Go) Roadmap', // Added
    totalProgress: 0, // Added
    createdAt: new Date().toISOString(), // Added
    updatedAt: new Date().toISOString(), // Added
    roleTitle: 'Backend Developer (Go)',
    targetLevel: 'mid',
    phases: [
      {
        id: 'p1',
        title: 'Phase 1: Foundations',
        description: 'Mastering the standard library and core syntax',
        colorTheme: '', // Ignored, set by service
        color: '', // Added to satisfy type if strictly checked, though RoadmapPhase interface has color
        progress: 0, // Added
        order: 1,
        steps: [
          { id: 's1', title: 'Go Structs & Init', type: 'practice', duration: '5h', durationEstimate: '5h', deepLink: '/course/c_go#structinit', resourceType: 'task', relatedResourceId: 't_structinit_1', status: 'available' },
          { id: 's2', title: 'Interfaces', type: 'practice', duration: '6h', durationEstimate: '6h', deepLink: '/course/c_go#interfaces', resourceType: 'task', relatedResourceId: 't_interfaces_1', status: 'available' },
          { id: 's3', title: 'Error Handling', type: 'video', duration: '2h', durationEstimate: '2h', deepLink: '/course/c_go#errorsx', resourceType: 'task', relatedResourceId: 't_errorsx_1', status: 'available' }
        ]
      },
      {
        id: 'p2',
        title: 'Phase 2: Concurrency',
        description: 'Building high-performance async systems',
        colorTheme: '',
        color: '',
        progress: 0,
        order: 2,
        steps: [
          { id: 's4', title: 'Goroutines Basics', type: 'practice', duration: '3h', durationEstimate: '3h', deepLink: '/course/c_go/task/goroutinesx-basics', resourceType: 'task', relatedResourceId: 't_goroutinesx_1', status: 'available' },
          { id: 's5', title: 'Channels Patterns', type: 'practice', duration: '8h', durationEstimate: '8h', deepLink: '/course/c_go/task/channelsx-basics', resourceType: 'task', relatedResourceId: 't_channelsx_1', status: 'available' }
        ]
      },
      {
        id: 'p3',
        title: 'Phase 3: System Design',
        description: 'Scalable architecture principles',
        colorTheme: '',
        color: '',
        progress: 0,
        order: 3,
        steps: [
           { id: 's7', title: 'Caching Strategies', type: 'project', duration: '10h', durationEstimate: '10h', deepLink: '/course/c_sys#caching-strategies', resourceType: 'task', relatedResourceId: 't_caching-strategies_1', status: 'available' }
        ]
      }
    ]
  },
  
  // 2. SENIOR ARCHITECT (New - Large Scale Test)
  'backend-go-senior': {
    id: 'tpl_backend_go_senior',
    userId: 'template',
    role: 'backend-go',
    level: 'senior',
    title: 'Principal Architect (Go) Roadmap',
    totalProgress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roleTitle: 'Principal Architect (Go)',
    targetLevel: 'senior',
    phases: [
      {
        id: 'sa1', title: 'Phase 1: Advanced Go Runtime', description: 'GC tuning, scheduler internals, and memory model', colorTheme: '', color: '', progress: 0, order: 1,
        steps: [
           { id: 'sa1_1', title: 'Scheduler Internals', type: 'video', duration: '4h', durationEstimate: '4h', deepLink: '/course/c_go', resourceType: 'topic', relatedResourceId: 'interview', status: 'available' },
           { id: 'sa1_2', title: 'Garbage Collection', type: 'practice', duration: '3h', durationEstimate: '3h', deepLink: '/course/c_go', resourceType: 'topic', relatedResourceId: 'profilingx', status: 'available' }
        ]
      },
      {
        id: 'sa2', title: 'Phase 2: Microservices Patterns', description: 'Service mesh, discovery, and resilience', colorTheme: '', color: '', progress: 0, order: 2,
        steps: [
           { id: 'sa2_1', title: 'Circuit Breakers', type: 'practice', duration: '5h', durationEstimate: '5h', deepLink: '/course/c_go', resourceType: 'task', relatedResourceId: 't_circuitx_1', status: 'available' },
           { id: 'sa2_2', title: 'Rate Limiting', type: 'practice', duration: '4h', durationEstimate: '4h', deepLink: '/course/c_go', resourceType: 'task', relatedResourceId: 't_ratelimit_1', status: 'available' },
           { id: 'sa2_3', title: 'gRPC & Protobuf', type: 'project', duration: '8h', durationEstimate: '8h', deepLink: '/course/c_go', resourceType: 'task', relatedResourceId: 't_grpcx_1', status: 'available' }
        ]
      },
      {
        id: 'sa3', title: 'Phase 3: Distributed Systems', description: 'Consensus, replication, and shading', colorTheme: '', color: '', progress: 0, order: 3,
        steps: [
           { id: 'sa3_1', title: 'CAP Theorem', type: 'video', duration: '2h', durationEstimate: '2h', deepLink: '/course/c_sys', resourceType: 'task', relatedResourceId: 't_cap-theorem_1', status: 'available' },
           { id: 'sa3_2', title: 'Database Sharding', type: 'project', duration: '12h', durationEstimate: '12h', deepLink: '/course/c_sys', resourceType: 'task', relatedResourceId: 't_database-sharding_1', status: 'available' }
        ]
      },
      {
        id: 'sa4', title: 'Phase 4: High Performance Storage', description: 'LSM Trees, B-Trees, and Custom DBs', colorTheme: '', color: '', progress: 0, order: 4,
        steps: [
           { id: 'sa4_1', title: 'Storage Engines', type: 'practice', duration: '6h', durationEstimate: '6h', deepLink: '/course/c_sys', resourceType: 'topic', relatedResourceId: 'storage', status: 'available' }
        ]
      },
      {
        id: 'sa5', title: 'Phase 5: Cloud Native', description: 'Kubernetes operators and cloud patterns', colorTheme: '', color: '', progress: 0, order: 5,
        steps: [
           { id: 'sa5_1', title: 'K8s Operators', type: 'project', duration: '15h', durationEstimate: '15h', deepLink: '/course/c_go', resourceType: 'topic', relatedResourceId: 'k8s', status: 'available' }
        ]
      },
      {
        id: 'sa6', title: 'Phase 6: Observability', description: 'Distributed tracing and metrics', colorTheme: '', color: '', progress: 0, order: 6,
        steps: [
           { id: 'sa6_1', title: 'OpenTelemetry', type: 'practice', duration: '4h', durationEstimate: '4h', deepLink: '/course/c_go', resourceType: 'topic', relatedResourceId: 'metricsx', status: 'available' }
        ]
      },
      {
        id: 'sa7', title: 'Phase 7: Leadership', description: 'Team management and RFC processes', colorTheme: '', color: '', progress: 0, order: 7,
        steps: [
           { id: 'sa7_1', title: 'Writing RFCs', type: 'video', duration: '2h', durationEstimate: '2h', deepLink: '/course/c_soft', resourceType: 'topic', relatedResourceId: 'rfc', status: 'available' }
        ]
      },
      {
        id: 'sa8', title: 'Phase 8: Mastery Capstone', description: 'Build a distributed KV store', colorTheme: '', color: '', progress: 0, order: 8,
        steps: [
           { id: 'sa8_1', title: 'Final Project', type: 'project', duration: '40h', durationEstimate: '40h', deepLink: '/course/c_go', resourceType: 'topic', relatedResourceId: 'capstone', status: 'available' }
        ]
      }
    ]
  }
};

export const roadmapRepository = {
  getTemplate: async (role: string, level: string): Promise<RoadmapEntity> => {
    await new Promise(r => setTimeout(r, 500)); // Sim network

    // Return the massive roadmap if "Senior" is selected, otherwise default
    if (level === 'senior' || role.includes('senior')) return TEMPLATES['backend-go-senior'];
    if (role.includes('go')) return TEMPLATES['backend-go-mid'];
    
    return TEMPLATES['backend-go-mid']; // Default fallback
  }
};
