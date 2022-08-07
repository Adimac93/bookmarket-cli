import { Book, Grade } from '@prisma/client';
import { prompt } from 'inquirer';
import { booksStorage } from './sessions';
import chalk from 'chalk';
import { fetchedBook } from './common';

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

export function displayBook(
	book: Book | fetchedBook,
	prefix?: string,
	suffix?: string,
) {
	const format = (value: unknown, modifier: chalk.ChalkFunction) => {
		return value != undefined ? modifier(value) : chalk.red('?');
	};
	let fields = [
		`Title       : ${format(book.title, chalk.underline)}`,
		`Author      : ${format(book.author, chalk.italic)}`,
		`Grade       : ${format(book.grade, chalk.rgb(73, 148, 245))}`,
		`Subject     : ${format(book.subject, chalk.rgb(73, 148, 245))}`,
		`Price       : ${colorValue(book.price, 70)}`,
		`Is advanced : ${format(
			book.isAdvanced,
			book.isAdvanced ? chalk.green : chalk.yellow,
		)}`,
	];
	return `${prefix ?? ''}\n${fields.join('\n')}\n${suffix ?? ''}`;
}

export function colorValue(value: number, maxValue: number): string {
	let blue = 70;
	if (value > maxValue) {
		return chalk.rgb(252, 0, blue)(value);
	}

	let step = 504 / maxValue;
	let indicator = Math.floor(step * value);
	if (indicator <= 252) {
		return chalk.rgb(3 + indicator, 252, blue)(value);
	}
	return chalk.rgb(252, 252 - (indicator - 252), blue)(value);
}
