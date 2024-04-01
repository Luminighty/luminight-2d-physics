export function IdGenerator() {
	let id = 0;
	return () => id++;
}
