import { Book, Grade, Subject } from '@prisma/client';
import { File } from '../common';
import { diff, uploadBook } from '../database';
import { promptEditBook } from '../editor';
import { fetchBook } from '../loader';
import { BooksSchema } from '../schema';

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
				return book.id;
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
				if (!this.registered.has(book.id)) {
					if (booksSchema) {
						if (booksSchema.schema[book.grade].includes(book.subject)) {
							this.books.push(book);
							this.registered.add(book.id);
						} else {
							console.log(
								`Could not include book ${book.title} because its subject isn't in grade schema`,
							);
						}
					} else {
						this.books.push(book);
						this.registered.add(book.id);
					}
				}
			});
			return;
		}
		if (!this.registered.has(other.id)) {
			this.books.push(other);
			this.registered.add(other.id);
		}
	}

	save() {
		let registered = this.registered;
		let books = this.books.reverse().filter((book) => {
			return registered.delete(book.id);
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
			this.registered.add(book.id);
		});

		super.save(this.books);
	}
}
class StorageBook {
	book: Book;

	constructor(book: Book) {
		this.book = book;
	}

	async redefine() {
		try {
			this.book = await promptEditBook(await fetchBook(this.book.url));
		} catch (err) {
			console.log((err as Error).message);
		}
	}
}
export const booksStorage = new Books('./books.json');
