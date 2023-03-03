const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { join } = require('path')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    if (pathname === '/api/upload') {
      upload.single('image')(req, res, err => {
        if (err) {
          return res.status(400).send(err.message)
        }

        const { path, filename } = req.file
        const newPath = join(__dirname, 'public', filename)

        fs.rename(path, newPath, err => {
          if (err) {
            return res.status(400).send(err.message)
          }

          return res.json({ url: `/static/${filename}` })
        })
      })
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(PORT, err => {
    if (err) {
      throw err
    }

    console.log(`> Ready on http://localhost:${PORT}`)
  })
})
