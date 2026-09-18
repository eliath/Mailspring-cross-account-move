import { CategoryStore } from 'mailspring-exports';

const NON_DESTINATION_ROLES = ['drafts', 'sent', 'snoozed'];

export function destinationsForAccounts(accounts) {
  const destinations = [];
  for (const account of accounts) {
    for (const category of CategoryStore.categories(account)) {
      if (!category.path || NON_DESTINATION_ROLES.includes(category.role)) continue;
      destinations.push({ account, folder: category });
    }
  }
  return destinations.sort((a, b) =>
    `${a.account.label}\0${a.folder.displayName}`.localeCompare(
      `${b.account.label}\0${b.folder.displayName}`
    )
  );
}
