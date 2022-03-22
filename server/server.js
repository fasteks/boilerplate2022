import express from 'express'
import path from 'path'
import cors from 'cors'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'

import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile } = require('fs').promises

require('colors')

let Root
try {
  // eslint-disable-next-line import/no-unresolved
  Root = require('../dist/assets/js/ssr/root.bundle').default
} catch {
  console.log('SSR not found. Please run "yarn run build:ssr"'.red)
}

let connections = []

const port = process.env.PORT || 8090
const server = express()

function setHeaders(req, res, next) {
  res.set('x-skillcrucial-user', '71cfff71-34e1-46eb-95ad-29637d913771')
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next()
}

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  express.json({ limit: '50mb', extended: true }),
  cookieParser(),
  setHeaders
]

middleware.forEach((it) => server.use(it))

const getData = () => {
  return readFile(`${__dirname}/users.json`, { encoding: 'utf8' })
    .then((users) => {
      return JSON.parse(users)
    })
    .catch(async () => {
      const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
      await writeFile(`${__dirname}/users.json`, JSON.stringify(users), { encoding: 'utf8' })
      return users
    })
}

const writeData = (file) => {
  return writeFile(`${__dirname}/users.json`, JSON.stringify(file), { encoding: 'utf8' })
}

server.get('/api/v1/users', async (req, res) => {
  const users = await getData()
  res.json(users)
})

server.post('/api/v1/users', async (req, res) => {
  const users = await getData()
  const lastItemId = users.length + 1
  const lastItem = { ...req.body, id: lastItemId }
  const usersUpdate = [...users, lastItem]
  await writeData(usersUpdate)
  res.json({ status: 'success', id: lastItemId })
})

server.patch('/api/v1/users/:userId', async (req, res) => {
  const users = await getData()
  const { userId } = req.params
  if (users.filter((it) => it.id === +userId).length === 0) {
    res.json({ status: 'Not Found', description: `There is not such id as ${userId}` })
  }
  const usersUpdate = users.map((it) => (it.id === +userId ? { ...it, ...req.body } : it))
  await writeData(usersUpdate)
  res.json({ status: 'success', id: userId })
})

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
