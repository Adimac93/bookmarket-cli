import { saveFile } from './common';
import { Book, Grade, Subject } from '@prisma/client';

import { prompt, registerPrompt } from 'inquirer';
registerPrompt('search-list', require('inquirer-search-list'));

import schema from './../../schema.json';

export async function promptEditBook(book: Book) {
	const isFilled = Object.values(book).every(
		(x) => x != undefined || x != false,
	);
	let modes;
	if (isFilled) {
		modes = ['accept', 'edit'];
	} else {
		modes = ['guided-edit', 'edit'];
	}
	const fill = await prompt([
		{
			name: 'mode',
			message: 'Mode',
			type: 'list',
			choices: modes,
		},
		{
			name: 'title',
			message: 'Title',
			default: book.title || 'brak tytułu',
			type: 'input',
			when: (fill) => {
				if (book.title && fill.mode != 'edit') {
					return false;
				}
				return true;
			},
		},
		{
			name: 'author',
			message: 'Authors',
			default: book.author || 'brak autora',
			type: 'input',
			when: (fill) => {
				if (book.author && fill.mode != 'edit') {
					return false;
				}
				return true;
			},
			filter: (authors: string) => {
				return authors
					.split(',')
					.map((author) => {
						const match = author.trim().match(/(\S+)+/giu);
						if (match) {
							console.log(match);
							return match.join(' ');
						}
						return author.trim();
					})
					.join(', ');
			},
		},
		{
			name: 'grade',
			message: 'Grade',
			type: 'list',
			default: book.grade,
			choices: Object.entries(Grade).map(([k, v]) => k),
			when: (fill) => {
				if (book.grade && fill.mode != 'edit') {
					return false;
				}
				return true;
			},
		},
		{
			name: 'subject',
			message: 'Subject',
			type: 'search-list',
			default: book.subject,
			choices: Object.entries(Subject).map(([k, v]) => k),
			when: (fill) => {
				if (book.subject && fill.mode != 'edit') {
					return false;
				}
				return true;
			},
		},
		{
			name: 'is_advanced',
			message: 'Is advanced',
			type: 'confirm',
			when: (fill) => {
				if (book.is_advanced != undefined && fill.mode != 'edit') {
					return false;
				}
				return true;
			},
		},
	]);
	delete fill.mode;
	Object.entries(fill).map(([k, v]) => {
		const filed = book[k as keyof typeof book];
		(book[k as keyof typeof book] as typeof filed) = v as typeof filed;
	});
	console.log(book);
	return book;
}

export async function promptEditBooks(books: Book[]) {
	for (let book of books) {
		console.log(book);
		book = await promptEditBook(book);
	}
	return books;
}

export async function promptEditSchema() {
	const options = await prompt([
		{
			name: 'grade',
			message: 'Choose grade',
			type: 'list',
			choices: Object.entries(Grade).map(([key, value]) => ({ value })),
		},
		{
			name: 'subjects',
			message: 'Choose subjects',
			type: 'checkbox',
			choices: (options) =>
				Object.entries(Subject).map(([key, value]) => ({
					value,
					checked: (
						schema[options.grade as keyof typeof schema] as Subject[]
					).includes(value as Subject),
				})),
		},
	]);
	schema[options.grade as keyof typeof schema] = options.subjects;
	await saveFile('./schema.json', schema);
}
