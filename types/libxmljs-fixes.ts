import * as libxmljs from 'libxmljs';

export declare class Element extends libxmljs.Element {
    text(): string;
    text(text: string): any;

    node(tagName: string): Element;

    attr(name: string): libxmljs.Attribute;
    attr(attr: libxmljs.Attribute): void;
    attr(attrObject: { [key: string]: string; }): void;
    attr(name: string, value: string): any;
}

export declare class XMLDocument extends libxmljs.XMLDocument {
    toString(): string;
    toString(formatted: boolean): string;
}
