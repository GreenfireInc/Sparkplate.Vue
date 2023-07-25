import FileStorage from '@/utils/general/fileStorage'
import bugReporter from '../logging/BugReporter'

export const windowsFunc = () => {
  window.emailConfig = new FileStorage({
    configName: 'email-config'
  })

  window.journalHistoryStore = new FileStorage({
    configName: 'journal-history'
  })

  window.bugStore = new FileStorage({
    configName: 'sparkplate-errors'
  })

  window.notificationFileSys = new FileStorage({
    configName: 'notification-store'
  })

  window.onerror = (message) => {
    // console.log('window.onerror > ', message)
    bugReporter.catchError(message)
  }

  window.createLog = async (data) => {
    // not seeing this function being called, remove when cleaning up code
    const { title, desc, note } = data
    const notification = {
      id: Date.now(),
      title: '',
      desc: '',
      date: new Date(),
      note: ''
    }

    if (data) {
      const newNotification = { ...notification }
      newNotification.title = title
      newNotification.note = note
      newNotification.desc = desc
      newNotification.date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })

      await window.notificationFileSys.set(newNotification.id, newNotification)
    }
  }
}
