// This place is not a place of honor... no highly esteemed deed is commemorated here... nothing valued is here

// i'm writing this while I'm not sure how far I will go with this
// this might end up just being a single page per space, but if I end up implementing
// hidden stuff please don't randomly spoil stuff for other people. otherwise you can
// find all the pages I added in the pages subdirectory if you're looking for that

// if the code looks like shit, it's because I spent a full 2 hours trying to fix
// my web development environment while getting more and more shitfaced on wine.
// eventually I just decided to do everything in pure HTML/JS/CSS instead.
// I started all of this during my holiday while drinking wine. The longer joe didn't stream hypnospace,
// the more I added to it. As a result, most if this is a product of severe alcohol intoxication.
// Especially anime den.


// redirect to https. Digitalocean is stinky and does not do this.
if (location.href.indexOf('localhost') === -1 && !location.href.startsWith('https://')) {
    var urlBase = '';
    if (location.href.startsWith('http://')) {
        urlBase = location.href.split('http://')[1];
    } else {
        urlBase = location.href;
    }
    location.href = 'https://' + urlBase;
}

// stuff to make the page load like it's 1999
const PAGE_LOAD_SLOWNESS = 50;
const PAGE_LOAD_VARIATION = 150;

// pure js and html fun
var urlElement = document.getElementById('url');
var pageTitleElement = document.getElementById('page-title');
var userNameElement = document.getElementById('user-name');
var bodyElement = document.getElementById('body');
var outerBodyElement = document.getElementById('outerBody');
var musicAudioElement = document.getElementById('musicAudio');

var audioCtrlPlayer = document.getElementById('audioCtrlPlayer');
var audioCtrlCanvas = document.getElementById('audioCtrlCanvas');
var audioCtrlImage = document.getElementById('audioCtrlImage');
var audioCtrlVolumeInfoDiv = document.getElementById('audioCtrlVolumeInfo');
var audioInfo = document.getElementById('audioInfo');
var audioVolumeControl = document.getElementById('volumeControl');


// this is very important otherwise people will really hate me
var storedVolume = localStorage.getItem('volume');
if (!storedVolume) {
    musicAudioElement.volume = 0.5;
    audioVolumeControl.value = 50;
} else {
    musicAudioElement.volume = storedVolume;
    audioVolumeControl.value = storedVolume * 100;
}

var homeBtn = document.getElementById('homeBtn');
var backBtn = document.getElementById('backBtn');
var fwdBtn = document.getElementById('fwdBtn');
// no time :(
    // scratch that I just got busy with other stuff. plenty of time
// press F 5 times to pay respects to the features lost in the battle to finish this in time
// var stampBtn = document.getElementById('stamp');

var infoBox = document.getElementById('infoDiv');
var infoTitle = document.getElementById('info-title');
var infoContent = document.getElementById('info-content');
var infoButton = document.getElementById('info-btn');
var infoButtonOuter = document.getElementById('info-btn-outer');

// please be kind to this server. you have no idea how scuffed the code is.
// also it's running on the cheapest shared-cpu droplet I could find
// const API_URL = 'http://localhost:8123';
const API_URL = 'https://hypnojads-api.croil.net';

// chrome is also stinky. add a muted attribute to an audio element in html and then remove it
// otherwise the audio won't autoplay for god knows what reason
if (window.navigator.userAgent.indexOf('Chrome') === -1) {
    musicAudioElement.removeAttribute('muted');
}

var votes = {};
// generate an id for this user
// this is one way to ruin the scoring system for everyone if you want to.
// this is a guid but without dashes because I don't want to do proper
// validation on the backend
var userId = window.localStorage.getItem('userId');
if (!userId) {
    userId = ([1e7]+1e3+4e3+8e3+1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    window.localStorage.setItem('userId', userId);
}


// vague attempt at getting the back/forward buttons to work.
var timesWentBack = 0;

function isFirstPage(url) {
    if (url == '') {
        return false;
    }
    return url.split('/').length === 1
}

// we'll load this from localstorage in loadpages()
var pageViews = JSON.parse(window.localStorage.getItem('pageViews'));
if (!pageViews) {
    pageViews = {};
}

// idk if I am still using this
function updateViewCounts(url) {
    pageViews[url]++;
    window.localStorage.setItem('pageViews', JSON.stringify(pageViews));
}

// uh
function navigate(url) {
    if (isFirstPage(url)) {
        updateViewCounts(url);
    }
    window.location.href = 'index.html#/' + url;
}

// deprecated
function getVotes() {
    return new Promise((resolve, reject) => {
        var xmlHttpRequest = new XMLHttpRequest();

        var url = API_URL + '/votes/' + userId;

        xmlHttpRequest.open('GET', url);
        xmlHttpRequest.onload = (e) => {
            if (xmlHttpRequest.status === 200) {
                votes = JSON.parse(xmlHttpRequest.response);
                window.localStorage.setItem('votes', JSON.stringify(votes));
            } else {
                votes = JSON.parse(window.localStorage.getItem('votes'));
                if (!votes) {
                    votes = {};
                }
            }
            resolve();
        };
        xmlHttpRequest.onerror = (e) => {
            votes = JSON.parse(window.localStorage.getItem('votes'));
            if (!votes) {
                votes = {};
            }
            resolve();
        }
        xmlHttpRequest.onabort = (e) => {
            votes = JSON.parse(window.localStorage.getItem('votes'));
            resolve();
        }
        xmlHttpRequest.send();
    });
}

// oooooo
function refreshVoteData() {
    var promises = [];
    promises.push(getVotes());
    return Promise.all(promises);
}

// very important
function refresh() {
    var dataPromise;
    if (window.location.href.indexOf('DiscussionDen') !== -1) {
        dataPromise = refreshVoteData();
    } else {
        dataPromise = Promise.resolve();
    }

    dataPromise.then(() => {
        const url = getPageIndex();
        loadPage(url);
    }, () => {
        // error handling? where do you think you are?
    });
}
// yes
function back() {
    if (window.history.length > 1) {
        timesWentBack += 1;
        window.history.back();
    }
}




// yes very yes
function fwd() {
    if (window.history.length > 1 && timesWentBack !== 0) {
        timesWentBack -= 1;
        window.history.forward();
    }
}

// very important indeed
function getEmote(stamp) {
    return 'img/emotes/' + stamp + '.webp';
}

///////////////////////////////////////////
// ELEMENT LOADING CODE WOWOWOWOWOOWOWOW //
// LOOK AT MR PROGRAMMER MAN. COMING TO  //
// ABSTRACT EVERYTHING. INSTEAD OF JUST  //
// GOING BACK TO ANGULAR OR REACT OR     //
// WHATEVER ELSE YOU COULD USE INSTEAD   //
// OF THIS.                 GOOD JOB     //
///////////////////////////////////////////


function loadImage(data, delay) {
    var parts = data.split(':');
    var leftOffs = parts[0];
    var topOffs = parts[1];
    var width = parts[2];
    var height = parts[3];
    var src = parts[4];
    var alt = parts[5];
    var link = '';
    if (parts.length > 6) {
        link = parts[6];
    }
    var tag = "";
    if (link) {
        tag += '<a href="'+link+'">'
    }
    tag += '<img class="load" style="';
    if (link !== '') {
        tag += 'cursor: pointer;';
    }
    tag += 'position: relative;'
    tag += 'animation-delay: ' + delay + 'ms;';
    tag += 'left: ' + leftOffs + ';';
    tag += 'top: ' + topOffs + ';';
    tag += 'width: ' + width + ';';
    tag += 'height: ' + height + ';';
    tag += '" src="' + src + '"';
    tag += '" alt="' + alt + '"';
    tag += '/>';
    if (link) {
        tag += '</a>'
    }
    bodyElement.innerHTML += tag;
}

function loadText(data, delay, marquee) {
    var parts = data.split(':', 5);
    var font = parts[0];
    var size = parts[1];
    var align = parts[2];
    var color = parts[3];
    var text = parts[4];
    var element = marquee ? 'marquee scrollamount=50' : 'span';
    var tag = "";
    tag += '<div class="load" style="'
    tag += 'width: 100%;';
    tag += 'text-align: '+ align + ';';
    tag += 'animation-delay: ' + delay + 'ms;'
    tag += '"><'+element+' style="width: 100%;';
    tag += '; font-family: ' + font;
    tag += '; font-size: ' + size;
    tag += '; color: ' + color;
    tag += '">';
    tag += text;
    tag += '</'+element+'></div>';
    bodyElement.innerHTML += tag;
}

// needed for adding new styles. this is how far we've fallen.
// because we insist that one or two texts must flash between two colors and instead
// of just implementing the colors I want statically, I am generalizing this implementation
// for no reason whatsoever
let dynamicStyles = null;

function addAnimation(body) {
  if (!dynamicStyles) {
    dynamicStyles = document.createElement('style');
    dynamicStyles.type = 'text/css';
    document.head.appendChild(dynamicStyles);
  }

  dynamicStyles.sheet.insertRule(body, dynamicStyles.length);
}

// text that pulses between color1 and color2
function loadTextPulse(data, delay, marquee) {
    var parts = data.split(':', 6);
    var font = parts[0];
    var size = parts[1];
    var align = parts[2];
    var color1 = parts[3];
    var color2 = parts[4];
    var colorString = 'p'+color1.substr(1) + color2.substr(1);
    addAnimation(`@keyframes ${colorString} {
        0% {
            color: ${color1};
        }
        50% {
            color: ${color2};
        }
        100 {
            color: ${color1};
        }
      }`)
    var text = parts[5];
    var element = marquee ? 'marquee scrollamount=50' : 'span';
    var tag = "";
    tag += '<div class="load" style="'
    tag += 'width: 100%;';
    tag += 'text-align: '+ align + ';';
    tag += 'animation-delay: ' + delay + 'ms;'
    tag += '"><'+element+' style="width: 100%;';
    tag += 'font-family: ' + font + ';';
    tag += 'font-size: ' + size + ';';
    tag += 'color: ' + color1 + ';';
    tag += 'animation-name: '+colorString+';';
    tag += 'animation-duration: 1s;';
    tag += 'animation-iteration-count: infinite;';
    tag += '">';
    tag += text;
    tag += '</'+element+'></div>';
    bodyElement.innerHTML += tag;
}

// text that goes through all colors like an overenthousiastic RGB keyboard
function loadTextRGB(data, delay, marquee) {
    var parts = data.split(':', 4);
    var font = parts[0];
    var size = parts[1];
    var align = parts[2];
    var text = parts[3];
    var element = marquee ? 'marquee scrollamount=50' : 'span';
    var tag = "";
    tag += '<div class="load" style="'
    tag += 'width: 100%;';
    tag += 'text-align: '+ align + ';';
    tag += 'animation-delay: ' + delay + 'ms;'
    tag += '"><'+element+' style="width: 100%;';
    tag += '; font-family: ' + font;
    tag += '; font-size: ' + size;
    tag += '; color: ' + color;
    tag += '">';
    tag += text;
    tag += '</'+element+'></div>';
    bodyElement.innerHTML += tag;
}

function loadTextWithImage(data, delay) {
    var parts = data.split(/(?<!https):/, 8);
    var textSide = parts[0]
    var font = parts[1];
    var size = parts[2];
    var align = parts[3];
    var color = parts[4];
    var text = parts[5];
    var image = parts[6];
    var link = '';
    if (parts.length == 8) {
        link = parts[7];
    }

    var style = 'grid-template-columns: ';
    style += textSide === 'left' ? '1fr 0.1fr;' : '0.1fr 1fr;';
    style += 'grid-template-areas: ';
    style += textSide === 'left' ? '\'TextWithImageText TextWithImageImage\';' : '\'TextWithImageImage TextWithImageText\';';
    if (link !== '') {
        style += 'cursor: pointer;';
    }

    var tag = '';
    tag += '<div class="text-with-image" ';
    tag += 'style="' + style + '">';
    if (link) {
        tag += '<a href="'+link+'" target="_blank">'
    }
    tag += '<div class="TextWithImageText load" style="';
    tag += 'text-align: '+ align + ';';
    tag += 'animation-delay: ' + delay + 'ms;';
    tag += '"><span style="';
    tag += 'font-family: ' + font + ';';
    tag += 'font-size: ' + size + ';';
    tag += 'color: ' + color + ';';
    tag += '">';
    tag += text;
    tag += '</span></div>';
    tag += '<div class="TextWithImageImage load" style="'
    tag += 'animation-delay: ' + delay + 'ms;';
    tag += '">';
    tag += '<img src="'+image+'"';
    tag += '</div>';
    if (link) {
        tag += '</a href="'+link+'">'
    }
    tag += '</div>';
    bodyElement.innerHTML += tag;
}

// most of this code powered by this ost https://www.youtube.com/watch?v=2JsYHpiH2xs

function loadDualTextColumn(data, delay) {
    var parts = data.split(':', 6);
    var font = parts[0];
    var size = parts[1];
    var align = parts[2];
    var color = parts[3];
    var leftText = parts[4];
    var rightText = parts[5];
    var tag = '<div class="double-column-text">';
    tag += '<div class="LeftTextColumn load" style="'
    tag += 'width: 100%;';
    tag += 'text-align: '+ align + ';';
    tag += 'animation-delay: ' + delay + 'ms;'
    tag += '"><span style="width: 100%;';
    tag += '; font-family: ' + font;
    tag += '; font-size: ' + size;
    tag += '; color: ' + color;
    tag += '">';
    tag += leftText;
    tag += '</span></div>';
    tag += '<div class="RightTextColumn load" style="'
    tag += 'width: 100%;';
    tag += 'text-align: '+ align + ';';
    tag += 'animation-delay: ' + delay + 'ms;'
    tag += '"><span style="width: 100%;';
    tag += '; font-family: ' + font;
    tag += '; font-size: ' + size;
    tag += '; color: ' + color;
    tag += '">';
    tag += rightText;
    tag += '</span></div>';
    tag += '</div>'
    bodyElement.innerHTML += tag;
}

// NOT EVEN USING JQUERY //

function loadListing(data, delay) {
    var parts = data.split(':', 7);
    var bgcolor = parts[0];
    var boxcolor = parts[1];
    var boxbordercolor = parts[2];
    var title = parts[3];
    var user = parts[4];
    var description = parts[5];
    var url = parts[6];
    if (!(url in pageViews)) {
        pageViews[url] = 0;
        window.localStorage.setItem('pageViews', JSON.stringify(pageViews));
    }
    var tag = '<div class="listing-item load" onClick="navigate(\''+url+'\');" style="'
    tag += 'animation-delay: ' + delay + 'ms;'
    tag += 'background: ' + bgcolor + ';"'
    tag += 'align-content: center;"'
    tag += '>';
    tag += '<div class="ListingContainerHeader">';
    tag += '<div class="ListingTitle"><span>'+title+'</span></div>';
    tag += '<div class="ListingUser"><span>'+user+'</span></div>';
    tag += '</div><div class="ListingContainerContent">'
    tag += '<div class="ListingStamp" style="background-color: '+boxcolor+'; border: 2px ' +boxbordercolor+ ' solid;"></div>';
    tag += '<div class="ListingCount" style="background-color: '+boxcolor+'; border: 2px ' +boxbordercolor+ ' solid;">';
    tag += '<span>'+pageViews[url];+'</span>';
    tag += '</div>';
    tag += '<div class="ListingDescription"><span>'+description+'</span></div>';
    tag += '</div>'
    tag += '</div>';
    bodyElement.innerHTML += tag;
}

// [internal screaming]
function updateVoteDisplay(id, skipStyle=true) {
    var listingDiv = document.getElementById('listing-' + id);

    // we might not be on the page where this discussion listing is displayed
    if (!listingDiv) {
        return;
    }

    // text
    var upVoteSpan = document.getElementById('upvotes-' + id);
    var downVoteSpan = document.getElementById('downvotes-' + id);
    // comment bar / vote graph
    var footer = document.getElementById('footer-' + id);
    // duplicate code. a sign of a quality codebase
    var totalVotes = 0;
    var upVotes = 0;
    var downVotes = 0;
    var yesPerc = 0.0;
    var noPerc = 0.0;
    if (id in votes) {
        upVotes = votes[parseInt(id)]['up_votes'];
        downVotes = votes[parseInt(id)]['down_votes'];
        totalVotes = upVotes + downVotes;
        if (totalVotes > 0) {
            yesPerc = upVotes / totalVotes * 100;
            noPerc = downVotes / totalVotes * 100;
        }
        // div stamp
        listingDiv.classList.remove(['open', 'closedyes', 'closedno']);
        switch(votes[id]['status']) {
            case 0:
                listingDiv.classList.add('open');
                break;
            case 1:
                listingDiv.classList.add('closedyes');
                break;
            case 2:
                listingDiv.classList.add('closedno');
                break;
        }
    }

    upVoteSpan.innerText = upVotes + ' (' + (Math.round(yesPerc * 100) / 100) + '%)';
    downVoteSpan.innerText = downVotes + ' (' + (Math.round(noPerc * 100) / 100) + '%)';


    // footer nonsense
    var lim1 = 0.0;
    var lim2 = 0.0;
    if (yesPerc > 1) {
        lim1 = yesPerc - 1;
        lim2 = yesPerc + 1;
    }
    if (yesPerc > 99) {
        lim1 = 100;
        lim2 = 100;
    }
    if (totalVotes === 0) {
        lim1 = 49;
        lim2 = 51
    }
    if (skipStyle) {
        return;
    }
    footer.style = 'background: linear-gradient(90deg, rgba(10,166,1,1) 0%, rgba(10,166,1,1) '+lim1+'%, rgba(236,213,193,1) '+lim1+'%, rgba(236,213,193,1) '+lim2+'%, rgba(153,0,0,1) '+lim2+'%, rgba(153,0,0,1) 100%);';
}

// doing this so that we don't have to wait for the vote load to complete
// on page load. instead we will just keep updating and it will reflect
// stuff when it changes. Does this every second
window.setInterval(() => {
    for (var id in votes) {
        updateVoteDisplay(id);
    }
}, 1000)

function vote(id, vote) {
    lastVote = 0;
    if (id in votes) {
        lastVote = votes[id]['own_vote'];
    }
    if (lastVote === vote) {
        vote = 0;
    }

    var xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.open('POST', API_URL + '/votes');
    var body = JSON.stringify({
        subjectId: id,
        userId: userId,
        vote: vote
    });
    xmlHttpRequest.setRequestHeader('Content-Type', 'application/json');
    xmlHttpRequest.onload =() => {
        // img
        upvoteImg = document.getElementById('upvote-' + id);
        downvoteImg = document.getElementById('downvote-' + id);

        if (xmlHttpRequest.status === 200) {
            last_vote = 0;
            if (!(id in votes)) {
                votes[id] = {
                    'up_votes': 0,
                    'down_votes': 0,
                    'own_vote': vote
                };
            }
            switch(vote) {
                case 0:
                    upvoteImg.classList.remove('voted');
                    downvoteImg.classList.remove('voted');
                    if (lastVote === 1) {
                        votes[id]['up_votes']--;
                    } else {
                        votes[id]['down_votes']--;
                    }
                    break;
                case 1:
                    upvoteImg.classList.add('voted');
                    downvoteImg.classList.remove('voted');
                    if (lastVote === 0) {
                        votes[id]['up_votes']++;
                    } else {
                        votes[id]['up_votes']++;
                        votes[id]['down_votes']--;
                    }
                    break;
                case -1:
                    upvoteImg.classList.remove('voted');
                    downvoteImg.classList.add('voted');
                    if (lastVote === 0) {
                        votes[id]['down_votes']++;
                    } else {
                        votes[id]['down_votes']++;
                        votes[id]['up_votes']--;
                    }
                    break;
            }

            updateVoteDisplay(id, false);

            votes[id]['own_vote'] = vote;
        }
    };
    xmlHttpRequest.send(body);
}

// discussion post for discussion den
function loadDiscussion(data, delay) {
    var parts = data.split(':', 6);
    var image = parts[0];
    var title = parts[1];
    var user = parts[2];
    var commentCount = 0;
    var id = parts[3];

    // comment stuff
    if (parts[4] === '') {
        commentCount = '#UNDEFINED#';
    } else {
        commentCount = parts[4];
    }
    var stamp = parts[5];

    // update text
    // duplicate code. a sign of a quality codebase
    var totalVotes = 0;
    var upVotes = 0;
    var downVotes = 0;
    var yesPerc = 0.0;
    var noPerc = 0.0;
    if (id in votes) {
        upVotes = votes[parseInt(id)]['up_votes'];
        downVotes = votes[parseInt(id)]['down_votes'];
        totalVotes = upVotes + downVotes;
        if (totalVotes > 0) {
            yesPerc = upVotes / totalVotes * 100;
            noPerc = downVotes / totalVotes * 100;
        }
        switch(votes[id]['status']) {
            case 0:
                stamp = 'open';
                break;
            case 1:
                stamp = 'closedyes';
                break;
            case 2:
                stamp = 'closedno';
                break;
        }
    }

    // yes

    var tag = '<div id="listing-'+id+'" class="discussion-item load '+stamp+'" style="';
    tag += 'animation-delay: ' + delay + 'ms;';
    tag += 'align-content: center;"';
    tag += '>';
    tag += '<div class="DiscussionHeader">';
    tag += '<div class="DiscussionTitle"><span class="discussion-title-text">Subject: '+title+'</span></div>';
    tag += '<div class="DiscussionUser"><span class="discussion-user-text">'+user+'</span></div>';
    tag += '</div>';
    tag += '<div class="DiscussionContent">'
    tag += '<div class="DiscussionImage"><img class="discussion-image-element" src="'+image+'"/></div>';
    tag += '<div class="DiscussionVotes">';
    tag += '<div class="UpVote">';
    tag += '<img id="upvote-'+id+'" class="vote '+(votes[id] && votes[id]['own_vote'] === 1 ? 'voted' : '')+'" onclick="vote('+id+', 1)" src="pages/DiscussionDen/upvote.png"/>'
    tag += '<span id="upvotes-'+id+'" class="vote-count-text">';
    tag += upVotes + ' (' + Math.round(yesPerc * 100) / 100 + '%)';
    tag += '</span>';
    tag += '</div>';
    tag += '<div class="VoteCount">'
    // if (parseInt(id) in votes) {
    //     tag += '<span id="votes-'+id+'" class="vote-count-text">'
    //     tag += 'Votes: ' + votes[parseInt(id)]['votes'];
    //     tag += '</span>'
    // } else {
    //     tag += '<span id="votes-'+id+'" class="vote-count-text">'
    //     tag += 'Votes: 0';
    //     tag += '</span>'
    // }
    tag += '</div>';
    tag += '<div class="DownVote">';
    tag += '<span id="downvotes-'+id+'" class="vote-count-text">';
    tag += downVotes + ' (' + Math.round(noPerc * 100) / 100 + '%)';
    tag += '</span>';
    tag += '<img id="downvote-'+id+'" class=" vote '+(votes[id] && votes[id]['own_vote'] === -1 ? 'voted' : '')+'" onclick="vote('+id+', -1)" src="pages/DiscussionDen/downvote.png"/>'
    tag += '</div>';
    tag += '</div>';
    tag += '</div>';
    tag += '<div id="footer-'+id+'" class="DiscussionFooter '+(commentCount === '#UNDEFINED#' || commentCount === '-' ? 'discussion-no-comments' : '')+'"';
    if (commentCount !== '#UNDEFINED#' && commentCount !== '-') {
        tag += 'onclick="navigate(\'DiscussionDen/'+id.padStart(6, '0')+'\')" ';
    }
    tag += 'style="'
    // now the fun begins. now, you ask? yes, now.
    var lim1 = 0.0;
    var lim2 = 0.0;
    if (yesPerc > 1) {
        lim1 = yesPerc - 1;
        lim2 = yesPerc + 1;
    }
    if (yesPerc > 99) {
        lim1 = 100;
        lim2 = 100;
    }
    if (totalVotes === 0) {
        lim1 = 49;
        lim2 = 51
    }
    tag += 'background: linear-gradient(90deg, rgba(10,166,1,1) 0%, rgba(10,166,1,1) '+lim1+'%, rgba(236,213,193,1) '+lim1+'%, rgba(236,213,193,1) '+lim2+'%, rgba(153,0,0,1) '+lim2+'%, rgba(153,0,0,1) 100%);';
    tag += '"><span class="digital discussion-footer-text">';
    if (commentCount !== '-') {
        // don't ask
        tag += commentCount + ' Comment'+ (commentCount !== '1' ? 's' : '')+' &gt';
    }
    tag += '</span></div>';
    tag += '</div>';
    bodyElement.innerHTML += tag;
}

// comment for discussion den
function loadDiscussionComment(data, delay) {
    var parts = data.split(':', 2);
    var user = parts[0];
    var body = parts[1];


    var tag = '<div class="discussion-comment load" style="';
    tag += 'animation-delay: ' + delay + 'ms;';
    tag += 'align-content: center;"';
    tag += '>';
    tag += '<div class="DiscussionCommentHeader">';
    tag += '<div class="DiscussionCommentUser"><span class="discussion-user-text">From: '+user+'</span></div>';
    tag += '</div>';
    tag += '<div class="DiscussionCommentBody">'
    tag += body;
    tag += '</div>';
    tag += '</div>';
    bodyElement.innerHTML += tag;
}

function loadStatus(data, delay) {
    var parts = data.split(':', 2);
    var stamp = getEmote(parts[0]);
    var status = parts[1];
    var tag = '<div class="status-box load">';
    tag += '<div class="StatusStamp" style="background-image: url('+stamp+')"></div>';
    tag += '<div class="Status"><span>'+status+'</span></div>';
    tag += '</div>';
    bodyElement.innerHTML += tag;
}

function loadPadding(data, delay) {
    var parts = data.split(':', 3);
    var type = parts[0]; // inline or block
    var width = parts[1];
    var height = parts[2];
    var tag = '<div style="';
    tag += 'display: ' + type === 'b' ? 'block' : 'inline' + ';';
    tag += 'width: ' + width + 'px;'
    tag += 'height: ' + height + 'px;'
    tag += '">';
    tag += '</div>';
    bodyElement.innerHTML += tag;
}

function loadHorizontalBreak(data, delay) {
    var parts = data.split(':', 1);
    var color = parts[0];
    var tag = '<hr class="load" style="';
    tag += 'animation-delay: ' + delay + 'ms;'
    tag += 'color: '+color+';';
    tag += '"/>'
    bodyElement.innerHTML += tag;
}

//////////////////////////////////////////////////
// I THINK THIS IS WHERE THE ELEMENT STUFF ENDS //
//////////////////////////////////////////////////

function playLoadSound() {
    var soundId = Math.floor(Math.random() * 3 + 1);
    var sound = new Audio('sound/sfx/loadelement'+soundId+'.ogg');
    sound.volume = 0.3;
    sound.play();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}


// array of timeout ids for the sounds to cancel on new page load
var loadSoundIds = [];

// get the page content
// I hope you like indentation
function loadPageContent(url) {
    const promise = new Promise((resolve, reject) => {
        const xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open('GET', url);
        xmlHttpRequest.addEventListener('load', (e) =>{
            switch (xmlHttpRequest.status) {
                case 200:
                    responseContent = xmlHttpRequest.response.split("\n");
                    // https://www.youtube.com/watch?v=P3ALwKeSEYs
                    resolve(responseContent);
                default:
                    reject();
            }
        });
        xmlHttpRequest.send();
    });
    return promise;
}

// thing to make sure we load vote data. don't ask
function loadPage(url) {
    var dataPromise;
    if (window.location.href.indexOf('DiscussionDen') !== -1) {
        dataPromise = refreshVoteData();
    } else {
        dataPromise = Promise.resolve();
    }
    dataPromise.then(() => {
        actualLoadPage(url);
    })
}

// load page
function actualLoadPage(url) {
    // load the index. if this page does not exist, this will load the notfound page instead
    loadPageContent(url).then((pageContent) => {
        // update the url
        urlElement.innerHTML = '>> <a class="invisible" href="index.html#/">DRAGONS DEN</a> >> ';
        var collectiveUrl = 'index.html#';
        var subs = getUrlBarParts(url);
        for (var i = 0; i < subs.length - 1; i++) {
            if (i > 0) {
                urlElement.innerHTML += " >> ";
            }
            collectiveUrl = collectiveUrl + '/' + subs[i];
            urlElement.innerHTML += '<a class="invisible" href="' + collectiveUrl + '">' + subs[i].toUpperCase() + '</a>';

        }

        // cancel any current load sounds
        for (var loadSoundId of loadSoundIds) {
            clearTimeout(loadSoundId);
        }
        loadSoundIds = [];

        // scroll to top
        outerBodyElement.scrollTo(0, 0);

        // clear body
        bodyElement.innerHTML = "";

        // clear title
        pageTitleElement.innerText = '';

        // clear user
        userNameElement.innerText = '';

        // set title and username

        // change body background
        var style = "";

        var lastDelay = 0;
        var setDelay = -1;
        var muteSounds = false;
        // load page elements
        for (var i = 0; i < pageContent.length; i++) {
            var content = pageContent[i];
            if (setDelay > -1) {
                delay = setDelay;
                setDelay = -1;
            } else {
                delay = lastDelay + (PAGE_LOAD_SLOWNESS + Math.random() * PAGE_LOAD_VARIATION);
            }
            lastDelay = delay;
            var data = content.substr(content.indexOf(':')+1);
            // this really got out of hand
            // but I am using switch/case so still better than the guy who developed that anime game
            switch(content.substring(0,content.indexOf(':'))) {
                /// meta stuff!
                case 'title':
                    pageTitleElement.innerText = data;
                    break;
                case 'user':
                    userNameElement.innerText = data;
                    break;
                case 'music':
                    if (decodeURIComponent(musicAudioElement.src).indexOf(data) === -1) {
                        musicAudioElement.src = data;
                    }
                    if (musicAudioElement.paused) {
                        setAudio(true);
                    }
                    setAudioEnabled(true);
                    var musicParts = data.split('/');
                    audioInfo.innerText = musicParts[musicParts.length-1];
                    audioInfo.onclick = () => {
                        speak('Downloading ' + musicParts[musicParts.length-1]);
                    }
                    audioInfo.setAttribute("href", data);
                    break;
                // start/stop/replay music
                case 'musicaction':
                    // a switch in a switch? yes. :chadapon:
                    switch (data) {
                        case 'forcestop':
                            setAudio(false);
                            break;
                        case 'forcerestart':
                            setAudio(true);
                            break;
                    }
                    break;
                case 'background-color':
                        color = data;
                        if (color.startsWith('#')) {
                            rgb = hexToRgb(color);
                            color = 'rgba('+rgb.r+', '+rgb.g+', '+rgb.b+', 1)';
                        }
                        // I don't know
                        var offset = 200;
                        var gradient = 'linear-gradient(180deg, rgba(18,18,18,1) 0%, rgba(18,18,18,1) '+offset+'px, '+color+' '+offset+'px, '+color+' 100%)';
                        style += 'background: ' + gradient + ';';
                    break;
                case 'background':
                    style += 'background: ' + data + ';';
                    break;
                // force a delay (absolute)
                case 'delayabs':
                    setDelay = parseInt(data)
                    break;
                // force a delay (relative to last delay)
                case 'delayrel':
                    setDelay = delay + parseInt(data); // can be negative for whatever reason
                    break;
                // clear the body
                case 'c':
                    setTimeout(() => {
                        bodyElement.innerHTML = "";
                    }, delay);
                    break;
                // mute/unmute load sounds
                case 'ls':
                    if (data == 'm') {
                        for (var loadSoundId of loadSoundIds) {
                            clearTimeout(loadSoundId);
                        }
                        muteSounds = true;
                    } else {
                        muteSounds = false;
                    }
                    break;



                /// element stuff!
                case 'i': // image
                    loadImage(data, delay);
                    break;
                case 'l': // page listing
                    loadListing(data, delay);
                    break;
                case 's': // spacing
                    loadStatus(data, delay);
                    break;
                case 'p': // profile status
                    loadPadding(data, delay);
                    break;
                case 't': // text
                    loadText(data, delay, false);
                    break;
                case 'trgb': // rgb text. what have I done
                    loadTextRGB(data, delay, false);
                    break;
                case 'tp': // pulsating text. why
                    loadTextPulse(data, delay, false);
                    break;
                case 'tm': // marquee text
                    loadText(data, delay, true);
                    break;
                case 'trgbm': // rgb marquee text. why
                    loadTextRGB(data, delay, false);
                    break;
                case 'tpm': // pulsing color marquee text. now I am truly lost
                    loadTextPulse(data, delay, false);
                    break;
                case 'ti': // text with an image
                    loadTextWithImage(data, delay);
                    break;
                case 'tdc': // two-column text
                    loadDualTextColumn(data, delay);
                    break;
                case 'hr': // horizontal line break
                    loadHorizontalBreak(data, delay);
                    break;
                case 'd':
                    loadDiscussion(data, delay);
                    break;
                case 'dc':
                    loadDiscussionComment(data, delay);
                    break;
                case '':
                    break;
                default:
                    loadText(data, delay, false);
                    break;
            }

            bodyElement.style = style;

            // do load sounds
            if (!muteSounds) {
                var loadSoundId = setTimeout(() => {
                    playLoadSound();
                }, delay);
                loadSoundIds.push(loadSoundId);
            }
        }

        // back and fwd buttons
        if (window.history.length > 1) {
            backBtn.classList.remove('disabled');
        } else {
            backBtn.classList.add('disabled');
        }

        if (timesWentBack > 0) {
            fwdBtn.classList.remove('disabled');
        } else {
            fwdBtn.classList.add('disabled');
        }

        // home button
        if (url === '') {
            homeBtn.classList.add('disabled');
        } else {
            homeBtn.classList.remove('disabled');
        }
    }, (error) => {
        loadPage('pages/notfound/index.hns');
    });
}


// get the page path associated with the current url
function getPagePath() {
    // path without the #/
    const sub = location.hash.substring(2);
    return "pages/" + sub;
}

function getPageIndex() {
    const pagePath = getPagePath();
    if (pagePath.endsWith('/')) {
        return pagePath + "index.hns";
    }
    return pagePath + "/index.hns";
}

function getUrlBarParts(url) {
    var pagesTrim = url.split("pages", 2)[1]
    var weirdSlashTrimIDontKnow = pagesTrim.substr(1);
    var parts = weirdSlashTrimIDontKnow.split("/");
    return parts;
}

function locationHashChanged( e ) {
    const url = getPageIndex();
    loadPage(url);
}

function setAudio(enable) {
    if (enable) {
        audioCtrlImage.src = "img/ui/sound-on.png";
        musicAudioElement.currentTime = 0;
        musicAudioElement.play().then(() => {

        }, () => {
            // whatever
        });
    } else {
        audioCtrlImage.src = "img/ui/sound-off.png";
        musicAudioElement.pause();
    }
}

function setAudioEnabled(enabled) {
    if (enabled) {
        audioCtrlPlayer.classList.remove('disabled');
    } else {
        audioCtrlPlayer.classList.add('disabled');
    }
}

function toggleAudio() {
    if (audioCtrlPlayer.classList.contains('disabled')) {
        return;
    }
    setAudio(musicAudioElement.paused);
}

function openSoundControls() {
    if (audioCtrlPlayer.classList.contains('disabled')) {
        return;
    }
    audioCtrlVolumeInfoDiv.classList.add('open');
}

function closeSoundControls() {
    audioCtrlVolumeInfoDiv.classList.remove('open');
}

function changeVolume(e) {
    var volume = audioVolumeControl.value / 100;
    musicAudioElement.volume = volume;
    window.localStorage.setItem('volume', volume)
}

// I love how simple this was
function speak(msg) {
    let speech = new SpeechSynthesisUtterance();

    window.speechSynthesis.cancel();

    speech.lang = "en-US";
    speech.text = msg;
    speech.volume = 0.8;
    speech.rate = 1;
    speech.pitch = 0.1;

    window.speechSynthesis.speak(speech);
}

// tODO: more window stuff for the dev den people
function showInfo(title, content, button, height=200, callback=undefined) {
    if (!infoBox.classList.contains('visible')) {
        infoBox.classList.remove('hidden');
        infoBox.classList.add('visible');
        infoBox.style = 'height: ' + height + 'px';

        // add callback
        if (callback) {
            infoButtonOuter.addEventListener('click', callback);
        } else {
            infoButtonOuter.addEventListener('click', () => {
                hideInfo();
            });
        }

        infoTitle.innerText = title;
        infoContent.innerHTML = content;
        infoButton.innerText = button;
        var sound = new Audio('sound/sfx/alert.ogg');
        sound.volume = 0.3;
        sound.play().then(() => {

        }, () => {
            // whatever
        });
    }
}

function hideInfo() {
    infoBox.classList.remove('visible');
    infoBox.classList.add('hidden');
}

function showHelp() {
    showInfo('Help', 'Volume controls in the bottom left.<br><br>Right click on text and most images for TTS<br><br>Press escape or s to make it shut up.', 'Cool', 300)
}

// TODO: this
// scroll handler
// window.onwheel = (ev) => {
//     bodyElement.scrollTop += ev.deltaY;
// }

// onhashchange my beloved
window.onhashchange = locationHashChanged;


window.onload = () => {
    // redirect to hash whatever thing
    if (location.href.indexOf("index.html") === -1) {
        location.href = "index.html#/";
    } else {
        const url = getPageIndex();
        loadPage(url);
    }
}

document.addEventListener('contextmenu', (event) => {
    if (event.target.id == "outerBody") {
        return;
    }
    event.preventDefault();
    var speakText = '';
    // find a more relevant element in certain cases
    switch(event.target.tagName) {
        case 'LI':
            speakText = event.target.parentElement.innerText;
            break;
        case 'DIV':
            speakText = event.target.innerText;
            return;
        case 'IMG':
            speakText = event.target.alt;
            break;
        default:
            speakText = event.target.innerText;
    }
    speak(speakText);
});

// mouse clicks
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        var sound = new Audio('sound/sfx/click1.ogg');
        sound.volume = 0.3;
        sound.play();
    }
    // musicAudioElement.play();
    // audioContext.resume();
    // musicAudioElement.muted = false;
});
document.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
        var sound = new Audio('sound/sfx/click2.ogg');
        sound.volume = 0.3;
        sound.play();
    }
});


var clear = 0;
var respects = 0;
window.onkeydown = (ev) => {
    switch(ev.keyCode) {
        case 27:
        case 83:
            window.speechSynthesis.cancel();
        case 192:
            clear += 1;
            if (clear == 5) {
                window.localStorage.clear('isAWeeb');
                window.localStorage.clear('volume');
                showInfo('Cleared local storage', 'You either accidentally or intentionally pressed the backtick (`) button 5 times. Congratulations. This means that the local storage is now gone. Are you happy? In practical terms this means your volume will be reset and you will see the first popup again when refreshing / visiting this page again in the future.','OK', 360);
            }
        case 70:
            respects += 1;
            if (respects == 5) {
                showInfo('o7', 'F for braincells lost during making this','F', 450);
            }
        break;
    }
}

// music player visualization
// copy and pasted all this stuff I have idea what this does
window.AudioContext = window.AudioContext || window.webkitAudioContext
var audioContext = new AudioContext();
var analyser = audioContext.createAnalyser();
var source = audioContext.createMediaElementSource(musicAudioElement);
var scriptProcessor = audioContext.createScriptProcessor();

analyser.smoothingTimeConstant = 0.2;
analyser.fftSize = 1024;

source.connect(audioContext.destination);
source.connect(analyser);
analyser.connect(scriptProcessor);
scriptProcessor.connect(audioContext.destination);
// enmd of paste from stackoverflow

// oh canvas context yeah I know canvas context I got this
const canvasContext = audioCtrlCanvas.getContext("2d");
const canvasWidth = canvasContext.canvas.width;
const canvasHeight = canvasContext.canvas.height;

// start of a chunk of code I literally don't remember writing I was so shitfaced
scriptProcessor.onaudioprocess = function() {
    const array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    const arraySum = array.reduce((a, value) => a + value, 0);
    const average = arraySum / array.length;

    // purple
    canvasContext.fillStyle = '#121212';
    canvasContext.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    if (audioVolumeControl.value === 0) {
        offs = 0;
    } else {
        offs = average;
        offs *= 0.4;
        if (offs > canvasHeight / 2) {
            offs = canvasHeight / 2;
        }
        // pixelate
        offs = Math.round(offs / 6);
        offs *= 4;
    }


    // red
    canvasContext.fillStyle = '#952E8A';
    canvasContext.fillRect(
        0,
        canvasHeight / 2 - offs - 6,
        canvasWidth,
        offs * 2
    );

    if (audioVolumeControl.value === 0) {
        offs = 0;
    } else {
        offs = average;
        offs *= 0.3;
        if (offs > canvasHeight / 2) {
            offs = canvasHeight / 2;
        }
        // pixelate
        offs = Math.round(offs / 6);
        offs *= 4;
    }

    canvasContext.fillStyle = '#BF354B';
    canvasContext.fillRect(
        0,
        canvasHeight / 2 - offs - 6,
        canvasWidth,
        offs * 2
    );

    // yellow
    if (audioVolumeControl.value === 0) {
        offs = 0;
    } else {
        offs = average;
        offs *= 0.2;
        if (offs > canvasHeight / 2) {
            offs = canvasHeight / 2;
        }
        // pixelate
        offs = Math.round(offs / 6);
        offs *= 4;
    }

    canvasContext.fillStyle = '#FFB003';
    canvasContext.fillRect(
        0,
        canvasHeight / 2 - offs - 6,
        canvasWidth,
        offs * 2
    );

    // pale yellow
    if (audioVolumeControl.value === 0) {
        offs = 0;
    } else {
        offs = average;
        offs *= 0.05;
        if (offs > canvasHeight / 2) {
            offs = canvasHeight / 2;
        }
        // pixelate
        offs = Math.round(offs / 6);
        offs *= 4;
    }

    canvasContext.fillStyle = '#EDE06D';
    canvasContext.fillRect(
        0,
        canvasHeight / 2 - offs - 6,
        canvasWidth,
        offs * 2
    );
};
// end of drunk code. it works really well what the fuck

// finally do a check to see if this is the users first time
var isUserAWeeb = window.localStorage.getItem('isAWeeb');
if (location.href.indexOf("index.html") !== -1) {
    if (!isUserAWeeb) {
        showInfo('First time?', `<br>
            Sure seems like it. Some important things:<br>
            <br>
            If audio isn\'t playing, make sure you allowed audio on this site and press OK.<br>
            <br>
            You would have heard some noises by now if it worked<br>
            <br>
            Volume controls in bottom left.<br>
            <br>
            Right click on text and most images for TTS. Escape or S to make it shut up.`,'OK', 500, () => {
            musicAudioElement.play();
            audioContext.resume();
            musicAudioElement.muted = false;
            musicAudioElement.currentTime = 0;
            hideInfo();
            window.localStorage.setItem('isAWeeb', true);
        });
    } else {
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
            showInfo('Chrome, huh?', 'This window appears every time you refresh because chrome is strict about autoplaying audio, which I guess is fair.<br><br>Press OK to continue and have the full audiovisual experience.','OK', 350, () => {
                musicAudioElement.play();
                audioContext.resume();
                musicAudioElement.muted = false;
                hideInfo();
            });
        } else {
            musicAudioElement.play();
            audioContext.resume();
            musicAudioElement.muted = false;
        }
    }

}