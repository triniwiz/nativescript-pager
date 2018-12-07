if ((global as any).TNS_WEBPACK) {
    global.registerModule("nativescript-pager", () => require("nativescript-pager"));
}