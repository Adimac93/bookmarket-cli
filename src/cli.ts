import { fetchBook } from "./lib/loader";
import { testUrlSet } from "./lib/common";
import * as fs from "node:fs/promises";
import { increment } from "./lib/common";
import { Book, Grade, Subject } from "@prisma/client";
import { uploadBook } from "./lib/database";
import { prompt, registerPrompt } from "inquirer";
registerPrompt("search-list", require("inquirer-search-list"));
const fileName = "./data.json";

const booksMap = new Map<string, number>();
Object.entries(Subject).map(([k, subject]) => {
    booksMap.set(subject, 0);
});
async function main() {
    const data = await loadFile();

    const books = await promptAddBooks();

    //await fs.writeFile(fileName, JSON.stringify(books, null, 4), "utf-8");
}
const loadFile = async () => {
    const file = await fs.readFile(fileName, { flag: "a+", encoding: "utf-8" });
    let data = {};

    try {
        data = JSON.parse(file);
        //console.log(data);
    } catch (err) {
        console.error(`Failed to parse "${fileName}"`);
        if (await confirm("Clear?")) {
            await fs.writeFile(fileName, "{}", "utf-8");
        }
    } finally {
        return data;
    }
};
async function promptAddBooks() {
    const books: Book[] = [];
    let isNext = true;
    while (isNext) {
        const options = await prompt({
            name: "url",
            message: "Url",
            type: "input",

            validate: (url) => /(https:\/{2}w{3}.taniaksiazka.pl\/.*\.html)/i.test(url) || "Invlaid url",
        });
        const book = await getBook(options.url);
        if (!book) return books;

        const fill = await prompt([
            {
                name: "mode",
                message: "Mode",
                type: "list",
                choices: ["accept", "edit", "guided-edit"],
            },
            {
                name: "title",
                message: "Title",
                default: book.title || "brak tytułu",
                type: "input",
                when: (fill) => {
                    if (book.title && fill.mode != "edit") {
                        return false;
                    }
                    return true;
                },
            },
            {
                name: "authors",
                message: "Authors",
                default: book.author || "brak autora",
                type: "input",
                when: (fill) => {
                    if (book.author && fill.mode != "edit") {
                        return false;
                    }
                    return true;
                },
                filter: (authors: string) => {
                    return authors
                        .split(",")
                        .map((author) => {
                            const match = /([\w-]+\s?)+/giu.exec(author.trim());
                            if (match) {
                                return match[0];
                            }
                            return author.trim();
                        })
                        .join(", ");
                },
            },
            {
                name: "grade",
                message: "Grade",
                type: "list",
                default: book.grade,
                choices: Object.entries(Grade).map(([k, v]) => k),
                when: (fill) => {
                    if (book.grade && fill.mode != "edit") {
                        return false;
                    }
                    return true;
                },
            },
            {
                name: "subject",
                message: "Subject",
                type: "search-list",
                default: book.subject,
                choices: Object.entries(Subject).map(([k, v]) => k),
                when: (fill) => {
                    if (book.subject && fill.mode != "edit") {
                        return false;
                    }
                    return true;
                },
            },
            {
                name: "is_advanced",
                message: "Is advanced",
                type: "confirm",
                when: (fill) => {
                    if (book.is_advanced == undefined && fill.mode != "edit") {
                        return false;
                    }
                    return true;
                },
            },
            // {
            //     name: "image",
            //     message: "Image",
            //     type: "input",
            //     default: book.image,
            // },
            // {
            //     name: "id",
            //     message: "ISBN",
            //     type: "input",
            //     default: book.id,
            // },
            // {
            //     name: "price",
            //     message: "Price",
            //     type: "number",
            //     default: book.price,
            // },
        ]);
        if (fill.title) {
            book.title = fill.title;
        }
        if (fill.authors) {
            book.author = fill.authors;
        }
        if (fill.grade) {
            book.grade = fill.grade;
        }
        if (fill.subject) {
            book.subject = fill.subject;
        }
        if (fill.is_advanced) {
            book.is_advanced = fill.is_advanced;
        }
        console.log(book);
        isNext = false;
    }
}

main();
const getBook = async (url: string) => {
    try {
        return await fetchBook(/(https:\/{2}w{3}.taniaksiazka.pl\/.*\.html)/i.exec(url)![1]);
    } catch (err) {
        console.log((err as Error).message);
    }
};
