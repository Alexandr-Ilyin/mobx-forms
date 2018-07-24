import * as React from 'react';
import { MultiSelectField } from './multiSelectField';
import * as PropTypes from 'prop-types';
export declare class InnerSelector extends React.Component<{
    field: MultiSelectField;
    classes: any;
}, any> {
    static contextTypes: {
        muiFormControl: PropTypes.Requireable<any>;
    };
    static childContextTypes: {
        muiFormControl: PropTypes.Requireable<any>;
    };
    private muiFormControl;
    constructor(props: any, context: any);
    componentDidMount(): void;
    updateDirty(): void;
    render(): JSX.Element;
}
export declare const MultiSelect: React.ComponentType<import("../../../../node_modules/@material-ui/core").Overwrite<any, import("../../../../node_modules/@material-ui/core/styles/withStyles").StyledComponentProps<string>>>;
