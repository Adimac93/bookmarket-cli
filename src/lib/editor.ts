import { saveFile } from './common';
import { Book, Grade, Subject } from '@prisma/client';

import { prompt, registerPrompt } from 'inquirer';
registerPrompt('search-list', require('inquirer-search-list'));

import schema from './../../schema.json';

export async function promptEditBook(book: Book) {
	console.log(book);
	const editedBook = await editBook(book);
	if (book == editedBook) {
		console.log('Nothing changed');
	} else {
		console.log(editedBook);
		console.log('---');
	}
	return editedBook;
}

async function editBook(book: Book): Promise<Book> {
	const fill = await prompt([
		{
			name: 'title',
			message: 'Title',
			default: 'brak tytułu',
			type: 'input',
			when: () => !book.title,
		},
		{
			name: 'author',
			message: 'Authors',
			default: 'brak autora',
			type: 'input',
			when: () => !book.author,
			filter: (authors: string) => {
				return authors
					.split(',')
					.map((author) => {
						const match = author.trim().match(/(\S+)+/giu);
						if (match) {
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
			choices: Object.keys(Grade),
			when: () => !book.grade,
		},
		{
			name: 'subject',
			message: 'Subject',
			type: 'search-list',
			choices: Object.keys(Subject),
			when: () => !book.subject,
		},
		{
			name: 'is_advanced',
			message: 'Is advanced',
			type: 'confirm',
			when: () => book.is_advanced == undefined,
		},
	]);
	return {
		title: fill.title || book.title,
		author: fill.author || book.author,
		grade: fill.grade || book.grade,
		subject: fill.subject || book.subject,
		is_advanced:
			fill.is_advanced != undefined ? fill.is_advanced : book.is_advanced,
		price: book.price,
		image: book.image,
		id: book.id,
	};
}

export async function promptEditBooks(books: Book[]) {
	const editedBooks: Book[] = [];
	for (let book of books) editedBooks.push(await promptEditBook(book));

	return editedBooks;
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
