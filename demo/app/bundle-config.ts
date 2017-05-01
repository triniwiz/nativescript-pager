if ((<any>global).TNS_WEBPACK) {
    require("bundle-entry-points");

    global.registerModule("main-page", () => require("./main-page"));

    // register application modules
    global.registerModule("nativescript-pager", () => require("nativescript-pager"));
}
