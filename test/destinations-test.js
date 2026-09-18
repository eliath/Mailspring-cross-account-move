const assert = require('assert');
const Module = require('module');

const gmail = { id: 'gmail', label: 'Gmail' };
const categories = [
  { id: 'all', role: 'all', path: '[Gmail]/All Mail', displayName: 'All Mail' },
  { id: 'sent', role: 'sent', path: '[Gmail]/Sent Mail', displayName: 'Sent Mail' },
  { id: 'label', role: null, path: 'Projects', displayName: 'Projects' },
];

const originalLoad = Module._load;
Module._load = function (request) {
  if (request === 'mailspring-exports') {
    return { CategoryStore: { categories: () => categories } };
  }
  return originalLoad.apply(this, arguments);
};

const { destinationsForAccounts } = require('../lib/destinations');
Module._load = originalLoad;

const destinations = destinationsForAccounts([gmail]);
assert.deepStrictEqual(
  destinations.map(({ folder }) => folder.displayName),
  ['All Mail', 'Projects']
);
