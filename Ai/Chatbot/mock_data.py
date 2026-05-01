# mock_data.py
# Provides realistic dummy financial data for local TEST mode development.
# This allows full frontend/AI development without a live backend connection.

MOCK_DASHBOARD_DATA: dict = {
    "monthlyIncome": 15000.00,
    "totalSpendThisMonth": 9450.75,
    "spendByCategory": [
        {"category": "Housing & Rent",    "amount": 3500.00, "percentage": 37.0},
        {"category": "Groceries",          "amount": 1200.50, "percentage": 12.7},
        {"category": "Dining Out",         "amount": 980.00,  "percentage": 10.4},
        {"category": "Transportation",     "amount": 750.25,  "percentage": 7.9},
        {"category": "Subscriptions",      "amount": 620.00,  "percentage": 6.6},
        {"category": "Shopping & Apparel", "amount": 1400.00, "percentage": 14.8},
        {"category": "Utilities",          "amount": 500.00,  "percentage": 5.3},
        {"category": "Entertainment",      "amount": 500.00,  "percentage": 5.3},
    ],
    "atRiskSubscriptionsList": [
        {
            "name": "Adobe Creative Cloud",
            "amount": 250.00,
            "billingCycle": "monthly",
            "lastUsed": "2025-03-15",
            "riskLevel": "HIGH",
            "reason": "No usage detected in the last 47 days.",
        },
        {
            "name": "Netflix Premium",
            "amount": 65.00,
            "billingCycle": "monthly",
            "lastUsed": "2025-04-20",
            "riskLevel": "MEDIUM",
            "reason": "Usage dropped significantly compared to last month.",
        },
        {
            "name": "LinkedIn Premium",
            "amount": 180.00,
            "billingCycle": "monthly",
            "lastUsed": "2025-04-01",
            "riskLevel": "HIGH",
            "reason": "No activity detected in the last 30 days.",
        },
    ],
}
