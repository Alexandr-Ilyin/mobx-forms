"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("React");
class ErrorContainer extends React.Component {
    componentDidCatch(error, info) {
        this.setState({
            error: error,
            errorInfo: info
        });
    }
    render() {
        if (this.state && this.state.error) {
            return React.createElement("div", null,
                React.createElement("h1", { className: "text-center" }, "Something went wrong"),
                React.createElement("details", { style: { whiteSpace: "pre-wrap" } },
                    this.state.error && this.state.error.toString(),
                    React.createElement("br", null),
                    this.state.errorInfo && this.state.errorInfo.componentStack));
        }
        return this.props.children;
    }
}
exports.ErrorContainer = ErrorContainer;
