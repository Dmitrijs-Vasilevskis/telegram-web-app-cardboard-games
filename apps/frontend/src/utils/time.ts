export function getRemainingSeconds(targetAt: number) {
    return Math.max(0, Math.ceil((targetAt - Date.now()) / 1000));
}