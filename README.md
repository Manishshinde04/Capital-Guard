CapitalGuard

Smart Capital Allocation. Real-Time Risk Control.

<p align="center">
  <img src="assets/capitalguard-loop.gif" alt="CapitalGuard closed-loop risk control animation" width="100%">
</p>

<p align="center">
  <b>A practical FinTech decision-support and portfolio risk simulation platform.</b><br>
  Built to turn market signals into measurable, explainable capital decisions.
</p>

<p align="center">
  <a href="#-what-is-capitalguard">What is it?</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-how-it-works">How it works</a> •
  <a href="#-quick-start">Quick start</a> •
  <a href="#-demo-flow">Demo</a>
</p>

🎯 What is CapitalGuard?

CapitalGuard is a FinTech decision-support and simulation platform for portfolio managers, financial officers, risk teams, and institutional allocators.

The idea is simple:

Don't wait for risk to become a problem. Detect it, understand it, optimize around it, and record the decision.

CapitalGuard follows a closed-loop workflow:

OBSERVE → ANALYZE → DETECT → OPTIMIZE → RESPOND → EXPLAIN → RECORD

Instead of showing a risk number and leaving the user to figure out what it means, the platform connects portfolio data, market shocks, risk limits, liquidity requirements, optimization, and explainable recommendations in one workflow.

Core question:
Given our current capital, allocation, market conditions, risk limits, liquidity requirements, and investment constraints, what is the safest and most efficient allocation right now?

💡 Why we built it

Managing a portfolio becomes difficult when markets move quickly.

A portfolio can look healthy one minute and become exposed to concentration, liquidity, or volatility risk after a sudden market move. Manual rebalancing can also introduce unnecessary transaction costs.

CapitalGuard is designed around five practical problems:

Delayed intervention — important changes can be missed while teams manually review portfolios.

Concentration risk — an oversized position can quietly dominate portfolio risk.

Liquidity pressure — selling the wrong assets during stress can make a bad situation worse.

Turnover costs — constantly rebalancing can reduce net returns.

Poor explainability — a warning is not very useful unless the user knows why it happened and what to do next.

🚀 Key Features

📊 Portfolio Monitoring

See the important portfolio numbers in one place:

Total capital

Expected return

Portfolio volatility

Sharpe ratio

Value at Risk (VaR)

Expected Shortfall / CVaR

Concentration

Liquidity

Asset-level exposure

🧠 Constrained Portfolio Optimization

CapitalGuard uses constrained mean-variance optimization with SLSQP to find a better allocation while respecting real portfolio rules.

The optimizer can account for:

Asset allocation bounds

Portfolio volatility ceilings

Liquidity floors

Concentration limits

Current holdings

Rebalancing / transaction friction

The goal is not simply to maximize return.

The goal is to find a practical risk-adjusted allocation under constraints.

🛡️ Explainable Risk Scoring

Risk is broken down into understandable factors instead of presenting one unexplained score:

Volatility

Tail VaR

Concentration (HHI)

Liquidity deficit

This makes the reason behind a warning or critical state easier to understand.

🌪️ Stress Testing

Test the portfolio before a scenario becomes reality.

Built-in scenarios include:

Market Crash

Recession

Interest Rate Shock

Inflation Shock

Liquidity Freeze

You can also test custom multi-asset shocks.

⚡ One-Click Market Crash Demo

For the hackathon demo, the SIMULATE MARKET CRASH action demonstrates the complete control loop:

Market shock → Portfolio impact → Risk spike → Alert → Defensive optimization → Explanation → Decision record

It is intentionally designed to make the system's value visible in a short live demonstration.

🔄 Simulated Rebalancing

The platform calculates simulated buy/sell orders in ₹ and includes transaction friction so that recommendations are closer to a practical portfolio-management workflow.

🧾 Decision History

Important optimization, stress, and market-shock events can be recorded with:

Trigger

Before/after metrics

Recommended action

Explanation

Timestamp

This creates a clear audit trail for the simulation.

🔁 How it works

┌─────────┐
│ OBSERVE │  Market & portfolio data
└────┬────┘
     ↓
┌─────────┐
│ ANALYZE │  Returns, volatility, liquidity, exposure
└────┬────┘
     ↓
┌────────┐
│ DETECT │  Check risk policies & thresholds
└────┬───┘
     ↓
┌──────────┐
│ OPTIMIZE │  Find a constrained allocation
└────┬─────┘
     ↓
┌─────────┐
│ RESPOND │  Generate simulated rebalance
└────┬────┘
     ↓
┌─────────┐
│ EXPLAIN │  Show why the recommendation was made
└────┬────┘
     ↓
┌────────┐
│ RECORD │  Save the decision / audit event
└────────┘

The animated banner above gives the same idea a more interactive feel.

🧮 Financial Methodology

CapitalGuard uses transparent quantitative formulas.

Expected portfolio return

$$R_p = \sum_{i=1}^{n} w_iR_i = \mathbf{w}^T\mathbf{R}$$

Portfolio variance and volatility

$$\sigma_p^2 = \mathbf{w}^T\mathbf{\Sigma}\mathbf{w}$$

$$\sigma_p = \sqrt{\max(0,\mathbf{w}^T\mathbf{\Sigma}\mathbf{w})}$$

where:

$$\mathbf{\Sigma}{ij}=\rho{ij}\sigma_i\sigma_j$$

Sharpe ratio

$$\text{Sharpe}=\frac{R_p-R_f}{\sigma_p}$$

The current methodology uses a configurable sovereign risk-free rate of 6.50%.

Parametric VaR and CVaR

$$\text{VaR}{\alpha}=Z{\alpha}\sigma_p-R_p$$

$$\text{CVaR}{\alpha}=\frac{\phi(Z{\alpha})}{1-\alpha}\sigma_p-R_p$$

Supported confidence levels include 95% and 99%.

Optimization objective

The constrained optimizer minimizes a combination of portfolio variance, expected return, and turnover cost:

\mathbf{w}^T\mathbf{R}
+
\kappa\sum_i|w_i-w_{i,current}|c
\right]
$$

Subject to:

Full investment: $\sum_iw_i=1$

Asset minimum/maximum bounds

Maximum portfolio volatility

Minimum liquidity

Maximum concentration

Risk profiles

Profile

Risk aversion λ

Max volatility

Min liquidity

Max equity

Conservative

6.0

11.0%

32.0%

22.0%

Balanced

3.0

14.5%

25.0%

32.0%

Aggressive

1.2

18.0%

18.0%

45.0%

🏗️ Architecture

┌──────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│ Dashboard • Portfolio • Risk • Optimization • Simulation   │
└─────────────────────────────┬────────────────────────────────┘
                              │ REST / JSON
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                        │
│ Portfolio • Optimization • Risk • Stress Test • Simulation │
└───────────────┬──────────────────┬───────────────────────────┘
                │                  │
                ▼                  ▼
      ┌─────────────────┐  ┌─────────────────────────┐
      │ Quant Engine    │  │ Closed-Loop Risk Engine │
      │ NumPy / SciPy   │  │ Detect • Respond • Log  │
      │ VaR / Covariance│  │ Explainable Decisions   │
      └────────┬────────┘  └────────────┬────────────┘
               └──────────────┬─────────┘
                              ▼
                 ┌────────────────────────┐
                 │ SQLAlchemy + Database  │
                 │ SQLite / PostgreSQL    │
                 └────────────────────────┘

🧰 Technology Stack

Layer

Technology

Frontend

React, TypeScript, Vite, Tailwind CSS

UI & Charts

Recharts, Lucide React

Backend

Python, FastAPI, Pydantic, SQLAlchemy, Uvicorn

Quantitative Engine

NumPy, Pandas, SciPy

Optimization

scipy.optimize.minimize with SLSQP

Development DB

SQLite

Production-ready DB direction

PostgreSQL

Deployment

Docker, Docker Compose

Testing

Pytest

💼 Seed Portfolio

The current development/demo baseline starts with ₹10.00 Crore.

Asset Class

Allocation

Expected Return

Volatility

Liquidity

Policy Limit

Core Large-Cap Equities

42%

16.0%

22.0%

92%

35%

Government Bonds

25%

7.2%

5.5%

98%

50%

Corporate AAA Bonds

12%

8.8%

9.0%

75%

30%

Physical Gold ETF

8%

9.5%

14.5%

88%

20%

Commercial REITs

5%

10.5%

16.5%

65%

15%

Cash & Liquid Equivalents

8%

5.5%

1.0%

100%

40%

The 42% equity allocation intentionally starts above the 35% concentration limit so the risk-control workflow has something meaningful to detect during the demo.

⚙️ Quick Start

Prerequisites

Make sure you have:

Python 3.11+

Node.js 18+

npm

Git

1. Start the backend

cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

Backend:

API: http://localhost:8000

Swagger docs: http://localhost:8000/docs

Health check: http://localhost:8000/health

2. Start the frontend

Open a second terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

🐳 Run with Docker

If Docker is installed:

docker compose up --build

Then open the application using the port exposed by the Docker Compose configuration.

🧪 Testing

Run the backend test suite:

cd backend
python -m pytest tests/ -v

The test suite covers the core areas of the system, including:

Financial calculations

Covariance and volatility

Sharpe ratio

VaR / CVaR

HHI concentration

Optimization constraints

Risk-state transitions

Transaction costs

Market-crash closed-loop behavior

API endpoints

🎬 2-Minute Hackathon Demo

If you are presenting CapitalGuard live, this is the simplest story to tell.

1. Start with the portfolio

Show the baseline portfolio and point out the equity concentration above its configured limit.

2. Run optimization

Open Optimization, select Balanced, and run the optimizer.

Show:

Before vs. after allocation

Risk change

Sharpe change

Simulated buy/sell orders

"Why this allocation?" explanation

3. Trigger a market crash

Return to the dashboard and click:

⚡ SIMULATE MARKET CRASH

The system demonstrates:

MARKET SHOCK
     ↓
PORTFOLIO IMPACT
     ↓
RISK SPIKE
     ↓
ALERT
     ↓
DEFENSIVE OPTIMIZATION
     ↓
EXPLANATION
     ↓
DECISION LOG

4. Finish with Decision History

Open Decision History and show the latest event with its trigger, metrics, action, and reasoning.

The key message for judges:

CapitalGuard doesn't just tell you that risk increased. It detects the problem, calculates a constrained response, explains the reasoning, and records what happened.

🔌 REST API

Method

Endpoint

Purpose

GET

/health

Check API, database, engine, and optimizer

GET

/api/portfolio

Portfolio, holdings, and risk metrics

GET

/api/assets

Supported assets

POST

/api/optimization

Run constrained optimization

POST

/api/rebalance

Simulate a rebalance

GET

/api/risk

Risk score and policy information

GET

/api/risk/heatmap

Asset risk heatmap

GET

/api/risk-policy

Read risk policy

PUT

/api/risk-policy

Update risk policy

POST

/api/stress-test

Run a stress scenario

POST

/api/market-shock

Trigger the market-crash demo

GET

/api/alerts

Read alerts

PATCH

/api/alerts/{id}

Resolve an alert

GET

/api/decisions

Read decision history

POST

/api/simulation/toggle

Pause/resume simulation

POST

/api/simulation/reset

Reset the demo portfolio

🔐 Security & Governance

CapitalGuard is designed around transparent and controlled decision support.

Current safeguards include:

Strong Pydantic input validation

Centralized portfolio state

Policy-based risk thresholds

Persistent event logging

Explainable quantitative outputs

No black-box AI used for financial calculations

The natural-language explanation layer translates structured quantitative results rather than inventing financial numbers.

🗺️ Project Structure

capitalguard/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── capitalguard.db
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── docker-compose.yml
└── README.md

🔮 What could come next?

The current platform is built as a strong decision-support and simulation foundation. Natural next steps include:

Real Supabase authentication and user accounts

User-specific portfolios and RLS

PostgreSQL production storage

Live market-data providers

More advanced liquidity modelling

Transaction-cost modelling

Portfolio-level scenario libraries

Role-based institutional access

Notification workflows

Cloud deployment

More advanced optimization objectives

These can be added without changing the core closed-loop architecture.

⚠️ Important Note

CapitalGuard is a financial decision-support and simulation platform developed for demonstration and hackathon purposes.

It does not provide personalized investment advice and does not execute real-world financial transactions.

Any simulated allocation, risk metric, market shock, or rebalance should be treated as a demonstration of the platform's methodology—not as a recommendation to invest.

👨‍💻 Built for

INIT'26 Hackathon

CapitalGuard is built around one simple idea:

Better capital decisions come from connecting risk detection, optimization, explainability, and action—not from looking at another dashboard full of numbers.

<p align="center">
  <b>CapitalGuard</b><br>
  Smart Capital Allocation • Real-Time Risk Control
</p>