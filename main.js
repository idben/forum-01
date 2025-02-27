const container = document.querySelector("#posts-container");

// AJAX 取得 JSON 資料
const response1 = await fetch('./post.json');
const posts = await response1.json();
const response2 = await fetch('./comment.json');
const comments = await response2.json();

container.innerHTML = ""; // 清空留言版
posts.forEach(post => {
  // 依照主留言的資料陣列繪製主留言區塊
  const relatedComments = comments.filter(c => c.post_id === post.id);
  const commentTree = buildCommentTree(relatedComments);
  container.innerHTML += `
    <div class="post" data-postid="${post.id}">
      <div class="post-title">${post.user_name}: ${post.content}</div>
      ${renderComments(commentTree)} <!-- 繪製回覆 -->
    </div>
  `;
});

document.body.addEventListener("click", async e => {
  let commentInput = document.querySelector(".comment-input");
  if(e.target.tagName == "BODY"){
    // 如果在非留言或非回覆區按一下，在最上方放留言的輸入欄位
    if(commentInput){
      commentInput.remove();
    }
    const node = document.createElement("DIV")
    node.classList.add("comment-input")
    node.innerHTML = `<input type="text" name="comment" placeholder="填入留言">
                      <input type="text" name="user-name" placeholder="填入名稱">
                      <button class="btn-send">送出</button>`;
    e.currentTarget.prepend(node);
    
  }else if(e.target.classList.contains("post-title")){
    // 如果在主留言區按一下，在第一樓的回覆下方放留言的輸入欄位
    const parent = e.target.closest(".post");
    const postId = parseInt(parent.dataset.postid, 10);
    if(commentInput){
      commentInput.remove();
    }
    parent.innerHTML += `<div class="comment-input">
                          <input type="text" name="comment" placeholder="填入留言">
                          <input type="text" name="user-name" placeholder="填入名稱">
                          <input type="hidden" name="post-id" value="${postId}">
                          <button class="btn-send">送出</button>
                        </div>`;
  }else if(e.target.classList.contains("comment")){
    // 如果在回覆區按一下，在第一樓的回覆下方放留言的輸入欄位
    const parent = e.target.closest(".comment-box");
    const level = parseInt(parent.dataset.level, 10);
    const parentId = parseInt(parent.dataset.id, 10);
    const postId = parseInt(parent.dataset.postid, 10);
    if(commentInput){
      commentInput.remove();
    }
    if(level >=2) return; // 控制可回覆層數
    parent.innerHTML += `<div class="comment-input">
                          <input type="text" name="comment" placeholder="填入留言">
                          <input type="text" name="user-name" placeholder="填入名稱">
                          <input type="hidden" name="post-id" value="${postId}">
                          <input type="hidden" name="parent-id" value="${parentId}">
                          <button class="btn-send">送出</button>
                        </div>`;
  }else if(e.target.classList.contains("btn-send")){
    // 按了輸入欄位區中的送出
    const parent = e.target.closest(".comment-box")?e.target.closest(".comment-box"):e.target.closest(".post");
    const level = parent?.dataset.level?parseInt(parent.dataset.level, 10):null;
    const content = document.querySelector("[name=comment]").value;
    const postId = document.querySelector("[name=post-id]")?document.querySelector("[name=post-id]").value:null;
    const userName = document.querySelector("[name=user-name]").value;
    const parentId = document.querySelector("[name=parent-id]")?document.querySelector("[name=parent-id]").value:null;
    if(content == "" || userName == ""){
      return;
    }
    commentInput.remove();
    
    const formData = new FormData();
    formData.append("content", content);
    formData.append("userName", userName);
    if(postId != null) formData.append("postId", postId);
    if(parentId != null) formData.append("parentId", parentId);
    // 底下這裡是 AJAX 接 API，目前純 JS 的這個 branch 沒有接 API
    // const url = "/commet";
    // const res = await fetch(url, {method: "POST", body: formData});
    // const result = await res.json();
    const temp = {}; // 從輸入的內容產生出一則留言或回覆
    temp.id = comments[comments.length-1].id + 1;
    temp["user_name"] = userName;
    if(postId != null){
      temp["post_id"] = parseInt(postId);
    }
    if(parentId != null){
      temp["parent_id"] = parseInt(postId);
    }
    temp["content"] = content;
    temp["created_at"] = Date.now();
    
    if(!parent){
      // 加到主留言區
      document.body.innerHTML += `<div class="post" data-postid="${temp.id}">
        <div class="post-title">${temp.user_name}: ${temp.content}</div>
      </div>`
      return;
    }
    // 加到回覆區
    parent.innerHTML += `<div class="comment-box comment-box${level}" data-level="${level}" data-id="${temp.id}" data-postid="${temp.post_id}">
                          <div class="comment">
                            <strong>${temp.user_name}:</strong> ${temp.content}
                          </div>
                        </div>`;
  }
})

// 建立留言樹狀結構
function buildCommentTree(comments) {
  let commentMap = {};
  let tree = [];
  // 先建立 commentMap
  comments.forEach(comment => {
    comment.children = []; // 初始化 children 陣列
    commentMap[comment.id] = comment;
  });
  // 將留言整理成樹狀結構
  comments.forEach(comment => {
    if (comment.parent_id === null) {
      tree.push(comment);
    } else {
      if (commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].children.push(comment);
      }
    }
  });
  return tree;
}

// 生成留言 HTML
function renderComments(comments, level = 1) {
  if (!comments.length) return "";

  return comments
    .map(
      (comment) => `
    <div class="comment-box comment-box${level}" data-level="${level}" data-id="${
        comment.id
      }" data-postid="${comment.post_id}">
      <div class="comment">
        <strong>${comment.user_name}:</strong> ${comment.content}
      </div>
      ${renderComments(comment.children, level + 1)} <!-- 遞迴渲染子留言 -->
    </div>
  `
    )
    .join("");
}
