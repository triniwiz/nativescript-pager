import { ImageCacheIt as NativeScriptImageCacheIt} from "nativescript-image-cache-it";
import { registerElement, ViewAttributes } from "react-nativescript";


registerElement("imageCacheIt", ()=> NativeScriptImageCacheIt as any);

export declare type ImageCacheItAttributes = ViewAttributes & {
    onIsLoadingChange?: (isLoading: boolean) => void;
    src?: any;
    placeHolder?: any;
    errorHolder?: any;
    stretch?: any;
    decodedWidth: any;
    decodedHeight: any;
    filter: string;
    isLoading: boolean;
    width?: any;
    height?: any;
}

declare global {
    module JSX {
        interface IntrinsicElements {
            imageCacheIt: ImageCacheItAttributes;
        }
    }
}