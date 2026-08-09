require('ts-node').register({
  compilerOptions: { module: 'commonjs' },
});
const { getLeads } = require('./app/actions/admin.ts');
getLeads().then(leads => console.log(JSON.stringify(leads, null, 2)));
