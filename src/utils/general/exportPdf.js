export const exportAsPDF = (fileName, contents, options, callback) => {
  var file =
    'data:text/html;charset=UTF-8,' +
    encodeURIComponent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
      </head>
      <body>
        ${contents}
      </body>
      <style>
        h1,h2,h3,h4 {
          font-size: 13px;
        }
        body {
          padding-left: 10px;
          padding-right: 10px;
        }
      </style>
    </html>
  `)

  window.browserWindow.createWindowForPDF(file, fileName, options, callback)
}
