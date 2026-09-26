# UNYQUEST — Server-Side API Reference
> *Build. Fund. Grow. Win.* — An [EM300.co](https://em300.co) Company

---

## 1. Overview

All critical economic mutations in UNYQUEST are validated server-side to guarantee economic integrity and prevent client-side tampering with cap tables, valuations, or balances.

---

## 2. Endpoints

### `GET /api/companies`
Lists the 20 pre-seeded startup archetypes available in the ecosystem.

**Response:**
```json
{
  "success": true,
  "count": 20,
  "archetypes": [
    {
      "name": "FleetMind AI",
      "sector": "Logistics",
      "market": "Global",
      "business_model": "SaaS",
      "tam": 18000000000,
      "initial_users": 120,
      "initial_revenue": 18000,
      "difficulty": "MEDIUM"
    }
  ]
}
```

---

### `POST /api/companies`
Creates a new startup entity with initial metrics and treasury.

**Request Body:**
```json
{
  "founder_id": "user-uuid",
  "founder_name": "Founder Name",
  "name": "My Startup",
  "tagline": "Next-gen enterprise software",
  "sector": "AI",
  "market": "Global",
  "business_model": "SaaS",
  "founder_strengths": ["Technical", "Product"]
}
```

**Response:**
```json
{
  "success": true,
  "company": {
    "id": "comp-123",
    "name": "My Startup",
    "metrics": {
      "cash": 100000,
      "monthly_burn": 10000,
      "runway": 10.0,
      "valuation": 1200000,
      "founder_ownership": 100
    }
  }
}
```

---

### `POST /api/investments`
Executes an investment transaction, diluting existing shareholders proportionally and updating cap tables.

**Request Body:**
```json
{
  "company": { "id": "comp-123", "metrics": { ... } },
  "investor_id": "inv-456",
  "investor_name": "Eleanor Vance",
  "amount": 250000,
  "pre_money_valuation": 1500000,
  "existing_cap_table": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "post_money_valuation": 1750000,
    "new_investor_equity": 14.3,
    "dilution_percentage": 14.3,
    "updated_cap_table": [ ... ],
    "investment_record": { ... }
  }
}
```

---

### `POST /api/pitch`
Evaluates a pitch deck against institutional venture investor archetypes (`GENERALIST`, `SPECIALIST`, or `OPERATOR`).

**Request Body:**
```json
{
  "company": { ... },
  "ask": 250000,
  "valuation": 2000000,
  "target_archetype": "GENERALIST",
  "use_of_funds": {
    "product": 100000,
    "marketing": 75000,
    "hiring": 37500,
    "sales": 25000,
    "reserve": 12500
  }
}
```

**Response:**
```json
{
  "success": true,
  "outcome": {
    "decision": "TERM_SHEET",
    "score": 72,
    "pitch_cost": 5000,
    "feedback_reason": "Clean terms, fair price. Let's build together.",
    "term_sheet": {
      "investment_amount": 250000,
      "pre_money_valuation": 2000000,
      "post_money_valuation": 2250000,
      "ownership_percentage": 11.1
    }
  }
}
```

---

### `GET /api/admin/config`
Retrieves current tunable engine configuration parameters, fee tiers, and market cycle multipliers.

**Response:**
```json
{
  "success": true,
  "config": {
    "STARTER_FOUNDER_CAPITAL": 100000,
    "STARTER_INVESTOR_CAPITAL": 100000,
    "RUNWAY_WARNING_MONTHS": 3.0,
    "RUNWAY_CRITICAL_MONTHS": 1.0,
    "MIN_SYNDICATE_LEADER_PERCENTAGE": 0.10,
    "MARKET_CONDITIONS": { ... }
  }
}
```
