export const extractPlayerNumber = (playerName: string) => {
    const match = playerName.match(/player-(\d+)/);
    if (!match) {
        throw new Error(`Invalid player name ${playerName}`);
    }
    return parseInt(match[1]);
}