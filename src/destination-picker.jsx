import { React, Actions } from 'mailspring-exports';
import { BoldedSearchResult, Menu, Spinner } from 'mailspring-component-kit';
import { moveThreads } from './transfer';

export default class DestinationPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { search: '', moving: false, status: '', destination: null };
  }

  _items = () => {
    const query = this.state.search.toLocaleLowerCase();
    return this.props.destinations.filter(({ account, folder }) => {
      const text = `${account.label} ${account.emailAddress} ${folder.displayName}`;
      return text.toLocaleLowerCase().includes(query);
    });
  };

  _select = async ({ account, folder }) => {
    if (this.state.moving) return;
    this.setState({
      moving: true,
      status: 'Preparing messages…',
      destination: `${account.label || account.emailAddress} / ${folder.displayName}`,
    });
    try {
      await moveThreads(this.props.threads, account, folder, (status) => this.setState({ status }));
      Actions.closePopover();
    } catch (error) {
      AppEnv.reportError(error);
      AppEnv.showErrorDialog({
        title: 'Cross-account move failed',
        message: error.message || String(error),
      });
      this.setState({ moving: false, status: '', destination: null });
    }
  };

  render() {
    if (this.state.moving) {
      return (
        <div className="cross-account-move-picker moving" role="status" aria-live="polite">
          <div className="spinner-container">
            <Spinner visible />
          </div>
          <div className="status">{this.state.status}</div>
          <div className="destination">{this.state.destination}</div>
        </div>
      );
    }

    return (
      <div className="cross-account-move-picker">
        <Menu
          headerComponents={[
            <input
              autoFocus
              className="search"
              key="search"
              onChange={(event) => this.setState({ search: event.target.value })}
              placeholder="Move to another account…"
              value={this.state.search}
            />,
          ]}
          items={this._items()}
          itemKey={({ account, folder }) => `${account.id}:${folder.id}`}
          itemContent={({ account, folder }) => (
            <div>
              <BoldedSearchResult value={folder.displayName} query={this.state.search} />
              <span className="account">{account.label || account.emailAddress}</span>
            </div>
          )}
          onEscape={() => Actions.closePopover()}
          onSelect={this._select}
          defaultSelectedIndex={0}
        />
      </div>
    );
  }
}
