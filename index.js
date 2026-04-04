#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const { fetchAllCharts } = require('./lib/api');
const { buildReport } = require('./lib/report');

program
  .name('rc-insights')
  .description('Generate a business health report from your RevenueCat Charts API data')
  .version('1.0.0')
  .requiredOption('-k, --key <apiKey>', 'RevenueCat secret API key (sk_*)', process.env.RC_API_KEY)
  .requiredOption('-p, --project <projectId>', 'RevenueCat project ID', process.env.RC_PROJECT_ID)
  .option('-s, --start <date>', 'Start date (YYYY-MM-DD)', oneYearAgo())
  .option('-e, --end <date>', 'End date (YYYY-MM-DD)', today())
  .option('-r, --resolution <n>', 'Resolution: 0=day, 1=week, 2=month, 3=quarter', '1')
  .option('-o, --output <file>', 'Write markdown report to this file (default: print to stdout)')
  .parse(process.argv);

const opts = program.opts();

(async () => {
  console.log(chalk.bold.cyan('\n  rc-insights — RevenueCat Business Health Reporter\n'));

  const spinner = ora('Fetching charts from RevenueCat API...').start();

  let charts;
  try {
    charts = await fetchAllCharts(opts.key, opts.project, {
      start_date: opts.start,
      end_date: opts.end,
      resolution: opts.resolution,
    });
    spinner.succeed(chalk.green(`Fetched ${Object.keys(charts).length} charts`));
  } catch (err) {
    spinner.fail(chalk.red(`API error: ${err.message}`));
    process.exit(1);
  }

  const spinner2 = ora('Building report...').start();
  const report = buildReport(charts);
  spinner2.succeed(chalk.green('Report ready'));

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, report, 'utf8');
    console.log(chalk.bold(`\n  Report saved to: ${chalk.underline(outPath)}\n`));
  } else {
    console.log('\n' + report + '\n');
  }
})();

function today() {
  return new Date().toISOString().split('T')[0];
}

function oneYearAgo() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
}
