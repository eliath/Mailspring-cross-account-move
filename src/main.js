import { ComponentRegistry } from 'mailspring-exports';
import CrossAccountMoveButton from './cross-account-move-button';

export function activate() {
  ComponentRegistry.register(CrossAccountMoveButton, {
    role: 'ThreadActionsToolbarButton',
  });
}

export function serialize() {}

export function deactivate() {
  ComponentRegistry.unregister(CrossAccountMoveButton);
}
