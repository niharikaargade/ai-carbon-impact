# AI Climate Impact Story

A clearer, scenario-based AI climate impact explainer.

## Run

Open [index.html](/Users/farmx/ai-prompt-carbon-ui/index.html) directly in browser, or run:

```bash
cd /Users/farmx/ai-prompt-carbon-ui
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080`.

## What it shows

- Simple scenario inputs:
  - daily AI requests
  - average tokens per request
  - model efficiency tier
- Timeline impact:
  - today
  - 30 days
  - 365 days
- One selected annual equivalency comparison
- Plain-language severity section to communicate why the impact matters

## Baselines and factors

1. **AI electricity by task**: Luccioni et al. (2024), Power Hungry Processing  
   https://arxiv.org/abs/2311.16863

2. **Grid carbon factor**: 297.6 gCO2e/kWh (same study setup)

3. **Car emissions factor**: U.S. EPA equivalencies references  
   https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references

4. **Wood/plastic comparisons**: simplified combustion approximations (directional only)

5. **Most-used AI activity categories**: Sensor Tower 2025 report page  
   https://sensortower.com/report/2025-ai-everyday-evolution-chatbots

## Note

This is an educational estimator, not a certified LCA tool. Real emissions vary by model, hardware, grid mix, and datacenter efficiency.
