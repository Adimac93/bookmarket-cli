import * as cheerio from 'cheerio';
import { gradeConvert, subjectConvert, fetchedBook } from '../common';
import { Grade, Subject } from '@prisma/client';
import fetch from 'node-fetch';

export const decoder = new TextDecoder('iso-8859-2');

export async function fetchBook(url: string): Promise<fetchedBook> {
	const $ = await getPageQuery(url);

	const title = $('div .product-info span').text().split('.')[0];

	const price = parseInt($('.our-price strong #updateable_price-zl').text());

	let image: string;
	let isbn: string;
	const coverMatch = /(?<image>\/\w+\/(?<isbn>\d+)\..*)/.exec(
		$('div .col-left4 .full-col img').attr('src') ?? '',
	);
	if (coverMatch?.groups) {
		image = coverMatch.groups.image;
		isbn = coverMatch.groups.isbn;
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

	let isAdvanced: boolean | undefined;
	isAdvanced = undefined;

	return { title, author, grade, subject, isAdvanced, image, isbn, price, url };
}

export async function fetchPage(url: string) {
	const response = await fetch(url).catch((err) => {
		throw new Error('Check your internet connection');
	});
	if (!response.ok) throw new Error(`Cannot fetch book from ${url}`);
	return response;
}

export async function getPageQuery(url: string) {
	const response = await fetchPage(url);
	const buffer = await response.arrayBuffer();
	const text = decoder.decode(buffer);
	return cheerio.load(text);
}
