import gfm from "remark-gfm";
import remark from "remark-parse";
import { Plugin, unified } from "unified";

import type { Content, Root, Parent, List } from "mdast";
const plugin: Plugin = function remarkHtmlUnity() {
    Object.assign(this, { Compiler: stringify });
};

export default plugin;

export function stringify(node: Content | Root): string {
    switch (node.type) {
        case "root":
            return all(node.children, "\n\n");
        case "paragraph":
            return all(node.children);
        case "heading":
            return `<size=${32 - node.depth * 4}>${all(node.children)}</size>`;
        case "text":
            return node.value;
        case "list":
            list(node);
            return `${all(node.children, "\n")}`;
        case "listItem":
            const li: { ordered: boolean; depth: number; index: number } =
                node.data as { ordered: boolean; depth: number; index: number };
            const indent = " ".repeat((li.depth - 1) * 4);
            const mark = li.ordered ? `${li.index + 1}. ` : "- ";
            const content = all(node.children, "\n");
            return `${indent}${mark}${content}`;
        case "link":
            set(node, { isLink: true });
            return `<b>${all(node.children)}</b>`;
        case "image":
            if (node.data?.isLink) {
                return node.alt ?? "";
            } else {
                return "";
            }
        case "strong":
            return `<b>${all(node.children)}</b>`;
        case "emphasis":
            return `<i>${all(node.children)}</i>`;
        case "blockquote":
            const children = all(node.children);
            if (children.startsWith("! ")) {
                return `${children.substr(2)}`;
            }
            return `<indent=30px>"<i>${all(node.children)}</i>"</indent>`;
        case "delete":
            return `<s>${all(node.children)}</s>`;
        case "inlineCode":
            return `<mspace>${node.value}</mspace>`;
        case "code":
            return `<indent=10px><mspace>${node.value}</mspace></indent>`;
        default:
            console.warn(`Unhandled node type: ${node.type}`);
            if ("value" in node) {
                return node.value;
            } else if ("children" in node) {
                return all(node.children);
            }
            return "";
    }
}

function all(children: Content[], sep: string = ""): string {
    return children.map(stringify).join(sep);
}

function set(node: Content | Parent, data: object) {
    node.data = Object.assign({}, node.data, data);
    if ("children" in node) {
        node.children.forEach((child) => {
            set(child, data);
        });
    }
}

function inc(node: Content | Parent, attr: string) {
    const value = (node.data?.[attr] as number) || 0;
    node.data = Object.assign({}, node.data, { [attr]: value + 1 });
    if ("children" in node) {
        node.children.forEach((child) => {
            inc(child, attr);
        });
    }
}

function list(node: List) {
    node.children.forEach((child, index) => {
        set(child, { ordered: node.ordered, index });
        inc(child, "depth");
    });
}

export function convert(md: string): string {
    const ast = unified().use(remark).use(gfm).use(plugin).parse(md);
    return stringify(ast as Root);
}
