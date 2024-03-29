import { Grade, Subject } from '@prisma/client';
import * as fs from 'node:fs';
import { saveDir } from '../config';

export interface fetchedBook {
	isbn: string;
	title: string;
	author: string | null;
	price: number;
	image: string;
	grade: Grade | undefined;
	subject: Subject | undefined;
	isAdvanced: boolean | undefined;
	url: string;
}
export const gradeConvert = {
	'1': 'FIRST',
	'2': 'SECOND',
	'3': 'THIRD',
	'4': 'FOURTH',
};

export const subjectConvert = {
	matematyka: 'MATH',
	'język polski': 'POLISH',
	angielski: 'ENGLISH',
	historia: 'HISTORY',
	chemia: 'CHEMISTRY',
	'wiedza o społeczeństwie': 'CIVICS',
	'język rosyjski': 'RUSSIAN',
	'język niemiecki': 'GERMAN',
	geografia: 'GEOGRAPHY',
	informatyka: 'COMPUTER_SCIENCE',
	fizyka: 'PHYSICS',
	biologia: 'BIOLOGY',
	przedsiębiorczość: 'ENTREPRENEURSHIP',
};

export const testUrlSet = [
	'https://www.taniaksiazka.pl/oblicza-geografii-2-zakres-podstawowy-podrecznik-dla-liceum-ogolnoksztalcacego-i-technikum-szkoly-ponadpodstawowe-krzysztof-wiedermann-p-1386257.html',
	'https://www.taniaksiazka.pl/matematyka-2-podrecznik-do-liceow-i-technikow-zakres-rozszerzony-elzbieta-kurczab-p-1421535.html',
	'https://www.taniaksiazka.pl/matematyka-2-zbior-zadan-do-liceow-i-technikow-zakres-rozszerzony-elzbieta-kurczab-p-1423759.html',
	'https://www.taniaksiazka.pl/to-jest-chemia-2-chemia-organiczna-podrecznik-dla-liceum-ogolnoksztalcacego-i-technikum-zakres-podstawowy-aleksandra-mrzigod-p-1488042.html',
	'https://www.taniaksiazka.pl/biologia-na-czasie-2-podrecznik-dla-liceum-ogolnoksztalcacego-i-technikum-zakres-podstawowy-jolanta-holeczek-p-1390700.html',
	'https://www.taniaksiazka.pl/fizyka-2-podrecznik-do-liceum-i-technikum-zakres-podstawowy-klasa-2-p-1405866.html',
	'https://www.taniaksiazka.pl/poznac-przeszlosc-2-podrecznik-do-historii-dla-liceum-ogolnoksztalcacego-i-technikum-zakres-podstawowy-szkola-ponadpodstawowa-adam-kucharski-p-1390702.html',
	'https://www.taniaksiazka.pl/sztuka-wyrazu-2-czesc-1-romantyzm-jezyk-polski-podrecznik-dla-liceum-i-technikum-zakres-podstawowy-i-rozszerzony-adam-regiewicz-p-1394159.html',
	'https://www.taniaksiazka.pl/sztuka-wyrazu-2-czesc-2-pozytywizm-jezyk-polski-podrecznik-dla-liceum-i-technikum-zakres-podstawowy-i-rozszerzony-adam-regiewicz-p-1394160.html',
	'https://www.taniaksiazka.pl/w-centrum-uwagi-2-wiedza-o-spoleczenstwie-podrecznik-liceum-ogolnoksztalcace-i-technikum-zakres-podstawowy-szkoly-ponadpodstawowe-arkadiusz-janicki-p-1409234.html',
	'https://www.taniaksiazka.pl/kak-raz-klasa-2-jezyk-rosyjski-podrecznik-cd-audio-szkola-ponadpodstawowa-liceum-i-technikum-olga-tatarchyk-p-1386071.html',
	'https://www.taniaksiazka.pl/kak-raz-klasa-2-jezyk-rosyjski-zeszyt-cwiczen-szkola-ponadpodstawowa-liceum-i-technikum-olga-tatarchyk-p-1386597.html',
	'https://www.taniaksiazka.pl/krok-w-przedsiebiorczosc-podrecznik-do-podstaw-przedsiebiorczosci-dla-szkol-ponadpodstawowych-tomasz-rachwal-p-1386260.html',
];

export class File {
	filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;
		if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir);
	}

	load<T>() {
		const data = fs.readFileSync(this.filePath, {
			encoding: 'utf-8',
			flag: 'a+',
		});
		try {
			return JSON.parse(data) as T;
		} catch (err) {
			return;
		}
	}

	save(payload: any) {
		fs.writeFileSync(this.filePath, JSON.stringify(payload, null, 4), 'utf-8');
	}
}
export class Random {
	choice<T>(choices: T[]): T {
		var index = Math.floor(Math.random() * choices.length);
		return choices[index];
	}

	int(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min) + min);
	}

	float(min: number, max: number, decimals: number): number {
		const str = (Math.random() * (max - min) + min).toFixed(decimals);
		return parseFloat(str);
	}
}
