/*
 * Contributors: Aciel Ochoa
 *
 * Description: This mixin file contains methods collecting/displaying
 *   toast notifications in different components throughout Sparkplate
 */

export default {
  methods: {
    collectEncryptionKeyToast(message, title = '') {
      const { $toast } = this

      return new Promise((resolve, reject) => {
        $toast.info(message, title, {
          timeout: 20000,
          displayMode: 'once',
          id: 'inputs',
          zindex: 999,
          position: 'center',
          drag: false,
          inputs: [
            ['<input type="password" placeholder="Password">'],
            ['<input type="password" placeholder="Confirm Password">']
          ],
          buttons: [
            [
              '<button><b>Confirm</b></button>',
              (instance, toast, button, e, inputs) => {
                // Update User profile on click of YES
                const encryptionKey = inputs[0].value
                if (!encryptionKey)
                  $toast.error('Please input an encryption key', 'Error')
                else if (encryptionKey.length < 6)
                  $toast.error(
                    'Your encryption must contain minimum of 6 characters',
                    'Error'
                  )
                else if (encryptionKey !== inputs[1].value)
                  $toast.error('The keys you entered do not match.', 'Error')
                else {
                  button.disabled = true
                  instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
                  resolve(encryptionKey)
                }
              },
              true
            ]
          ],
          onClosed: () => {
            reject(new Error('User timed out'))
          }
        })
      })
    },
    collectPassword(message, title = '') {
      const { $toast } = this

      return new Promise((resolve, reject) => {
        $toast.info(message, title, {
          timeout: 20000,
          displayMode: 'once',
          id: 'inputs',
          zindex: 999,
          position: 'center',
          drag: false,
          inputs: [['<input type="password" placeholder="Password">']],
          buttons: [
            [
              '<button><b>Confirm</b></button>',
              (instance, toast, button, e, inputs) => {
                // Update User profile on click of YES
                const encryptionKey = inputs[0].value
                if (!encryptionKey)
                  $toast.error('Please input password', 'Error')
                else if (encryptionKey.length < 6)
                  $toast.error(
                    'Your password must contain minimum of 6 characters',
                    'Error'
                  )
                else {
                  button.disabled = true
                  instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
                  resolve(encryptionKey)
                }
              },
              true
            ]
          ],
          onClosed: () => {
            reject(new Error('User timed out'))
          }
        })
      })
    }
  }
}
