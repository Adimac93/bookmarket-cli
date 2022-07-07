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
			default: book.title || 'brak tytułu',
			type: 'input',
			when: (fill) => {
				if (book.title) {
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
				if (book.author) {
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
				if (book.grade) {
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
				if (book.subject) {
					return false;
				}
				return true;
			},
		},
		{
			name: 'is_advanced',
			message: 'Is advanced',
			type: 'confirm',
			default: book.is_advanced,
			when: (fill) => {
				if (book.is_advanced != undefined) {
					return false;
				}
				return true;
			},
		},
	]);
	return {
		title: fill.title || book.title,
		author: fill.author || book.author,
		grade: fill.grade || book.grade,
		subject: fill.subject || book.subject,
		is_advanced: fill.is_advanced || book.is_advanced,
		image: book.image,
		price: book.price,
		id: book.id,
	};
}

export async function promptEditBooks(books: Book[]) {
	for (let book of books) {
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
