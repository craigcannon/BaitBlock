Parse.initialize("KEYS", "HERE");

var tweets = document.getElementsByClassName("tweet original-tweet js-stream-tweet js-actionable-tweet js-profile-popup-actionable js-original-tweet");
var currentUser = document.getElementsByClassName("account-group js-mini-current-user")[0].getAttribute("data-user-id");

for (var i = 0; i < tweets.length; i++) {
    (function (el) {
        createButton(el);
    }(tweets[i]));
};

function createButton(el) {
    var targetDiv = el.getElementsByClassName("time")[0];
    var tweet = el.getAttribute('data-tweet-id');
    var tweet = "stream-item-tweet-" + tweet;

    var button = document.createElement('button');
    button.style.cssText = "width:50px; float:right; margin-left:-50px;";
    var counter = document.createElement('p');
    counter.style.cssText = "width:80px; float:right;";

    var TweetObject = Parse.Object.extend("TweetObject");
    var tweetObject = new TweetObject();
    var query = new Parse.Query(TweetObject);

    query.equalTo('tweetID', tweet);
    query.first({
        success: function(object) {
            if (typeof object === "undefined")
            {
                var t = document.createTextNode("Bait?");
                button.appendChild(t);
                var c = document.createTextNode("Block Count: " + 0);
                counter.appendChild(c);
            }
            else
            {
                var objectCount = object.get("count");
                var userList = object.get("blockers");

                if (objectCount > 5)
                {
                   blocker(tweet); 
                }
                else 
                {
                    if (userList.indexOf(currentUser) > -1)
                    {
                        blocker(tweet); 
                    }
                    else
                    {
                        var t = document.createTextNode("Bait?");
                        button.appendChild(t);
                        var c = document.createTextNode("Block Count: " + objectCount);
                        counter.appendChild(c);
                    }
                    
                }
            }
        },
        error: function(error) {
            //console.log("errrrr");
        }
    });
 
    button.addEventListener('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
	    blocker(tweet);
        sendData(el, tweet, tweetObject, TweetObject);
        return false;
	}, false);
	 
    targetDiv.appendChild(button);
    targetDiv.appendChild(counter);
 
    return targetDiv;
}
 
function handleInsertedNode(event) {
    var el = event.target;
    var tweets;
    if (el.className && 
        el.className.toLowerCase().indexOf("js-stream-item") > -1) {
        tweets = el.getElementsByClassName("original-tweet")
        createButton(tweets[tweets.length-1]);
    }
}
 
document.addEventListener("DOMNodeInserted", handleInsertedNode);
 
function sendData(el, tweet, tweetObject, TweetObject) {
    var user = el.getAttribute('data-user-id');
    var handle = el.getAttribute('data-screen-name');
    var avatar = el.getElementsByClassName("avatar js-action-profile-avatar")[0].getAttribute("src");

    var queryData = new Parse.Query(TweetObject);

    queryData.equalTo('tweetID', tweet);
    queryData.first({
        success: function(object) {
            if (typeof object === "undefined")
            {
                tweetObject.save({"tweetID": tweet, "userID": user, "count": 1}, {
                    success: function(object) {
                        console.log(tweet + " made");
                    }
                });
                tweetObject.add("blockers", currentUser);
                tweetObject.save();
            }
            else
            {
                //object exists. increment count.
                object.increment("count");
                object.add("blockers", currentUser);
                object.save();
                console.log(tweet + " incremented");
            }
        },
        error: function(error) {
            //console.log("errrrr");
        }
    });

    var AccountObject = Parse.Object.extend("AccountObject");
    var accountObject = new AccountObject();

    var accountQueryData = new Parse.Query(AccountObject);

    accountQueryData.equalTo('userID', user);
    accountQueryData.first({
        success: function(object) {
            if (typeof object === "undefined")
            {
                accountObject.save({"userID": user, "count": 1, "handle": handle, "avatar": avatar}, {
                    success: function(object) {
                        console.log(accountObject + " made");
                    }
                });
            }
            else
            {
                //object exists. increment count.
                object.increment("count");
                object.save();
                console.log(accountObject + " incremented");
            }
        },
        error: function(error) {
            //console.log("errrrr");
        }
    });

}

function blocker(tweet) {
    //console.log(tweet);

	document.getElementById(tweet).style.backgroundColor = "black";
	document.getElementById(tweet).style.color = "red";
 
	var targetDiv = document.getElementById(tweet).getElementsByClassName("time")[0];
	targetDiv.style.display = "none";
 
	var targetDiv = document.getElementById(tweet).getElementsByClassName("js-tweet-text tweet-text")[0];
	targetDiv.innerHTML = "BAIT BLOCKED";
	targetDiv.style.fontSize = "30px";
	targetDiv.style.marginTop = "10px";
 
	var targetDiv = document.getElementById(tweet).getElementsByClassName("context")[0];
	targetDiv.style.display = "none";
 
	var targetDiv = document.getElementById(tweet).getElementsByClassName("details with-icn js-details")[0];
	targetDiv.style.display = "none";
 
	var targetDiv = document.getElementById(tweet).getElementsByClassName("tweet-actions js-actions")[0];
	targetDiv.style.display = "none";
}