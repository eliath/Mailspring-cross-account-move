"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const destination_picker_1 = __importDefault(require("./destination-picker"));
const destinations_1 = require("./destinations");
class CrossAccountMoveButton extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this._open = () => {
            const sourceAccount = mailspring_exports_1.AccountStore.accountForItems(this.props.items);
            if (!sourceAccount)
                return;
            const accounts = mailspring_exports_1.AccountStore.accounts().filter((account) => account.id !== sourceAccount.id);
            const destinations = destinations_1.destinationsForAccounts(accounts);
            if (!destinations.length) {
                AppEnv.showErrorDialog('No folders are available in another account.');
                return;
            }
            mailspring_exports_1.Actions.openPopover(mailspring_exports_1.React.createElement(destination_picker_1.default, { destinations: destinations, threads: this.props.items }), { originRect: this._button.getBoundingClientRect(), direction: 'down' });
        };
    }
    render() {
        if (!mailspring_exports_1.AccountStore.accountForItems(this.props.items) || mailspring_exports_1.AccountStore.accounts().length < 2) {
            return mailspring_exports_1.React.createElement("span", null);
        }
        return (mailspring_exports_1.React.createElement(mailspring_component_kit_1.BindGlobalCommands, { commands: { 'mailspring-cross-account-move:open-picker': this._open } },
            mailspring_exports_1.React.createElement("button", { className: "btn btn-toolbar cross-account-move-button", onClick: this._open, ref: (button) => (this._button = button), title: "Move to another account", "aria-label": "Move to another account" },
                mailspring_exports_1.React.createElement("svg", { "aria-hidden": "true", className: "cross-account-move-icon", height: "16", viewBox: "0 0 16 16", width: "16" },
                    mailspring_exports_1.React.createElement("path", { d: "M1.5 4h4.25l1.5 2h7.25v7.5h-13z" }),
                    mailspring_exports_1.React.createElement("path", { d: "M6 8.25h3m-.6-.6.6.6-.6.6M10 10.75H7m.6.6-.6-.6.6-.6" })))));
    }
}
exports.default = CrossAccountMoveButton;
CrossAccountMoveButton.displayName = 'CrossAccountMoveButton';
CrossAccountMoveButton.containerRequired = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3MtYWNjb3VudC1tb3ZlLWJ1dHRvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jcm9zcy1hY2NvdW50LW1vdmUtYnV0dG9uLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUk0QjtBQUM1Qix1RUFBOEQ7QUFDOUQsOEVBQXFEO0FBQ3JELGlEQUF5RDtBQUV6RCxNQUFxQixzQkFBdUIsU0FBUSwwQkFBSyxDQUFDLFNBQVM7SUFBbkU7O1FBSUUsVUFBSyxHQUFHLEdBQUcsRUFBRTtZQUNYLE1BQU0sYUFBYSxHQUFHLGlDQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLGFBQWE7Z0JBQUUsT0FBTztZQUUzQixNQUFNLFFBQVEsR0FBRyxpQ0FBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUYsTUFBTSxZQUFZLEdBQUcsc0NBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxlQUFlLENBQUMsOENBQThDLENBQUMsQ0FBQztnQkFDdkUsT0FBTzthQUNSO1lBQ0QsNEJBQU8sQ0FBQyxXQUFXLENBQ2pCLHlDQUFDLDRCQUFpQixJQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFJLEVBQzVFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQ3hFLENBQUM7UUFDSixDQUFDLENBQUM7SUErQkosQ0FBQztJQTdCQyxNQUFNO1FBQ0osSUFBSSxDQUFDLGlDQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksaUNBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3pGLE9BQU8sc0RBQVEsQ0FBQztTQUNqQjtRQUNELE9BQU8sQ0FDTCx5Q0FBQyw2Q0FBa0IsSUFDakIsUUFBUSxFQUFFLEVBQUUsMkNBQTJDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUVyRSxxREFDRSxTQUFTLEVBQUMsMkNBQTJDLEVBQ3JELE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUNuQixHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsRUFDeEMsS0FBSyxFQUFDLHlCQUF5QixnQkFDcEIseUJBQXlCO2dCQUVwQyxpRUFDYyxNQUFNLEVBQ2xCLFNBQVMsRUFBQyx5QkFBeUIsRUFDbkMsTUFBTSxFQUFDLElBQUksRUFDWCxPQUFPLEVBQUMsV0FBVyxFQUNuQixLQUFLLEVBQUMsSUFBSTtvQkFFVixtREFBTSxDQUFDLEVBQUMsaUNBQWlDLEdBQUc7b0JBQzVDLG1EQUFNLENBQUMsRUFBQyxzREFBc0QsR0FBRyxDQUM3RCxDQUNDLENBQ1UsQ0FDdEIsQ0FBQztJQUNKLENBQUM7O0FBakRILHlDQWtEQztBQWpEUSxrQ0FBVyxHQUFHLHdCQUF3QixDQUFDO0FBQ3ZDLHdDQUFpQixHQUFHLEtBQUssQ0FBQyJ9