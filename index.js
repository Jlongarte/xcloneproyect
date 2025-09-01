import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

// Cargar tweets desde localStorage si existen
if (localStorage.getItem("tweetsData")) {
  const storedTweets = JSON.parse(localStorage.getItem("tweetsData"));
  tweetsData.length = 0;
  storedTweets.forEach((tweet) => tweetsData.push(tweet));
}

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.dataset.delete) {
    handleDeleteClick(e.target.dataset.delete);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.dataset.sendReply) {
    handleSendReplyClick(e.target.dataset.sendReply);
  }
});

// Guardar tweets en localStorage
function saveTweetsToLocalStorage() {
  localStorage.setItem("tweetsData", JSON.stringify(tweetsData));
}

// Likes
function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.find((tweet) => tweet.uuid === tweetId);

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--;
  } else {
    targetTweetObj.likes++;
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  saveTweetsToLocalStorage();
  render();
}

// Retweets
function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.find((tweet) => tweet.uuid === tweetId);

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--;
  } else {
    targetTweetObj.retweets++;
  }
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
  saveTweetsToLocalStorage();
  render();
}

// Mostrar/ocultar respuestas
function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

// Nuevo tweet
function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");

  if (tweetInput.value.trim()) {
    tweetsData.unshift({
      handle: `@troll123134`,
      profilePic: `unnamed.png`,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value.trim(),
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
    });
    saveTweetsToLocalStorage();
    render();
    tweetInput.value = "";
  }
}

// Borrar tweet
function handleDeleteClick(tweetId) {
  const tweetIndex = tweetsData.findIndex((tweet) => tweet.uuid === tweetId);
  if (tweetIndex !== -1) {
    tweetsData.splice(tweetIndex, 1);
    saveTweetsToLocalStorage();
    render();
  }
}

// Enviar respuesta a un tweet
function handleSendReplyClick(tweetId) {
  const replyInput = document.getElementById(`reply-input-${tweetId}`);
  const replyText = replyInput.value.trim();

  if (replyText) {
    const targetTweetObj = tweetsData.find((tweet) => tweet.uuid === tweetId);
    targetTweetObj.replies.push({
      handle: "@troll123134",
      profilePic: "unnamed.png",
      tweetText: replyText,
    });
    saveTweetsToLocalStorage();
    render();
  }
}

// Generar HTML del feed
function getFeedHtml() {
  let feedHtml = "";

  tweetsData.forEach(function (tweet) {
    const likeIconClass = tweet.isLiked ? "liked" : "";
    const retweetIconClass = tweet.isRetweeted ? "retweeted" : "";

    // Replies existentes
    let repliesHtml = "";
    if (tweet.replies.length > 0) {
      tweet.replies.forEach(function (reply) {
        repliesHtml += `
<div class="tweet-reply">
  <div class="tweet-inner">
    <img src="${reply.profilePic}" class="profile-pic">
    <div>
      <p class="handle">${reply.handle}</p>
      <p class="tweet-text">${reply.tweetText}</p>
    </div>
  </div>
</div>`;
      });
    }

    // Formulario para responder
    repliesHtml += `
<div class="reply-input-area">
  <img src="unnamed.png" class="profile-pic">
  <input type="text" placeholder="Escribe tu respuesta..." id="reply-input-${tweet.uuid}">
  <button data-send-reply="${tweet.uuid}">Responder</button>
</div>`;

    // Botón borrar solo para tus tweets
    let deleteBtnHtml = "";
    if (tweet.handle === "@troll123134") {
      deleteBtnHtml = `
<span class="tweet-detail">
  <i class="fa-solid fa-trash" data-delete="${tweet.uuid}"></i>
</span>`;
    }

    feedHtml += `
<div class="tweet">
  <div class="tweet-inner">
    <img src="${tweet.profilePic}" class="profile-pic">
    <div>
      <p class="handle">${tweet.handle}</p>
      <p class="tweet-text">${tweet.tweetText}</p>
      <div class="tweet-details">
        <span class="tweet-detail">
          <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
          ${tweet.replies.length}
        </span>
        <span class="tweet-detail">
          <i class="fa-solid fa-heart ${likeIconClass}" data-like="${tweet.uuid}"></i>
          ${tweet.likes}
        </span>
        <span class="tweet-detail">
          <i class="fa-solid fa-retweet ${retweetIconClass}" data-retweet="${tweet.uuid}"></i>
          ${tweet.retweets}
        </span>
        ${deleteBtnHtml}
      </div>
    </div>
  </div>
  <div class="hidden" id="replies-${tweet.uuid}">
    ${repliesHtml}
  </div>
</div>`;
  });

  return feedHtml;
}

// Renderizar feed
function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}

render();
