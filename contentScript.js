// Add icon to youtube video by manupaluting DOM of the we page
// How our extension going to know when we navigate to a new web page, to add icon to add bookmark  -> backgroung.js
// In our contentScript we will add a listener that is going to listen any of the incoming messages from backgroung.js

(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = []; //Store all current video boomarks


    chrome.runtime.onMessage.addListener((obj, sender, response) => {// listener
        const { type, value, videoId } = obj; //destructre the values (coming from background.js)

        if (type === "NEW") {  //if new video is loaded
            currentVideo = videoId; //Set currnt video id
            newVideoLoaded(); //function that handle action with the new video
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        } else if (type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.get({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });

            response(currentVideo)
        }
    });



    // Fetch all bookmarks when a video is loaded
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []); //look in storage if currnet video has any bookmarks, if yes then fetch it, else return an empty array
            });
        });
    }


    //Contain all the functionality of the new video loaded
    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0]; //check if a bookmark button already exist
        console.log(bookmarkBtnExists);

        currentVideoBookmarks = await fetchBookmarks();

        // Add bookmark button to any youtube player
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img"); //image elment by we will click on the bookmark button

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");  //Pull the image
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";  //title show

            // Now we will find the place to add our button. We will add the the boothm left along with outher youtube control buttons
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0]; //We access the left element
            youtubePlayer = document.getElementsByClassName("video-stream")[0]; //Grab youtube player

            youtubeLeftControls.append(bookmarkBtn); // We will append our bookmark button in the row 
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler); //Listner to listent to any clicks on the button
        }
    }

    //Listner to listent to any clicks on the button
    // We need time stamp of the video at which point the user clicked on the button
    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime; //We can find the current time in attribute. This will return time in seconds
        const newBookmark = { //We will call the function only when  a new bookmark is made
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),  //will convert the time from second to standard time as shown in youtube
        };
        // console.log(newBookmark);

        currentVideoBookmarks = await fetchBookmarks();



        //Sync it to the chrome storage, set chrome storage with each bookmark
        // each video accordin to it's id that we are grabbing from the url will also map back to set of bookmarks in chrome storage
        chrome.storage.sync.set({  //from documentation
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
            // Things store in json in chrome storage. We spread currentVideoBookmarks and add new Bookmark here. And we sort bookmark on the based of time they were marked 
        });
    }

    // We were only checking if the new video is played then onlye we add our button. But when we refresh the same page then new page is not loaded to we call the newVideoLoaded function again to add the button.
    // We will the function twice but we are only adding button in this function, so it's not a big issue.
    newVideoLoaded();
})();


// convert the time from second to standard time as shown in youtube
const getTime = t => {
    var date = new Date(0);
    date.setSeconds(1);

    return date.toISOString().substring(11, 11 + 8);
}
