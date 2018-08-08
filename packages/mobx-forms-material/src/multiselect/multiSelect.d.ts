import * as React from 'react';
import { MultiSelectField } from './multiSelectField';
import * as PropTypes from 'prop-types';
export declare class InnerSelector<TKey, T> extends React.Component<{
    field: MultiSelectField<TKey, T>;
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
export declare const MultiSelect: React.ComponentType<import("@material-ui/core").Overwrite<any, import("@material-ui/core/styles/withStyles").StyledComponentProps<string>>>;
