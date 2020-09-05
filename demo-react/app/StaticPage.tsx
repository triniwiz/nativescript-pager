import * as React from 'react';
import { ItemSpec } from '@nativescript/core/ui/layouts/grid-layout';
import { Color, Page } from '@nativescript/core';
import { NSVElement } from 'react-nativescript';
import { Pager, PagerItem } from './nativescript-pager/index';
export class StaticPage extends React.Component<{ forwardedRef: React.RefObject<any> }> {
    private selectedIndex: number = 3;

    constructor(props) {
        super(props);
    }

    private navigate() {
    }

    render() {
        const { forwardedRef } = this.props;
        return (
            <gridLayout ref={forwardedRef} rows="*,auto" columns="auto">
                
            </gridLayout>
        );
    }
}
