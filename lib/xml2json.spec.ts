import xml2json from './xml2json';

describe("xml2json", () => {
    it("wraps everything into an object", async () => {
        expect(await xml2json("")).toEqual({})
    })
    it("creates an empty object for an empty tag", async () => {
        expect(await xml2json("<root/>")).toEqual({root:[{}]})
    })
    it("knows how to add attributes", async () => {
        expect(await xml2json("<root attr1='val1' attr2='val2' />")).toEqual({root: [{attr1: "val1", attr2: "val2"}]})
    })
    it("errors out if a tag stays unclosed", (done) => {
        xml2json("<root>").then(() => {
            fail()
            done()
        }).catch((err) => {
            expect(err.message).toContain("Unclosed")
            done()
        })
    })
    it("nests elements in arrays (excepting the root element!)", async () => {
        expect(await xml2json("<root><foo></foo><foo><bar></bar></foo></root>")).toEqual({root: [{foo: [{}, {bar: [{}]}]}]})
    })
    it("nests elements also in more complex scenario (parser needs to move up again when building tree)", async () => {
        expect(await xml2json(`
<match uuid="948766cb-f4e2-4ee3-8a8c-7770a28d214a">
  <platoon side="" natosymbol="inf" callsign="Platoon" frequency="43" vehicletype="brummbrumm" min-slotted-player-count="2">
    <slot shortcode="PTL" description="Platoon Leader" uuid="bcb25389-0cce-4ca6-8492-bc963c4fd92d"/>
    <squad natosymbol="inf" callsign="Squad" vehicletype=""/>
  </platoon>
</match>`)).toEqual({"match":[{
            "uuid": "948766cb-f4e2-4ee3-8a8c-7770a28d214a",
            "platoon": [{
                "side": 0,
                "natosymbol": "inf",
                "callsign": "Platoon",
                "frequency": 43,
                "vehicletype": "brummbrumm",
                "min-slotted-player-count": 2,
                "slot": [{
                    "shortcode": "PTL",
                    "description": "Platoon Leader",
                    "uuid": "bcb25389-0cce-4ca6-8492-bc963c4fd92d",
                }],
                "squad": [{
                    "natosymbol": "inf",
                    "callsign": "Squad",
                    "vehicletype": 0
                }]
            }]
        }]})
    })
    it("can mix attributes and nested tags", async () => {
        expect(await xml2json("<root><foo a='a'></foo><foo a='b'><bar a='c'></bar></foo></root>")).toEqual({root: [{foo: [{a:"a"}, {a:"b", bar: [{a:"c"}]}]}]})
    })
    it("converts numerics to numbers", async () => {
        expect(await xml2json("<root><foo a='1'></foo><foo a='2.5'></foo><foo a='-3.1'></foo><foo a='2.5e3'></foo></root>")).toEqual({root: [{foo: [{a:1}, {a:2.5}, {a:-3.1}, {a:2500}]}]})
    })
})
