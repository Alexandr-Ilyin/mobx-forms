"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class OfflineErrorIcon extends React.Component {
    render() {
        return React.createElement("div", { className: "offlineIcon" },
            React.createElement("i", { className: "fa fa-wifi offlineIcon-wifi", "aria-hidden": "true" }),
            React.createElement("i", { className: "fa fa-exclamation-triangle offlineIcon-err", "aria-hidden": "true" }));
    }
}
exports.OfflineErrorIcon = OfflineErrorIcon;
