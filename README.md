# Signal Corps.

### The Immune System for High-Signal Networks.

[![Live Demo](https://img.shields.io/badge/Live_Demo-signalcorps.dev-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://www.signalcorps.dev)
[![Built With](https://img.shields.io/badge/Built_With-Gemini_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

---

LIVE LINK: https://www.signalcorps.dev

## 🚨 The Problem: Signal vs. Noise

Series.so is building a future that feels human. But as any high-value network scales, it faces an inevitable threat: **Noise.**

Bots, spammers, resume-padders, and "wantrepreneurs" dilute the quality of the community. Traditional verification (SMS/Email) proves **Identity**, but it does not prove **Competence** or **Intent**.

## 🛡️ The Solution

**Signal Corps** is an autonomous verification and moderation protocol designed to protect the integrity of builder communities. It acts as a two-layer filter:

1.  **The Gate:** Verifies *Merit* (Can you actually build what you claim?)
2.  **The Guard:** Verifies *Intent* (Are you here to contribute or to spam?)

---

## ✨ Key Features

### 1. Merit-Based Verification (The Gate)
We don't trust bios; we trust code.
* Users connect their **GitHub**.
* They state their claim (e.g., *"I am a Senior Solidity Engineer"*).
* Our system recursively scans their actual repository file trees and reads dependency manifests.
* **The Verdict:** We don't just check filenames; we check **code lines**. If you claim "Docker" skills, we verify if your `package.json` includes `dockerode` or if your config files match the claim. Empty repos or "Hello World" tutorials are rejected at the door.

### 2. The Network Graph
* Verified users are visualized as a living, force-directed graph.
* "Me" nodes pulse to anchor the user, while verified peers are color-coded by their unique identity hash.
* Click any node to initiate a secure, high-signal chat.

### 3. Vibe Guard (Real-Time Moderation)
We moved beyond "Report User" buttons.
* **How it works:** Vibe Guard is a logic engine powered by **Google Gemini Flash**.
* Every message sent is analyzed in real-time against a strict set of community guidelines injected into the model's context window.
* It assigns a **Signal Score (0-100)** based on technical depth, sentiment, and intent.
* **The Kill Switch:** If a user attempts to spam, sell crypto scams, or harass others (Score < 20), the system automatically:
    1.  Flags the account.
    2.  Increments a "Bad Quality" counter.
    3.  **Permanently deletes the account** upon the 3rd strike (removes from Clerk & DB).

---

## 🏗️ Architecture & Tech Stack

Signal Corps is designed as an **Event-Driven Architecture** adaptable for high-throughput streams.

* **Frontend:** React + Vite (Deployed on Vercel)
* **Backend:** Node.js + Express (Serverless Functions)
* **Auth:** Clerk (Custom integration for forced bans)
* **Database:** MongoDB (Stores verification status and risk scores)
* **AI Engine:** Google Gemini Flash (Chosen for massive context window to read recursive file trees)
* **Visualization:** `react-force-graph-2d`

### Production Readiness (Kafka Integration)
While this demo runs synchronously for instant feedback, the **Vibe Guard** logic is designed to run as a downstream **Kafka Consumer**. In a production environment at Series, this service would plug directly into the message event stream to moderate millions of messages asynchronously without adding latency.

---

## 🚀 Getting Started Locally

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/yourusername/signal-corps.git](https://github.com/yourusername/signal-corps.git)
    cd signal-corps
    ```

2.  **Install Dependencies** (Root, Client, and Server)
    ```bash
    npm install
    cd client && npm install
    cd ../server && npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in `/server` and `/client` based on the keys provided in the submission.

4.  **Run the App**
    ```bash
    # Terminal 1 (Backend)
    cd server && npm run dev

    # Terminal 2 (Frontend)
    cd client && npm run dev
    ```

---

## 🏆 Hackathon Context

Built for the **Series.so "Future Feels Human" Hackathon**.
Signal Corps ensures that the future of human connection remains authentic, safe, and high-signal.

> *"Talk is cheap. Show me the code."* — Linus Torvalds (and Signal Corps)
