import * as nodebb from "../types/nodebb";
import * as logger from "./logger";
import {Meta} from './nodebb';

export interface IPluginSettings {
    apiKey: string;
    allowedCategories: number[];
    slottingUiUrl: string;
}
let pluginSettings: IPluginSettings = {
    allowedCategories: [],
    apiKey: "",
    slottingUiUrl: "https://slotting.gruppe-adler.de"
};

function parsePluginSettings(rawSettings): IPluginSettings {
    return {
        allowedCategories: (rawSettings["allowed-categories"] || "").
            split(",").
            map(function (bit) { return Number(bit.trim()); }).
            filter(function (id) {return id; }),
        apiKey: rawSettings["api-key"],
        slottingUiUrl: rawSettings["slotting-ui-url"] || "https://slotting.gruppe-adler.de",
    };
}

export async function init(params, meta): Promise<any> {
    const renderAdmin = function (req: nodebb.INodebbRequest, res: nodebb.INodebbResponse) {
        res.render("admin/plugins/" + meta.nbbId, meta || {});
    };

    const settings = await Meta.settings.get(meta.nbbId);
    if (!settings) {
        logger.warn("Settings not set or could not be retrived!")
    } else {
        pluginSettings = parsePluginSettings(settings);
        logger.info("Settings loaded: " + JSON.stringify(pluginSettings));
    }

    params.router.get("/admin/plugins/" + meta.nbbId, params.middleware.admin.buildHeader, renderAdmin);
    params.router.get("/api/admin/plugins/" + meta.nbbId, renderAdmin);
}

export function getPluginSettings(): IPluginSettings {
    return pluginSettings;
}
