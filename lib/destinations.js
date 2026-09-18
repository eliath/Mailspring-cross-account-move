"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const NON_DESTINATION_ROLES = ['drafts', 'sent', 'snoozed'];
function destinationsForAccounts(accounts) {
    const destinations = [];
    for (const account of accounts) {
        for (const category of mailspring_exports_1.CategoryStore.categories(account)) {
            if (!category.path || NON_DESTINATION_ROLES.includes(category.role))
                continue;
            destinations.push({ account, folder: category });
        }
    }
    return destinations.sort((a, b) => `${a.account.label}\0${a.folder.displayName}`.localeCompare(`${b.account.label}\0${b.folder.displayName}`));
}
exports.destinationsForAccounts = destinationsForAccounts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzdGluYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Rlc3RpbmF0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQUFtRDtBQUVuRCxNQUFNLHFCQUFxQixHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUU1RCxTQUFnQix1QkFBdUIsQ0FBQyxRQUFRO0lBQzlDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN4QixLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtRQUM5QixLQUFLLE1BQU0sUUFBUSxJQUFJLGtDQUFhLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUFFLFNBQVM7WUFDOUUsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUNsRDtLQUNGO0lBQ0QsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQ2hDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxhQUFhLENBQ3pELEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FDOUMsQ0FDRixDQUFDO0FBQ0osQ0FBQztBQWJELDBEQWFDIn0=