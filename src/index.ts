import { regex } from './constants';
import { clamp, hexSegmentParser, rgbToHsl, rgbToHwb, segmentToHex } from './utils';

type ColorType = string | Color | Array<number>;
type ColorInitType = 'rgb' | 'hsl' | 'hwb';
type RGBA = 'r' | 'g' | 'b' | 'a';

/**
 * See more: https://drafts.csswg.org/css-color/
 */
class Color extends Object {
	private initialValue: string;

	r: number = 0;
	g: number = 0;
	b: number = 0;
	a: number = 1;

	constructor(color: ColorType, type: ColorInitType = 'rgb') {
		super();

		if (typeof color === 'string') {
			this.initialValue = color;

			this.parse();
		} else if (color instanceof Color) {
			this.initialValue = color.initialValue;

			this.r = color.r;
			this.g = color.g;
			this.b = color.b;
			this.a = color.a;
		} else if (Array.isArray(color)) {
			this.initialValue = type;

			this.initByArray(color, type);
		} else {
			console.warn(`[Color]: Color ${color} is invalid`);
			this.initialValue = 'unknown';
		}
	}

	initByArray(color: Array<number>, type: ColorInitType) {
		switch (type) {
			case 'rgb':
				this.parseRGB(color);
				break;
			case 'hsl':
				this.parseHSL(color);
				break;
			case 'hwb':
				this.parseHWB(color);
				break;
			default:
				console.warn("[Color]: unknown color type. Default array color type is 'rgb'");
				this.parseRGB(color);
		}
	}

	get isValid(): boolean {
		if (!this.initialValue || this.initialValue === 'unknown') {
			return false;
		}

		return this.isHEX || this.isRGB || this.isHSL || this.isHWB;
	}

	get isHEX() {
		return this.isHEX24 || this.isHEX32;
	}

	static isHEX(color: string): boolean {
		return new Color(color).isHEX;
	}

	get isHEX24(): boolean {
		return new RegExp(regex.hex.x24).test(this.initialValue);
	}

	static isHEX24(color: string): boolean {
		return new Color(color).isHEX24;
	}

	get isHEX32(): boolean {
		return new RegExp(regex.hex.x32).test(this.initialValue);
	}

	static isHEX32(color: string): boolean {
		return new Color(color).isHEX32;
	}

	get isRGB(): boolean {
		return new RegExp(regex.rgb.simple).test(this.initialValue) || this.initialValue === 'rgb';
	}

	static isRGB(color: string): boolean {
		return new Color(color).isRGB;
	}

	get isHSL(): boolean {
		return new RegExp(regex.hsl.simple).test(this.initialValue) || this.initialValue === 'hsl';
	}

	static isHSL(color: string): boolean {
		return new Color(color).isHSL;
	}

	get isHWB(): boolean {
		return new RegExp(regex.hwb.simple).test(this.initialValue) || this.initialValue === 'hwb';
	}

	static isHWB(color: string): boolean {
		return new Color(color).isHWB;
	}

	get hasAlpha(): boolean {
		return this.a !== 1;
	}

	static hasAlpha(color: string): boolean {
		return new Color(color).hasAlpha;
	}

	private parse() {
		if (this.isValid) {
			if (this.isHEX) {
				this.parseHEX();
			} else if (this.isRGB) {
				this.parseRGB();
			} else if (this.isHSL) {
				this.parseHSL();
			} else if (this.isHWB) {
				this.parseHWB();
			}
		}
	}

	private parseHEX() {
		const [, ...value] = this.initialValue;

		if (value.length === 3) {
			this.r = parseInt(value[0]);
			this.g = parseInt(value[1]);
			this.b = parseInt(value[2]);
		} else if (value.length === 6) {
			['r', 'g', 'b'].forEach(hexSegmentParser.apply(this, value));
		} else if (value.length === 8) {
			['r', 'g', 'b', 'a'].forEach(hexSegmentParser.apply(this, value));
		}
	}

	private parseRGB(color?: Array<number>) {
		const [r, g, b, a = 0] = color ?? this.initialValue.replace(regex.rgb.parser, '').split(',').map(parseFloat);

		this.r = clamp(r, 0, 255);
		this.g = clamp(g, 0, 255);
		this.b = clamp(b, 0, 255);

		if (a) {
			this.a = clamp(a);
		}
	}

	private parseHSL(color?: Array<number>) {
		let [h, s, l, a = 0] = color ?? this.initialValue.replace(regex.hsl.parser, '').split(',').map(parseFloat);

		h = h % 360;

		if (h < 0) {
			h += 360;
		}

		s /= 100;
		l /= 100;

		function hsl2rgb(n: number) {
			let k = (n + h / 30) % 12;
			let a = s * Math.min(l, 1 - l);
			return Math.round(clamp(l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
		}

		this.r = hsl2rgb(0);
		this.g = hsl2rgb(8);
		this.b = hsl2rgb(4);

		if (a) {
			this.a = clamp(a);
		}
	}

	private parseHWB(color?: Array<number>) {
		let [h, w, b, a = 0] = color ?? this.initialValue.replace(regex.hwb.parser, ',').split(',').filter(Boolean).map(parseFloat);

		w /= 100;
		b /= 100;

		if (w + b >= 1) {
			const g = w / (w + b);
			this.r = this.g = this.b = clamp(g, 0, 255);

			if (a) {
				this.a = clamp(a);
			}
		} else {
			this.parseHSL([h, 100, 50, a]);

			(['r', 'g', 'b'] as Array<RGBA>).forEach((key) => {
				this[key] = Math.round((this[key] / 255) * (1 - w - b) * 255);
				this[key] = Math.round((this[key] / 255 + w) * 255);
			});
		}
	}

	toHex(): Array<string> {
		return [segmentToHex(this.r), segmentToHex(this.g), segmentToHex(this.b), segmentToHex(this.a)];
	}

	toHexString(forceAlpha?: boolean) {
		const [r, g, b, a] = this.toHex();

		if (forceAlpha || this.a !== 1) {
			return '#'.concat(r, g, b, a);
		}

		return '#'.concat(r, g, b);
	}

	toRgbString(forceAlpha?: boolean) {
		if (forceAlpha || this.a !== 1) {
			return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
		}

		return `rgb(${this.r}, ${this.g}, ${this.b})`;
	}

	toHslString(forceAlpha?: boolean) {
		const [h, s, l] = rgbToHsl(this.r / 255, this.g / 255, this.b / 255);

		if (forceAlpha || this.a !== 1) {
			return `hsla(${h}, ${s}%, ${l}%, ${this.a})`;
		}

		return `hsl(${h}, ${s}%, ${l}%)`;
	}

	toHwbString(forceAlpha?: boolean) {
		const [h, w, b] = rgbToHwb(this.r / 255, this.g / 255, this.b / 255);

		if (forceAlpha || this.a !== 1) {
			return `hwb(${h} ${w}% ${b}% / ${this.a})`;
		}

		return `hsl(${h} ${w}% ${b}%)`;
	}

	toString() {
		return this.toHexString();
	}

	[Symbol.toPrimitive](hint: string) {
		switch (hint) {
			case 'default':
			case 'string':
				return this.toString();
		}
	}
}

export default Color;
