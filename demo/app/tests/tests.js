var Pager = require("nativescript-pager").Pager;
var pager = new Pager();

describe("greet function", function() {
    it("exists", function() {
        expect(pager.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(pager.greet()).toEqual("Hello, NS");
    });
});