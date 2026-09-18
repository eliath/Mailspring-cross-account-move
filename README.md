# Mailspring cross-account move

This Mailspring plugin moves selected conversations to a folder in another
IMAP account, including moves between Gmail and password-based IMAP accounts.

The plugin adds a **Move to another account** button to the thread toolbar.
Select one or more conversations, click the button, and choose a destination
folder. The picker searches both account names and folder names.

## Install

1. Download the zip from the [GitHub Releases page](https://github.com/eliath/Mailspring-cross-account-move/releases/latest).
2. Extract the zip
3. In Mailspring, **Developer > Install a Plugin...**.
4. Select the extracted `mailspring-cross-account-move` folder

To update, follow the install steps and restart Mailspring.

## Safety

The plugin downloads each source message as an RFC 2822 `.eml` file and appends
it to the destination folder. It moves the source conversation to Trash only
after the destination server accepts every message. Mailspring's Undo action
restores the source first, then removes the exact copies created at the
destination.

If an export or append fails, the source stays in place and the plugin removes
any partial destination copies. The plugin deletes its temporary `.eml` files
after each attempt.

## Requirements

- Mailspring 1.24.1 or later
- A Gmail or password-based destination IMAP account with UIDPLUS support
- Node.js and npm to build from source

Microsoft OAuth destination accounts are not supported.

## Install from source

1. Run `npm install`.
2. Run `npm test`.
3. In Mailspring, select **Developer > Install a Plugin...**.
4. Select this repository folder.
5. Restart Mailspring.

Mailspring loads the compiled files in `lib`. Keep `node_modules` beside the
plugin when you install or copy it because `imapflow` performs the destination
IMAP append.

## Build a release

Run:

```sh
npm run package
```

The command creates an installable folder and a GitHub release archive:

```text
dist/mailspring-cross-account-move/
dist/mailspring-cross-account-move-<version>.zip
```

The bundle contains the compiled plugin and its runtime dependencies. It does
not contain `.git`, the source files, the tests, or the development packages.
To install the ZIP, extract it and select the extracted plugin folder from
**Developer > Install a Plugin...**.

## Keyboard shortcut

The plugin does not set a default keyboard shortcut. To add one, select
**Preferences > Shortcuts > Edit custom shortcuts** and add the command to your
keymap:

```json
{
  "mailspring-cross-account-move:open-picker": "mod+alt+m"
}
```

Replace `mod+alt+m` with your preferred shortcut. `mod` is Command on macOS and
Ctrl on Linux and Windows.

## Development

Run `npm run build` after you change a file in `src`.
