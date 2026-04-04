# rc-insights

> A CLI tool that fetches your RevenueCat Charts API data and generates a business health report — in your terminal or as a markdown file.

```
  rc-insights — RevenueCat Business Health Reporter

  ✔ Fetched 5 charts
  ✔ Report ready

  Report saved to: ./report.md
```

## Why

RevenueCat's dashboard is excellent, but sometimes you want:

- A quick health snapshot in CI or a cron job
- A shareable markdown report for weekly team standups
- A scriptable baseline to build alerts on top of

`rc-insights` wraps the RevenueCat Charts API V2 and outputs a structured report covering MRR, Revenue, Active Subscriptions, Churn, and Trials — with inline insights and strategic recommendations.

## Installation

```bash
# Run directly with npx (no install needed)
npx rc-insights --key sk_your_key --project proj_your_id

# Or install globally
npm install -g rc-insights
rc-insights --key sk_your_key --project proj_your_id
```

## Usage

```
Usage: rc-insights [options]

Options:
  -k, --key <apiKey>       RevenueCat secret API key (sk_*)  [env: RC_API_KEY]
  -p, --project <id>       RevenueCat project ID             [env: RC_PROJECT_ID]
  -s, --start <date>       Start date YYYY-MM-DD             (default: 1 year ago)
  -e, --end <date>         End date YYYY-MM-DD               (default: today)
  -r, --resolution <n>     0=day 1=week 2=month 3=quarter    (default: 1/weekly)
  -o, --output <file>      Write markdown report to file     (default: stdout)
  -h, --help               Display help
  -V, --version            Show version
```

### Examples

```bash
# Print report to terminal
rc-insights --key sk_xxx --project proj_xxx

# Save weekly report to file
rc-insights --key sk_xxx --project proj_xxx --output reports/week-42.md

# Custom date range, monthly resolution
rc-insights --key sk_xxx --project proj_xxx \
  --start 2024-01-01 --end 2024-12-31 --resolution 2

# Using environment variables (recommended for CI)
export RC_API_KEY=sk_xxx
export RC_PROJECT_ID=proj_xxx
rc-insights --output report.md
```

### CI / Cron

Add to a GitHub Actions workflow to generate a weekly report artifact:

```yaml
- name: Generate RevenueCat health report
  run: npx rc-insights --output reports/weekly.md
  env:
    RC_API_KEY: ${{ secrets.RC_API_KEY }}
    RC_PROJECT_ID: ${{ secrets.RC_PROJECT_ID }}
```

## Sample Output

See [sample-output/report.md](./sample-output/report.md) for a real report generated from the Dark Noise app.

```
# RevenueCat Business Health Report
_Generated on April 3, 2026_

## Monthly Recurring Revenue (MRR)
| Metric | Value |
|--------|-------|
| Current MRR | $4,544.83 |
| Average MRR (period) | $4,522.32 |
| Growth over period | -1.6% |

`MRR trend: ▁▂▄▃▃▄▃▄▅▆▇▇████▇█▇▇` (last 20 weeks)

> Insight: MRR is flat — review churn and acquisition.

## Churn
| Avg Weekly Churn Rate | 1.64% |
...

## Strategic Recommendations
1. Maintain low churn...
2. Boost acquisition...
3. Test annual plan pricing...
```

## Authentication

This tool requires a **RevenueCat secret API key** (`sk_*`). You can find or create one in your RevenueCat dashboard under **Project Settings → API Keys**.

> **Never expose your secret key in client-side code or public repositories.** Use environment variables or a secrets manager.

Your project ID is visible in your dashboard URL: `https://app.revenuecat.com/projects/PROJ_ID/...`

## API Rate Limits

RevenueCat's Charts API allows **15 requests per minute**. This tool fetches 5–6 charts per run, well within the limit.

## Available Charts

The RevenueCat Charts API V2 supports many charts beyond what this tool currently uses. You can extend `lib/api.js` to add:

| Chart name | Description |
|---|---|
| `mrr` | Monthly Recurring Revenue |
| `arr` | Annual Recurring Revenue |
| `revenue` | Raw revenue + transactions |
| `actives` | Active subscriptions count |
| `churn` | Churn rate + churned actives |
| `trials` | Active trial count |
| `mrr_movement` | New vs. churned MRR |
| `conversion_to_paying` | Trial → paid conversion |
| `ltv_per_customer` | Lifetime value |
| `subscription_retention` | Cohort retention |
| `refund_rate` | Refund percentage |

## Contributing

PRs welcome. Open an issue or submit a pull request.

## License

MIT
