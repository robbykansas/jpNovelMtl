const puppeteer = require('puppeteer');
const translate = require('@iamtraction/google-translate');
const epub = require('epub-gen')
const { 
  LocalStorageRepositories,
  WlnUpdatesRepositories
} = require('../repositories')

class SyosetuPageService {
  constructor() {
    this.localStorageRepositories = new LocalStorageRepositories();
    this.wlnUpdatesRepositories = new WlnUpdatesRepositories();
  }

  /**
   * Get List of novel from syosetu with data scraping
   * @param {string} url 
   * @returns {object} - returns object with array list included
   */
  async getList(url) {
    /**
     * set browser with:
     * headless: "new" for controlling chromium browser without displaying browser UI
     * userDataDir for reutilize the same browser instance: improve performance around 1000-2000 ms in getPage but takes a lot of space storage
     * executablePath for use chromium with arm64 based, and in fact, it improves performance by a lot
     */
    const browser = await puppeteer.launch({
      headless: "new",
      userDataDir: "./user-data",
      executablePath: "/opt/homebrew/bin/Chromium"
    })

    const [page] = await browser.pages();
    /**
     * waitUntil explanation
     * domcontentloaded: navigation is finished when the DOMContentLoaded event is fired.
     * load: navigation is finished when the load event is fired.
     * networkidle0: navigation is finished when there are no more than 0 network connections for at least 500 ms.
     * networkidle0 is best suited for SPA-based applications or applications that close connections when finished, such as those using fetch requests.
     * networkidle2: navigation is finished when there are no more than 2 network connections for at least 500 ms.
     * networkidle2is ideal for pages using streams or long-lived connections, like polling or background tasks involving network connections.
     * timeout: 0 means no timeout
     */
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 0});

    // page.$$: The method runs document.querySelectorAll within the page. If no elements match the selector, the return value resolves to [].
    const contents = await page.$$('.index_box .novel_sublist2');

    let list = []
    for (let content of contents) {
      // to get text inside subtitle
      let title = await content.evaluate(data => data.querySelector('.subtitle').textContent, content)
      // to get <a href> inside div subtitle
      const url = await content.evaluate(data => data.querySelector('.subtitle').querySelector('a').href)
      title = title.replace(/\r?\n|\r/g, "")
      
      list.push({title, url})
    }
    // close broser after use
    await browser.close();

    const existingList = await this.localStorageRepositories.getNovelPages({ url })
    if (!existingList) {
      await this.localStorageRepositories.createNovelPages({ url, list })
      this.getTitleEn({ url, list })
    }

    if (existingList != null && existingList.list.length != list.length) {
      const listLength = list.length
      const existingLength = existingList.list.length
      const minusArray = listLength - existingLength
      const startMinus = listLength - minusArray
      for (let i = startMinus; i < listLength; i++) {
        const { title, url } = list[i]
        const titleEn = await this.singleTitleEn(list[i].title)
        existingList.list.push({ title, url, titleEn })
      }
      
      await this.localStorageRepositories.updateNovelPages({ url, list: existingList.list })
      list = existingList
    } else {
      list = existingList
    }

    return list
  }

  /**
   * get en title from jp title in batch
   * @param {object}
   */
  async getTitleEn({ url, list }) {
    for (let content of list) {
      const { title } = content
      const titleEn = (await translate(title, {from: 'ja', to: 'en'})).text
      content.titleEn = titleEn
    }

    await this.localStorageRepositories.updateNovelPages({ url, list })
  }

  async singleTitleEn(title) {
    const titleEn = (await translate(title, {from: 'ja', to: 'en'})).text

    return titleEn
  }

  /**
   * get page reading with english MTL
   * @param {string} url 
   * @returns {object}
   */
  async getPage(url) {
    /**
     * set browser with:
     * headless: "new" for controlling chromium browser without displaying browser UI
     * userDataDir for reutilize the same browser instance: improve performance around 1000-2000 ms in getPage but takes a lot of space storage
     * executablePath for use chromium with arm64 based, and in fact, it improves performance by a lot
     */
    const browser = await puppeteer.launch({
      headless: "new",
      // userDataDir: "./user-data",
      executablePath: "/opt/homebrew/bin/Chromium"
    })
    const [page] = await browser.pages();
    /**
     * waitUntil explanation
     * domcontentloaded: navigation is finished when the DOMContentLoaded event is fired.
     * load: navigation is finished when the load event is fired.
     * networkidle0: navigation is finished when there are no more than 0 network connections for at least 500 ms.
     * networkidle0 is best suited for SPA-based applications or applications that close connections when finished, such as those using fetch requests.
     * networkidle2: navigation is finished when there are no more than 2 network connections for at least 500 ms.
     * networkidle2is ideal for pages using streams or long-lived connections, like polling or background tasks involving network connections.
     * timeout: 0 means no timeout
     */
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 0});

    let title = await page.$eval('.novel_subtitle', el => el.textContent);
    title = (await translate(title, {from: "ja", to: "en"})).text
    const honbun = await page.$eval('.novel_view', el => el.textContent);
    const honbunEn = (await translate(honbun, {from: 'ja', to: 'en'})).text

    // close browser after use
    await browser.close();
    return { title, honbunEn }
  }

  async jpGetPage(url) {
    /**
     * set browser with:
     * headless: "new" for controlling chromium browser without displaying browser UI
     * userDataDir for reutilize the same browser instance: improve performance around 1000-2000 ms in getPage but takes a lot of space storage
     * executablePath for use chromium with arm64 based, and in fact, it improves performance by a lot
     */
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/opt/homebrew/bin/Chromium"
    })
    const [page] = await browser.pages();
    /**
     * waitUntil explanation
     * domcontentloaded: navigation is finished when the DOMContentLoaded event is fired.
     * load: navigation is finished when the load event is fired.
     * networkidle0: navigation is finished when there are no more than 0 network connections for at least 500 ms.
     * networkidle0 is best suited for SPA-based applications or applications that close connections when finished, such as those using fetch requests.
     * networkidle2: navigation is finished when there are no more than 2 network connections for at least 500 ms.
     * networkidle2is ideal for pages using streams or long-lived connections, like polling or background tasks involving network connections.
     * timeout: 0 means no timeout
     */
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 0});

    const title = await page.$eval('.novel_subtitle', el => el.textContent);
    const honbun = await page.$eval('.novel_view', el => el.textContent);

    // close browser after use
    await browser.close();

    return { title, honbun }
  }

  /**
   * convert translated page as epub
   * @param {string} url which url to convert
   * @param {string} page page to convert: example 1-50, from page 1 to page 50
   * @returns {object} return success
   */
  async epubPage(url, page) {
    const { title, author } = await this.getTitleAndWriter(url)
    const titleEpub = title.replaceAll(" ", "-")
    const output = `./epub/${titleEpub}${page}.epub`
    const pageLimit = page.split('-')
    let content = [];
    for (let i = pageLimit[0]; i <= pageLimit[1]; i++) {
      const urlTarget = `${url}${i}`
      let { title, honbunEn } = await this.getPage(urlTarget)
      honbunEn = honbunEn.replaceAll("\n", "<br />")
      content.push({ title, data: honbunEn })
    }

    const options = {
      title,
      author,
      output,
      content
    }

    new epub(options).promise.then(() => console.log('Done'));

    return { success: true }
  }

  /**
   * convert translated page as epub
   * @param {string} url which url to convert
   * @param {string} page page to convert: example 1-50, from page 1 to page 50
   * @returns {object} return success
   */
  async jpEpubPage(url, page) {
    const { title, author } = await this.getTitleAndWriter(url)
    const titleEpub = title.replaceAll(" ", "-")
    const output = `./${titleEpub}${page}.epub`
    const pageLimit = page.split('-')
    let content = [];
    
    for (let i = pageLimit[0]; i <= pageLimit[1]; i++) {
      const urlTarget = `${url}${i}`
      const { title, honbun } = await this.jpGetPage(urlTarget)
      honbun = honbun.replaceAll("\n", "<br />")
      content.push({ title, data: honbun })
    }

    const options = {
      title,
      author,
      output,
      content
    }

    new epub(options).promise.then(() => console.log('Done'));

    return { success: true }
  }

  /**
   * get title and author from syosetu
   * @param {string} url url list syosetu 
   * @returns {object} return title and author
   */
  async getTitleAndWriter(url) {
    /**
     * set browser with:
     * headless: "new" for controlling chromium browser without displaying browser UI
     * userDataDir for reutilize the same browser instance: improve performance around 1000-2000 ms in getPage but takes a lot of space storage
     * executablePath for use chromium with arm64 based, and in fact, it improves performance by a lot
     */
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/opt/homebrew/bin/Chromium"
    })

    const [page] = await browser.pages();
    /**
     * waitUntil explanation
     * domcontentloaded: navigation is finished when the DOMContentLoaded event is fired.
     * load: navigation is finished when the load event is fired.
     * networkidle0: navigation is finished when there are no more than 0 network connections for at least 500 ms.
     * networkidle0 is best suited for SPA-based applications or applications that close connections when finished, such as those using fetch requests.
     * networkidle2: navigation is finished when there are no more than 2 network connections for at least 500 ms.
     * networkidle2is ideal for pages using streams or long-lived connections, like polling or background tasks involving network connections.
     * timeout: 0 means no timeout
     */
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 0});
    let title = await page.$eval('.novel_title', el => el.textContent)
    let author = await page.$eval('.novel_writername', el => el.textContent)
    title = (await translate(title, {from: "ja", to: "en"})).text
    author = (await translate(author, {from: "ja", to: "en"})).text

    await browser.close();

    return { title, author}
  }

  /**
   * get alternate title jp to use it as search syosetu
   * @param {string} title title in english 
   * @returns list of alternate title based on search
   */
  async searchNovel(title) {
    const search = await this.wlnUpdatesRepositories.searchNovel(title)
    let result = [];
    for (const data of search) {
      const { title, sid } = data
      const alternateTitle = await this.wlnUpdatesRepositories.alternateTitle({ title, sid })
      if (alternateTitle.alternateJp != "") {
        result.push(alternateTitle)
      }
    }

    return result
  }

  /**
   * 
   * @param {string} title Jp title from search novel
   * @returns 
   */
  async searchSyosetu(title) {
    const url = `https://yomou.syosetu.com/search.php?word=${title}`
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/opt/homebrew/bin/Chromium"
    })
    const [page] = await browser.pages();
    await page.goto(url, {waitUntil: 'load', timeout: 0});

    const contents = await page.$$('.c-trad-contents .searchkekka_box')

    let list = [];

    for (let content of contents) {
      let title = await content.evaluate(data => data.querySelector('.novel_h').textContent, content)
      const url = await content.evaluate(data => data.querySelector('.novel_h').querySelector('a').href)
      title = title.replace(/\r?\n|\r/g, "")

      list.push({title, url})
    }

    return list
  }
}

module.exports = SyosetuPageService