import {AnyCallback} from "./fn";

import * as nodebb from "../types/nodebb";
import * as logger from "./logger";

const Meta = require("../../../src/meta") as nodebb.IMeta;

interface IPluginSettings {"api-key": string; "allowed-categories": number[]; }
let pluginSettings: IPluginSettings = {
    "allowed-categories": [],
    "api-key": "",
};

function parsePluginSettings(rawSettings): IPluginSettings {
    return {
        "allowed-categories": (rawSettings["allowed-categories"] || "").
            split(",").
            map(function (bit) { return Number(bit.trim()); }).
            filter(function (id) {return id; }),
        "api-key": rawSettings["api-key"],
    };
}

export function init(params, meta, callback: AnyCallback) {
    const renderAdmin = function (req: nodebb.INodebbRequest, res: nodebb.INodebbResponse) {
        res.render("admin/plugins/" + meta.nbbId, meta || {});
    };

    Meta.settings.get(meta.nbbId, function (err: Error, settings: any) {
        if (err || !settings) {
            logger.warn("Settings not set or could not be retrived!");
        } else {
            pluginSettings = parsePluginSettings(settings);
            logger.info("Settings loaded: " + JSON.stringify(pluginSettings));
        }

        params.router.get("/admin/plugins/" + meta.nbbId, params.middleware.admin.buildHeader, renderAdmin);
        params.router.get("/api/admin/plugins/" + meta.nbbId, renderAdmin);

        callback(null, null);
    });
}

export function getApiKey(): string {
    return pluginSettings["api-key"];
}

export function getAllowedCategories(): number[] {
    return pluginSettings["allowed-categories"];
}
