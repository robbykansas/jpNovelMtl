let LocalStorage = require('node-localstorage').LocalStorage
let localStorage = new LocalStorage('./storage')

class LocalStorageRepositories {
  setNovelPages({ url, data }) {
    localStorage.setItem(`${url}`, JSON.stringify(data))
  }

  async getNovelPages({ url }) {
    return JSON.parse(localStorage.getItem(`${url}`))
  }

  async updateNovelPages({ url, list }) {
    const data = {
      url,
      list
    }

    this.setNovelPages({ url, data})
  }

  async createNovelPages({ url, list }) {
    const data = {
      url,
      list
    }

    this.setNovelPages({ url, data})
  }
}

module.exports = LocalStorageRepositories