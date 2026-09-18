"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const transfer_1 = require("./transfer");
class DestinationPicker extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._items = () => {
            const query = this.state.search.toLocaleLowerCase();
            return this.props.destinations.filter(({ account, folder }) => {
                const text = `${account.label} ${account.emailAddress} ${folder.displayName}`;
                return text.toLocaleLowerCase().includes(query);
            });
        };
        this._select = async ({ account, folder }) => {
            if (this.state.moving)
                return;
            this.setState({
                moving: true,
                status: 'Preparing messages…',
                destination: `${account.label || account.emailAddress} / ${folder.displayName}`,
            });
            try {
                await transfer_1.moveThreads(this.props.threads, account, folder, (status) => this.setState({ status }));
                mailspring_exports_1.Actions.closePopover();
            }
            catch (error) {
                AppEnv.reportError(error);
                AppEnv.showErrorDialog({
                    title: 'Cross-account move failed',
                    message: error.message || String(error),
                });
                this.setState({ moving: false, status: '', destination: null });
            }
        };
        this.state = { search: '', moving: false, status: '', destination: null };
    }
    render() {
        if (this.state.moving) {
            return (mailspring_exports_1.React.createElement("div", { className: "cross-account-move-picker moving", role: "status", "aria-live": "polite" },
                mailspring_exports_1.React.createElement("div", { className: "spinner-container" },
                    mailspring_exports_1.React.createElement(mailspring_component_kit_1.Spinner, { visible: true })),
                mailspring_exports_1.React.createElement("div", { className: "status" }, this.state.status),
                mailspring_exports_1.React.createElement("div", { className: "destination" }, this.state.destination)));
        }
        return (mailspring_exports_1.React.createElement("div", { className: "cross-account-move-picker" },
            mailspring_exports_1.React.createElement(mailspring_component_kit_1.Menu, { headerComponents: [
                    mailspring_exports_1.React.createElement("input", { autoFocus: true, className: "search", key: "search", onChange: (event) => this.setState({ search: event.target.value }), placeholder: "Move to another account\u2026", value: this.state.search }),
                ], items: this._items(), itemKey: ({ account, folder }) => `${account.id}:${folder.id}`, itemContent: ({ account, folder }) => (mailspring_exports_1.React.createElement("div", null,
                    mailspring_exports_1.React.createElement(mailspring_component_kit_1.BoldedSearchResult, { value: folder.displayName, query: this.state.search }),
                    mailspring_exports_1.React.createElement("span", { className: "account" }, account.label || account.emailAddress))), onEscape: () => mailspring_exports_1.Actions.closePopover(), onSelect: this._select, defaultSelectedIndex: 0 })));
    }
}
exports.default = DestinationPicker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzdGluYXRpb24tcGlja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Rlc3RpbmF0aW9uLXBpY2tlci5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyREFBb0Q7QUFDcEQsdUVBQTZFO0FBQzdFLHlDQUF5QztBQUV6QyxNQUFxQixpQkFBa0IsU0FBUSwwQkFBSyxDQUFDLFNBQVM7SUFDNUQsWUFBWSxLQUFLO1FBQ2YsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBSWYsV0FBTSxHQUFHLEdBQUcsRUFBRTtZQUNaLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDcEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO2dCQUM1RCxNQUFNLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsWUFBTyxHQUFHLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO1lBQ3RDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO2dCQUFFLE9BQU87WUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUscUJBQXFCO2dCQUM3QixXQUFXLEVBQUUsR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxZQUFZLE1BQU0sTUFBTSxDQUFDLFdBQVcsRUFBRTthQUNoRixDQUFDLENB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