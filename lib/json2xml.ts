function identity(x) {return x}
function xmlEscape(str: string): string {
    return str
        .replace("&", "&amp;")
        .replace("<", "&lt;")
}

function createXml(tag: string, value: object): string {
    let content = ""
    let attributes = {}

    Object.getOwnPropertyNames(value).forEach((propName) => {
        const val = value[propName]
        if (typeof val === "object") {
            if (Array.isArray(val)) {
                content += val.map((elem) => createXml(propName, elem)).join("")
            } else if (val) {
                content += createXml(propName, val)
            }
        } else {
            attributes[propName] = val
        }
    })

    let attributeString = Object
        .getOwnPropertyNames(attributes)
        .map(propname => {
            const val = attributes[propname]
            switch (val) {
                case true: return propname
                case false: return ""
                case null: return ""
            }
            return `${propname}="${attributes[propname]}"`
        }).filter(identity).join(" ")
    if (attributeString) {
        attributeString = ` ${attributeString}`
    }

    if (content) {
        return [`<${tag}`, attributeString, `>`, content, `</${tag}>`].filter(identity).join("")
    }

    return [`<${tag}`, attributeString, "/>"].filter(identity).join("")
}

export default function (json: object): string {
    if (!json) {
        return "";
    }
    const propNames = Object.getOwnPropertyNames(json);
    switch (propNames.length) {
        case 0: return "";
        case 1:
            const firstName = propNames.shift()
            return createXml(firstName, json[firstName])
        default:
            throw new Error("need a single root object")
    }
}
