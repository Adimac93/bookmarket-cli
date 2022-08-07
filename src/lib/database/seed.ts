import { Book, Grade, Subject } from '@prisma/client';
import fetch from 'node-fetch';
import { db } from '.';
import { saveDir } from '../../config';
import { File, Random, subjectConvert } from '../common';

const random = new Random();
export async function seedDatabase() {
	const booksCount = await (await db.book.findMany({})).length;
	const expectedNumber = 1000;
	const n = expectedNumber - booksCount;
	if (n <= 0) {
		console.log(
			`Database is already seeded with ${expectedNumber} or more books`,
		);
		return;
	}
	const start = Date.now();
	await generateBooks(n);
	console.log(`\nGenerated ${n} books in ${(Date.now() - start) / 1000}s`);
}

const GRADE_NUMBER = 4;
const BOOK_TYPES = ['podręcznik', 'zbiór zadań', 'karty pracy', 'ćwiczenia'];
const SUBJECTS = [
	'matematyka',
	'język polski',
	'angielski',
	'historia',
	'chemia',
	'wiedza o społeczeństwie',
	'język rosyjski',
	'język niemiecki',
	'geografia',
	'informatyka',
	'fizyka',
	'biologia',
	'przedsiębiorczość',
];
const SUFFIXES = [
	'kozaka',
	'bystrzaka',
	'nie dla buraka',
	'ojca',
	'brata',
	'malucha',
	'al dente',
	'w sam raz',
	'na ząb',
	'cię dopadnie',
	'dzika',
	'taka se',
	'',
];

class Source extends File {
	src: source;
	constructor(filePath: string) {
		super(filePath);
		this.src = super.load<source>() || {
			male: { firstNames: [], lastNames: [] },
			female: { firstNames: [], lastNames: [] },
		};
	}

	private async fetchJsonMap(sourceUrl: string) {
		return (await fetchJson(`${sourceUrl}?page=${random.int(1, 500)}`))
			.data as any[];
	}

	async generate(n: number) {
		const baseURL = 'https://api.dane.gov.pl/1.4/resources';
		const femaleFirstNameSource = `${baseURL}/28103,lista-imion-zenskich-w-rejestrze-pesel-stan-na-31012021-imie-pierwsze/data`;
		const femaleLastNameSource = `${baseURL}/38771,nazwiska-zenskie-stan-na-2022-01-27/data`;
		const maleFirstNameSource = `${baseURL}/36411,lista-imion-meskich-w-rejestrze-pesel-stan-na-24012022-imie-pierwsze/data`;
		const maleLastNameSource = `${baseURL}/38771,nazwiska-zenskie-stan-na-2022-01-27/data`;

		process.stdout.write('Generating authors:\n');
		await Promise.all(
			Array.from({ length: Math.ceil(n / 20) })
				.map(() => [
					this.fetchJsonMap(femaleFirstNameSource).then((records) =>
						records.forEach((record) =>
							this.src.female.firstNames.push(record.attributes.col1.val),
						),
					),
					this.fetchJsonMap(femaleLastNameSource).then((records) =>
						records.forEach((record) =>
							this.src.female.lastNames.push(record.attributes.col1.val),
						),
					),
					this.fetchJsonMap(maleFirstNameSource).then((records) =>
						records.forEach((record) =>
							this.src.male.firstNames.push(record.attributes.col1.val),
						),
					),
					this.fetchJsonMap(maleLastNameSource).then((records) =>
						records.forEach((record) =>
							this.src.male.lastNames.push(record.attributes.col1.val),
						),
					),
				])
				.flat(),
		);
	}

	getRandomFullNames(n: number) {
		const fullNames: string[] = [];
		for (let i = 0; i < n; i++) {
			const isFemale = randomBoolean();
			let fullName: string;
			if (isFemale) {
				const firstName = random.choice(this.src.female.firstNames);
				const lastName = random.choice(this.src.female.lastNames);
				fullName = `${firstName[0] + firstName.slice(1).toLowerCase()} ${
					lastName[0] + lastName.slice(1).toLowerCase()
				}`;
			} else {
				const firstName = random.choice(this.src.male.firstNames);
				const lastName = random.choice(this.src.male.lastNames);
				fullName = `${firstName[0] + firstName.slice(1).toLowerCase()} ${
					lastName[0] + lastName.slice(1).toLowerCase()
				}`;
			}
			fullNames.push(fullName);
		}
		return fullNames;
	}

	count(): number {
		return this.src.female.firstNames.length;
	}

	save() {
		super.save(this.src);
	}
}

async function generateBooks(n: number) {
	const source = new Source(`${saveDir}/seed.json`);
	if (source.count() < n / 2) {
		await source.generate(n / 2);
		source.save();
	}

	for (let i = 0; i < n; i++) {
		const gradeNumber = random.int(1, GRADE_NUMBER);
		const grade = Object.keys(Grade)[gradeNumber - 1] as Grade;

		const titleMain = random.choice(SUBJECTS);
		const title = `${
			titleMain[0].toUpperCase() + titleMain.slice(1)
		} ${random.choice(SUFFIXES)} ${getRandomBookType()} ${gradeNumber}`;

		const subject = subjectConvert[
			titleMain as keyof typeof subjectConvert
		] as Subject;

		const authorsNumber = random.int(1, 4);
		const authors = source.getRandomFullNames(authorsNumber);
		const author = authors.join(', ');

		const price = random.int(10, 60);

		const url = 'unknown';

		const image = 'unknown';

		const isAdvanced = randomBoolean();

		const isbn = getRandomISBN();

		const created = randomDate(new Date(2000, 1, 1), new Date());
		const updated = randomDate(created, new Date());
		const book: Book = {
			isbn,
			title,
			author,
			price,
			image,
			grade,
			subject,
			isAdvanced,
			url,
			created,
			updated,
		};
		await db.book.create({ data: book });
	}
}

type nameParts = { firstNames: string[]; lastNames: string[] };
type source = {
	male: nameParts;
	female: nameParts;
};

function randomDate(start: Date, end: Date) {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

function randomBoolean(prob?: number): boolean {
	if (prob != undefined && prob > 0 && prob < 1) return Math.random() < prob;
	return Math.random() < 0.5;
}

function getRandomBookType(): string {
	const isWithPart = randomBoolean(0.3);
	return `${
		isWithPart ? ' część ' + random.int(1, GRADE_NUMBER) + ' ' : ''
	}${random.choice(BOOK_TYPES)}`;
}

function getRandomISBN(): string {
	let prefix = '978';
	let registrationGroupElement = random.int(0, 10 - 1);
	let registrantElement = random.int(0, 90000 - 1) + 10000;
	let publicationElement = random.int(0, 900 - 1) + 100;
	const isbn =
		prefix + registrationGroupElement + registrantElement + publicationElement;
	let checkDigit = 0;
	for (let i = 1; i <= isbn.length; i++) {
		let digit = parseInt(isbn[i - 1]);
		if (i % 2 == 0) {
			checkDigit += digit * 3;
		} else {
			checkDigit += digit;
		}
	}
	let rem = checkDigit % 10;
	if (rem == 0) {
		checkDigit = 0;
	} else {
		checkDigit = 10 - rem;
	}
	return isbn + checkDigit;
}

async function fetchJson(url: string) {
	return await (await fetch(url)).json();
}
