import * as React from 'react';
import * as PropTypes from 'prop-types';
import { SelectField } from './selectField';
export declare class SelectWrapped<TKey, TObj> extends React.Component<{
    field: SelectField<TKey, TObj>;
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
        field: SelectField<TKey, TObj>;
        classes: any;
        placeholder: any;
        muiFormControl: any;
    }, context: any);
    componentDidMount(): void;
    updateDirty(): void;
    render(): JSX.Element;
}
export declare class InnerSelector<TKey, T> extends React.Component<{
    field: SelectField<TKey, T>;
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
    field: SelectField<TKey, T>;
    constructor(props: {
        field: SelectField<TKey, T>;
        classes: any;
    }, context: any);
    componentDidMount(): void;
    updateDirty(): void;
    componentWillReceiveProps(nextProps: Readonly<{
        field: SelectField<TKey, T>;
        classes: any;
        placeholder?: any;
    }>, nextContext: any): void;
    render(): JSX.Element;
}
export declare const Select: any;
