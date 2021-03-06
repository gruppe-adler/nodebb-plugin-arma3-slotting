import * as winston from "winston";

const id = "plugin/arma3-slotting";

function format(message: string): string {
    return "[%s] %s".replace("%s", id).replace("%s", message);
}

function makeLogFunction(level: string): (message: string, e?: Error) => any {
    return function (message: string, e?: Error) {
        arguments[0] = format(message);
        winston[level].apply(winston, arguments);
    };
}

export const debug = makeLogFunction("debug");
export const info = makeLogFunction("info");
export const warn = makeLogFunction("warn");
export const error = makeLogFunction("error");
