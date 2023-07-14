import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => { //show bookmark
   const bookmarkTitleElement = document.createElement("div");
   const controlsElement = document.createElement("div");
   const newBookmarkElement = document.createElement("div");

   bookmarkTitleElement.textContent = bookmark.desc;
   bookmarkTitleElement.className = "bookmark-title";
   controlsElement.className = "bookmark-controls";

   setBookmarkAttributes("play", onPlay, controlsElement);
   setBookmarkAttributes("delete", onDelete, controlsElement);

   newBookmarkElement.id = "bookmark-" + bookmark.time;  //give title of current time as a id to the bookmark
   newBookmarkElement.className = "bookmark";
   newBookmarkElement.setAttribute("timestamp", bookmark.time); //time stamp of the any specific bookamrk

   newBookmarkElement.appendChild(bookmarkTitleElement);
   newBookmarkElement.appendChild(controlsElement);
   bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {  //It views all the bookmarks
   const bookmarksElement = document.getElementById("bookmarks");
   bookmarksElement.innerHTML = ""; //if no bookmark then mark it to empty string

   if (currentBookmarks.length > 0) {  //if bookmark present then show it in UI
      for (let i = 0; i < currentBookmarks.length; i++) {
         const bookmark = currentBookmarks[i];
         addNewBookmark(bookmarksElement, bookmark); //pass one bookmark at a time
      }
   } else { //if no bookmark
      bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
   }

   return;
};


// play video at bookmarked timestamp
const onPlay = async e => {
   const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
   const activeTab = await getActiveTabURL();

   chrome.tabs.sendMessage(activeTab.id, {
      type: "PLAY",
      value: bookmarkTime,
   });
};


// Delete a bookmark
const onDelete = async e => {
   const activeTab = await getActiveTabURL();
   const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
   const bookmarkElementToDelete = document.getElementById(
      "bookmark-" + bookmarkTime
   );

   bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

   chrome.tabs.sendMessage(activeTab.id, {
      type: "DELETE",
      value: bookmarkTime,
   }, viewBookmarks);
};


//add playbutton the each bookmark from there we will go to that time in the video and play form there 
const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
   const controlElement = document.createElement("img");

   controlElement.src = "assets/" + src + ".png";
   controlElement.title = src;
   controlElement.addEventListener("click", eventListener);
   controlParentElement.appendChild(controlElement); //there will we a container for all control elements and we are passing that in in this function
};

document.addEventListener("DOMContentLoaded", async () => {  // it fires when an HTML document is intially loaded, This is essentially when we want to load all of our bookmark and show them
   const activeTab = await getActiveTabURL();
   const queryParameters = activeTab.url.split("?")[1];
   const urlParameters = new URLSearchParams(queryParameters);

   const currentVideo = urlParameters.get("v");

   if (activeTab.url.includes("youtube.com/watch") && currentVideo) { //when we are on youtube video page
      chrome.storage.sync.get([currentVideo], (data) => { //get current video bookmark
         const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];  //Contain all the bookmark

         viewBookmarks(currentVideoBookmarks); //pass all the bookmark to viewBookmarks function
      });
   } else {  //when we are not on youtube video page. 
      const container = document.getElementsByClassName("container")[0]; //get container class of our extenion ui and add the following div

      container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
   }
});
