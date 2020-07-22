let isStarted = false;
let isAngular = false;
const enablerSwitch = document.getElementById(
  "enablerSwitch"
) as HTMLInputElement;
const statusP = document.getElementById("status") as HTMLParagraphElement;
const tabQueryData = { active: true, currentWindow: true };

function initPopup(): void {
  chrome.tabs.query(tabQueryData, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { command: "check-connection" },
      (connectionResponse) => {
        if (
          connectionResponse &&
          connectionResponse.message === "connection-established"
        ) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { command: "check-ng-status" },
            (ngStatusResponse) => {
              if (ngStatusResponse.message === "checking-ng-status") {
                chrome.runtime.onMessage.addListener(
                  (message, sender, sendResponse) => {
                    if (message.command === "get-ng-status") {
                      isAngular = message.status;
                      enablerSwitch.disabled = !isAngular;
                      statusP.innerText = isAngular
                        ? "You can enable/disable this extension from below switch."
                        : "You can enable this extension only in an Angular application.";
                      chrome.storage.sync.get(["status"], (result) => {
                        isStarted = result.status === "started";
                        enablerSwitch.checked = isStarted;
                      });
                      sendResponse();
                      enablerSwitch.addEventListener("change", (event) => {
                        if ((event.target as HTMLInputElement).checked) {
                          chrome.tabs.sendMessage(
                            tabs[0].id,
                            { command: "start" },
                            (startResponse) => {
                              if (startResponse.message === "started") {
                                chrome.storage.sync.set({ status: "started" });
                                isStarted = true;
                              }
                            }
                          );
                        } else {
                          chrome.tabs.sendMessage(
                            tabs[0].id,
                            { command: "end" },
                            (endResponse) => {
                              if (endResponse.message === "ended") {
                                chrome.storage.sync.set({ status: "ended" });
                                isStarted = false;
                              }
                            }
                          );
                        }
                      });
                    }
                    sendResponse();
                  }
                );
              }
            }
          );
        } else {
          enablerSwitch.disabled = true;
          statusP.innerText =
            "You can enable this extension only in an Angular application.";
        }
      }
    );
  });
}

initPopup();
