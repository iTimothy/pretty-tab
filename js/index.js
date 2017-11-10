Element.prototype.on = Element.prototype.addEventListener
const $ = selector => document.querySelector(selector) || null;
const log = {
    i: console.log,
    e: console.error,
    w: console.warn
}
Element.prototype.addClass = function(classStr){

    if (this.classList.contains(classStr)) {
        return true
    }
    this.classList.add(classStr)
}

Element.prototype.removeClass = function(classStr) {
    this.classList.contains(classStr) && this.classList.remove(classStr)
}
Element.prototype.hasClass = function(classStr) {
    return this.classList.contains(classStr)
}
let merge = function(target) {
    for (var i = 1, j = arguments.length; i < j; i++) {
        var source = arguments[i];
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                var value = source[prop];
                if (value !== undefined) {
                    target[prop] = value;
                }
            }
        }
    }
    return target;
};

class Modal {
    constructor(option) {
        let opt = {
            type: 0,
            title: 'Message',
            btnTxt: 'OK',
            msg: '',
            time: 0
        }
        this.modal = null
        merge(opt, option)
        this.opt = opt
        this.init(opt)
    }
    init(opt) {
        let modal = this.modal = document.createElement('div')
        let that = this
        modal.className = 'modal'
        this.timer && clearTimeout(this.timer)
        let addWebsiteItem = `
            <p class="input_wrap">
                <input type="text" placeholder="Website Name" name="websiteName">
            </p>
            <p class="input_wrap">
                <input type="text" placeholder="Website Url" name="websiteUrl">
            </p>
            <p class="input_wrap">
                <input type="text" placeholder="Website Icon" name="websiteIcon">
            </p>
            <p class="input_wrap">
                <input type="text" placeholder="Website Icon background, E.g: #eeeeee" name="websiteBg">
            </p>
        `
        let addFrameItem = `
            <p class="input_wrap frame_input_wrap">
                <input type="text" placeholder="Website Url" name="iframeUrl">
            </p>
        `
        let inner = `<div class="inner">
            <div class="title">${opt.title}</div>
            <span class="delete" data-action="modal_close"></span>
            <div class="content">
                ${opt.type === 0 ? opt.msg : opt.type === 1 ? addWebsiteItem : addFrameItem}
            </div>
            <div class="footer_place"></div>
            <div class="footer">
                <button class="btn" data-action="modal_btn">${opt.btnTxt}</button>
            </div>
        </div>`
        modal.innerHTML = inner
        document.body.appendChild(modal)
        opt.mounted && opt.mounted(modal)

        if (opt.time !== 0) {
            this.timer = setTimeout(e => {
                that.close()
            }, opt.time * 1e3)
        }

        modal.on('click', e => {
            let target = e.target
            let action = target.getAttribute('data-action')
            if (action === 'modal_close') {
                that.close()
            } else if (action === 'modal_btn') {
                let flag = opt.callback && opt.callback(modal);
                !flag && (that.close())
            }
        }, !1)
    }
    close() {
        this.modal.addClass('move-out')
        this.opt.destroy && this.opt.destroy()
        this.modal.on('animationend', e => {
            document.body.removeChild(this.modal)
        }, false)
    }
}
let createWebItem = function(dataArray) {
    let html = '';
    if (dataArray.length === 0) {
        return html;
    }
    dataArray.forEach(item => {
        html += `<li draggable="true" data-name="${item.name}">
                    <a href="${item.url}" target="${item.target ||  '_self'}">
                        <span class="icon" style="background-color:${item.bgc || '#fff'}">
                            <img src="${item.icon || 'asset/Website.png'}">
                        </span>
                        <p class="name">${item.name}</p>
                    </a>
                    <span class="delete" data-name="${item.name}"></span>
                    <span class="edit" data-name="${item.name}"></span>
                </li>`
    });
    return html;
}
let createFrameItem = function(dataArray) {
    let html = '';
    if (dataArray.length === 0) {
        return html;
    }
    dataArray.forEach(item => {
        html += `<div class="cell">
                    <span class="delete" data-url="${item}"></span>
                    <iframe src="${item}" frameborder="0"></iframe>
                </div>`
    });
    return html;
}

let inArray = (valObj, array) => {
    let ret = -1;
    if (typeof valObj === 'string') {
        array.forEach((item, index) => {
            if (valObj === item) {
                ret = index
            }
        })

    } else {
        let key = Object.keys(valObj)[0]
        let val = valObj[key]
        array.forEach((item, index) => {
            if (val === item[key]) {
                ret = index
            }
        })
    }
    return ret
}
class Verify {
    constructor() {
        this.cache = [];
        this.strategy = {
            text(val, errMsg) {
                if (!val || /^\s+$/g.test(val)) {
                    return errMsg;
                }
            }
        };
    };
    add(el, rule, errMsg) {
        this.cache.push(() => {
            return this.strategy[rule].apply(el, [el.value, errMsg]);
        });
    };
    startVerify() {
        var index = 0;
        while (index < this.cache.length) {
            var errMsg = this.cache[index++]();
            if (errMsg) return errMsg;
        }
    }
}

var store = {
    websites: [],
    frames: [],
    engineIndex: 1
};
var globalStore = {
    activeIndex: -1,
    GOOGLEKEY: 'AIzaSyBmP5d8cdLy8h57J4UZ4dhoTJ6dQW9wFbA',
    GOOGLECX: '005241945962570121590:4mjv7mmifku'
}
var engine = ['https://www.google.com.hk/search?q=', 'https://www.baidu.com/s?wd=', 'http://www.bing.com/search?q=', 'http://duckduckgo.com/?q=']

let websiteList = $('#websiteList')
let frameList = $('#frameList')
let searchBtns = $('#searchBtns')
let searchInput = $('#searchInput')
let wrapper = $('.wrapper')
let menuDoms = {
    closeMenu: $('#closeMenu'),
    menuList: $('#menuList'),
    menuContent: $('#menuContent'),
    menuBtn: $('#menuBtn'),
    menu: $('#menu')
}
let Action = {
    menuActive: false,
    preMenuActiveItem: null,
    menuContentActive: false
}
let menuContentList = {
    topSitesList: $('#topSitesList'),
    historyList: $('#historyList'),
    appList: $('#appList')
}
let searchList = $('#searchList')

chrome.storage.sync.get('tabStore', function(data) {
    if (data.tabStore) {
        merge(store, data.tabStore || {})
        websiteList.innerHTML = createWebItem(store.websites.reverse());
        if (store.frames) {
            frameList.innerHTML = createFrameItem(store.frames)
        }
        engineSelect.children[store.engineIndex].selected = true
    }
})
let engineSelect = $('#engine')
engineSelect.on('change', e => {
    store.engineIndex = e.target.value
    chrome.storage.sync.set({
        tabStore: store
    })
})

searchBtns.on('click', e => {
    let target = e.target
    if (target.nodeName.toLowerCase() === 'button') {
        location.replace(`${target.getAttribute('data-url')}${searchInput.value}`);
    }
}, !1)

searchInput.on('keydown', e => {
    let childs = searchList.childNodes
    if (e.keyCode == 13) {
        if (childs[globalStore.activeIndex] && childs[globalStore.activeIndex].dataset.key) {
            return location.replace(`${engine[~~store.engineIndex]}${childs[globalStore.activeIndex].dataset.key}`)
        }
        location.replace(`${engine[~~store.engineIndex]}${searchInput.value}`)
    }
    if (e.keyCode == 40) {
        //DOWN
        if (globalStore.activeIndex >= childs.length - 1) return
        if (childs.length > 0) {
            if (globalStore.activeIndex > -1) {
                childs[globalStore.activeIndex].removeClass('active')
                    ++globalStore.activeIndex;
                childs[globalStore.activeIndex].addClass('active')
                searchInput.value = childs[globalStore.activeIndex].dataset.key
            } else {
                globalStore.activeIndex = 0;
                childs[globalStore.activeIndex].addClass('active')
                searchInput.value = childs[globalStore.activeIndex].dataset.key
            }
        } else {
            globalStore.activeIndex = -1
        }

    }
    if (e.keyCode == 38) {
        //UP
        if (globalStore.activeIndex <= 0) return
        if (childs.length > 0) {
            if (globalStore.activeIndex > -1) {
                childs[globalStore.activeIndex].removeClass('active')
                    --globalStore.activeIndex;
                childs[globalStore.activeIndex].addClass('active')
                searchInput.value = childs[globalStore.activeIndex].dataset.key
            }
        } else {
            globalStore.activeIndex = -1
        }
    }
}, !1)
let createSearchList = function(data) {
    if (data.length == 0) {
        searchList.removeClass('show')
    } else {
        searchList.addClass('show')
    }
    let html = ''
    let type = ['google', 'baidu', 'bing', 'duck']

    let hrefHandle = (engineIndex, item) => {
        if (engineIndex == 0) {
            return item.link
        } else {
            return `${engine[engineIndex]}${item}`
        }

    }

    data.forEach(item => {
        html += `<li data-type="${type[store.engineIndex]}" data-key="${item.title || item}"><a href="${hrefHandle(store.engineIndex,item)}" >${item.title || item}</a></li>`
    })
    searchList.innerHTML = html
}
var throttle = null;

function handleInput() {
    globalStore.activeIndex = -1;
    let val = this.value
    if (!val || throttle) {
        return searchList.removeClass('show')
    }
    throttle = setTimeout(_ => {
        let queue = []
        if (store.engineIndex == 0) {
            queue = [new Promise(resolve => {
                fetch(`https://www.googleapis.com/customsearch/v1?key=${globalStore.GOOGLEKEY}&cx=${globalStore.GOOGLECX}&q=${val}`, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(res => {
                        res.json().then(ret => resolve(ret.items))
                    })
            })]
        } else if (store.engineIndex == 2) {
            queue = [new Promise(resolve => {
                fetch(`http://cn.bing.com/AS/Suggestions?pt=page.serp&bq=l&mkt=zh-cn&qry=${val}&cp=6&cvid=C9317AADF02F48D6AF6B9DE66174A425`, {
                        mode: 'cors',
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(res => res.text())
                    .then(res => {
                        res = res.match(/(?:query=")([\S]*)(?:")/gi)
                        let ret = []
                        res.forEach((element, index) => {
                            element = element.slice(7, element.length - 1)
                            ret.push(element)
                        });
                        resolve(ret)
                    })
            })]
        } else {
            queue = [new Promise(resolve => {
                fetch(`https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=${val}&json=1&p=3&sid=1436_21096_23384_24393&req=2&csor=0&pwd=${val}`, {
                        mode: 'cors',
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(res => res.blob())
                    .then(blob => {
                        let reader = new FileReader;
                        reader.onload = (e) => {
                            let text = reader.result;
                            text = text.replace('window.baidu.sug(', '')
                            text = text.slice(0, text.length - 2)
                            let ret = JSON.parse(text)
                            resolve(ret.s)

                        }
                        reader.readAsText(blob, 'GBK')
                    })
            })]
        }

        Promise.all(queue).then((ret) => {
                clearTimeout(throttle)
                throttle = null;
                createSearchList([...ret[0]])
                if (!searchInput.value) {
                    searchList.removeClass('show')
                    searchList.innerHTML = ''
                }
            })
            .catch(err => {
                log.i(`getSuggest: ${err}`)
            })

    }, 300);

}

let event = new Event('handleInput')
searchInput.on('handleInput', handleInput, !1)

searchInput.on('input', function() {
    this.dispatchEvent(event)
})
searchInput.on('focus', function() {
    this.dispatchEvent(event)
})
searchInput.on('dblclick',function(){
    location.replace(`${engine[~~store.engineIndex]}${searchInput.value}`);
},!1)

let addAEditWebsite = (target, dataObj, arrIndex, cb) => {

    new Modal({
        type: 1,
        title: 'add website',
        mounted(modalIns) {
            let inputs = modalIns.getElementsByTagName('input')
            let websiteName = inputs[0]
            let websiteUrl = inputs[1]
            let websiteIcon = inputs[2]
            let websiteIconBg = inputs[3]
            if (dataObj !== null) {
                websiteName.readOnly = true
                websiteName.value = dataObj.name
                websiteUrl.value = dataObj.url
                websiteIcon.value = dataObj.icon || ''
                websiteIconBg.value = dataObj.bgc || ''
            }
        },
        callback(modalIns) {
            let inputs = modalIns.getElementsByTagName('input')
            let websiteName = inputs[0]
            let websiteUrl = inputs[1]
            let websiteIcon = inputs[2]
            let websiteIconBg = inputs[3]
            let verify = new Verify;
            verify.add(websiteName, 'text', 'error');
            verify.add(websiteUrl, 'text', 'error');
            if (verify.startVerify()) {
                return true
            }
            let data = {
                name: websiteName.value.trim(),
                icon: websiteIcon.value.trim() || null,
                url: websiteUrl.value.trim(),
                bgc: websiteIconBg.value.trim() || null
            }
            if (inArray({
                    name: websiteName.value
                }, store.websites) === -1) {
                store.websites.push(data)
                chrome.storage.sync.set({
                    tabStore: store
                })
                websiteList.innerHTML += createWebItem([data])
            } else {
                store.websites[arrIndex] = data
                let liNode = target.parentNode
                liNode.getElementsByTagName('a')[0].href = data.url
                liNode.getElementsByClassName('name')[0].href = data.name
                liNode.getElementsByTagName('img')[0].src = data.icon || 'asset/Website.png'
                liNode.getElementsByClassName('icon')[0].style.backgroundColor = data.bgc || '#fff'
                chrome.storage.sync.set({
                    tabStore: store
                })
            }

        },
        destroy() {
            cb && cb()
        }
    })
}

let editWebsiteFlag = false
websiteList.on('click', e => {
    let target = e.target
    if (target.className === 'delete') {
        let name = target.getAttribute('data-name')
        let arrIndex = inArray({
            name: name
        }, store.websites)
        store.websites.splice(arrIndex, 1)
        target.parentNode.remove()
        chrome.storage.sync.set({
            tabStore: store
        })
    } else if (target.className === 'edit') {
        if (editWebsiteFlag) return
        editWebsiteFlag = true
        let name = target.getAttribute('data-name')
        let arrIndex = inArray({
            name: name
        }, store.websites)
        let dataObj = store.websites[arrIndex]
        addAEditWebsite(target, dataObj, arrIndex, () => editWebsiteFlag = false)
    }
}, !1)

let addWebsiteBtn = $('#addWebsiteBtn')

let addWebsiteFlag = false
addWebsiteBtn.on('click', e => {
    if (addWebsiteFlag) return
    addWebsiteFlag = true
    addAEditWebsite(null, null, null, () => addWebsiteFlag = false)
}, !1)

let addFrameBtn = $('#addFrameBtn')

let addFrameFlag = false
addFrameBtn.on('click', e => {
    if (addFrameFlag) return
    addFrameFlag = true
    let modal = new Modal({
        type: 2,
        title: 'add website frame',
        callback(modalIns) {
            let inputs = modalIns.getElementsByTagName('input')
            let websiteUrl = inputs[0]
            let verify = new Verify;
            verify.add(websiteUrl, 'text', 'error');
            if (verify.startVerify()) {
                return true
            }

            !store.frames && (store.frames = [])

            if (store.frames.indexOf(websiteUrl.value.trim()) === -1) {
                store.frames.push(websiteUrl.value.trim())
                chrome.storage.sync.set({
                    tabStore: store
                })
                frameList.innerHTML += createFrameItem([websiteUrl.value.trim()])
            }

        },
        destroy() {
            addFrameFlag = false
        }
    })
}, !1)
frameList.on('click', e => {
    let target = e.target
    if (target.className == 'delete') {
        let url = target.getAttribute('data-url')
        let index = store.frames.indexOf(url)
        store.frames.splice(index, 1)
        target.parentNode.remove()
        chrome.storage.sync.set({
            tabStore: store
        })
    }
}, !1)

function createDataItem(ret, warpperDom) {
    if (ret.length == 0) {
        warpperDom.innerHTML = `<li class="empty">无记录</li>`
    } else {
        let html = ''
        ret.forEach(item => {
            if (item.title) {
                html += `<li><a href="${item.url}" title="${item.title}">${item.title}</a></li>`
            }
        })
        warpperDom.innerHTML = html
    }
}
let getHistory = (historyList, opt) => {
    chrome.history.search(opt, ret => {
        createDataItem(ret, historyList)
    })
}
let getTopSites = topSitesList => {
    chrome.topSites.get(ret => {
        createDataItem(ret, topSitesList)
    })
}
let getApps = (appList) => {
    chrome.management.getAll(ret => {
        if (ret.length == 0) {
            appList.innerHTML = `<li class="empty">无数据</li>`
        } else {
            let html = ''
            ret.forEach(item => {
                if (item.type === 'packaged_app') {
                    html += `<li data-id="${item.id}">
                                <p class="img_wrap">
                                    <img src="${item.icons.pop().url}">
                                </p>
                                <p class="name">${item.name}</p>
                            </li>`
                }
            })
            appList.innerHTML = html
        }

    })
}
let clearMenuDetail = _ => {
    let menuDeatilList = menuDoms.menuContent.getElementsByClassName('menu_detail_item')
    Array.prototype.slice.call(menuDeatilList).forEach(item => {
        item.innerHTML = '';
    })
}

menuDoms.menuBtn.on('click', function() {
    if (Action.menuActive) {
        this.removeClass('active')
        menuDoms.menuContentActive = false
        menuDoms.menuContent.removeClass('active')
        menuDoms.menu.removeClass('active')
        Action.menuActive = false
        Action.menuContentActive = false
        wrapper.removeClass('step1')
        wrapper.removeClass('step2')
    } else {
        this.addClass('active')
        Action.menuActive = true
        menuDoms.menu.addClass('active')
        wrapper.addClass('step1')
    }

}, !1)
menuDoms.menuList.on('click', e => {
    let target = e.target
    let action = target.getAttribute('data-action')
    if (Action.preMenuActiveItem) {
        Action.preMenuActiveItem.removeClass('active')
    }
    Action.preMenuActiveItem = target

    target.addClass('active')


    wrapper.addClass('step2')

    if (!Action.menuContentActive) {
        menuDoms.menuContent.addClass('active')
        Action.menuContentActive = true
    }
    clearMenuDetail()
    switch (action) {
        case 'history':
            getHistory(menuContentList.historyList, {
                text: '',
                maxResults: 20
            })
            break
        case 'topSites':
            getTopSites(menuContentList.topSitesList)
            break
        case 'app':
            getApps(menuContentList.appList)
            break
    }

}, !1)

menuDoms.closeMenu.on('click', e => {
    if (Action.menuContentActive) {
        clearMenuDetail()
        menuDoms.menuContent.removeClass('active')
        wrapper.removeClass('step2')
        Action.menuContentActive = false
    } else {
        if (Action.preMenuActiveItem) {
            Action.preMenuActiveItem.removeClass('active')
            Action.preMenuActiveItem = null
        }
        menuDoms.menu.removeClass('active')
        menuDoms.menuBtn.removeClass('active')
        wrapper.removeClass('step1')
        Action.menuActive = false
    }

}, !1)
menuDoms.menuContent.on('transitionend', e => {
    if (e.propertyName === 'left' && !Action.menuContentActive && Action.preMenuActiveItem) {
        Action.preMenuActiveItem.removeClass('active')
        Action.preMenuActiveItem = null
    }
}, !1)

menuContentList.appList.on('click', function(e) {
    let path = e.path || e.composedPath()
    path.forEach(item => {
        if (item.nodeType && item.nodeName.toLowerCase() === 'li' && item.getAttribute('data-id')) {
            chrome.management.launchApp(item.getAttribute('data-id'))
        }
    })
}, !1)
document.body.on('click', e => {
    if (searchList.hasClass('show') && e.target.id != 'searchInput') {
        searchList.removeClass('show')
    }
}, !1)
