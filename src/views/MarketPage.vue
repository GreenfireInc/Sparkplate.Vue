<template>
  <!-- This is the HTML section of Market.vue file -->
  <div>
    <!-- Defining the heading content and its className -->
    <h1 class="coinTitle">Coin Market Cap Website</h1>
    <div class="coinWeb">
      <iframe width="100%" :src="frame1.url"></iframe>
    </div>
  </div>
</template>

<script>
// export default {
//     data() {
//         return {
//             name: 'MarketPage',
//             message: 'Coin Market Cap Website',
//             frame1: { url: 'https://coinmarketcap.com/' }
//         };
//     }
// };
const { app, BrowserWindow, BrowserView } = require('electron')

app.on('ready', () => {
  const mainWindow = new BrowserWindow({ width: 800, height: 600 })

  const view = new BrowserView()
  mainWindow.setBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: 800, height: 600 })
  view.webContents.loadURL('https://coinmarketcap.com/')

  mainWindow.show()
})
</script>

<style>
/* This is the CSS section of Market.vue file  */
h1.coinTitle {
  color: chocolate;
}
</style>
