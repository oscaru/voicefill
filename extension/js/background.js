/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if (typeof browser.runtime.getBrowserInfo === "function") {
  const TRACKING_ID = "UA-35433268-80";

  const analytics = new TestPilotGA({
    tid: TRACKING_ID,
    ds: "addon",
    an: "Voice Fill",
    aid: "voicefill@mozilla.com",
    av: "1.4.3",
  });

  browser.runtime.onMessage.addListener((event) => {
    console.log("[metrics] Event successfully sent. Calling analytics.");

    analytics
      .sendEvent("voice fill", event.type, event.content)
      .then((response) => {
        console.log("[metrics] Event successfully sent", response);
      })
      .catch((response, err) => {
        console.error("[metrics] Event failed while sending", response, err);
      });
  });
}

browser.browserAction.onClicked.addListener(function() {
  browser.storage.sync
    .get("searchProvider")
    .then((result) => {
      const url = result.searchProvider || "https://www.google.com";

      return browser.tabs.create({url});
    })
    .then((tab) => {
      const intervalConnection = setInterval(() => {
        browser.tabs
          .sendMessage(tab.id, {
            msg: "background script syn",
          })
          .then((response) => {
            clearInterval(intervalConnection);
          })
          .catch((error) => {
            // console.error(`Not connected yet. Retrying ${error}`);
          });
      }, 100);
    })
    .catch((error) => {
      console.log(`Error: ${error}`);
    });
});

// Chrome won't accept an SVG as the toolbar icon, so we'll just draw it
// manually.
(function() {
  const canvas = document.createElement("canvas");
  canvas.height = 16;
  canvas.width = 16;

  const image = new Image(16, 16);
  image.onload = () => {
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, 16, 16);
    chrome.browserAction.setIcon({
      imageData: context.getImageData(0, 0, 16, 16),
    });
  };
  image.src = "/assets/images/mic.svg";
})();
