import * as cheerio from "cheerio";
import { gradeConvert, subjectConvert, Book } from "./common";

const decoder = new TextDecoder("iso-8859-2");

export async function getBook(urlSuffix: string): Promise<Book> {
    const response = await fetch(`https://www.taniaksiazka.pl${urlSuffix}`);

    const buffer = await response.arrayBuffer();

    const text = decoder.decode(buffer);

    const $ = cheerio.load(text);

    const imageInfo = getCoverInfo($("div .col-left4 .full-col img").attr("src") || "");

    const cover = imageInfo?.path || "";
    const isbn = imageInfo?.isbn || "";

    const authors: Array<string> = [];
    $("div .author h2").each((i, author) => {
        authors.push($(author).text().trim().replace("  ", " "));
    });

    const path = $("div #path").text().trim().toLowerCase().replace("\t", "").split("\n").slice(-3);

    const details = getDetails($("div .product-info span").text());
    let grade;
    if (!details?.grade) {
        const match = /klasa\s(\d)/i.exec(path[0]);
        grade = gradeConvert[(match ? match[1] : "1") as keyof typeof gradeConvert];
    } else {
        grade = gradeConvert[details.grade as keyof typeof gradeConvert];
    }
    const title = details?.title || "";
    const isAdvanced = details?.isAdvanced || false;
    const subject: string = subjectConvert[path[1] as keyof typeof subjectConvert];

    const price = parseInt($(".our-price strong #updateable_price-zl").text());
    // const description = $("#opis").text();

    return { title, authors, grade, subject, isAdvanced, cover, isbn, price };
}

function getCoverInfo(data: string) {
    const match = /(?<path>\/\w+\/(?<isbn>\d+)\..*)/.exec(data);
    if (match?.groups) {
        const path = match.groups.path;
        const isbn = match.groups.isbn;
        return { path, isbn };
    }
}
function getDetails(data: string) {
    const match =
        /^(?<title>.*?)\.(?:.*?(?:klasa\s(?<grade>\d)))?(?:.*?(?<type>podręcznik|zbiór|ćwiczenia|zeszyt ćwiczeń))(?:.*?(?:zakres\s(?<level>rozszerzony)))?/iu.exec(
            data
        );

    if (match?.groups) {
        const title = match.groups.title;
        const isAdvanced = match.groups.level == "rozszerzony";
        const grade = match.groups.grade;
        const type = match.groups.type.toLowerCase() == "podręcznik" ? "podręcznik" : "ćwiczenia";
        return { title, isAdvanced, grade, type };
    }
}
