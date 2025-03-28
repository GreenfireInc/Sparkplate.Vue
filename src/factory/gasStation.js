export async function getGasPrices() {
  // updating to window.axios for security through IPC
  const data = await window.axios.get(
    'https://ethgasstation.info/api/ethgasAPI.json?'
  )
  return data
}
