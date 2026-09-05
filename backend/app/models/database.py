import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DB_URL = os.getenv("DATABASE_URL", "sqlite:///./capitalguard.db")

# Enable check_same_thread=False for SQLite
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}
engine = create_engine(DB_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    asset_class = Column(String(50), nullable=False)
    price = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    expected_return = Column(Float, nullable=False)  # Annualized (e.g. 0.16 = 16%)
    volatility = Column(Float, nullable=False)       # Annualized std dev (e.g. 0.22 = 22%)
    liquidity_score = Column(Float, nullable=False)  # 0.0 to 1.0 (1.0 = highly liquid)
    risk_score = Column(Float, nullable=False)       # 0 to 100
    minimum_allocation = Column(Float, default=0.0)  # Min weight bound
    maximum_allocation = Column(Float, default=1.0)  # Max weight bound

    holdings = relationship("Holding", back_populates="asset")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Institutional Main Portfolio")
    total_capital = Column(Float, default=100000000.0)  # Default ₹10.00 Cr
    cash_balance = Column(Float, default=8000000.0)      # ₹80 Lakh
    risk_profile = Column(String(30), default="Balanced") # Conservative, Balanced, Aggressive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")

class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    allocation = Column(Float, nullable=False)  # Proportion 0.0 to 1.0 (e.g. 0.42 for 42%)
    quantity = Column(Float, default=0.0)
    current_value = Column(Float, nullable=False)

    portfolio = relationship("Portfolio", back_populates="holdings")
    asset = relationship("Asset", back_populates="holdings")

class RiskPolicy(Base):
    __tablename__ = "risk_policies"

    id = Column(Integer, primary_key=True, index=True)
    max_equity = Column(Float, default=0.35)          # 35% max equity
    max_volatility = Column(Float, default=0.18)      # 18% critical max volatility
    warning_volatility = Column(Float, default=0.14)  # 14% warning volatility
    warning_var = Column(Float, default=0.05)         # 5% warning VaR
    critical_var = Column(Float, default=0.08)        # 8% critical VaR
    max_concentration = Column(Float, default=0.30)   # 30% max any single asset
    min_liquidity = Column(Float, default=0.20)       # 20% minimum liquid assets
    critical_liquidity = Column(Float, default=0.15)  # 15% emergency liquidity floor
    max_drawdown = Column(Float, default=0.15)        # 15% max tolerable drawdown
    warning_drawdown = Column(Float, default=0.10)    # 10% warning drawdown
    transaction_cost_rate = Column(Float, default=0.0015) # 15 bps trading cost

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(20), nullable=False)  # CRITICAL, WARNING, INFO
    metric = Column(String(50), nullable=False)
    current_value = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    message = Column(String(255), nullable=False)
    recommendation = Column(Text, nullable=False)
    status = Column(String(20), default="ACTIVE")   # ACTIVE, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False) # MARKET_SHOCK, OPTIMIZATION, REBALANCE, RISK_BREACH
    trigger = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    action = Column(String(255), nullable=False)
    before_metrics = Column(Text, nullable=False)   # JSON string
    after_metrics = Column(Text, nullable=False)    # JSON string
    status = Column(String(30), default="COMPLETED")
    created_at = Column(DateTime, default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if assets exist
        if db.query(Asset).count() == 0:
            seed_assets = [
                Asset(
                    symbol="EQUITY",
                    name="Large-Cap Core Equities (NIFTY 50)",
                    asset_class="Equity",
                    price=2450.0,
                    base_price=2450.0,
                    expected_return=0.160, # 16.0%
                    volatility=0.220,      # 22.0%
                    liquidity_score=0.92,
                    risk_score=78.0,
                    minimum_allocation=0.10,
                    maximum_allocation=0.35  # Max policy is 35%, initial is 42% -> breach!
                ),
                Asset(
                    symbol="GBOND",
                    name="Government Bonds (10Y Sovereign G-Sec)",
                    asset_class="Government Bonds",
                    price=101.5,
                    base_price=101.5,
                    expected_return=0.072, # 7.2%
                    volatility=0.055,      # 5.5%
                    liquidity_score=0.98,
                    risk_score=20.0,
                    minimum_allocation=0.15,
                    maximum_allocation=0.50
                ),
                Asset(
                    symbol="CBOND",
                    name="Corporate Bonds (AAA Investment Grade)",
                    asset_class="Corporate Bonds",
                    price=104.2,
                    base_price=104.2,
                    expected_return=0.088, # 8.8%
                    volatility=0.090,      # 9.0%
                    liquidity_score=0.75,
                    risk_score=38.0,
                    minimum_allocation=0.05,
                    maximum_allocation=0.30
                ),
                Asset(
                    symbol="GOLD",
                    name="Physical Gold ETF Reserve",
                    asset_class="Gold",
                    price=7120.0,
                    base_price=7120.0,
                    expected_return=0.095, # 9.5%
                    volatility=0.145,      # 14.5%
                    liquidity_score=0.88,
                    risk_score=45.0,
                    minimum_allocation=0.03,
                    maximum_allocation=0.20
                ),
                Asset(
                    symbol="REIT",
                    name="Institutional Commercial REITs",
                    asset_class="REIT",
                    price=385.0,
                    base_price=385.0,
                    expected_return=0.105, # 10.5%
                    volatility=0.165,      # 16.5%
                    liquidity_score=0.65,
                    risk_score=55.0,
                    minimum_allocation=0.02,
                    maximum_allocation=0.15
                ),
                Asset(
                    symbol="CASH",
                    name="Overnight Treasury & Liquid Cash",
                    asset_class="Cash",
                    price=100.0,
                    base_price=100.0,
                    expected_return=0.055, # 5.5%
                    volatility=0.010,      # 1.0%
                    liquidity_score=1.00,
                    risk_score=5.0,
                    minimum_allocation=0.05,
                    maximum_allocation=0.40
                )
            ]
            db.add_all(seed_assets)
            db.commit()

        # Check Portfolio
        if db.query(Portfolio).count() == 0:
            total_cap = 100000000.0  # ₹10.00 Cr
            portfolio = Portfolio(
                name="CapitalGuard Institutional Master Fund",
                total_capital=total_cap,
                cash_balance=8000000.0,
                risk_profile="Balanced"
            )
            db.add(portfolio)
            db.commit()
            db.refresh(portfolio)

            # Seed holdings according to requirements:
            # Equity: 42%, Gov Bonds: 25%, Corp Bonds: 12%, Gold: 8%, REIT: 5%, Cash: 8%
            allocations = {
                "EQUITY": 0.42,
                "GBOND": 0.25,
                "CBOND": 0.12,
                "GOLD": 0.08,
                "REIT": 0.05,
                "CASH": 0.08
            }
            assets = {a.symbol: a for a in db.query(Asset).all()}
            for sym, alloc in allocations.items():
                asset = assets[sym]
                val = total_cap * alloc
                qty = val / asset.price
                holding = Holding(
                    portfolio_id=portfolio.id,
                    asset_id=asset.id,
                    allocation=alloc,
                    quantity=qty,
                    current_value=val
                )
                db.add(holding)
            db.commit()

        # Check RiskPolicy
        if db.query(RiskPolicy).count() == 0:
            policy = RiskPolicy(
                max_equity=0.35,          # 35% concentration threshold
                max_volatility=0.18,      # 18% max volatility
                warning_volatility=0.14,  # 14%
                warning_var=0.05,         # 5%
                critical_var=0.08,        # 8%
                max_concentration=0.30,   # 30% max any single asset (equity at 42% triggers alert)
                min_liquidity=0.20,       # 20% minimum liquidity (cash + gov bond + gold = 41% initial)
                critical_liquidity=0.15,
                max_drawdown=0.15,
                warning_drawdown=0.10,
                transaction_cost_rate=0.0015
            )
            db.add(policy)
            db.commit()

        # Check Initial Alerts
        if db.query(Alert).count() == 0:
            # Seed the initial concentration breach: Equity is 42% vs 35% limit
            initial_alert = Alert(
                severity="WARNING",
                metric="EQUITY_CONCENTRATION",
                current_value=0.42,
                threshold=0.35,
                message="Equity Exposure Exceeds Concentration Limit",
                recommendation="Reduce equity allocation by 7.00% to conform with the 35.00% institutional policy ceiling.",
                status="ACTIVE",
                created_at=datetime.utcnow()
            )
            db.add(initial_alert)
            db.commit()

        # Check Initial Decisions
        if db.query(Decision).count() == 0:
            initial_decision = Decision(
                event_type="POLICY_AUDIT",
                trigger="System Initialization & Baseline Scan",
                reason="Portfolio baseline established at ₹10.00 Cr with 6 core institutional asset classes.",
                action="Baseline Recorded & Active Monitoring Engaged",
                before_metrics=json.dumps({
                    "portfolio_value": 100000000.0,
                    "expected_return": 0.124,
                    "portfolio_risk": 0.142,
                    "sharpe_ratio": 1.31,
                    "liquidity": 0.27,
                    "var_95": 0.058
                }),
                after_metrics=json.dumps({
                    "portfolio_value": 100000000.0,
                    "expected_return": 0.124,
                    "portfolio_risk": 0.142,
                    "sharpe_ratio": 1.31,
                    "liquidity": 0.27,
                    "var_95": 0.058
                }),
                status="COMPLETED",
                created_at=datetime.utcnow()
            )
            db.add(initial_decision)
            db.commit()

    finally:
        db.close()
