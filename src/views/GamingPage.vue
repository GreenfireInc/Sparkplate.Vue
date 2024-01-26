<template>
  <div>
    <div id="board"></div>
    <!-- In this section, I state the status and Portable Game Notation features of what the chessboard game will carry -->
    <p id="status-wrapper">Status: <span id="status"></span></p>
    <p id="pgn-wrapper">PGN: <span id="pgn"></span></p>
    <div class="btn-wrapper">
      <!-- This section contains more of the features that the chessboard will execute such as Start, Clear, and Flip -->
      <input class="game-button" type="button" id="startBtn" value="Start" />
      <input class="game-button" type="button" id="clearBtn" value="Clear" />
      <input class="game-button" type="button" id="colorBtn" value="Flip" />
    </div>
  </div>
</template>

<script>
//I import jquery, chessboardjs and chess.js in the scrip tag section to enable and construct the chess board game
import $ from 'jquery'
import ChessBoard from 'chessboardjs'

export default {
  name: 'GamingPage',
  data() {
    return {}
  },
  async mounted() {
    // This section create the background-base of the chess board game will be located
    try {
      //the variable of the game are created in this section
      const { default: Chess } = await import('chess.js')
      let game = new Chess()

      var statusEl = $('#status')
      var fenEl = $('#fen')
      var pgnEl = $('#pgn')

      // do not pick up pieces if the game is over
      // only pick up pieces for the side to move
      var onDragStart = function (source, piece, position, orientation) {
        // Use position and orientation within the function
        console.log('Position:', position)
        console.log('Orientation:', orientation)

        if (
          game.game_over() === true ||
          (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (game.turn() === 'b' && piece.search(/^w/) !== -1)
        ) {
          return false
        }
      }

      var onDrop = function (source, target) {
        // see if the move is legal
        var move = game.move({
          from: source,
          to: target,
          promotion: 'q'
        })

        // illegal move
        if (move === null) return 'snapback'

        updateStatus()
      }

      var onSnapEnd = function () {
        board.position(game.fen())
      }
      //update the status of the game after each move
      var updateStatus = function () {
        var status = ''
        //check whose turn is it by looking at the color of piece
        var moveColor = 'White'
        if (game.turn() === 'b') {
          moveColor = 'Black'
        }
        //check if the at this point of the game, there is a draw or if either oponent has win
        if (game.in_checkmate() === true) {
          status = 'Game over, ' + moveColor + ' is in checkmate.'
        } else if (game.in_draw() === true) {
          status = 'Game over, drawn position'
        } else {
          status = moveColor + ' to move'

          if (game.in_check() === true) {
            status += ', ' + moveColor + ' is in check'
          }
        }

        statusEl.html(status)
        fenEl.html(game.fen())
        pgnEl.html(game.pgn())
      }

      var cfg = {
        snapbackSpeed: 550,
        appearSpeed: 1500,
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        pieceTheme:
          'http://www.willangles.com/projects/chessboard/img/chesspieces/wikipedia/{piece}.png',
        onSnapEnd: onSnapEnd
      }

      var board = new ChessBoard('board', cfg)
      $(window).resize(board.resize)
      //calling function to update status
      updateStatus()
      //executing desired feature based on selection ( clear, start, or flip)
      $('#startBtn').on('click', board.start)
      $('#clearBtn').on('click', board.clear)
      $('#colorBtn').on('click', board.flip)
    } catch (error) {
      console.error('Error importing chess.js:', error)
    }
  }
}
</script>

<style>
/* This section contains the style of the how the chess game pieces and text/content will look like */
@import url(https://fonts.googleapis.com/css?family=Lato:100,900,300);
* {
  font-family: 'Lato', Arial, Helvetica, sans-serif !important;
  color: #2e313f;
}
html {
  overflow: none;
}
body {
  background-color: #d89454;
  overflow: none;
}
p#status-wrapper {
  background-color: #756563;
  width: 100%;
  padding: 1em;
  font-weight: 900;
  font-size: 1.125em;
  position: absolute;
  top: -18px;
  left: 0;
  color: #fffffa;
}
p#pgn-wrapper {
  font-weight: 900;
  font-size: 1.25em;
  max-width: 600px;
  margin: 0 auto;
}
span#pgn {
  font-size: 0.85em;
  font-weight: 300;
  color: #fff;
}
.btn-wrapper {
  width: 100%;
  max-width: 600px;
  min-width: 320px;
  margin: 0 auto;
}
#startBtn,
#clearBtn,
#colorBtn {
  text-align: center;
  position: relative;
  font-size: 1.78em;
  background: #756563;
  color: #fffffa;
  font-weight: 900;
  padding: 0em;
  width: 197px;
  max-width: 197px;
}
#board {
  width: 100%;
  max-width: 600px;
  min-width: 320px;
  margin: 3.75em auto 1.25em auto;
}
.board-b72b1 {
  border: 15px outset #756563;
}
.white-1e1d7 {
  background-color: #f2f4f1;
  color: #5a3336;
}
.black-3c85d {
  background-color: #5a3336;
  color: #f2f4f1;
}
.highlight1-32417,
.highlight2-9c5d2 {
  -webkit-box-shadow: inset 0 0 3px 3px rgba(209, 75, 45, 0.15);
  -moz-box-shadow: inset 0 0 3px 3px rgba(209, 75, 45, 0.15);
  box-shadow: inset 0 0 3px 3px rgba(209, 75, 45, 0.15);
}
</style>
