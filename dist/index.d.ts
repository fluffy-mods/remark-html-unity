import { Plugin } from "unified";
import type { Content, Root } from "mdast";
declare const plugin: Plugin;
export default plugin;
export declare function stringify(node: Content | Root): string;
export declare function convert(md: string): string;
