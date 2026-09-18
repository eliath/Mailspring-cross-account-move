"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const cross_account_move_button_1 = __importDefault(require("./cross-account-move-button"));
function activate() {
    mailspring_exports_1.ComponentRegistry.register(cross_account_move_button_1.default, {
        role: 'ThreadActionsToolbarButton',
    });
}
exports.activate = activate;
function serialize() { }
exports.serialize = serialize;
function deactivate() {
    mailspring_exports_1.ComponentRegistry.unregister(cross_account_move_button_1.default);
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkRBQXVEO0FBQ3ZELDRGQUFpRTtBQUVqRSxTQUFnQixRQUFRO0lBQ3RCLHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxtQ0FBc0IsRUFBRTtRQUNqRCxJQUFJLEVBQUUsNEJBQTRCO0tBQ25DLENBQUMsQ0FBQztBQUNMLENBQUM7QUFKRCw0QkFJQztBQUVELFNBQWdCLFNBQVMsS0FBSSxDQUFDO0FBQTlCLDhCQUE4QjtBQUU5QixTQUFnQixVQUFVO0lBQ3hCLHNDQUFpQixDQUFDLFVBQVUsQ0FBQyxtQ0FBc0IsQ0FBQyxDQUFDO0FBQ3ZELENBQUM7QUFGRCxnQ0FFQyJ9