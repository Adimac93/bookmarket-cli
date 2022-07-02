import readLine from "readline";
import { getBook } from "./lib/loader";
import { subjects } from "./lib/common";
import { stdin, stdout } from "node:process";
import fs from "node:fs/promises";
import { Book } from "./lib/common";
const rl = readLine.createInterface({ input: stdin, output: stdout });

const fileName = "./data.json";
async function main() {
    const file = await fs.readFile(fileName, { flag: "a+", encoding: "utf-8" });
    let data = {};

    try {
        data = JSON.parse(file);
        console.log(data);
    } catch (err) {
        console.error(`Failed to parse "${fileName}"`);
        if (await confirm("Clear?")) {
            await fs.writeFile(fileName, "{}", "utf-8");
        }
    }

    const books = await addBooks();
    await fs.writeFile(fileName, JSON.stringify(books, null, 4), "utf-8");
    rl.close();
}

const addBooks = () =>
    new Promise<Book[]>(async (resolve, reject) => {
        const books: Book[] = [];
        let isNext = true;
        while (isNext) {
            try {
                const url = await askURL();
                books.push(await getBook(url));
            } catch (err) {
                console.log(err);
            }

            isNext = await confirm("Next?");
        }
        if (!isNext) {
            resolve(books);
        }
    });

const askURL = () =>
    new Promise<string>((resolve, reject) => {
        rl.question("URL: ", async (url) => {
            const match = url.match(
                /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i
            );
            if (match) {
                resolve(match[1]);
            }
            reject("Cannot parse URL");
        });
    });

const confirm = (prompt: string) =>
    new Promise<boolean>((resolve, reject) => {
        rl.question(`${prompt} (y\\n) `, async (res) => {
            if (!res) {
                resolve(true);
            }
            const match = /(y|n|yes|no)/.exec(res);
            if (match) {
                resolve(match[1] == "y");
            }
            resolve(false);
        });
    });

main();
