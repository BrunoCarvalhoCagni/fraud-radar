<div align="center">

# 🛡️ FraudRadar
### Real-Time ML-Powered Fraud Detection & Event-Driven Decision Engine
*An end-to-end distributed system inspired by Stripe Radar, processing high-throughput financial transactions with unsupervised anomaly detection, event streaming, and live dashboard monitoring.*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Kafka / Redpanda](https://img.shields.io/badge/Redpanda-Kafka_API-FF462D?style=for-the-badge&logo=apachekafka&logoColor=white)](https://redpanda.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📌 Overview

**FraudRadar** is a production-oriented, event-driven financial intelligence platform designed to evaluate and flag fraudulent credit card operations with sub-millisecond decision latency. 

The platform continuously replays and ingests transaction data, executes real-time Machine Learning scoring using **Isolation Forest** anomaly detection, streams events through a high-performance **Redpanda (Kafka-compatible)** broker, applies business rules in a decoupled **Node.js/TypeScript** worker, and broadcasts state mutations over **WebSockets** into a **Stripe Radar-inspired Dark UI**.

---

## 🏗️ System Architecture
                                  ┌───────────────────────────────┐
                                  │  Kaggle CC Fraud Dataset CSV  │
                                  └──────────────┬────────────────┘
                                                 │ (Stream Replay)
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   Python / FastAPI Core       │
                                  │   - RobustScaler + PCA Vec    │
                                  │   - Isolation Forest Engine   │
                                  └──────────────┬────────────────┘
                                                 │
                                                 │ (Produce: 'transactions.scored')
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   Redpanda / Kafka Cluster    │
                                  │   - Lightweight Event Bus     │
                                  │   - Redpanda Console UI: 8080 │
                                  └──────────────┬────────────────┘
                                                 │
                                                 │ (Consume: Consumer Group)
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   Node.js / TypeScript Worker │
                                  │   - Business Rules Engine     │
                                  │   - Action Tiering & Reasons  │
                                  │   - Socket.io Gateway Server  │
                                  └──────────────┬────────────────┘
                                                 │
                                                 │ (WebSocket Stream)
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   React + Tailwind Dashboard  │
                                  │   - Real-time Visual Feed     │
                                  │   - Live Metrics & KPIs       │
                                  │   - Deep Inspection Drawer    │
                                  └───────────────────────────────┘


---

## 🧠 Technical Highlights & Architectural Decisions

| Decision | Technology | Rationale |
| :--- | :--- | :--- |
| **Anomaly Detection** | **Isolation Forest** (`scikit-learn`) | Unsupervised tree-based anomaly isolation capable of handling extreme class imbalance (~0.17% fraud rate) with high inference speed (< 2ms). |
| **Event Streaming** | **Redpanda (Kafka)** | 100% Kafka API compatibility written in C++. Zero JVM memory overhead, zero Zookeeper dependencies, boot time under 1 second, and native Docker efficiency. |
| **Worker / Gateway** | **Node.js & TypeScript** | High concurrency non-blocking asynchronous event loop; optimal for maintaining thousands of persistent WebSocket connections while executing business rule evaluation. |
| **API Core** | **FastAPI + AioKafka** | Asynchronous Python core enabling non-blocking stream replays and tight integration with native ML/scientific libraries. |
| **User Interface** | **React + Tailwind + Framer Motion** | Dark-mode terminal/fintech aesthetic styled after Stripe Radar. Real-time DOM reconciliation optimized for high-frequency incoming event streams. |

---

## 📂 Repository Structure

```text
fraud-radar/
├── docker-compose.yml             # Redpanda broker + Redpanda Web Console
├── README.md
└── apps/
    ├── api-core-python/           # Machine Learning inference & FastAPI producer
    │   ├── data/                  # Kaggle credit card dataset storage
    │   ├── model/                 # Training scripts, evaluation & .joblib artifacts
    │   └── src/                   # FastAPI routes, schemas & simulator engine
    ├── worker-node/               # Kafka consumer, business rules & WebSocket server
    │   └── src/                   # Decision engine, types & Socket.io broadcaster
    └── web-dashboard/             # React (Vite) + TypeScript + Tailwind UI
        └── src/                   # Components, custom hooks & real-time views

---

## ⚡ Quickstart Guide

### Prerequisites
* [Docker & Docker Compose](https://www.docker.com/)
* [Python 3.10+](https://www.python.org/)
* [Node.js 18+](https://nodejs.org/)
* [Kaggle Credit Card Fraud Dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) (`creditcard.csv`)

---
```

### Step 1: Clone & Place Dataset
```bash
git clone https://github.com/your-username/fraud-radar.git
cd fraud-radar

# Download 'creditcard.csv' and place it in the Python data directory:
# Path: apps/api-core-python/data/creditcard.csv
```

---

### Step 2: Spin Up Message Broker
Start the local Redpanda broker and Web Console:
```bash
docker compose up -d
```
* *Redpanda Broker:* `localhost:9092`
* *Redpanda Web Console:* [http://localhost:8080](http://localhost:8080)

---

### Step 3: Train Model & Start Python Core API
```bash
cd apps/api-core-python

# Set up virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
cp .env.example .env

# Train the Isolation Forest model
python model/train.py

# Start the FastAPI engine
uvicorn src.main:app --reload --port 8000
```
* *Interactive Swagger Docs:* [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step 4: Start Node.js Worker & WebSocket Gateway
In a new terminal window:
```bash
cd apps/worker-node

npm install
cp .env.example .env
npm run dev
```
* *Worker & WebSocket Server:* [http://localhost:4000](http://localhost:4000)

---

### Step 5: Launch the React Dashboard
In a new terminal window:
```bash
cd apps/web-dashboard

npm install
npm run dev
```
* *Dashboard UI:* [http://localhost:5173](http://localhost:5173)

---

---

## 🧪 Event Schemas

### 1. Scored Transaction Event (Produced to Kafka)
```json
{
  "event_id": "evt_9f81a742cd1a",
  "transaction_id": "tx_4a91b820cd",
  "amount": 1845.50,
  "currency": "USD",
  "card_last4": "8841",
  "customer_id": "cus_e8b912a4",
  "risk_score": 0.9324,
  "is_anomaly": true,
  "timestamp": "2026-09-12T17:28:00Z",
  "metadata": {
    "source": "kaggle_stream_replay"
  }
}
```

### 2. Enriched Decision Event (Broadcasted via WebSocket)
```json
{
  "event_id": "evt_9f81a742cd1a",
  "transaction_id": "tx_4a91b820cd",
  "amount": 1845.50,
  "currency": "USD",
  "card_last4": "8841",
  "risk_score": 0.9324,
  "is_anomaly": true,
  "decision": "BLOCKED",
  "reasons": [
    "CRITICAL_RISK_SCORE_THRESHOLD",
    "ISOLATION_FOREST_HIGH_ANOMALY_CONFIDENCE"
  ],
  "processed_at": "2026-09-12T17:28:00.120Z",
  "processing_time_ms": 1.45
}
```

---

## 📊 Business Rules Matrix

| Risk Tier | Risk Score Range | Automatic Action | Rationale Code |
| :--- | :---: | :---: | :--- |
| 🟢 **Low Risk** | `0.00 - 0.49` | `APPROVED` | `WITHIN_NORMAL_BEHAVIORAL_PARAMETERS` |
| 🟡 **Medium Risk** | `0.50 - 0.84` | `MANUAL_REVIEW` | `ELEVATED_RISK_SUSPICION` / `HIGH_VALUE_TRANSACTION_AMOUNT` |
| 🔴 **Critical Risk**| `0.85 - 1.00` | `BLOCKED` | `CRITICAL_RISK_SCORE_THRESHOLD` / `ISOLATION_FOREST_HIGH_ANOMALY_CONFIDENCE` |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
```
