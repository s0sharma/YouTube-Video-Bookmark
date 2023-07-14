// Liten to any update in our tab system and find the most recent tab or our current tab and see if it is youtube page
//So we have a listener to listen to tabs, we got permission to access the chrome tab

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) { //check if we have a url if yes then check if it includes youtube.com/watch (check every video we are watching has this "youtube.com/watch"), we want that specific page
    const queryParameters = tab.url.split("?")[1]; //need unique id for each video so we can use it to store the video in our storage. 
    const urlParameters = new URLSearchParams(queryParameters); //interface to worl with URLSearchParams 

    // messaging system happen between the extensio, we are going to send a message to our contentscript that basically says a new video has loaded and this the video id of that video
    chrome.tabs.sendMessage(tabId, {  //from documentation
      type: "NEW", //type of event, which is a new video event
      videoId: urlParameters.get("v"), //v will grab the id (go to a youtube video and see)
    });
  }
});

// In our contentScript we will add a listener that is going to listen any of the incoming messages
