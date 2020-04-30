import {Match} from "./match";
import {XmlMatchRequest} from "./xml-match-request";

describe("XmlMatchRequest", function () {
    describe("getMatch", function () {
        it("returns Match instance", async function () {
            expect(await new XmlMatchRequest({
                body: "<match></match>",
                params: {tid: "1"},
            }).getMatch() instanceof Match).toBeTruthy();
        });
        it("recognizes match uuid", async function () {
            expect((await new XmlMatchRequest({
                body: "<match uuid=\"foo\"></match>",
                params: {tid: "1"},
            }).getMatch()).uuid).toBe("foo");
        });

        it("recognizes match uuid passed as parameter", async function () {
            expect((await new XmlMatchRequest({
                body: "<match></match>",
                params: {tid: "1", matchid: "bar"},
            }).getMatch()).uuid).toBe("bar");
        });
        it("adds structure down to slot level", async function () {
            const m = await new XmlMatchRequest({
                body: "<match><company><platoon><squad><fireteam>" +
                "<slot description='fooslot' reserved-for='a,b'></slot>" +
                "</fireteam></squad></platoon></company></match>",
                params: {tid: "1", matchid: "bar"},
            }).getMatch();
            const slot = m.getSlots()[0];
            expect(slot.description).toBe("fooslot");
            expect(slot["reserved-for"]).toEqual("a,b");

        });
    });
});
