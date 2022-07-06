import { prompt } from 'inquirer';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fetchBook } from './loader';
const decoder = new TextDecoder('iso-8859-2');

export async function promptSearchBooks() {
	const options = await prompt({
		name: 'query',
		message: 'Search book',
		type: 'input',
	});

	const choices = await fetchSearchResults(options.query);

	const search = await prompt({
		name: 'books',
		message: 'Search results',
		type: 'checkbox',
		choices,
	});

	search.books.map(async (url: string) => {
		console.log(await fetchBook(`https://www.taniaksiazka.pl/${url}`));
	});
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

	const response = await fetch(
		`https://www.taniaksiazka.pl/Szukaj/q-${query
			.split(' ')
			.join('+')}?params[c]=${filter}&params[f]=no,p&params[last]=f`,
	);
	const buffer = await response.arrayBuffer();

	const text = decoder.decode(buffer);

	const $ = cheerio.load(text);

	const choices: { name: string; value: string }[] = [];
	$('.product-main h2 a').each((i, el) => {
		const url = el.attribs['href'];
		const title = el.attribs['data-name'];
		choices.push({ name: title, value: url });
	});
	return choices;
}
