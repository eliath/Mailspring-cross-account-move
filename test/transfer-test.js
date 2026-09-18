const assert = require('assert');
const Module = require('module');

const events = [];
let failAppend = false;
let failRestore = false;
let hasUidPlus = true;
let undoBlock;
const messages = [
  { id: 'm1', date: new Date('2024-01-01'), unread: false, starred: true },
  { id: 'm2', date: new Date('2024-01-02'), unread: true, starred: false },
];

class ImapFlow {
  constructor() {
    this.usable = true;
    this.capabilities = new Set(hasUidPlus ? ['UIDPLUS'] : []);
  }
  async connect() {
    events.push('connect');
  }
  async append(folder, content, flags) {
    events.push(`append:${folder}:${content}:${flags.join(',')}`);
    if (failAppend && events.filter((event) => event.startsWith('append:')).length === 2) {
      throw new Error('append failed');
    }
    return { uid: events.length, uidValidity: 42n };
  }
  async getMailboxLock(folder) {
    events.push(`lock:${folder}`);
    this.mailbox = { uidValidity: 42n };
    return { release: () => events.push('unlock') };
  }
  async messageDelete(uids, options) {
    events.push(`delete:${uids.join(',')}:${options.uid}`);
    return true;
  }
  async logout() {
    events.push('logout');
  }
}

const exportsMock = {
  Actions: { queueTasks: (tasks) => events.push(tasks[0].isUndo ? 'restore' : 'trash') },
  DatabaseStore: { findAll: async () => messages },
  EmlUtils: {
    stageMessagesAsEml: async () =>
      messages.map((message) => ({ message, filePath: `/tmp/${message.id}.eml` })),
    discardStagedEml: (path) => events.push(`discard:${path}`),
  },
  KeyManager: {
    insertAccountSecrets: async (account) => ({
      ...account,
      settings: { ...account.settings, imap_password: 'secret' },
    }),
  },
  Message: function Message() {},
  TaskFactory: {
    tasksForMovingToTrash: () => [
      {
        canBeUndone: true,
        createUndoTask: () => ({ isUndo: true }),
        createIdenticalTask() {
          return this;
        },
      },
    ],
  },
  TaskQueue: {
    waitForPerformRemote: async (task) =>
      failRestore ? { ...task, error: new Error('restore failed') } : task,
  },
  UndoRedoStore: { _onQueueBlock: (block) => (undoBlock = block) },
  imapUtf7: { decode: (path) => path },
};

const originalLoad = Module._load;
Module._load = function (request) {
  if (request === 'imapflow') return { ImapFlow };
  if (request === 'mailspring-exports') return exportsMock;
  if (request === 'fs') {
    return { promises: { readFile: async (path) => path } };
  }
  return originalLoad.apply(this, arguments);
};

const { moveThreads } = require('../lib/transfer');
Module._load = originalLoad;
global.AppEnv = {
  reportError: () => {},
  showErrorDialog: () => events.push('error-dialog'),
};

const threads = [{ id: 'thread' }];
const account = {
  settings: {
    imap_host: 'imap.example.com',
    imap_port: 993,
    imap_username: 'eli@example.com',
    imap_security: 'SSL / TLS',
  },
};
const folder = { path: 'Archive' };

(async () => {
  const progress = [];
  await moveThreads(threads, account, folder, (status) => progress.push(status));
  assert.deepStrictEqual(progress, [
    'Preparing messages…',
    'Copying 1 of 2…',
    'Copying 2 of 2…',
    'Finishing…',
  ]);
  assert.strictEqual(events.filter((event) => event.startsWith('append:')).length, 2);
  assert.ok(events[1].endsWith('\\Seen,\\Flagged'));
  const lastAppend = events.findLastIndex((event) => event.startsWith('append:'));
  assert.ok(events.indexOf('trash') > lastAppend);
  assert.strictEqual(events.at(-1), 'trash');
  assert.ok(undoBlock);

  events.length = 0;
  await undoBlock.undo();
  assert.strictEqual(events[0], 'restore');
  assert.ok(events.some((event) => event.startsWith('delete:')));
  assert.ok(events.indexOf('restore') < events.findIndex((event) => event.startsWith('delete:')));

  events.length = 0;
  await undoBlock.redo();
  assert.ok(events.includes('trash'));
  await undoBlock.undo();
  assert.ok(events.some((event) => event.startsWith('delete:')));

  events.length = 0;
  failAppend = true;
  await assert.rejects(moveThreads(threads, account, folder), /append failed/);
  assert.ok(!events.includes('trash'));
  assert.ok(events.some((event) => event.startsWith('delete:')));
  assert.strictEqual(events.filter((event) => event.startsWith('discard:')).length, 2);

  events.length = 0;
  failAppend = false;
  hasUidPlus = false;
  await assert.rejects(moveThreads(threads, account, folder), /required for Undo/);
  assert.ok(!events.includes('trash'));

  events.length = 0;
  hasUidPlus = true;
  await moveThreads(threads, account, folder);
  events.length = 0;
  failRestore = true;
  await undoBlock.undo();
  assert.ok(events.includes('restore'));
  assert.ok(!events.some((event) => event.startsWith('delete:')));
  assert.ok(events.includes('error-dialog'));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
