# AI/ML Courses - Research & Planning

**Research Date:** December 2024 - January 2025
**Target Platform:** Practix Coding Education Platform

---

## Executive Summary

This document consolidates research and planning for enterprise-grade AI/ML courses. Based on 2024-2025 industry trends, job market demand, and production deployment patterns.

### Course Portfolio

| Course | Language | Duration | Tasks | Priority |
|--------|----------|----------|-------|----------|
| Python for Data Science & ML | Python | ~28h | ~112 | High |
| Deep Learning with PyTorch | Python | ~32h | ~128 | High |
| LLM Engineering & MLOps | Python | ~28h | ~112 | Very High |
| Java AI & Machine Learning | Java | ~81h | ~303 | Medium |

**Total:** ~170 hours, ~650+ tasks

---

## Python Courses (3-Course Series)

### Course 1: Python for Data Science & ML
**Slug:** `c_python_ml_fundamentals`
**Target:** Beginner to Intermediate
**Duration:** ~28h

**Modules:**
1. NumPy Fundamentals (4h)
2. Pandas for Data Analysis (6h)
3. Data Visualization (3h) - Matplotlib, Seaborn
4. scikit-learn Foundations (5h)
5. Advanced scikit-learn (4h) - Ensemble, tuning, pipelines
6. XGBoost and LightGBM (3h)
7. Unsupervised Learning (3h) - Clustering, dimensionality reduction

**Key Libraries:** NumPy, Pandas, Matplotlib, Seaborn, scikit-learn, XGBoost, LightGBM

---

### Course 2: Deep Learning with PyTorch
**Slug:** `c_pytorch_deep_learning`
**Target:** Intermediate to Advanced
**Duration:** ~32h

**Modules:**
1. PyTorch Fundamentals (4h) - Tensors, autograd, GPU
2. Neural Networks with torch.nn (5h)
3. Computer Vision with PyTorch (6h) - CNNs, torchvision, YOLO
4. NLP with PyTorch (5h) - RNNs, LSTMs, attention
5. Hugging Face Transformers (6h) - BERT, fine-tuning
6. OpenCV for Computer Vision (4h)
7. spaCy for Production NLP (2h)

**Key Libraries:** PyTorch, torchvision, transformers, OpenCV, spaCy

---

### Course 3: LLM Engineering & MLOps
**Slug:** `c_llm_mlops`
**Target:** Advanced to Professional
**Duration:** ~28h

**Modules:**
1. OpenAI API Fundamentals (4h)
2. Anthropic Claude API (3h)
3. LangChain Framework (6h) - Chains, RAG, agents
4. Vector Databases (3h) - Chroma, FAISS, Pinecone
5. MLflow for Experiment Tracking (4h)
6. Weights & Biases (3h)
7. Model Deployment and Serving (5h) - FastAPI, Docker

**Key Libraries:** openai, anthropic, langchain, chromadb, mlflow, wandb, fastapi

---

## Java Courses

### Course: Java AI & Machine Learning
**Slug:** `c_java_ai_ml`
**Target:** Java developers entering AI/ML
**Duration:** ~81h

**Core Modules:**

1. **Deep Java Library (DJL)** - 15h
   - AWS-backed deep learning for Java
   - Computer Vision, NLP, Model Serving

2. **Apache Spark MLlib** - 13h
   - Industry standard for distributed ML
   - Classification, Regression, Clustering

3. **LangChain4j** - 14.5h
   - LLM integration for Java
   - RAG, Agents, Spring Boot integration

4. **Spring AI** - 11.25h
   - Spring ecosystem AI integration
   - Vector stores, function calling

5. **Stanford CoreNLP** - 11h
   - Enterprise NLP standard
   - NER, Sentiment, QA

6. **BoofCV** - 10h
   - Pure Java computer vision
   - Feature detection, tracking

7. **Apache Flink** - 4.25h
   - Real-time feature engineering

---

## Technology Stack (2024-2025)

### Python Stack
| Category | Primary | Secondary |
|----------|---------|-----------|
| Deep Learning | PyTorch | TensorFlow |
| Classical ML | scikit-learn | XGBoost, LightGBM |
| NLP | Hugging Face | spaCy |
| Computer Vision | torchvision | OpenCV |
| MLOps | MLflow | W&B |
| LLM Framework | LangChain | OpenAI SDK |
| Vector DB | Chroma/FAISS | Pinecone |

### Java Stack
| Category | Primary | Secondary |
|----------|---------|-----------|
| Deep Learning | DJL | - |
| Distributed ML | Spark MLlib | - |
| LLM Integration | LangChain4j | Spring AI |
| NLP | Stanford CoreNLP | - |
| Computer Vision | BoofCV | JavaCV |
| Real-time ML | Apache Flink | - |

---

## Implementation Priority

### Phase 1: Foundation (Months 1-3)
- Python ML Fundamentals (Course 1)
- Reason: Foundation for all ML, broader audience

### Phase 2: LLM Focus (Months 3-5)
- LLM Engineering & MLOps (Course 3)
- Reason: Hottest market demand, highest willingness to pay

### Phase 3: Deep Learning (Months 4-7)
- Deep Learning with PyTorch (Course 2)
- Reason: Essential for CV/NLP roles

### Phase 4: Java (Months 6-12)
- Java AI/ML (enterprise focus)
- Reason: Specialized audience, enterprise demand

---

## Premium Content Strategy

| Course | Free % | Premium % | Premium Focus |
|--------|--------|-----------|---------------|
| Python ML Fundamentals | 70-75% | 25-30% | Advanced topics, projects |
| PyTorch Deep Learning | 65-70% | 30-35% | Transformers, advanced CV/NLP |
| LLM & MLOps | 55-60% | 40-45% | Agents, deployment, production |
| Java AI/ML | 65-70% | 30-35% | Production patterns |

---

## Technical Requirements

### Execution Environment

**Simple Tasks:** Current Piston setup
**ML Training:** Jupyter notebooks or Google Colab integration
**Deployment:** Sandboxed Docker containers

### GPU Requirements
- Course 1 (Python ML): No GPU needed
- Course 2 (PyTorch): GPU recommended
- Course 3 (LLM/MLOps): GPU optional
- Java courses: No GPU needed

---

## Market Insights (2024-2025)

### Most In-Demand Skills
1. LLM/GenAI (LangChain, OpenAI API, RAG) - +30-50% salary premium
2. PyTorch (overtaking TensorFlow) - 65% of ML job postings
3. MLOps (MLflow, deployment) - +20-30% salary premium
4. Hugging Face Transformers - de facto NLP standard
5. Classical ML (still 80% of production)

### Enterprise Trends
- Classical ML still dominant for tabular data
- LLM explosion across all industries
- MLOps maturity increasing
- Open-source frameworks winning
- Cost optimization focus (inference, caching)

---

## Career Outcomes

### Python Path
- Machine Learning Engineer
- Deep Learning Engineer
- LLM Engineer / GenAI Engineer
- MLOps Engineer
- Data Scientist
- Computer Vision Engineer
- NLP Engineer

### Java Path
- AI/ML Engineer (Java focus)
- LLM Application Developer
- Data Engineer (ML pipelines)
- Enterprise AI Developer

---

## References

### Official Documentation
- PyTorch: https://pytorch.org/docs/
- Hugging Face: https://huggingface.co/docs
- scikit-learn: https://scikit-learn.org/
- LangChain: https://python.langchain.com/
- MLflow: https://mlflow.org/docs/
- DJL: https://djl.ai/
- LangChain4j: https://docs.langchain4j.dev/
- Spring AI: https://spring.io/projects/spring-ai

### Research Sources
- Kaggle ML Survey 2024
- Stack Overflow Developer Survey 2024
- LinkedIn Job Market Insights
- GitHub Octoverse 2024
