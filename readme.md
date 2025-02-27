# 樹狀結構式的留言版基礎架構
## 架構
* `index.html`，主要檔案，整合 css 和 js 檔用
* `main.css`，樣式
* `main.js`，主要程式
* `post.json`，模擬主要留言的資料表資料
* `comment.json`，模擬回覆的資料表資料

## 主要程式
* 先用 AJAX 抓取兩支 JSON 做為視覺繪製的依據
* 用 `post` 這個變數，跑迴圈繪製主要留言的 HTML
* 同時間執行 `renderComments` 這個 function 來繪製回覆內容
* 使用事件代理，針對 `body` 註冊滑鼠點擊事件，然後再針對 `body`，`.post-title`，`.comment` 和`.btn-send`做不同的動作撰寫
  * `body`：如果在非留言或非回覆區按一下，在最上方放留言的輸入欄位
  * `.post-title`：如果在主留言區按一下，在第一樓的回覆下方放留言的輸入欄位
  * `.comment`：如果在回覆區按一下，在第一樓的回覆下方放留言的輸入欄位
  * `.btn-send`：按了輸入欄位區中的送出

## 依賴 function
* `buildCommentTree`，建立留言樹狀結構
* `renderComments`，生成留言 HTML，會使用遞來迴渲染子留言

## 展示網址
* [展示網址](https://idben.github.io/forum-01/)