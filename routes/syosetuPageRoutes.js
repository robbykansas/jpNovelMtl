const express = require('express');
const router = express.Router();
const { SyosetuPageService } = require('../services')
const syosetuPageService = new SyosetuPageService()

router.post('/list', async (req, res) => {
  const { url } = req.body
  const result = await syosetuPageService.getList(url)

  res.send(result)
})

router.post('/page', async (req, res) => {
  const { url } = req.body
  const result = await syosetuPageService.getPage(url)

  res.send(result)
})

router.post('/epub', async (req, res) => {
  const { url, page } = req.body
  const result = await syosetuPageService.epubPage(url, page)

  res.send(result)
})

router.post('/jp-epub', async (req, res) => {
  const { url, page } = req.body
  const result = await syosetuPageService.jpEpubPage(url, page)
  res.send(result)
})

router.post('/search-title', async (req, res) => {
  const { title } = req.body
  const result = await syosetuPageService.searchNovel(title)

  res.send(result)
})

router.post('/search', async (req, res) => {
  const { title } = req.body
  const result = await syosetuPageService.searchSyosetu(title)

  res.send(result)
})
module.exports = router