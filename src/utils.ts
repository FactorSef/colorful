import type Color from './index';

export function isNil<T>(value: T): boolean {
	return value === null || value === undefined || typeof value === 'undefined';
}

export function hexSegmentParser(this: Color, ...value: string[]) {
	return (key: string, index: number): void => {
		let parsedValue = parseInt([value[index * 2], value[index * 2 + 1]].join(''), 16);

		if (key === 'a') {
			parsedValue = parseFloat((Math.round((parsedValue / 255) * 1000) / 1000).toFixed(3));
		}

		this[key as 'r' | 'g' | 'b' | 'a'] = parsedValue;
	};
}

export function segmentToHex(segment: number): string {
	const hex = segment.toString(16);

	return hex.length === 1 ? `0${hex}` : hex;
}

export function clamp(value: number, min: number = 0, max: number = 1): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * @param red - Red component 0..1
 * @param green - Green component 0..1
 * @param blue - Blue component 0..1
 * @return Array of HSL values: Hue as degrees 0..360, Saturation and Lightness as percentages 0..100
 */
export function rgbToHsl(red: number, green: number, blue: number): Array<number> {
	let max = Math.max(red, green, blue);
	let min = Math.min(red, green, blue);
	let [hue, sat, light] = [NaN, 0, (min + max) / 2];
	let d = max - min;

	if (d !== 0) {
		sat = light === 0 || light === 1 ? 0 : (max - light) / Math.min(light, 1 - light);

		switch (max) {
			case red:
				hue = (green - blue) / d + (green < blue ? 6 : 0);
				break;
			case green:
				hue = (blue - red) / d + 2;
				break;
			case blue:
				hue = (red - green) / d + 4;
		}

		hue = hue * 60;
	}

	return [Math.round(hue), Math.round(sat * 100), Math.round(light * 100)];
}

/**
 * @param red - Red component 0..1
 * @param green - Green component 0..1
 * @param blue - Blue component 0..1
 * @return Array of HWB values: Hue as degrees 0..360, Whiteness and Blackness as percentages 0..100
 */
export function rgbToHwb(red: number, green: number, blue: number): Array<number> {
	const hsl = rgbToHsl(red, green, blue);
	const white = Math.round(Math.min(red, green, blue));
	const black = Math.round(1 - Math.max(red, green, blue));
	return [hsl[0], white * 100, black * 100];
}
