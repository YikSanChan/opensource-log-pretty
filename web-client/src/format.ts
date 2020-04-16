export function formatUnixEpochSecond(unixEpochSecond: number) {
  return new Date(unixEpochSecond * 1000).toLocaleDateString();
}
