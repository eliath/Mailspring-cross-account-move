"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const imapflow_1 = require("imapflow");
const mailspring_exports_1 = require("mailspring-exports");
const imap_config_1 = require("./imap-config");
async function messagesForThreads(threads) {
    const groups = await Promise.all(threads.map((thread) => mailspring_exports_1.DatabaseStore.findAll(mailspring_exports_1.Message, { threadId: thread.id, draft: false })));
    return [].concat(...groups).sort((a, b) => a.date - b.date);
}
async function moveThreads(threads, destinationAccount, destinationFolder, onProgress = () => { }, registerUndo = true) {
    onProgress('Preparing messages…');
    const trashTasks = mailspring_exports_1.TaskFactory.tasksForMovingToTrash({
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
    const staged = await mailspring_exports_1.EmlUtils.stageMessagesAsEml(messages);
    if (staged.length !== messages.length) {
        staged.forEach(({ filePath }) => mailspring_exports_1.EmlUtils.discardStagedEml(filePath));
        throw new Error('Mailspring could not download every selected message. Nothing was moved.');
    }
    let client;
    const copies = [];
    try {
        const account = await mailspring_exports_1.KeyManager.insertAccountSecrets(destinationAccount);
        client = new imapflow_1.ImapFlow(imap_config_1.imapConfig(account, await imap_config_1.imapAuth(account)));
        await client.connect();
        if (!client.capabilities.has('UIDPLUS')) {
            throw new Error('The destination server cannot provide the message IDs required for Undo.');
        }
        const mailbox = mailspring_exports_1.imapUtf7.decode(destinationFolder.path);
        try {
            for (let index = 0; index < staged.length; index++) {
                const { message, filePath } = staged[index];
                onProgress(`Copying ${index + 1} of ${staged.length}…`);
                const flags = [];
                if (!message.unread)
                    flags.push('\\Seen');
                if (message.starred)
                    flags.push('\\Flagged');
                const result = await client.append(mailbox, await fs_1.default.promises.readFile(filePath), flags, message.date);
                if (!result || !result.uid || result.uidValidity === undefined) {
                    throw new Error(`The IMAP server did not return an ID for “${message.subject || 'untitled'}”.`);
                }
                const copy = { uid: result.uid, uidValidity: String(result.uidValidity) };
                if (copies.length && copies[0].uidValidity !== copy.uidValidity) {
                    throw new Error('The destination folder changed while messages were being copied.');
                }
                copies.push(copy);
            }
        }
        catch (error) {
            if (copies.length)
                await deleteCopies(client, mailbox, copies);
            throw error;
        }
        onProgress('Finishing…');
    }
    finally {
        staged.forEach(({ filePath }) => mailspring_exports_1.EmlUtils.discardStagedEml(filePath));
        if (client && client.usable) {
            try {
                await client.logout();
            }
            catch (error) {
                AppEnv.reportError(error);
            }
        }
    }
    trashTasks.forEach((task) => (task.canBeUndone = false));
    mailspring_exports_1.Actions.queueTasks(trashTasks);
    const state = { copies, trashTasks };
    if (!registerUndo)
        return state;
    const mailbox = mailspring_exports_1.imapUtf7.decode(destinationFolder.path);
    registerUndoBlock(threads, destinationAccount, destinationFolder, mailbox, state);
    return state;
}
exports.moveThreads = moveThreads;
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
    mailspring_exports_1.UndoRedoStore._onQueueBlock({
        tasks: [],
        description: `Moved ${threads.length === 1 ? 'conversation' : `${threads.length} conversations`} to ${destinationFolder.displayName}`,
        undo: () => run('Cross-account move could not be undone', async () => {
            await undoMove(destinationAccount, mailbox, state);
            state = null;
        }),
        redo: () => run('Cross-account move could not be redone', async () => {
            if (state)
                throw new Error('The previous destination copies have not been removed.');
            state = await moveThreads(threads, destinationAccount, destinationFolder, () => { }, false);
        }),
    });
}
async function undoMove(destinationAccount, mailbox, state) {
    if (!state)
        return;
    const restoreTasks = state.trashTasks.map((task) => task.createUndoTask());
    mailspring_exports_1.Actions.queueTasks(restoreTasks);
    const restored = await Promise.all(restoreTasks.map((task) => mailspring_exports_1.TaskQueue.waitForPerformRemote(task)));
    const failed = restored.find((task) => task.status === 'cancelled' || task.error);
    if (failed) {
        const message = failed.error && (failed.error.message || failed.error);
        throw new Error(message || 'Mailspring could not restore the source messages.');
    }
    await deleteDestinationCopies(destinationAccount, mailbox, state.copies);
}
async function deleteDestinationCopies(destinationAccount, mailbox, copies) {
    const account = await mailspring_exports_1.KeyManager.insertAccountSecrets(destinationAccount);
    const client = new imapflow_1.ImapFlow(imap_config_1.imapConfig(account, await imap_config_1.imapAuth(account)));
    try {
        await client.connect();
        await deleteCopies(client, mailbox, copies);
    }
    finally {
        if (client.usable) {
            try {
                await client.logout();
            }
            catch (error) {
                AppEnv.reportError(error);
            }
        }
    }
}
async function deleteCopies(client, mailbox, copies) {
    const lock = await client.getMailboxLock(mailbox);
    try {
        if (String(client.mailbox.uidValidity) !== copies[0].uidValidity) {
            throw new Error('The destination folder changed, so the copied messages cannot be removed safely.');
        }
        const deleted = await client.messageDelete(copies.map(({ uid }) => uid), { uid: true });
        if (!deleted)
            throw new Error('The destination server did not remove the copied messages.');
    }
    finally {
        lock.release();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHJhbnNmZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBb0I7QUFDcEIsdUNBQW9DO0FBQ3BDLDJEQVU0QjtBQUM1QiwrQ0FBcUQ7QUFFckQsS0FBSyxVQUFVLGtCQUFrQixDQUFDLE9BQU87SUFDdkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxrQ0FBYSxDQUFDLE9BQU8sQ0FBQyw0QkFBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FDL0YsQ0FBQztJQUNGLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlELENBQUM7QUFFTSxLQUFLLFVBQVUsV0FBVyxDQUMvQixPQUFPLEVBQ1Asa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQixVQUFVLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxFQUNyQixZQUFZLEdBQUcsSUFBSTtJQUVuQixVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNsQyxNQUFNLFVBQVUsR0FBRyxnQ0FBVyxDQUFDLHFCQUFxQixDQUFDO1FBQ25ELE9BQU87UUFDUCxNQUFNLEVBQUUsb0JBQW9CO0tBQzdCLENBQUMsQ0FBQztJQUNILElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsNERBQTRELENBQUMsQ0FBQztLQUMvRTtJQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sa0JBQWtC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