# PRACTIX Platform Roadmap

> Last updated: 2025-12-22

---

## Quick Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Platform Core** | DONE | Courses, Auth, Progress tracking |
| **7 Courses (Go + Java)** | DONE | ~403 tasks, 3 languages (EN/RU/UZ) |
| **Piston Code Execution** | DONE | 8 languages, BullMQ queue, Redis caching |
| **Playground (Web IDE)** | DONE | At /playground |
| **GoF Design Patterns (Go)** | DONE | 23 tasks |
| **GoF Design Patterns (Java)** | DONE | 23 tasks |
| **Software Engineering** | DONE | 6 modules, ~65 tasks |
| **Algo Fundamentals (Python)** | DONE | 7 modules, 41 tasks |
| **Algo Advanced (Python)** | DONE | 6 modules, 50 tasks |
| **Python ML Fundamentals** | DONE | 5 modules, 51 tasks |
| **Python Deep Learning** | DONE | 6 modules, 61 tasks |
| **Python LLM** | DONE | 5 modules, 51 tasks |
| **Java ML** | DONE | 5 modules, 51 tasks |
| **Java NLP** | DONE | 5 modules, 51 tasks |
| **Go ML Inference** | DONE | 5 modules, 51 tasks |
| **System Design** | Planned | Phase 3 |

---

## Table of Contents

### Platform
1. [Platform Features](#platform-features) - **DONE**
2. [Code Execution Engine](#code-execution-engine) - **DONE**
3. [Playground (Web IDE)](#playground-web-ide) - **DONE**

### Courses
4. [Course Structure](#course-structure) - **DONE** (19 Courses)
5. [Go Courses](#go-courses) - **Production Ready** (4 Courses)
6. [Java Courses](#java-courses) - **Production Ready** (3 Courses)
7. [Design Patterns Courses](#design-patterns-courses) - **DONE** (2 Courses)
8. [Software Engineering](#software-engineering-course) - **DONE**
9. [Algorithms Courses](#algorithms-courses) - **DONE** (2 Courses)
10. [AI/ML Courses](#aiml-courses) - **DONE** (6 Courses)
11. [Future Courses](#future-courses) - Planned

### Implementation
11. [Implementation Priorities](#implementation-priorities)
12. [Task File Template](#task-file-template)

---

# Platform Features

## Current State - ALL DONE
- [x] Course system with modules, topics, tasks
- [x] Multi-language support (EN, RU, UZ)
- [x] Code editor with Monaco (syntax highlighting)
- [x] Solution verification
- [x] Progress tracking (from passed submissions)
- [x] Module progress bars
- [x] Shared module architecture (reusable across courses)
- [x] **Piston Code Execution** - 8 languages
- [x] **BullMQ Queue** - Redis-based job queue
- [x] **Execution Caching** - 30min TTL, ~60% load reduction
- [x] **Rate Limiting** - Per-endpoint throttling
- [x] **Playground (Web IDE)** - at /playground
- [x] User authentication (JWT)
- [x] Premium/Free tier system
- [x] AI Tutor integration (Gemini 2.0 Flash)
- [x] Submission history (real API data)

---

# Code Execution Engine

## Status: DONE

Production-grade code execution with Piston + BullMQ + Redis:
- **8 Languages:** Go, Java, JavaScript, TypeScript, Python, Rust, C++, C
- **Resource Limits:** CPU time, memory, process limits
- **Queue Management:** BullMQ with Redis persistence
- **Caching:** SHA-256 hash-based, 30min TTL
- **Rate Limiting:** @nestjs/throttler integration

### Supported Languages

| Language | Time Limit | Memory Limit |
|----------|------------|--------------|
| Go | 5s | 256MB |
| Java | 10s | 512MB |
| JavaScript | 5s | 256MB |
| TypeScript | 10s | 256MB |
| Python | 10s | 256MB |
| Rust | 10s | 256MB |
| C++ | 5s | 256MB |
| C | 5s | 256MB |

### Key Files
```
server/src/judge0/judge0.service.ts       # Judge0 API client
server/src/queue/code-execution.service.ts # BullMQ queue API
server/src/queue/code-execution.processor.ts # Queue worker
server/src/cache/cache.service.ts         # Redis caching
server/src/submissions/                   # Submission handling
```

### Usage
```bash
# Start full stack
make start-docker

# Check status
curl http://localhost:8080/submissions/judge/status
```

> **Note:** Piston works natively on ARM64/Apple Silicon.

---

# Playground (Web IDE)

## Status: DONE

Standalone coding environment at **`/playground`** - no login required.

### Features
- [x] Multi-language support (8 languages)
- [x] Monaco editor with syntax highlighting
- [x] Input (stdin) panel
- [x] Output (stdout/stderr/compile errors) panel
- [x] Code templates for each language
- [x] Language selector dropdown
- [x] Execution status indicator
- [x] Reset to template button
- [ ] Save and share code snippets (future)
- [ ] Multiple files support (future)

### Key Files
```
src/features/playground/
├── api/playgroundService.ts    # API calls to /submissions/run
└── ui/PlaygroundPage.tsx       # Main playground component
```

---

# Course Structure

## Architecture: DONE

```
server/prisma/seeds/
├── types.ts                    # Type definitions
├── courses/
│   ├── index.ts               # ALL_COURSES export
│   ├── go-basics/             # Go Basics Course
│   ├── go-concurrency/        # Go Concurrency Course
│   ├── go-web-apis/           # Go Web & APIs Course
│   ├── go-production/         # Go Production Course
│   ├── java-core/             # Java Core Course
│   ├── java-modern/           # Java Modern Course
│   ├── java-advanced/         # Java Advanced Course
│   ├── go-design-patterns/    # GoF Patterns in Go (NEW)
│   ├── java-design-patterns/  # GoF Patterns in Java (NEW)
│   ├── software-engineering/  # Software Engineering (NEW)
│   ├── algo-fundamentals/     # Algorithms Fundamentals (NEW)
│   └── algo-advanced/         # Algorithms Advanced (NEW)
└── shared/
    └── modules/
        ├── go/                # 25 reusable Go modules
        └── java/              # 35 reusable Java modules
```

## Summary

| Course | Modules | Tasks | Status |
|--------|---------|-------|--------|
| **Go Basics** | 9 | ~64 | DONE |
| **Go Concurrency** | 4 | ~48 | DONE |
| **Go Web & APIs** | 6 | ~54 | DONE |
| **Go Production** | 6 | ~64 | DONE |
| **Java Core** | 7 | ~47 | DONE |
| **Java Modern** | 9 | ~44 | DONE |
| **Java Advanced** | 19 | ~82 | DONE |
| **Go Design Patterns** | 3 | 23 | DONE |
| **Java Design Patterns** | 3 | 23 | DONE |
| **Software Engineering** | 6 | ~65 | DONE |
| **Algo Fundamentals** | 7 | 41 | DONE |
| **Algo Advanced** | 6 | 50 | DONE |
| **Python ML Fundamentals** | 5 | 51 | DONE |
| **Python Deep Learning** | 6 | 61 | DONE |
| **Python LLM** | 5 | 51 | DONE |
| **Java ML** | 5 | 51 | DONE |
| **Java NLP** | 5 | 51 | DONE |
| **Go ML Inference** | 5 | 51 | DONE |
| **Total** | **116** | **~921** | **Production** |

---

# Go Courses

## Go Basics
**Modules:** 9 | **Tasks:** ~64 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| fundamentals | constructors, data-structures, io-interfaces | 17 |
| error-handling | fundamentals | 8 |
| pointersx | fundamentals | 5 |
| datastructsx | operations | 5 |
| encodingx | json-validation | 5 |
| generics | fundamentals | 8 |
| io-interfaces | implementation | 5 |
| constructor-patterns | implementation | 5 |
| panic-recovery | implementation | 5 |

## Go Concurrency
**Modules:** 4 | **Tasks:** ~48 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| concurrency-patterns | context, pipeline, worker-pool | 33 |
| channels | implementation | 5 |
| goroutines | implementation | 5 |
| synchronization | implementation | 5 |

## Go Web & APIs
**Modules:** 6 | **Tasks:** ~54 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| http-middleware | fundamentals, advanced | 20 |
| grpc-interceptors | interceptors | 6 |
| database | sql-basics, transactions, connection-pool | 16 |
| logging | implementation | 5 |
| config-management | implementation | 5 |
| testing | unit-tests, table-driven, mocking, benchmarks | 20 |

## Go Production
**Modules:** 6 | **Tasks:** ~64 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| circuit-breaker | implementation | 8 |
| rate-limiting | implementation | 7 |
| caching | implementation | 7 |
| retry-patterns | implementation | 6 |
| metrics | implementation | 6 |
| profiling | implementation | 5 |

---

# Java Courses

## Java Core
**Modules:** 7 | **Tasks:** ~47 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| syntax-basics | fundamentals | 5 |
| oop-core | fundamentals | 6 |
| interfaces | fundamentals | 6 |
| exception-handling | fundamentals | 6 |
| collections-list | fundamentals | 6 |
| collections-set-map | fundamentals | 6 |
| collections-queue | fundamentals | 5 |

## Java Modern
**Modules:** 9 | **Tasks:** ~44 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| generics | fundamentals | 6 |
| lambda-expressions | fundamentals | 4 |
| stream-api | fundamentals | 4 |
| optional | fundamentals | 5 |
| date-time | fundamentals | 5 |
| records | fundamentals | 4 |
| sealed-classes | fundamentals | 4 |
| pattern-matching | fundamentals | 4 |
| virtual-threads | fundamentals | 4 |

## Java Advanced
**Modules:** 19 | **Tasks:** ~82 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| threads-basics | fundamentals | 5 |
| executor-service | fundamentals | 5 |
| concurrent-collections | fundamentals | 5 |
| completable-future | fundamentals | 5 |
| locks-advanced | fundamentals | 4 |
| atomic-operations | fundamentals | 4 |
| io-streams | fundamentals | 4 |
| nio | fundamentals | 4 |
| jdbc | fundamentals | 4 |
| connection-pooling | fundamentals | 4 |
| design-patterns | fundamentals | 4 |
| testing | fundamentals | 5 |
| logging | fundamentals | 4 |
| metrics | fundamentals | 4 |
| config-management | fundamentals | 4 |
| error-handling | fundamentals | 4 |
| retry-resilience | fundamentals | 4 |
| caching | fundamentals | 4 |
| http-clients | fundamentals | 4 |

---

# Design Patterns Courses

## Go Design Patterns (GoF)
**Modules:** 3 | **Tasks:** 23 | **Status:** DONE

| Module | Patterns | Tasks |
|--------|----------|-------|
| creational | Singleton, Factory, Abstract Factory, Builder, Prototype | 5 |
| structural | Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy | 7 |
| behavioral | Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor, Interpreter | 11 |

## Java Design Patterns (GoF)
**Modules:** 3 | **Tasks:** 23 | **Status:** DONE

| Module | Patterns | Tasks |
|--------|----------|-------|
| creational | Singleton, Factory, Abstract Factory, Builder, Prototype | 5 |
| structural | Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy | 7 |
| behavioral | Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor, Interpreter | 11 |

---

# Software Engineering Course

**Modules:** 6 | **Tasks:** ~65 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| solid | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion | 10 |
| clean-code | Naming, Functions, Comments, Formatting, Error Handling, Classes | 12 |
| refactoring | Extract Method, Replace Conditional, Composition over Inheritance, Move Method, Inline Method, Parameter Object | 12 |
| grasp | Information Expert, Creator, Controller, Low Coupling, High Cohesion, Polymorphism, Pure Fabrication, Indirection, Protected Variations | 9 |
| anti-patterns | God Object, Spaghetti Code, Copy-Paste, Magic Numbers, Golden Hammer, Premature Optimization, Cargo Cult, Lava Flow, Dead Code, Feature Envy, Primitive Obsession, Shotgun Surgery | 12 |
| api-design | RESTful Design, Versioning, Error Handling, Pagination, Rate Limiting, Documentation, Consistency, Authentication, Idempotency, HATEOAS | 10 |

---

# Algorithms Courses

## Algo Fundamentals (Python)
**Modules:** 7 | **Tasks:** 41 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| arrays | Array Basics | 6 |
| strings | String Basics | 6 |
| linked-lists | Linked List Basics | 6 |
| stacks-queues | Stack and Queue Basics | 6 |
| trees | Binary Tree Basics | 6 |
| sorting | Sorting Algorithms | 5 |
| searching | Binary Search & Variations | 6 |

## Algo Advanced (Python)
**Modules:** 6 | **Tasks:** 50 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| dynamic-programming | DP Techniques | 10 |
| graphs | Graph Algorithms | 10 |
| backtracking | Backtracking Techniques | 8 |
| greedy | Greedy Algorithms | 8 |
| divide-conquer | Divide & Conquer | 6 |
| bit-manipulation | Bit Operations | 8 |

---

# AI/ML Courses

## Python ML Fundamentals
**Modules:** 5 | **Tasks:** 51 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| numpy-essentials | Array Basics, Operations, Linear Algebra | 15 |
| pandas-mastery | DataFrame Basics, Manipulation, Aggregation | 15 |
| data-visualization | Matplotlib, Seaborn, Plotly | 6 |
| classical-ml | Supervised, Unsupervised, Evaluation | 10 |
| gradient-boosting | XGBoost, LightGBM, CatBoost | 5 |

## Python Deep Learning
**Modules:** 6 | **Tasks:** 61 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| nn-basics | Neural Network Fundamentals | 10 |
| pytorch-fundamentals | PyTorch Tensors, Autograd | 12 |
| convolutional-networks | CNN Architectures, Image Processing | 12 |
| recurrent-networks | RNN, LSTM, Sequence Models | 10 |
| transfer-learning | Fine-tuning, Feature Extraction | 10 |
| model-deployment | ONNX, TorchServe, Optimization | 7 |

## Python LLM
**Modules:** 5 | **Tasks:** 51 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| transformer-architecture | Attention, Transformers | 10 |
| huggingface-transformers | Models, Tokenizers, Pipelines | 12 |
| fine-tuning | LoRA, PEFT, QLoRA | 10 |
| langchain-basics | Chains, Agents, Memory | 10 |
| rag-systems | Retrieval, Vector Stores | 9 |

## Java ML (DJL + Tribuo)
**Modules:** 5 | **Tasks:** 51 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| djl-fundamentals | NDArray, Models, Inference | 12 |
| tribuo-ml | Classification, Regression | 12 |
| model-inference | ONNX Runtime, Optimization | 10 |
| feature-engineering | Preprocessing, Transformation | 10 |
| ml-pipelines | Training, Evaluation Pipelines | 7 |

## Java NLP
**Modules:** 5 | **Tasks:** 51 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| text-preprocessing | Tokenization, Cleaning | 10 |
| nlp-fundamentals | Embeddings, Word2Vec | 12 |
| text-classification | Sentiment, Topic Modeling | 10 |
| named-entity-recognition | NER, Entity Extraction | 10 |
| language-models | Transformers, Fine-tuning | 9 |

## Go ML Inference
**Modules:** 5 | **Tasks:** 51 | **Status:** DONE

| Module | Topics | Tasks |
|--------|--------|-------|
| onnx-inference | ONNX Runtime in Go | 12 |
| tensorflow-go | TensorFlow Serving | 10 |
| ml-api-design | REST APIs for ML | 10 |
| model-optimization | Quantization, Pruning | 10 |
| production-ml | Monitoring, Logging | 9 |

---

# Future Courses

## Math for Data Science
**Status:** Planned | **Tasks:** ~50 | **Priority:** Medium
**Language:** Python (NumPy, SciPy, SymPy)

```
math-for-data-science/
├── linear-algebra/           # Vectors, matrices, eigenvalues, SVD (10-12 tasks)
├── calculus/                 # Derivatives, integrals, optimization (10-12 tasks)
├── probability-statistics/   # Distributions, hypothesis testing (10-12 tasks)
├── numerical-methods/        # Root finding, integration, ODEs (8-10 tasks)
└── discrete-math/            # Graphs, combinatorics, logic (8-10 tasks)
```

**Execution Strategy:**
- Uses existing Piston Python runtime (no new infrastructure)
- NumPy for numerical math, SymPy for symbolic math
- Standard unit test verification (same as other courses)
- Visualization support with matplotlib

**Sample Task Types:**
- "Implement matrix multiplication" → NumPy array comparison
- "Compute derivative symbolically" → SymPy expression comparison
- "Perform t-test" → Statistical result verification

## System Design
**Status:** Planned | **Tasks:** 30+ | **Priority:** Medium

```
system-design/
├── fundamentals/            # CAP, ACID, BASE, Scalability
├── building-blocks/         # Load Balancer, CDN, Cache, DB
├── case-studies/            # URL Shortener, Twitter, Uber
└── interviews/              # Common questions, Frameworks
```

## Data Engineering (Python)
**Status:** Planned | **Tasks:** 50+ | **Priority:** Medium
**Language:** Python (with SQLite for SQL tasks)

```
data-engineering/
├── sql-advanced/            # Window functions, CTEs, Query optimization (8-10 tasks)
├── pandas-basics/           # DataFrames, Series, Indexing, Selection (8-10 tasks)
├── data-cleaning/           # Missing values, Duplicates, Type conversion (6-8 tasks)
├── etl-patterns/            # Extract, Transform, Load pipelines (6-8 tasks)
├── file-formats/            # CSV, JSON, Parquet, Avro reading/writing (5-6 tasks)
├── data-validation/         # Schema validation, Data quality checks (5-6 tasks)
├── batch-processing/        # Chunking, Memory optimization, Parallelization (5-6 tasks)
└── data-modeling/           # Star schema, Normalization, Denormalization (5-6 tasks)
```

**Technical Notes:**
- Python supported via Piston (already available)
- SQL tasks use SQLite (built into Python, no extra DB needed)
- Each task returns verifiable output (DataFrame shape, values, etc.)

## Prompt Engineering
**Status:** HIGH PRIORITY | **Tasks:** 35+ | **Priority:** HIGH
**Special Feature:** 100 AI Tutor requests/day for this course

```
prompt-engineering/
├── fundamentals/            # Prompt structure, Context, Instructions (5-6 tasks)
├── zero-few-shot/           # Zero-shot, Few-shot examples, Formatting (6-8 tasks)
├── chain-of-thought/        # Step-by-step reasoning, Self-consistency (4-5 tasks)
├── structured-output/       # JSON mode, Schema definition, Parsing (5-6 tasks)
├── role-playing/            # System prompts, Personas, Constraints (4-5 tasks)
├── rag-basics/              # Context injection, Chunking strategies (5-6 tasks)
├── prompt-security/         # Injection attacks, Jailbreaks, Defense (4-5 tasks)
└── multimodal/              # Image prompts, Vision analysis (3-4 tasks)
```

**Technical Notes:**
- Requires new task type: "prompt" instead of "code"
- AI Tutor limit: 100 requests/day (same as Global Premium)
- Verification options:
  1. Structure validation (regex, JSON schema)
  2. LLM-as-judge (uses Gemini for evaluation)
  3. Output comparison (for deterministic prompts)
- UI will need prompt-specific input/output panels

---

# Implementation Priorities

## Phase 1: Platform - DONE
- [x] Course restructuring (7 courses)
- [x] Shared module architecture
- [x] All translations (EN, RU, UZ)
- [x] Piston Code Execution (8 languages)
- [x] BullMQ Queue + Redis Caching
- [x] Rate Limiting
- [x] Playground (Web IDE)

## Phase 2: Content Expansion - DONE
- [x] GoF Design Patterns (Go) - 23 tasks
- [x] GoF Design Patterns (Java) - 23 tasks
- [x] Software Engineering Principles - ~65 tasks
- [x] Algo Fundamentals (Python) - 41 tasks
- [x] Algo Advanced (Python) - 50 tasks
- [x] Real API data for submissions
- [x] Progress tracking cleanup

## Phase 3: Advanced Courses - NEXT
- [ ] System Design - 30+ tasks
- [ ] Real-world case studies
- [ ] Data Engineering (Python) - 50+ tasks

## Future: Performance Optimization
- [ ] WebAssembly browser execution for playground (Pyodide, TinyGo WASM)
- [ ] Kubernetes migration for horizontal scaling

---

# Task File Template

```typescript
import { Task } from '../../../../../../../types';

export const task: Task = {
    slug: 'course-module-task-name',
    title: 'Task Title',
    difficulty: 'easy' | 'medium' | 'hard',
    tags: ['language', 'topic1', 'topic2'],
    estimatedTime: '20m',
    isPremium: false,
    youtubeUrl: '',
    description: `Task description with requirements...`,
    initialCode: `// Initial code template`,
    solutionCode: `// Solution with English comments`,
    hint1: `First hint...`,
    hint2: `Second hint...`,
    whyItMatters: `Why this concept is important...`,
    order: 0,
    translations: {
        ru: {
            title: 'Russian title',
            solutionCode: `// Solution with Russian comments`,
            description: `Russian description...`,
            hint1: `Russian hint 1...`,
            hint2: `Russian hint 2...`,
            whyItMatters: `Russian explanation...`
        },
        uz: {
            title: `Uzbek title`,
            solutionCode: `// Solution with Uzbek comments`,
            description: `Uzbek description...`,
            hint1: `Uzbek hint 1...`,
            hint2: `Uzbek hint 2...`,
            whyItMatters: `Uzbek explanation...`
        }
    }
};
```

---

## Notes

1. **Translation Requirements:** All tasks must have complete ru/uz translations including solutionCode with translated comments
2. **Task Quality:** Each task should teach one specific concept with clear requirements
3. **Difficulty Progression:** Topics should progress from easy to hard within each module
4. **Real-World Focus:** Tasks should reflect production patterns and best practices
5. **Code Comments:** English for main solutionCode, Russian for ru.solutionCode, Uzbek for uz.solutionCode

---

## Statistics

### Current State (Production)
| Course | Modules | Tasks | Status |
|--------|---------|-------|--------|
| Go Basics | 9 | ~64 | DONE |
| Go Concurrency | 4 | ~48 | DONE |
| Go Web & APIs | 6 | ~54 | DONE |
| Go Production | 6 | ~64 | DONE |
| Java Core | 7 | ~47 | DONE |
| Java Modern | 9 | ~44 | DONE |
| Java Advanced | 19 | ~82 | DONE |
| Go Design Patterns | 3 | 23 | DONE |
| Java Design Patterns | 3 | 23 | DONE |
| Software Engineering | 6 | ~65 | DONE |
| Algo Fundamentals | 7 | 41 | DONE |
| Algo Advanced | 6 | 50 | DONE |
| Python ML Fundamentals | 5 | 51 | DONE |
| Python Deep Learning | 6 | 61 | DONE |
| Python LLM | 5 | 51 | DONE |
| Java ML | 5 | 51 | DONE |
| Java NLP | 5 | 51 | DONE |
| Go ML Inference | 5 | 51 | DONE |
| **Total** | **116** | **~921** | **Production** |

### Target State (with Future Courses)
| Course | Modules | Tasks | Priority |
|--------|---------|-------|----------|
| Go Courses (4) | 25 | 230 | Done |
| Java Courses (3) | 35 | 173 | Done |
| GoF Patterns (Go + Java) | 6 | 46 | Done |
| Software Engineering | 6 | 65 | Done |
| Algorithms (2) | 13 | 91 | Done |
| AI/ML Courses (6) | 31 | 316 | Done |
| **Prompt Engineering** | 8 | 35 | **HIGH** |
| Math for Data Science | TBD | TBD | Medium |
| System Design | 4 | 30 | Medium |
| Data Engineering | 8 | 50 | Medium |
| **Total** | **136+** | **~1100** | - |

---

*Last updated: 2026-01-04*
