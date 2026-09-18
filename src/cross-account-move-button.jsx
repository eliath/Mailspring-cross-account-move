import {
  React,
  Actions,
  AccountStore,
} from 'mailspring-exports';
import { BindGlobalCommands } from 'mailspring-component-kit';
import DestinationPicker from './destination-picker';
import { destinationsForAccounts } from './destinations';

export default class CrossAccountMoveButton extends React.Component {
  static displayName = 'CrossAccountMoveButton';
  static containerRequired = false;

  _open = () => {
    const sourceAccount = AccountStore.accountForItems(this.props.items);
    if (!sourceAccount) return;

    const accounts = AccountStore.accounts().filter((account) => account.id !== sourceAccount.id);
    const destinations = destinationsForAccounts(accounts);

    if (!destinations.length) {
      AppEnv.showErrorDialog('No folders are available in another account.');
      return;
    }
    Actions.openPopover(
      <DestinationPicker destinations={destinations} threads={this.props.items} />,
      { originRect: this._button.getBoundingClientRect(), direction: 'down' }
    );
  };

  render() {
    if (!AccountStore.accountForItems(this.props.items) || AccountStore.accounts().length < 2) {
      return <span />;
    }
    return (
      <BindGlobalCommands
        commands={{ 'mailspring-cross-account-move:open-picker': this._open }}
      >
        <button
          className="btn btn-toolbar cross-account-move-button"
          onClick={this._open}
          ref={(button) => (this._button = button)}
          title="Move to another account"
          aria-label="Move to another account"
        >
          <svg
            aria-hidden="true"
            className="cross-account-move-icon"
            height="16"
            viewBox="0 0 16 16"
            width="16"
          >
            <path d="M1.5 4h4.25l1.5 2h7.25v7.5h-13z" />
            <path d="M6 8.25h3m-.6-.6.6.6-.6.6M10 10.75H7m.6.6-.6-.6.6-.6" />
          </svg>
        </button>
      </BindGlobalCommands>
    );
  }
}
