import json2xml from "./json2xml"

describe("json2xml", () => {
    it("returns empty from empty object", () => {
        expect(json2xml({})).toBe("")
    })
    it("errors with more than one root", () => {
        expect(()=> {json2xml({foo: 1, bar: 2})}).toThrow()
    })
    it("creates empty tag with one root that contains empty object", () => {
        expect(json2xml({root: {}})).toBe("<root/>")
    })
    it("creates simple nested structure with tags only", () => {
        expect(json2xml({root: {leaf11: {leaf21: {}}, leaf12: {}}})).toBe("<root><leaf11><leaf21/></leaf11><leaf12/></root>")
    })
    it("creates attributes", () => {
        expect(json2xml({root: {str: "str1", boolt: true, boolf: false, numpos: 5.3, numneg: -4, "null": null, }})).toBe('<root str="str1" boolt numpos="5.3" numneg="-4"/>')
    })
    it("flattens arrays", () => {
        expect(json2xml({root: {elem: [{}, {}, {}]}})).toBe('<root><elem/><elem/><elem/></root>')
    })
})
