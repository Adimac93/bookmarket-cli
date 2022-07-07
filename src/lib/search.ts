import { prompt, ChoiceCollection } from 'inquirer';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fetchBook } from './loader';
import { createSpinner } from 'nanospinner';
import { Book } from '@prisma/client';
const decoder = new TextDecoder('iso-8859-2');

import books from '../../books.json';
const registeredBooks = books.map((book) => {
	return book.id;
});

export async function promptSearchBooks() {
	const options = await prompt({
		name: 'query',
		message: 'Search book',
		type: 'input',
	});

	const choices = await fetchSearchResults(options.query);
	if (!choices) return;

	const search = await prompt({
		name: 'books',
		message: 'Search results',
		type: 'checkbox',
		choices,
	});
	if (!search.books) return;
	return Promise.all<Book>(
		search.books.map(async (url: string) => {
			return await fetchBook(`https://www.taniaksiazka.pl/${url}`);
		}),
	);
}

const gradeFilters = [13916, 13917, 13933, 13948];

async function fetchSearchResults(query: string) {
	let filter;
	const match = /\d/.exec(query);
	if (match) {
		filter = gradeFilters[parseInt(match[0])];
	} else {
		filter = gradeFilters[0];
	}
	const spinner = createSpinner('Fetching results...').start();
	const choices: ChoiceCollection = [];

	let pageNumber = 1;
	let isNext = true;
	while (isNext) {
		spinner.update({ text: `Fetching page ${pageNumber}` });
		const response = await fetch(
			`https://www.taniaksiazka.pl/Szukaj/q-${query
				.split(' ')
				.join(
					'+',
				)}/page-${pageNumber}?params[c]=${filter}&params[f]=no,p&params[last]=f`,
		).catch((err) => {
			spinner.error({ text: 'Bad connection' });
			throw new Error('Check your internet connection');
		});

		const buffer = await response.arrayBuffer();

		const text = decoder.decode(buffer);

		const $ = cheerio.load(text);

		const products = $('.product-container');
		products.each((i, el) => {
			const data = $(el).find('.product-image a');

			const title = data.attr('data-name')!;
			const url = data.attr('href')!;
			const image = data.find('img').attr('data-src');

			if (title && url && image) {
				const match = /(?<path>\/\w+\/(?<isbn>\d+)\..*)/.exec(image);
				if (match) {
					const isbn = match.groups!.isbn;

					choices.push({
						name: title,
						value: url,
						disabled: registeredBooks.includes(isbn),
					});
				}
			}

			console.log(title, url, image);
		});

		pageNumber++;
		isNext = $('.page-index .next').length ? true : false;
	}
	spinner.success({ text: 'Fetched all books', mark: '📚' });
	return choices;
}
