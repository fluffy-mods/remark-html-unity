import { expect } from "chai";
import gfm from "remark-gfm";
import markdown from "remark-parse";
import { unified } from "unified";

import { stringify } from "../dist/index.js";

describe("markdown to unity rich text stringifier", () => {
    /**
     * @param {string} markdown
     * @returns {Promise<string>} parsed output
     */
    const parse = (md) => {
        const ast = unified().use(markdown).use(gfm).parse(md);
        return stringify(ast);
    };

    /**
     * @param {string} markdown
     * @param {string} expected
     * @returns {Promise<void>}
     */
    const parseAndCheck = (md, bb) => {
        expect(parse(md)).to.equal(bb);
    };

    it("should convert headings of levels 1-6", () => {
        for (let i = 1; i <= 6; i++) {
            let markdown = `${"#".repeat(i)} heading ${i}`;
            let unity = `<size=${32 - i * 4}>heading ${i}</size>`;

            parseAndCheck(markdown, unity);
        }
    });

    it("should convert unordered lists", () => {
        const markdown = `- item 1\n- item 2\n- item 3`;
        const unity = `- item 1\n- item 2\n- item 3`;

        parseAndCheck(markdown, unity);
    });

    it("should convert ordered lists", () => {
        const markdown = `1. item 1\n2. item 2\n3. item 3`;
        const unity = `1. item 1\n2. item 2\n3. item 3`;

        parseAndCheck(markdown, unity);
    });

    it("should convert nested lists", () => {
        const markdown = `
- item 1
    - item 1.1
    - item 1.2
- item 2
    1. item 2.1
    2. item 2.2
`;
        const unity = `- item 1
    - item 1.1
    - item 1.2
- item 2
    1. item 2.1
    2. item 2.2`;

        parseAndCheck(markdown, unity);
    });

    it("should convert links", () => {
        const markdown = `[example](http://example.com)`;
        const unity = `<b>example</b>`;

        parseAndCheck(markdown, unity);
    });

    it("should ignore images", () => {
        const markdown = `![image](http://example.com/image.png)`;
        const unity = ``;

        parseAndCheck(markdown, unity);
    });

    it("should convert image links", () => {
        const markdown = `[![image](http://example.com/image.png)](http://example.com)`;
        const unity = `<b>image</b>`;

        parseAndCheck(markdown, unity);
    });

    it("should convert bold text", () => {
        const markdown = `**bold**`;
        const unity = `<b>bold</b>`;

        parseAndCheck(markdown, unity);
    });

    it("should convert italic text", () => {
        const markdown = `*italic*`;
        const unity = `<i>italic</i>`;

        parseAndCheck(markdown, unity);
    });

    it("should convert strikethrough text", () => {
        const markdown = `~~strikethrough~~`;
        const unity = `<s>strikethrough</s>`;

        parseAndCheck(markdown, unity);
    });

    it("should pass through spoilers", () => {
        const markdown = `>! spoiler`;
        const unity = `spoiler`;

        parseAndCheck(markdown, unity);
    });

    it("should fake quotes", () => {
        const markdown = `> quote`;
        const unity = `<indent=30px>"<i>quote</i>"</indent>`;

        parseAndCheck(markdown, unity);
    });

    it("should convert multi-line quotes", () => {
        const markdown = `> quote\n> quote\n> even more quote`;
        const unity = `<indent=30px>"<i>quote\nquote\neven more quote</i>"</indent>`;

        parseAndCheck(markdown, unity);
    });

    it("should pass through multi-line spoilers", () => {
        const markdown = `>! quote\n> quote\n> even more quote`;
        const unity = `quote\nquote\neven more quote`;

        parseAndCheck(markdown, unity);
    });

    it("should fake code blocks", () => {
        const markdown = "```\ncode\n```";
        const unity = `<indent=10px><mspace>code</mspace></indent>`;

        parseAndCheck(markdown, unity);
    });

    it("should convert inline code", () => {
        const markdown = "this is inline `code`, let's type around";
        const unity = `this is inline <mspace>code</mspace>, let's type around`;
        parseAndCheck(markdown, unity);
    });
});
