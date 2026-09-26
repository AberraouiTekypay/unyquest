# UNYQUEST — Game Rules & Mathematical Model
> *Build. Fund. Grow. Win.* — An [EM300.co](https://em300.co) Company

---

## 1. Starter Economy & Capital Segregation

Every new player account receives:
- **Founder Capital**: $\$100,000$ (virtual)
- **Investor Capital**: $\$100,000$ (virtual)

### Economic Firewall:
- Founder Capital cannot be converted into Investor Capital.
- Investor Capital cannot be withdrawn into Founder Treasury.
- This prevents trivial arbitrage and forces players to engage in genuine venture cycles.

---

## 2. Company Runway & Distress Mechanics

### Runway Formula:
$$\text{Runway (Months)} = \begin{cases} \frac{\text{Cash Treasury}}{\text{Monthly Burn}}, & \text{if Monthly Burn} > 0 \\ 99.9, & \text{if Monthly Burn} \le 0 \end{cases}$$

### Threat Levels:
- **Normal**: $\text{Runway} \ge 3.0\text{ months}$ (Green)
- **Warning**: $1.0\text{ month} \le \text{Runway} < 3.0\text{ months}$ (Amber)
- **Critical**: $0 < \text{Runway} < 1.0\text{ month}$ (Red)
- **Distress Mode**: $\text{Cash Treasury} \le \$0$
  - Triggers mandatory restructuring: Emergency Angel Bridge, Burn Reduction, or Insolvency Liquidation.

---

## 3. Valuation Engine

$$\text{Valuation} = \max\left(\$500\text{K}, \min\left(\text{ARR} \times M_{\text{sector}} \times (1 + \frac{\text{Growth}}{100}) \times Q_{\text{score}} \times M_{\text{market}}, 0.30 \times \text{TAM}\right)\right)$$

Where:
- $\text{ARR} = \text{Monthly Revenue} \times 12$
- $M_{\text{sector}}$: Sector multiple (AI: 18x, Climate: 15x, SaaS: 14x, Fintech: 14x, Healthcare: 12x, Marketplace: 11x, Logistics: 10x, PropTech: 9x, Education: 8x, Food: 7x)
- $Q_{\text{score}}$: Quality factor derived from Product, Team, Traction, and Defensibility:
  $$Q_{\text{score}} = \frac{0.25 P + 0.25 T_m + 0.30 T_r + 0.20 D}{50}$$
- $M_{\text{market}}$: Market cycle modifier (BOOM: 1.35x, NORMAL: 1.0x, TIGHT: 0.8x, CRISIS: 0.55x).

---

## 4. Investment Dilution & Cap Table Allocation

When an investor injects capital $I$ at pre-money valuation $V_{\text{pre}}$:
1. **Post-Money Valuation**:
   $$V_{\text{post}} = V_{\text{pre}} + I$$
2. **New Investor Equity Percentage**:
   $$E_{\text{new}} = \left(\frac{I}{V_{\text{post}}}\right) \times 100$$
3. **Proportional Dilution Factor**:
   $$D = 1 - \frac{I}{V_{\text{post}}}$$
4. **Existing Shareholders Dilution**:
   For every existing stakeholder $k$:
   $$E_{k,\text{post}} = E_{k,\text{pre}} \times D$$
   $$\sum_k E_{k,\text{post}} + E_{\text{new}} = 100\%$$

---

## 5. Non-Linear Action Trade-offs

Actions avoid one-dimensional "pay money to improve everything" tropes:

| Action | Virtual Cost | Primary Gains | Permanent Trade-off / Cost |
| :--- | :--- | :--- | :--- |
| **Build Product** | $\$15,000$ | Product $+7$, Defensibility $+3$ | Monthly burn permanently $+1,500$ |
| **Marketing Sprint** | $\$18,000$ | Users $+35\%$, Traction $+6$ | Immediate treasury drain |
| **Hire Key Talent** | $\$25,000$ | Team $+9$, Product $+4$ | Monthly burn permanently $+4,000$ |
| **Enterprise Sales** | $\$20,000$ | Revenue $+25\%$, Traction $+5$ | Monthly burn $+2,500$ |
| **Expand Market (TAM)** | $\$30,000$ | TAM $+40\%$, Distribution $+6$ | Monthly burn $+3,500$ |
| **Improve Operations** | $\$12,000$ | Defensibility $+2$ | Monthly burn reduced by $20\%$ |

---

## 6. Pitch Scoring & Investor Archetypes

Pitches are evaluated based on weighted archetype matrices:

| Parameter | Generalist Fund | Specialist VC | Operator / Builder |
| :--- | :--- | :--- | :--- |
| **Market (TAM)** | $25\%$ | $15\%$ | $15\%$ |
| **Traction** | $25\%$ | $35\%$ | $20\%$ |
| **Team Execution** | $20\%$ | $20\%$ | $25\%$ |
| **Distribution Velocity** | $10\%$ | $5\%$ | $25\%$ |
| **Proprietary Moat** | $10\%$ | $15\%$ | $5\%$ |
| **Valuation Sensitivity** | High ($0.35$) | Moderate ($0.25$) | Low ($0.20$) |

### Outcome Thresholds:
- **Term Sheet**: Composite Score $\ge 65$ (Specialist: 70)
- **Interested**: Composite Score $\ge 48$ (Specialist: 52)
- **Pass (Rejection)**: Composite Score $< 48$ with contextual reasoning.

---

## 7. Syndicate Skin-in-the-Game Rule

- A syndicate leader must commit a **minimum of 10%** of the target raise from their personal Investor Capital:
  $$C_{\text{leader}} \ge 0.10 \times T_{\text{syndicate}}$$
- Member equity in the syndicate entity is strictly pro-rated:
  $$S_i = \left(\frac{C_i}{C_{\text{total}}}\right) \times 100\%$$

---

## 8. Exit Valuation & Recycling Loop

- **Acquisition**: Current Valuation $\times (1.2 + 0.4 \times \text{Defensibility} + 0.2 \times \text{Product})$
- **IPO**: Current Valuation $\times 2.5$
- **Proceeds Recycling**: Founder exit payouts are credited directly into **Investor Capital**, transforming successful startup founders into angel investors and syndicate leads.
