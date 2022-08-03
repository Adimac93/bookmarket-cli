import { Book, Grade, Subject } from '@prisma/client';
import fetch from 'node-fetch';
import { db } from '.';
import { subjectConvert } from '../common';

async function main() {
	const start = Date.now();
	await generateBooks(200);
	console.log(`\nCompleted in ${(Date.now() - start) / 1000}s`);
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

async function generateBooks(n: number) {
	process.stdout.write('Generating books:');
	for (let i = 0; i < n; i++) {
		const gradeNumber = randomInt(1, GRADE_NUMBER);
		const titleMain = randomChoice(SUBJECTS);
		const title = `${
			titleMain[0].toUpperCase() + titleMain.slice(1)
		} ${randomChoice(SUFFIXES)} ${getRandomBookType()} ${gradeNumber}`;

		const grade = Object.keys(Grade)[gradeNumber - 1] as Grade;
		const subject = subjectConvert[
			titleMain as keyof typeof subjectConvert
		] as Subject;
		const authorsNumber = randomInt(1, 4);
		const authors = [];
		for (let j = 0; j < authorsNumber; j++) {
			const isFemale = Math.random() < 0.5;
			authors.push(
				`${await getRandomFirstName(isFemale)} ${await getRandomLastName(
					isFemale,
				)}`,
			);
		}
		const author = authors.join(', ');
		const price = randomInt(10, 60);
		const url = 'unknown';
		const image = 'unknown';
		const is_advanced = Math.random() < 0.5;
		const id = create_UUID();
		const book: Book = {
			id,
			title,
			author,
			price,
			image,
			grade,
			subject,
			is_advanced,
			url,
		};

		await db.book.create({ data: book });
		process.stdout.write(`\r${progressBar(i, n, 20)}`);
	}
}
main()
	.then(async () => {
		await db.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await db.$disconnect();
		process.exit(1);
	});

async function getRandomFirstName(isFemale: boolean) {
	let source;
	if (isFemale) {
		source =
			'https://api.dane.gov.pl/1.4/resources/28103,lista-imion-zenskich-w-rejestrze-pesel-stan-na-31012021-imie-pierwsze/data';
	} else {
		source =
			'https://api.dane.gov.pl/1.4/resources/36411,lista-imion-meskich-w-rejestrze-pesel-stan-na-24012022-imie-pierwsze/data';
	}
	const json = await fetchJson(`${source}?page=${randomInt(1, 500)}`);
	const firstName = json.data[randomInt(0, 19)].attributes.col1.val as string;
	return firstName[0].concat(firstName.slice(1).toLowerCase());
}

async function getRandomLastName(isFemale: boolean) {
	let source;
	if (isFemale) {
		source =
			'https://api.dane.gov.pl/1.4/resources/38771,nazwiska-zenskie-stan-na-2022-01-27/data';
	} else {
		source =
			'https://api.dane.gov.pl/1.4/resources/33046,nazwiska-meskie-stan-na-2021-02-01/data';
	}
	const json = await fetchJson(`${source}?page=${randomInt(1, 500)}`);
	const lastName = json.data[randomInt(0, 19)].attributes.col1.val as string;
	return lastName[0].concat(lastName.slice(1).toLowerCase());
}

function getRandomBookType(): string {
	const isWithPart = Math.random() < 0.3;
	return `${
		isWithPart ? ' część' + randomInt(1, GRADE_NUMBER) + ' ' : ''
	}${randomChoice(BOOK_TYPES)}`;
}

async function fetchJson(url: string) {
	return await (await fetch(url)).json();
}

function create_UUID() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		function (c) {
			var r = (dt + Math.random() * 16) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
		},
	);
	return uuid;
}

function randomChoice<T>(choices: T[]): T {
	var index = Math.floor(Math.random() * choices.length);
	return choices[index];
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min) + min);
}

function randomFloat(min: number, max: number, decimals: number): number {
	const str = (Math.random() * (max - min) + min).toFixed(decimals);
	return parseFloat(str);
}

function progressBar(value: number, maxValue: number, size: number): string {
	const percentage = value / maxValue;
	const progress = Math.round(size * percentage);
	const emptyProgress = size - progress;

	const progressText = '▇'.repeat(progress);
	const emptyProgressText = '—'.repeat(emptyProgress);
	const percentageText = Math.round(percentage * 100) + '%';

	const bar =
		'[' + progressText + emptyProgressText + ']' + percentageText + '';
	return bar;
}
