export function useDebounce<Args extends unknown[]>(
    fn: (...args: Args) => void,
    delay: number
) {
    let timeoutID: ReturnType<typeof setTimeout> | undefined;

    function debounced(...args: Args) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => fn(...args), delay);
    }

    return debounced;
}
