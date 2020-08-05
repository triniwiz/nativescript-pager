/* Controls react-nativescript log verbosity. true: all logs; false: only error logs. */
import { run } from '@nativescript/core/application';
import * as React from 'react';
import * as ReactNativeScript from 'react-nativescript/dist/index';
import { AppContainer } from './AppContainer';

(global as any).__DEV__ = false;

const rootRef: React.RefObject<any> = React.createRef<any>();

run({
    create: () => {
        ReactNativeScript.render(
            React.createElement(AppContainer, {forwardedRef: rootRef}, null),
            null,
            () => {
                console.log(`AppContainer top-level render complete! run.create with rootRef.current: ${rootRef.current}`);
            },
            '__APP_ROOT__',
        );
        return rootRef.current;
    }
});
