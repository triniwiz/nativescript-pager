import * as React from 'react';
import { PropsWithoutForwardedRef, ViewProps } from 'react-nativescript/dist/shared/NativeScriptComponentTypings';
import { RCTView, ViewComponentProps } from 'react-nativescript/dist/components/View';
import { PagerItem as NativeScriptPagerItem } from '../pager';
interface Props {
}
export declare type PagerItemProps = ViewProps;
export declare type PagerItemComponentProps<E extends NativeScriptPagerItem = NativeScriptPagerItem> = Props & Partial<PagerItemProps> & ViewComponentProps<E>;
export declare class _PagerItem<P extends PagerItemComponentProps<E>, S extends {}, E extends NativeScriptPagerItem> extends RCTView<P, S, E> {
    private readonly item;
    componentDidMount(): void;
    render(): React.ReactElement<Pick<Readonly<P> & Readonly<{
        children?: React.ReactNode;
    }>, Exclude<keyof P, "forwardedRef" | "onPropertyChange" | "children">> & {
        ref: P["forwardedRef"];
    }, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
}
declare type OwnPropsWithoutForwardedRef = PropsWithoutForwardedRef<PagerItemComponentProps<NativeScriptPagerItem>>;
export declare const $PagerItem: React.ComponentType<OwnPropsWithoutForwardedRef & React.ClassAttributes<NativeScriptPagerItem>>;
export {};
