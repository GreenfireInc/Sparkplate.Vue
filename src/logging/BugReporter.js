/*
 * Contributors: Tim Reynolds
 *
 * Description: Checks getBugTracking statuc through IPC render and if enabled will save
 * a local error log (see windowFunctions.js) and then make API call to backlog.com
 *
 */
class BugReporter {
  // NOTE: removed constructor that setup jsstore log
  async catchError(error) {
    // console.log('** BugReproter catchError top hit *******')
    // NOTE: go back to my original code where BugReporter class handless all error reporting calls
    // Unable to call windowFunctions from BugTracking class as the file is not importing properly
    try {
      var dt = new Date()
      var utcDate = dt.toUTCString()
      // console.log('** BugReporter utcDAte >>> ', utcDate)
      // local jsstore can not be implemented here when background.js imports BugReporter
      // use BugTracking Class to manage bugTrackingEnabled status through ipc call
      // ipcBugTracking returns an Object with the status attribute
      const ipcBugTracking = await window.ipcRenderer.invoke('getBugTracking', {
        timestamp: utcDate
      })
      // console.log('** from BugReporter ipcBugTracking Status >>', ipcBugTracking)
      if (ipcBugTracking) {
        await window.bugStore.set(utcDate, error)
        // Initial test account that was setup
        // const apiURL = 'https://green001.backlog.com/api/v2/issues?apiKey=raq2ZWTL3fzXILEpsfAvRJcBv5NthaKCqleGxrKrYv3OGkKtqUeDfZRdw61J082z'
        const apiURL =
          'https://greenfire.backlog.com/api/v2/issues?apiKey=45OVcJTw8p6IEQkttOwWGkappR1qkfbzFdmMUp9rN6u6x7vR8NVfan75jLhGE2HQ'
        const json = JSON.stringify({
          projectId: 84000,
          summary: error,
          issueTypeId: 357978,
          priorityId: 3
        })
        // updating to window.axios for security through IPC
        const response = await window.axios.post(apiURL, json, {
          headers: {
            // Overwrite Axios automatically set Content-Type
            'Content-Type': 'application/json'
          }
        })
        console.log('** backlog response >>', response)
      }
    } catch (error) {
      console.log(error)
    }
  }
}
const bugReporter = new BugReporter()
export default bugReporter
