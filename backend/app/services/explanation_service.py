from typing import Dict, List, Any

class ExplanationService:
    """
    Transparent Institutional Explanation Engine.
    Converts structured financial metrics and optimization results into
    rigorous, human-readable 5-point institutional rationales:
      1. WHAT HAPPENED?
      2. WHICH LIMIT WAS BREACHED?
      3. WHY DOES IT MATTER?
      4. WHAT SHOULD WE DO?
      5. WHAT WILL HAPPEN AFTERWARD?
    """

    @staticmethod
    def generate_optimization_explanation(
        current_metrics: Dict[str, float],
        recommended_metrics: Dict[str, float],
        allocations_diff: List[Dict[str, Any]],
        risk_profile: str,
        policy_limits: Dict[str, float]
    ) -> Dict:
        # Find major changes
        reductions = [a for a in allocations_diff if a["allocation_change"] < -0.01]
        additions = [a for a in allocations_diff if a["allocation_change"] > 0.01]

        vol_before = current_metrics["portfolio_risk"] * 100.0
        vol_after = recommended_metrics["portfolio_risk"] * 100.0
        sharpe_before = current_metrics["sharpe_ratio"]
        sharpe_after = recommended_metrics["sharpe_ratio"]
        liq_before = current_metrics["liquidity_ratio"] * 100.0
        liq_after = recommended_metrics["liquidity_ratio"] * 100.0

        main_drivers = []

        # Detect drivers
        eq_diff = next((a for a in allocations_diff if a["symbol"] == "EQUITY"), None)
        if eq_diff and eq_diff["current_allocation"] > policy_limits.get("max_equity", 0.35):
            main_drivers.append(f"Equity Concentration ({eq_diff['current_allocation']*100:.1f}% vs {policy_limits.get('max_equity', 0.35)*100:.1f}% limit)")
        if vol_before > (policy_limits.get("max_volatility", 0.18) * 100.0):
            max_v = policy_limits.get("max_volatility", 0.18) * 100.0
            main_drivers.append(f"Volatility Breach ({vol_before:.2f}% vs {max_v:.2f}% limit)")
        if liq_before < (policy_limits.get("min_liquidity", 0.20) * 100.0):
            main_drivers.append(f"Liquidity Buffer Deficit ({liq_before:.1f}%)")
        if not main_drivers:
            main_drivers.append("Mean-Variance Efficiency & Risk-Aversion Optimization")

        # 1. What Happened
        reduc_str = ", ".join([f"{r['symbol']} by {abs(r['allocation_change'])*100:.1f}%" for r in reductions]) or "minimal rotation"
        add_str = ", ".join([f"{a['symbol']} by {a['allocation_change']*100:.1f}%" for a in additions]) or "hold positions"
        what_happened = (
            f"The optimizer selected an efficient capital allocation under the {risk_profile} institutional profile, "
            f"identifying optimal reweighting across {len(allocations_diff)} asset classes."
        )

        # 2. Which Limit Was Breached / Targeted
        which_limit = (
            f"Targeting compliance with max concentration ({policy_limits.get('max_concentration', 0.30)*100:.0f}%), "
            f"volatility ceiling ({policy_limits.get('max_volatility', 0.18)*100:.1f}%), and minimum liquidity buffer ({policy_limits.get('min_liquidity', 0.20)*100:.1f}%)."
        )

        # 3. Why It Matters
        why_it_matters = (
            f"Excessive risk or concentration limits amplify portfolio vulnerability to market shocks and tail-risk drawdowns. "
            f"Prior allocation exhibited {vol_before:.2f}% annualized volatility with a Sharpe ratio of {sharpe_before:.2f}."
        )

        # 4. What Should We Do
        what_should_we_do = (
            f"Trim overweight allocations ({reduc_str}) and deploy capital into defensive and liquid holdings ({add_str}), "
            f"penalizing unnecessary turnover to contain execution friction."
        )

        # 5. What Will Happen Afterward
        vol_change_str = f"decreases by {abs(vol_before - vol_after):.2f}%" if vol_after < vol_before else f"adjusts to {vol_after:.2f}%"
        sharpe_change_str = f"improves from {sharpe_before:.2f} to {sharpe_after:.2f}" if sharpe_after >= sharpe_before else f"moves to {sharpe_after:.2f}"
        what_will_happen_afterward = (
            f"Portfolio volatility {vol_change_str} (now {vol_after:.2f}%), Sharpe ratio {sharpe_change_str}, "
            f"and liquidity buffer shifts to {liq_after:.1f}%, restoring institutional resilience."
        )

        summary = (
            f"Under {risk_profile} optimization, capital is shifted from high-volatility/concentrated assets "
            f"into yield-bearing sovereign debt and liquidity, balancing return potential with tail-risk defense."
        )

        return {
            "summary": summary,
            "what_happened": what_happened,
            "which_limit_breached": which_limit,
            "why_it_matters": why_it_matters,
            "what_should_we_do": what_should_we_do,
            "what_will_happen_afterward": what_will_happen_afterward,
            "main_drivers": main_drivers
        }

    @staticmethod
    def generate_market_shock_explanation(
        shock_name: str,
        loss_amount: float,
        percentage_loss: float,
        vol_before: float,
        vol_after: float,
        var_before: float,
        var_after: float,
        status_before: str,
        status_after: str,
        breached_metrics: List[str]
    ) -> Dict:
        loss_cr = loss_amount / 1e7
        what_happened = (
            f"A systemic {shock_name} shock impacted portfolio asset valuations, causing an aggregate capital contraction "
            f"of ₹{loss_cr:.2f} Cr ({percentage_loss:.2f}%)."
        )

        limits_str = ", ".join(breached_metrics) if breached_metrics else "Policy Volatility & VaR thresholds"
        which_limit = (
            f"Breached institutional risk policies: {limits_str}. "
            f"Portfolio Risk escalated from {vol_before*100:.2f}% to {vol_after*100:.2f}%, and 95% VaR surged from {var_before*100:.2f}% to {var_after*100:.2f}%."
        )

        why_it_matters = (
            f"Transitioning from {status_before} to {status_after} exposes the fund to severe compounding drawdowns "
            f"and potential liquidity impairment under continued market distress."
        )

        what_should_we_do = (
            "Initiate immediate defensive rebalancing: de-risk high-beta equity exposure and scale allocations into "
            "sovereign government bonds and liquid overnight reserves."
        )

        what_will_happen_afterward = (
            f"The recommended rebalance dampens portfolio volatility back below institutional ceilings, "
            f"reinforces the liquidity buffer above 28%, and protects remaining capital against secondary shocks."
        )

        summary = (
            f"Systemic {shock_name} triggered a ₹{loss_cr:.2f} Cr loss and {status_after} risk state. "
            f"Automated risk control triggered to rebalance into defensive capital preservation."
        )

        return {
            "summary": summary,
            "what_happened": what_happened,
            "which_limit_breached": which_limit,
            "why_it_matters": why_it_matters,
            "what_should_we_do": what_should_we_do,
            "what_will_happen_afterward": what_will_happen_afterward,
            "main_drivers": [
                f"{shock_name} Price Contraction (-{percentage_loss:.1f}%)",
                f"Volatility Surge (+{(vol_after - vol_before)*100:.2f}%)",
                f"Value at Risk Spike (+{(var_after - var_before)*100:.2f}%)"
            ]
        }
