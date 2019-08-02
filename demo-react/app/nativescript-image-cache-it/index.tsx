import * as React from "react";
import { PropsWithoutForwardedRef } from "react-nativescript/dist/shared/NativeScriptComponentTypings";
import { ImageCacheIt as NativeScriptImageCacheIt} from "nativescript-image-cache-it";
import { ViewComponentProps, RCTView } from "react-nativescript/dist/components/View";
import { register } from "react-nativescript/dist/client/ElementRegistry";

const elementKey: string = "imageCacheIt";
register(elementKey, NativeScriptImageCacheIt);

type ImageCacheItProps = Pick<NativeScriptImageCacheIt, "src"|"placeHolder"| "errorHolder" |"stretch"|"decodedWidth"|"decodedHeight"|"filter"|"isLoading">;

interface Props {
    onIsLoadingChange?: (isLoading: boolean) => void;
}

export type ImageCacheItComponentProps<
    E extends NativeScriptImageCacheIt = NativeScriptImageCacheIt
> = Props /* & typeof ImageCacheIt.defaultProps */ & Partial<ImageCacheItProps> & ViewComponentProps<E>;

export class _ImageCacheIt<
    P extends ImageCacheItComponentProps<E>,
    S extends {},
    E extends NativeScriptImageCacheIt
> extends RCTView<P, S, E> {

    render(): React.ReactNode {
        const {
            forwardedRef,

            onLoaded,
            onUnloaded,
            onAndroidBackPressed,
            onShowingModally,
            onShownModally,

            onTap,
            onDoubleTap,
            onPinch,
            onPan,
            onSwipe,
            onRotation,
            onLongPress,
            onTouch,

            onPropertyChange,

            children,
            //@ts-ignore - ATLoader not liking this rest operation for some reason.
            ...rest
        } = this.props;

        return React.createElement(
            elementKey,
            {
                ...rest,
                ref: forwardedRef || this.myRef,
            },
            children
        );
    }
}

type OwnPropsWithoutForwardedRef = PropsWithoutForwardedRef<ImageCacheItComponentProps<NativeScriptImageCacheIt>>;

export const $ImageCacheIt: React.ComponentType<
    OwnPropsWithoutForwardedRef & React.ClassAttributes<NativeScriptImageCacheIt>
> = React.forwardRef<NativeScriptImageCacheIt, OwnPropsWithoutForwardedRef>(
    (props: React.PropsWithChildren<OwnPropsWithoutForwardedRef>, ref: React.RefObject<NativeScriptImageCacheIt>) => {
        const { children, ...rest } = props;

        return React.createElement(
            _ImageCacheIt,
            {
                ...rest,
                forwardedRef: ref,
            },
            children
        );
    }
);
