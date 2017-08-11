import * as logger from './logger'; // TODO TEST
import * as nodebb from '../types/nodebb';
const Meta = <nodebb.Meta>require('../../../src/meta');

interface PluginSettings {'api-key': string, 'allowed-categories': number[]}
let pluginSettings: PluginSettings = {
    'api-key': '',
    'allowed-categories': []
};

function parsePluginSettings(rawSettings): PluginSettings {
    return {
        'api-key': rawSettings['api-key'],
        'allowed-categories': (rawSettings['allowed-categories'] || '').
            split(',').
            map(function (bit) { return Number(bit.trim())}).
            filter(function (id) {return id;})
    }
}

export function init(params, meta, callback: Function) {
    var renderAdmin = function(req: nodebb.NodebbRequest, res: nodebb.NodebbResponse) {
        res.render('admin/plugins/' + meta.nbbId, meta || {});
    };

    Meta.settings.get(meta.nbbId, function(err: Error, settings: any) {
        if (err || !settings) {
            logger.warn('Settings not set or could not be retrived!');
        } else {
            pluginSettings = parsePluginSettings(settings);
            logger.info('Settings loaded: ' + JSON.stringify(pluginSettings));
        }

        params.router.get('/admin/plugins/' + meta.nbbId, params.middleware.admin.buildHeader, renderAdmin);
        params.router.get('/api/admin/plugins/' + meta.nbbId, renderAdmin);

        callback();
    });
}

export function getApiKey(): string {
    return pluginSettings['api-key'];
}

export function getAllowedCategories(): number[] {
    return pluginSettings['allowed-categories'];
}
