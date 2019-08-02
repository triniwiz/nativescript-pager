import * as React from 'react';
import { PropsWithoutForwardedRef, ViewProps } from 'react-nativescript/dist/shared/NativeScriptComponentTypings';
import { RCTView, ViewComponentProps } from 'react-nativescript/dist/components/View';


import { PagerItem, PagerItem as NativeScriptPagerItem } from '../pager';

interface Props {
}

export type PagerItemProps = ViewProps;
export type PagerItemComponentProps<E extends NativeScriptPagerItem = NativeScriptPagerItem> =
    Props /* & typeof PagerItem.defaultProps */
    & Partial<PagerItemProps>
    & ViewComponentProps<E>;


// tslint:disable-next-line:class-name
export class _PagerItem<P extends PagerItemComponentProps<E>,
    S extends {},
    E extends NativeScriptPagerItem> extends RCTView<P, S, E> {

    private readonly item = new NativeScriptPagerItem();


    componentDidMount(): void {
        const view = this.myRef.current;
        const parent = view && view.parent ? view.parent : null;
        if (parent) {
            // remove parent
            parent._removeView(view);
            // add to item;
            this.item.addChild(view);
            console.log(this.item.getChildAt(0));
            // @ts-ignore
            parent._addChildFromBuilder('PagerItem', this.item);
        }
    }

    render() {
        const {
            forwardedRef,

            onPropertyChange,

            children,
            // view, /* We disallow this at the typings level. */
            ...rest
        } = this.props;


        return React.createElement(
            'pagerItem',
            {
                ...rest,
                ref: forwardedRef || this.myRef,
            },
            children
        );
    }
}

type OwnPropsWithoutForwardedRef = PropsWithoutForwardedRef<PagerItemComponentProps<NativeScriptPagerItem>>;

export const $PagerItem: React.ComponentType<OwnPropsWithoutForwardedRef & React.ClassAttributes<NativeScriptPagerItem>> = React.forwardRef<NativeScriptPagerItem, OwnPropsWithoutForwardedRef>(
    (props: React.PropsWithChildren<OwnPropsWithoutForwardedRef>, ref: React.RefObject<NativeScriptPagerItem>) => {
        const {children, ...rest} = props;

        return React.createElement(
            _PagerItem,
            {
                ...rest,
                forwardedRef: ref,
            },
            children
        );
    }
);
