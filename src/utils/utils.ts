export function deleteUndefied(obj: object): object {
	const keys = Object.keys(obj);
	for (const key of keys) {
		if (obj[key] === undefined) {
			delete obj[key];
		}
	}
	return obj;
}

export function deleteNullOrUndefied(obj: object): object {
	const keys = Object.keys(obj);
	for (const key of keys) {
		if (obj[key] === undefined || obj[key] === null) {
			delete obj[key];
		}
	}
	return obj;
}
