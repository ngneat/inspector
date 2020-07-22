declare const ng: any;

function isAngularAppRunning(): boolean {
  if (
    typeof ng !== "undefined" &&
    ng.getComponent &&
    typeof ng.getComponent === "function"
  ) {
    return true;
  }
  return false;
}

window.addEventListener("message", (event) => {
  if (event.data.command === "start-ng-check") {
    if (isAngularAppRunning()) {
      window.postMessage({ type: "ng-check-status", isAngular: true }, "*");
    } else {
      window.postMessage({ type: "ng-check-status", isAngular: false }, "*");
    }
  }
});
