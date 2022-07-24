import { prompt, ChoiceCollection } from 'inquirer';
import { CheerioAPI } from 'cheerio';
import { fetchBook, getPageQuery } from './loader';
import { createSpinner } from 'nanospinner';
import { Book } from '@prisma/client';
import { promptEditBook, promptEditBooks } from './editor';
import { booksStorage } from './sessions';

export async function promptSearchBooks() {
	const options = await prompt([
		{
			name: 'isFiltered',
			message: 'Use auto filtering',
			type: 'confirm',
		},
		{
			name: 'query',
			message: 'Search book',
			type: 'input',
		},
	]);

	if ((options.query as string).trim() == '') {
		console.log('✖ Search cancelled');
		return;
	}

	const choices = await fetchSearchResults(options.query, options.isFiltered);
	if (!choices) return;

	const search = await prompt({
		name: 'books',
		message: 'Search results',
		type: 'checkbox',
		choices,
		loop: false,
	});
	if ((search.books as Array<any>).length == 0) return;

	const spinner = createSpinner('Fetching books').start();

	let currentFetchNumber = 1;
	const maxFetchNumber = search.books.length;

	const fetchedBooks = await Promise.all<Book>(
		search.books.map(async (url: string) => {
			try {
				return await fetchBook(`https://www.taniaksiazka.pl/${url}`);
			} finally {
				spinner.update({
					text: `Fetching ${currentFetchNumber} / ${maxFetchNumber}`,
				});
				currentFetchNumber++;
			}
		}),
	);
	if (!fetchedBooks) {
		spinner.error({ text: "Couldn't fetch data", mark: '📖' });
		return;
	}
	spinner.success({ text: 'Fetched all data', mark: '🚀' });

	const editedBooks = await promptEditBooks(fetchedBooks);

	booksStorage.update(editedBooks);
	await booksStorage.save();
}

const gradeFilters = [13916, 13917, 13933, 13948];

async function fetchSearchResults(query: string, isFiltered: boolean) {
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
		const url = `https://www.taniaksiazka.pl/Szukaj/q-${query
			.split(' ')
			.join('+')}${pageNumber == 1 ? '' : `/page-${pageNumber}`}${
			isFiltered ? `?params[c]=${filter}&params[f]=no,p&params[last]=f` : ''
		}`;

		let $: CheerioAPI;
		try {
			$ = await getPageQuery(url);
		} catch (err) {
			spinner.error({ text: (err as Error).message, mark: '🌐' });
			return;
		}

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
						disabled: booksStorage.registered.has(isbn),
					});
				}
			}
		});

		pageNumber++;
		isNext = $('.page-index .next').length ? true : false;
	}

	if (choices.length == 0) {
		spinner.error({ text: `Couldn't find any books` });
		return;
	}
	spinner.success({ text: 'Fetched all books', mark: '📚' });
	return choices;
}

export async function promptFetchBook() {
	const options = await prompt({
		name: 'url',
		message: 'Url',
		type: 'input',

		filter: (url) => {
			const match = /(https:\/{2}w{3}.taniaksiazka.pl\/.*\.html)/i.exec(url);
			if (match) return match[1];
			return url;
		},
		validate: (url) =>
			/(https:\/{2}w{3}.taniaksiazka.pl\/.*\.html)/i.test(url) || 'Invalid url',
	});

	try {
		const book = await fetchBook(options.url);
		if (!booksStorage.registered.has(book.id)) {
			booksStorage.update(await promptEditBook(book));
			await booksStorage.save();
			console.log('Book saved');
		} else {
			console.log('Book already saved');
		}
	} catch (err) {
		console.log((err as Error).message);
		return;
	}
}
