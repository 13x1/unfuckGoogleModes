// ==UserScript==
// @name         unfuck google modes
// @namespace    http://tampermonkey.net/
// @version      2024-02-25
// @description  disables those dynamic suggestions
// @author       13x1
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

if (location.hostname.startsWith("www.google.") && location.pathname === "/search") {
    // manually add new ones here!
    // use `url` to set the base url or any other string to set a query parameter
    let modes = {
        Search: {tbm: ""},
        News: {tbm: "nws"},
        Images: {tbm: "isch"},
        Videos: {tbm: "vid"},
        Books: {tbm: "bks"},
        Shopping: {tbm: "shop"},
        Scholar: {url: "https://scholar.google.com/scholar"},
        Maps: {url: "https://www.google.com/maps"},
        Finance: {url: "https://www.google.com/finance"},
        // examples:
        DuckDuckGo: {url: "https://duckduckgo.com/"},
        "Disable Personalization": {pws: "0"},
    }

    // customize which ones you want here
    let items = ["Search", "Images", "Videos", "News", "Books", "Shopping", "Scholar", "Maps", "Finance"]

    let main = () => {
        let target = document.querySelector('.main [role=navigation] [role=navigation]') || // regular search
            document.querySelector('h1:has(+a)')?.parentElement || // images
            document.querySelector('.main [role=navigation] style + style + div') // books
        if (target.innerHTML.indexOf("<!-- replaced -->") >= 0) return;
        target.style = "height: 100%; display: flex; align-items: center;"
        let html = "<!-- replaced -->" + items
            .map(name => {
                let mode = modes[name] || alert(`mode ${name} not found!`)
                let newLink = new URL(mode.url || location)
                newLink.searchParams.set("q", new URL(location).searchParams.get('q'))
                Object.entries(mode).map(([key, value]) => {
                    if (["url"].includes(key)) return
                    newLink.searchParams.set(key, value)
                })
                return `<a href="${newLink}">${name}${mode.url ? " ↗" : ""}</a>`
            }).join("&nbsp;&nbsp;")
        console.log(target.innerHTML, html)
        try {
            target.innerHTML = trustedTypes.createPolicy("forceInner", {createHTML: e => e}).createHTML(html)
        } catch(e) {
            console.error(e)
            target.innerHTML = html
        }
    }
    setInterval(main, 100);
}

