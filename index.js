import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const refreshEl = document.getElementById('refresh-btn')

refreshEl.addEventListener('click', function(){
        localStorage.clear()
        location.reload()
    })


function saveTweetStates(){
    const states = {}
    tweetsData.forEach(tweet => {
        states[tweet.uuid] = {
            likes: tweet.likes,
            retweets: tweet.retweets,
            replies: tweet.replies,
            isLiked: tweet.isLiked,
            isRetweeted: tweet.isRetweeted
        }
    })
    localStorage.setItem('tweetStates', JSON.stringify(states))
}

function loadSavedStates(){
    const raw = localStorage.getItem('tweetStates')
    if(!raw) return
    try{
        const states = JSON.parse(raw)
        tweetsData.forEach(tweet => {
            const s = states[tweet.uuid]
            if(s){
                tweet.likes = typeof s.likes === 'number' ? s.likes : tweet.likes
                tweet.retweets = typeof s.retweets === 'number' ? s.retweets : tweet.retweets
                tweet.replies = Array.isArray(s.replies) ? s.replies : tweet.replies
                tweet.isLiked = typeof s.isLiked === 'boolean' ? s.isLiked : tweet.isLiked
                tweet.isRetweeted = typeof s.isRetweeted === 'boolean' ? s.isRetweeted : tweet.isRetweeted
            }
        })
    }catch(err){
        console.error('Failed to load saved tweet states', err)
    }
}

loadSavedStates()


document.addEventListener('click', function(e){
    if(e.target.dataset.like){
        handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.dataset.submitReply){
        handleTweetBtnClick(e.target.dataset.submitReply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
})

function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
    saveTweetStates()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render()
    saveTweetStates()
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(tweetId){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput && tweetInput.value){
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
        render()
        saveTweetStates()
        tweetInput.value = ''
        return
    }

    // If tweetId was provided, treat this as submitting a reply for that tweet
    if(tweetId){
        const replyInput = document.getElementById(`tweet-input-reply-${tweetId}`)
        if(replyInput && replyInput.value){
            const targetTweetObj = tweetsData.filter(function(tweet){
                return tweet.uuid === tweetId
            })[0]

            if(targetTweetObj){
                targetTweetObj.replies.unshift({
                    handle: `@Scrimba`,
                    profilePic: `images/scrimbalogo.png`,
                    tweetText: replyInput.value
                })
                render()
                saveTweetStates()
                replyInput.value = ''
            }
        }
    }
}

function getFeedHtml(){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = `    
        <div class="tweet-reply user-reply">
            <div class="tweet-inner">
                <img src="images/scrimbalogo.png" class="profile-pic">
                <input type = 'text' placeholder = 'Your thoughts...' class ='tweet-input-reply' id='tweet-input-reply-${tweet.uuid}'></input>
            </div>
            <div class="tweet-btn-reply">
            <button id="tweet-btn" data-submit-reply='${tweet.uuid}'>Reply</button>
            </div>

        </div>
        `


        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`
            })
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
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`
    })
    return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()

