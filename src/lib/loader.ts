import * as cheerio from 'cheerio';
import { gradeConvert, subjectConvert, fetchedBook } from './common';
import { Grade, Subject } from '@prisma/client';
import fetch from 'node-fetch';

const decoder = new TextDecoder('iso-8859-2');

export async function fetchBook(url: string): Promise<fetchedBook> {
	const response = await fetch(url).catch((err) => {
		throw new Error('Check your internet connection');
	});
	if (!response.ok) throw new Error(`Cannot fetch book from ${url}`);

	const buffer = await response.arrayBuffer();

	const text = decoder.decode(buffer);

	const $ = cheerio.load(text);

	const title = $('div .product-info span').text().split('.')[0];

	const price = parseInt($('.our-price strong #updateable_price-zl').text());

	let image: string;
	let id: string;
	const coverMatch = /(?<image>\/\w+\/(?<id>\d+)\..*)/.exec(
		$('div .col-left4 .full-col img').attr('src') ?? '',
	);
	if (coverMatch?.groups) {
		image = coverMatch.groups.image;
		id = coverMatch.groups.id;
	} else {
		throw new Error('Missing cover');
	}

	const authors: Array<string> = [];
	$('div .author h2').each((i, author) => {
		authors.push($(author).text().trim().replace('  ', ' '));
	});
	const author = authors.join(', ');

	let grade: Grade | undefined;
	let subject: Subject | undefined;
	const path = $('div #path')
		.text()
		.trim()
		.toLowerCase()
		.replace('\t', '')
		.split('\n')
		.slice(-3);

	if (path[0].includes('klasa')) {
		grade = gradeConvert[path[0].at(-1) as keyof typeof gradeConvert] as Grade;
		subject = subjectConvert[path[1] as keyof typeof subjectConvert] as Subject;
	}

	let is_advanced: boolean | undefined;
	is_advanced = undefined;

	return { title, author, grade, subject, is_advanced, image, id, price, url };
}
