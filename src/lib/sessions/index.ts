import { Book, Grade, Subject } from '@prisma/client';
import { File } from '../common';
import { diff, uploadBook } from '../database';

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

	update(other: Book[] | Book) {
		if (Array.isArray(other)) {
			other.forEach((book) => {
				if (!this.registered.has(book.id)) {
					this.books.push(book);
					this.registered.add(book.id);
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
		super.save(this.books);
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

		this.save();
	}
}

export const booksStorage = new Books('./books.json');
