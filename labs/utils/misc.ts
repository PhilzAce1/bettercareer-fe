import { APP_URL } from '@lib/config';

function getRandomBytes(byteCount: number): Uint8Array {
	let randomBytes = new Uint8Array(byteCount);
	if (
		typeof crypto !== 'undefined' &&
		typeof crypto.getRandomValues === 'function'
	) {
		randomBytes = crypto.getRandomValues(new Uint8Array(byteCount));
	} else {
		// Fallback to Math.random()
		for (let i = 0; i < byteCount; i++) {
			randomBytes[i] = Math.floor(Math.random() * 256);
		}
	}
	return randomBytes;
}

/**
 * The function `generateUUIDv4` generates a Version 4 UUID (Universally Unique Identifier) in
 * TypeScript.
 * @returns The function `generateUUIDv4()` returns a randomly generated UUID (Universally Unique
 * Identifier) in version 4 format.
 */

export function generateUUID(): string {
	const randomBytes = getRandomBytes(16);

	randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // Version 4
	randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // Variant 10xx

	let uuid = 'bc-';
	for (let i = 0; i < 16; i++) {
		if (i === 4 || i === 6 || i === 8 || i === 10) {
			uuid += '-';
		}
		uuid += randomBytes[i].toString(16).padStart(2, '0');
	}

	return uuid;
}

export const getSSRCssRules = (): string[] => {
	if (
		typeof (global as any) !== 'undefined' &&
		(global as any).__NEXT_SSR_CSS_RULES__
	) {
		return (global as any).__NEXT_SSR_CSS_RULES__;
	}

	return [];
};

export function openPopupWindow(
	url = '',
	{ name = '', width = 600, height = 400 } = {}
) {
	const left = window.innerWidth / 2 - width / 2;
	const top = window.innerHeight / 2 - height / 2;
	const options = {
		toolbar: 'no',
		location: 'no',
		directories: 'no',
		status: 'no',
		menubar: 'no',
		scrollbars: 'no',
		resizable: 'no',
		copyhistory: 'no',
		width,
		height,
		top,
		left,
	};
	const optionsString = Object.entries(options)
		.map(([key, value]) => `${key}=${value}`)
		.join(',');

	return window.open(url, name, optionsString);
}

export async function getLocationFromPopup(popup: {
	location: Location;
	closed: boolean | undefined;
	close: () => void;
}): Promise<any> {
	return new Promise((resolve, reject) => {
		let timer: number | undefined;

		function getLocation() {
			if (!popup || popup.closed || typeof popup.closed === 'undefined') {
				clearTimeout(timer!);
				reject(new Error('Popup closed'));
				return;
			}

			try {
				const { hostname } = popup.location;
				const anchor = document.createElement('a');
				anchor.href = APP_URL as string;

				const hostnameSearch = anchor.hostname;

				if (hostname.includes(hostnameSearch)) {
					clearTimeout(timer!);
					popup.close();
					resolve(popup.location);
					return;
				}
			} catch (error) {
				// Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
				// A hack to get around same-origin security policy errors in IE.
			}

			timer = window.setTimeout(getLocation, 500);
		}

		getLocation();
	});
}

/**
 * Scale bytes to its proper byte format
 * e.g:
 *
 *   1253656 => '1.20MB'
 *
 *   1253656678 => '1.17GB'
 * @param b The size in bytes.
 * @param factor The factor to divide by.
 * @param suffix The suffix to add to the end.
 */
export function getSizeFormat(
	b: number,
	factor: number = 1024,
	suffix: string = 'B'
): string {
	const units: string[] = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z'];

	for (const unit of units) {
		if (b < factor) {
			return `${b.toFixed(2)}${unit}${suffix}`;
		}
		b /= factor;
	}

	return `${b.toFixed(2)}Y${suffix}`;
}
