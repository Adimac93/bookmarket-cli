import { Book, Grade, Subject } from '@prisma/client';
import { saveFile } from './common';
import * as fs from 'node:fs';

interface Filter {
	grade: Grade;
	subject?: Subject;
}

export class Books {
	readonly filePath: string;
	readonly books: Book[];

	constructor(filePath: string) {
		this.filePath = filePath;
		const data = fs.readFileSync(this.filePath, {
			flag: 'a+',
			encoding: 'utf-8',
		});
		try {
			this.books = JSON.parse(data);
		} catch (err) {
			this.books = [];
		}
	}

	get(filter?: Filter) {
		if (filter != undefined) {
			return this.books.filter((book) => {
				if (filter.subject) {
					return book.grade == filter.grade && book.subject == filter.subject;
				}
				return book.grade == filter.grade;
			});
		}
		return this.books;
	}

	update(other: Book[] | Book) {
		if (Array.isArray(other)) {
			other.forEach((book) => {
				this.books.push(book);
			});
			return;
		}
		this.books.push(other);
	}

	async save() {
		await saveFile(this.filePath, this.books);
	}
}
