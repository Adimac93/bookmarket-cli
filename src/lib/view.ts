import { Book, Grade } from '@prisma/client';
import { prompt } from 'inquirer';
import { booksStorage } from './sessions';
import chalk from 'chalk';

export async function promptViewBooks() {
	const options = await prompt({
		name: 'grade',
		message: 'Choose grade',
		choices: Object.keys(Grade),
		type: 'list',
	});

	const books = booksStorage.get({ grade: options.grade });
	if (books.length > 0) {
		for (let book of books) {
			console.log(displayBook(book, '⨇\t⨇\t⨇', '⨈\t⨈\t⨈'));
		}
	}
}

export function displayObject(
	object: object,
	prefix?: string,
	suffix?: string,
) {
	let props = Object.entries(object).map(([key, value]) => {
		key = `${key[0].toUpperCase()}${key.slice(1)}`;
		value = value ?? 'missing';
		return `${key} : ${value}`;
	});
	return `${prefix ?? ''}\n${props.join('\n')}\n${suffix ?? ''}`;
}

export function displayBook(book: Book, prefix?: string, suffix?: string) {
	let color = colorPricing(book.price, 70);

	let fields = [
		`Title       : ${chalk.underline(book.title)}`,
		`Author      : ${chalk.italic(book.author)}`,
		`Grade       : ${chalk.rgb(73, 148, 245)(book.grade)}`,
		`Subject     : ${chalk.rgb(73, 148, 245)(book.subject)}`,
		`Price       : ${chalk.rgb(color[0], color[1], color[2])(book.price)}`,
		`Is advanced : ${
			book.is_advanced
				? chalk.green(book.is_advanced)
				: chalk.red(book.is_advanced)
		}`,
	];
	return `${prefix ?? ''}\n${fields.join('\n')}\n${suffix ?? ''}`;
}

function colorPricing(price: number, maxPrice: number) {
	let blue = 70;
	if (price > maxPrice) {
		return [252, 0, blue];
	}

	let step = 504 / maxPrice;
	let indicator = Math.floor(step * price);
	if (indicator <= 252) {
		return [3 + indicator, 252, blue];
	}
	return [252, 252 - (indicator - 252), blue];
}
