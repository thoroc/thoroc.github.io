export const reportFetchProgress = (
  page: number,
  count: number,
  { done = false }: { done?: boolean } = {},
): void => {
  const msg = done
    ? `Fetched ${count} starred repos`
    : `Fetching page ${page}… (${count} so far)`
  console.log(msg)
}
