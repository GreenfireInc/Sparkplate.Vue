const express = require('express')
const axios = require('axios')
const path = require('path')

const app = express()

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')))

// Handle requests for CoinMarketCap
app.use('/coinmarketcap', async (req, res) => {
  try {
    const response = await axios.get('https://coinmarketcap.com/')
    res.send(response.data)
  } catch (error) {
    console.error(error)
    console.log('CoinMarketCap Error')
    res.status(500).send('Internal Server Error')
  }
})

// Handle requests for Decentraland
app.use('/decentraland', async (req, res) => {
  try {
    const response = await axios.get('https://decentraland.org/')
    res.send(response.data)
  } catch (error) {
    console.error(error)
    console.log('Decentraland Error')
    res.status(500).send('Internal Server Error')
  }
})

// Serve CSS files explicitly
app.get('/*.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.url))
})

const port = 3400
app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`)
})
