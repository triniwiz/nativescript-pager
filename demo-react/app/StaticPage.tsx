import * as React from 'react';
import { $Pager, $PagerItem } from '@nativescript-community/ui-pager/react';
import { $Button, $GridLayout, $Label } from 'react-nativescript';
import { ItemSpec } from '@nativescript/core/ui/layouts/grid-layout/grid-layout';
import { Color } from '@nativescript/core/color';

export class StaticPage extends React.Component<{ forwardedRef: React.RefObject<any> }> {
    private selectedIndex: number = 3;

    constructor(props) {
        super(props);
    }

    private navigate() {
    }

    render() {
        const {forwardedRef} = this.props;
        return (
            <$GridLayout ref={forwardedRef} rows={[new ItemSpec(1, 'star'), new ItemSpec()]} columns={[new ItemSpec()]}>
                <$Pager row={0} col={0} selectedIndex={this.selectedIndex} height={{unit: '%', value: 100}}>
                    <$PagerItem backgroundColor={'red'}>
                        <$Label text={'First'}/>
                    </$PagerItem>
                    <$PagerItem backgroundColor={'white'}>
                        <$Label text={'Second'}/>
                    </$PagerItem>
                    <$PagerItem backgroundColor={'black'}>
                        <$Label text={'Third'} color={new Color('white')}/>
                    </$PagerItem>
                    <$PagerItem backgroundColor={'green'}>
                        <$Label text={'Fourth'}/>
                    </$PagerItem>
                    <$PagerItem backgroundColor={'pink'}>
                        <$Label text={'Fifth'}/>
                    </$PagerItem>
                </$Pager>
                <$Button col={0} row={1} text="Nav" onTap={this.navigate.bind(this)}/>
            </$GridLayout>
        );
    }
}
