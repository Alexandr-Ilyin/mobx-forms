import * as React from 'react';
import * as PropTypes from 'prop-types';
import { SelectField } from './selectField';
export declare class SelectWrapped extends React.Component<{
    field: SelectField;
    classes: any;
    placeholder: any;
}, any> {
    static contextTypes: {
        muiFormControl: PropTypes.Requireable<any>;
    };
    static childContextTypes: {
        muiFormControl: PropTypes.Requireable<any>;
    };
    muiFormControl: any;
    constructor(props: {
        field: SelectField;
        classes: any;
        placeholder: any;
        muiFormControl: any;
    }, context: any);
    componentDidMount(): void;
    updateDirty(): void;
    render(): JSX.Element;
}
export declare class InnerSelector extends React.Component<{
    field: SelectField;
    classes: any;
    placeholder?: any;
}, any> {
    static contextTypes: {
        muiFormControl: PropTypes.Requireable<any>;
    };
    static childContextTypes: {
        muiFormControl: PropTypes.Requireable<any>;
    };
    muiFormControl: any;
    field: SelectField;
    constructor(props: {
        field: SelectField;
        classes: any;
    }, context: any);
    componentDidMount(): void;
    updateDirty(): void;
    render(): JSX.Element;
}
export declare const Select: any;
