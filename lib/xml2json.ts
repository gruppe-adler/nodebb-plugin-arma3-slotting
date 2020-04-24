import * as Saxophone from "saxophone"

export default function (xml: string): Promise<object> {
    return new Promise((resolve, reject) => {
        const parser = new Saxophone()
        const result = {};

        const tree = (function() {
            const currentStack: object[] = [result];
            function last() {
                return currentStack[currentStack.length - 1]
            }
            return {
                goUp: function(): object {
                    return currentStack.pop()
                },
                addNested: function(name, tag) {
                    last()[name] = last()[name] || []
                    last()[name].push(tag);
                    currentStack.push(tag)
                }
            };
        }())

        parser.on('tagopen', tag => {
            const attrs: object = Saxophone.parseAttrs(tag.attrs)
            Object.keys(attrs).forEach(key => {
                const num = Number(attrs[key])
                if (isNaN(num)) {
                    return
                }
                attrs[key] = num
            })
            tree.addNested(tag.name, attrs)
            if (tag.isSelfClosing) {
                tree.goUp()
            }
        });
        parser.on('tagclose', tag => {
            tree.goUp()
        })
        parser.on('finish', () => {
            resolve(result)
        });
        parser.on('error', (err) => {
            reject(err)
        })

        parser.parse(xml)
    });
}
