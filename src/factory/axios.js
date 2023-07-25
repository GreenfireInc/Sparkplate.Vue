import axios from 'axios'

axios.create({
  baseURL: 'https://cv-cors-fix.herokuapp.com/',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  },
  retry: true
})

export default axios
