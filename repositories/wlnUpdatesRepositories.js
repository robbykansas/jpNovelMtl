class WlnUpdatesRepository {
  async searchNovel(title) {
    const data = {
      title,
      mode: "search-title"
    }
    const url = "https://www.wlnupdates.com/api"
    let dataSearch = []

    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(data)
    })
    
    const search = await res.json()
    search.data.results.forEach(novel => {
      const data = {
        title: novel.match[0][1],
        sid: novel.sid
      }
      dataSearch.push(data)
    })

    return dataSearch
  }

  async alternateTitle(novel) {
    const { title, sid } = novel
    const data = {
      id: sid,
      mode: "get-series-id"
    }
    const url = "https://www.wlnupdates.com/api"

    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(data)
    })

    let alternateTitle = await res.json()
    let alternateJp = ""
    alternateTitle = alternateTitle.data.alternatenames
    alternateTitle.some(title => {
      const containsJapanese = title.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/)
      if (containsJapanese) {
        alternateJp = title
        return;
      }
    })
    
    const result = {
      title,
      sid,
      alternateJp
    }

    return result
  }
}

module.exports = WlnUpdatesRepository