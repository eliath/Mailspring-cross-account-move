import fs from 'fs';
import { ImapFlow } from 'imapflow';
import {
  Actions,
  DatabaseStore,
  EmlUtils,
  KeyManager,
  Message,
  TaskFactory,
  TaskQueue,
  UndoRedoStore,
  imapUtf7,
} from 'mailspring-exports';
import { imapAuth, imapConfig } from './imap-config';

async function messagesForThreads(threads) {
  const groups = await Promise.all(
    threads.map((thread) => DatabaseStore.findAll(Message, { threadId: thread.id, draft: false }))
  );
  return [].concat(...groups).sort((a, b) => a.date - b.date);
}

export async function moveThreads(
  threads,
  destinationAccount,
  destinationFolder,
  onProgress = () => {},
  registerUndo = true
) {
  onProgress('Preparing messages…');
  const trashTasks = TaskFactory.tasksForMovingToTrash({
    threads,
    source: 'Cross-account move',
  });
  if (!trashTasks.length) {
    throw new Error('The source account has no Trash folder. Nothing was moved.');
  }

  const messages = await messagesForThreads(threads);
  if (!messages.length) {
    throw new Error('The selected conversations have no messages that can be moved.');
  }

  const staged = await EmlUtils.stageMessagesAsEml(messages);
  if (staged.length !== messages.length) {
    staged.forEach(({ filePath }) => EmlUtils.discardStagedEml(filePath));
    throw new Error('Mailspring could not download every selected message. Nothing was moved.');
  }

  let client;
  const copies = [];
  try {
    const account = await KeyManager.insertAccountSecrets(destinationAccount);
    client = new ImapFlow(imapConfig(account, await imapAuth(account)));
    await client.connect();
    if (!client.capabilities.has('UIDPLUS')) {
      throw new Error('The destination server cannot provide the message IDs required for Undo.');
    }
    const mailbox = imapUtf7.decode(destinationFolder.path);
    try {
      for (let index = 0; index < staged.length; index++) {
        const { message, filePath } = staged[index];
        onProgress(`Copying ${index + 1} of ${staged.length}…`);
        const flags = [];
        if (!message.unread) flags.push('\\Seen');
        if (message.starred) flags.push('\\Flagged');
        const result = await client.append(
          mailbox,
          await fs.promises.readFile(filePath),
          flags,
          message.date
        );
        if (!result || !result.uid || result.uidValidity === undefined) {
          throw new Error(
            `The IMAP server did not return an ID for “${message.subject || 'untitled'}”.`
          );
        }
        const copy = { uid: result.uid, uidValidity: String(result.uidValidity) };
        if (copies.length && copies[0].uidValidity !== copy.uidValidity) {
          throw new Error('The destination folder changed while messages were being copied.');
        }
        copies.push(copy);
      }
    } catch (error) {
      if (copies.length) await deleteCopies(client, mailbox, copies);
      throw error;
    }
    onProgress('Finishing…');
  } finally {
    staged.forEach(({ filePath }) => EmlUtils.discardStagedEml(filePath));
    if (client && client.usable) {
      try {
        await client.logout();
      } catch (error) {
        AppEnv.reportError(error);
      }
    }
  }

  trashTasks.forEach((task) => (task.canBeUndone = false));
  Actions.queueTasks(trashTasks);

  const state = { copies, trashTasks };
  if (!registerUndo) return state;

  const mailbox = imapUtf7.decode(destinationFolder.path);
  registerUndoBlock(threads, destinationAccount, destinationFolder, mailbox, state);
  return state;
}

function registerUndoBlock(threads, destinationAccount, destinationFolder, mailbox, initialState) {
  let state = initialState;
  let operation = Promise.resolve();
  const reportFailure = (title) => (error) => {
    AppEnv.reportError(error);
    AppEnv.showErrorDialog({ title, message: error.message || String(error) });
  };
  const run = (title, callback) => {
    operation = operation.then(callback).catch(reportFailure(title));
    return operation;
  };

  // Direct IMAP changes need an undo block that can run code as well as queue Mailspring tasks.
  UndoRedoStore._onQueueBlock({
    tasks: [],
    description: `Moved ${threads.length === 1 ? 'conversation' : `${threads.length} conversations`} to ${destinationFolder.displayName}`,
    undo: () =>
      run('Cross-account move could not be undone', async () => {
        await undoMove(destinationAccount, mailbox, state);
        state = null;
      }),
    redo: () =>
      run('Cross-account move could not be redone', async () => {
        if (state) throw new Error('The previous destination copies have not been removed.');
        state = await moveThreads(
          threads,
          destinationAccount,
          destinationFolder,
          () => {},
          false
        );
      }),
  });
}

async function undoMove(destinationAccount, mailbox, state) {
  if (!state) return;
  const restoreTasks = state.trashTasks.map((task) => task.createUndoTask());
  Actions.queueTasks(restoreTasks);
  const restored = await Promise.all(
    restoreTasks.map((task) => TaskQueue.waitForPerformRemote(task))
  );
  const failed = restored.find((task) => task.status === 'cancelled' || task.error);
  if (failed) {
    const message = failed.error && (failed.error.message || failed.error);
    throw new Error(message || 'Mailspring could not restore the source messages.');
  }
  await deleteDestinationCopies(destinationAccount, mailbox, state.copies);
}

async function deleteDestinationCopies(destinationAccount, mailbox, copies) {
  const account = await KeyManager.insertAccountSecrets(destinationAccount);
  const client = new ImapFlow(imapConfig(account, await imapAuth(account)));
  try {
    await client.connect();
    await deleteCopies(client, mailbox, copies);
  } finally {
    if (client.usable) {
      try {
        await client.logout();
      } catch (error) {
        AppEnv.reportError(error);
      }
    }
  }
}

async function deleteCopies(client, mailbox, copies) {
  const lock = await client.getMailboxLock(mailbox);
  try {
    if (String(client.mailbox.uidValidity) !== copies[0].uidValidity) {
      throw new Error(
        'The destination folder changed, so the copied messages cannot be removed safely.'
      );
    }
    const deleted = await client.messageDelete(
      copies.map(({ uid }) => uid),
      { uid: true }
    );
    if (!deleted) throw new Error('The destination server did not remove the copied messages.');
  } finally {
    lock.release();
  }
}
