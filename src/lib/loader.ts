import * as cheerio from 'cheerio';
import { gradeConvert, subjectConvert } from './common';
import { Book, Grade, Subject } from '@prisma/client';
import fetch from 'node-fetch';

const decoder = new TextDecoder('iso-8859-2');

export async function fetchBook(url: string): Promise<Book> {
	const response = await fetch(url).catch((err) => {
		throw new Error('Check your internet connection');
	});
	if (!response.ok) throw new Error(`Cannot fetch book from ${url}`);

	const buffer = await response.arrayBuffer();

	const text = decoder.decode(buffer);

	const $ = cheerio.load(text);

	const imageInfo = getCoverInfo(
		$('div .col-left4 .full-col img').attr('src') || '',
	);

	const image = imageInfo?.path || '';
	const id = imageInfo?.isbn || '';

	const authors: Array<string> = [];
	$('div .author h2').each((i, author) => {
		authors.push($(author).text().trim().replace('  ', ' '));
	});
	const author = authors.join(', ');

	const path = $('div #path')
		.text()
		.trim()
		.toLowerCase()
		.replace('\t', '')
		.split('\n')
		.slice(-3);

	const details = getDetails($('div .product-info span').text());
	let grade: Grade = undefined!;
	if (!details?.grade) {
		const match = /klasa\s(\d)/i.exec(path[0]);
		if (match)
			grade = gradeConvert[match[1] as keyof typeof gradeConvert] as Grade;
	} else {
		grade = gradeConvert[details.grade as keyof typeof gradeConvert] as Grade;
	}
	const title = details?.title || undefined!;
	const is_advanced = details?.isAdvanced || undefined!;
	const subject = subjectConvert[
		path[1] as keyof typeof subjectConvert
	] as Subject;

	const price = parseInt($('.our-price strong #updateable_price-zl').text());
	// const description = $("#opis").text();

	return { title, author, grade, subject, is_advanced, image, id, price };
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
		/^(?<title>.*?)\.(?:.*?(?:klas[ay]\s(?<grade>\d)))?(?:.*?(?<type>podręcznik|zbiór|ćwiczenia|zeszyt ćwiczeń))(?:.*?(?:zakres\s(?<level>rozszerzony)))?/iu.exec(
			data,
		);

	if (match?.groups) {
		const title = match.groups.title;
		const isAdvanced = match.groups.level == 'rozszerzony';
		const grade = match.groups.grade;
		const type =
			match.groups.type.toLowerCase() == 'podręcznik'
				? 'podręcznik'
				: 'ćwiczenia';
		return { title, isAdvanced, grade, type };
	}
}
