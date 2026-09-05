import numpy as np
from typing import Dict, List, Tuple
from scipy.stats import norm

# Standard 6x6 Institutional Correlation Matrix
# Order: EQUITY, GBOND, CBOND, GOLD, REIT, CASH
DEFAULT_CORRELATION_MATRIX = np.array([
    [ 1.00, -0.15,  0.25, -0.05,  0.55,  0.00 ],  # EQUITY
    [-0.15,  1.00,  0.60,  0.20,  0.10,  0.05 ],  # GBOND
    [ 0.25,  0.60,  1.00,  0.10,  0.35,  0.05 ],  # CBOND
    [-0.05,  0.20,  0.10,  1.00,  0.05,  0.00 ],  # GOLD
    [ 0.55,  0.10,  0.35,  0.05,  1.00,  0.00 ],  # REIT
    [ 0.00,  0.05,  0.05,  0.00,  0.00,  1.00 ]   # CASH
])

SYMBOL_ORDER = ["EQUITY", "GBOND", "CBOND", "GOLD", "REIT", "CASH"]
RISK_FREE_RATE = 0.065  # 6.5% Annualized Sovereign Risk-Free Rate

class FinancialEngine:
    """
    Institutional quantitative engine providing mathematically rigorous
    calculations for portfolio risk, expected return, covariance, VaR, CVaR,
    Sharpe ratio, and concentration metrics.
    """

    @staticmethod
    def get_correlation_matrix() -> np.ndarray:
        return DEFAULT_CORRELATION_MATRIX.copy()

    @staticmethod
    def calculate_covariance_matrix(volatilities: np.ndarray, corr_matrix: np.ndarray = None) -> np.ndarray:
        """
        Calculates Covariance Matrix: Sigma_ij = Corr_ij * Vol_i * Vol_j
        """
        if corr_matrix is None:
            corr_matrix = DEFAULT_CORRELATION_MATRIX
        D = np.diag(volatilities)
        cov_matrix = np.dot(np.dot(D, corr_matrix), D)
        return cov_matrix

    @staticmethod
    def calculate_expected_return(weights: np.ndarray, expected_returns: np.ndarray) -> float:
        """
        Rp = sum(w_i * R_i) = w.T * R
        """
        return float(np.dot(weights, expected_returns))

    @staticmethod
    def calculate_portfolio_variance(weights: np.ndarray, cov_matrix: np.ndarray) -> float:
        """
        sigma_p^2 = w.T * Sigma * w
        """
        var = float(np.dot(weights.T, np.dot(cov_matrix, weights)))
        return max(0.0, var)

    @staticmethod
    def calculate_portfolio_volatility(weights: np.ndarray, cov_matrix: np.ndarray) -> float:
        """
        sigma_p = sqrt(w.T * Sigma * w)
        """
        var = FinancialEngine.calculate_portfolio_variance(weights, cov_matrix)
        return float(np.sqrt(var))

    @staticmethod
    def calculate_sharpe_ratio(expected_return: float, volatility: float, risk_free_rate: float = RISK_FREE_RATE) -> float:
        """
        Sharpe Ratio = (Rp - Rf) / sigma_p
        """
        if volatility <= 1e-6:
            return 0.0
        return float((expected_return - risk_free_rate) / volatility)

    @staticmethod
    def calculate_var(expected_return: float, volatility: float, confidence_level: float = 0.95) -> float:
        """
        Parametric Annualized Value at Risk (VaR):
        VaR_alpha = Z_alpha * sigma_p - Rp
        Represents the estimated potential loss threshold at confidence level alpha.
        """
        z_score = float(norm.ppf(confidence_level))
        var = z_score * volatility - expected_return
        return max(0.0, float(var))

    @staticmethod
    def calculate_expected_shortfall(expected_return: float, volatility: float, confidence_level: float = 0.95) -> float:
        """
        Expected Shortfall (CVaR / Conditional VaR):
        ES_alpha = (phi(Z_alpha) / (1 - alpha)) * sigma_p - Rp
        Represents average loss conditional on exceeding the VaR threshold.
        """
        z_score = float(norm.ppf(confidence_level))
        pdf_val = float(norm.pdf(z_score))
        cvar = (pdf_val / (1.0 - confidence_level)) * volatility - expected_return
        return max(0.0, float(cvar))

    @staticmethod
    def calculate_concentration_hhi(weights: np.ndarray) -> float:
        """
        Herfindahl-Hirschman Index for portfolio concentration:
        HHI = sum(w_i^2)
        0.166 = perfectly diversified across 6 assets; 1.0 = 100% in one asset.
        """
        return float(np.sum(np.square(weights)))

    @staticmethod
    def calculate_liquidity_ratio(weights: np.ndarray, liquidity_scores: np.ndarray) -> float:
        """
        Weighted average liquidity ratio of the portfolio:
        L_p = sum(w_i * L_i)
        """
        return float(np.dot(weights, liquidity_scores))

    @staticmethod
    def calculate_transaction_cost(
        current_weights: np.ndarray,
        target_weights: np.ndarray,
        portfolio_value: float,
        cost_rate: float = 0.0015
    ) -> float:
        """
        Transaction Cost = sum(|w_target - w_current|) * 0.5 * PortfolioValue * cost_rate
        (Factor 0.5 accounts for turnover: selling 10% and buying 10% is 10% turnover)
        """
        turnover = float(np.sum(np.abs(target_weights - current_weights))) * 0.5
        return float(turnover * portfolio_value * cost_rate)
