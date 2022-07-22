import { Book, Grade, Subject } from '@prisma/client';
import { CheerioAPI } from 'cheerio';
import { File, gradeConvert, subjectConvert, testUrlSet } from '../common';
import { decoder, fetchPage, getPageQuery } from './index';

describe.each(testUrlSet)('Query book properties', (url) => {
	let $: CheerioAPI;
	beforeAll(async () => {
		$ = await getPageQuery(url);
	});

	let title: string;
	it('title', () => {
		title = $('div .product-info span').text().split('.')[0];
	});
	let price: number;
	it('price', () => {
		price = parseInt($('.our-price strong #updateable_price-zl').text());
	});
	let id: string, image: string;
	it('id & image', () => {
		const coverMatch = /(?<image>\/\w+\/(?<id>\d+)\..*)/.exec(
			$('div .col-left4 .full-col img').attr('src') ?? '',
		);
		if (coverMatch?.groups) {
			image = coverMatch.groups.image;
			id = coverMatch.groups.id;
		} else {
			throw new Error('Missing cover');
		}
	});
	let author: string;
	it('author', () => {
		const authors: Array<string> = [];
		$('div .author h2').each((i, author) => {
			authors.push($(author).text().trim().replace('  ', ' '));
		});
		author = authors.join(', ');
	});
	let grade: Grade | undefined, subject: Subject | undefined;
	it('grade & subject', () => {
		const path = $('div #path')
			.text()
			.trim()
			.toLowerCase()
			.replace('\t', '')
			.split('\n')
			.slice(-3);

		if (path[0].includes('klasa')) {
			grade = gradeConvert[
				path[0].at(-1) as keyof typeof gradeConvert
			] as Grade;
			subject = subjectConvert[
				path[1] as keyof typeof subjectConvert
			] as Subject;
		}
	});
	let is_advanced: boolean | undefined;
	it('is advanced', () => {
		is_advanced = undefined;
	});
});
