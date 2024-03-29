import { Book, Grade, Subject } from '@prisma/client';
import { File } from '../common';
import { diff, uploadBook } from '../database';
import { BooksSchema } from '../schema';
import * as config from '../../config';

interface Filter {
	grade: Grade[];
	subject?: Subject[];
}

export class Books extends File {
	readonly books: Book[];
	readonly registered: Set<string>;

	constructor(filePath: string) {
		super(filePath);
		this.books = super.load() || [];
		this.registered = new Set(
			this.books.map((book) => {
				return book.isbn;
			}),
		);
	}

	get(filter?: Filter) {
		if (filter != undefined) {
			return this.books.filter((book) => {
				if (filter.subject) {
					return (
						filter.grade.includes(book.grade) &&
						filter.subject.includes(book.subject)
					);
				}
				return filter.grade.includes(book.grade);
			});
		}
		return this.books;
	}

	update(other: Book[] | Book, booksSchema?: BooksSchema) {
		if (Array.isArray(other)) {
			other.forEach((book) => {
				if (!this.registered.has(book.isbn)) {
					if (booksSchema) {
						if (booksSchema.schema[book.grade].includes(book.subject)) {
							this.books.push(book);
							this.registered.add(book.isbn);
						} else {
							console.log(
								`Could not include book ${book.title} because its subject isn't in grade schema`,
							);
						}
					} else {
						this.books.push(book);
						this.registered.add(book.isbn);
					}
				}
			});
			return;
		}
		if (!this.registered.has(other.isbn)) {
			this.books.push(other);
			this.registered.add(other.isbn);
		}
	}

	save() {
		let registered = this.registered;
		let books = this.books.reverse().filter((book) => {
			return registered.delete(book.isbn);
		});
		super.save(books);
	}

	async synch(force?: boolean) {
		const dbBooks = await diff(this.registered);

		for (const book of this.books) {
			await uploadBook(book, force);
		}

		dbBooks.forEach((book) => {
			this.books.push(book);
			this.registered.add(book.isbn);
		});

		super.save(this.books);
	}
}
export const booksStorage = new Books(`${config.saveDir}/books.json`);
