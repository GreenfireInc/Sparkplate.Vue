/*
 * Contributors: Tim Reynolds
 *
 * Description: Class for tracking when bugTrackedEnabled boolean changes. Toggle is found in User Settings
 * This class is needed as User Settings can not be accessed through background.js
 * NOTE: Tried moving a report error function into this class but ran into the bugStore function that is tied to the windowsFunctions.js
 * Seeing import issues for windowsFunctions.js in this file and importing ipcRenderer in BugReporter.js
 */

class BugTracking {
  constructor() {
    this.status = false
  }

  getStatus() {
    return this.status
  }

  setStatus({ status }) {
    this.status = status
  }
}

export default new BugTracking()
