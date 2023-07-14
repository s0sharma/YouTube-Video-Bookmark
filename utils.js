// We want to show it current page is not youtube then show this is not a youtube page

// From documentation
export async function getActiveTabURL() {
   let queryOptions = { active: true, currentWindow: true };
   let [tab] = await chrome.tabs.query(queryOptions);
   return tab;
}