<!-- <template>
  <div>
    <div id="board"></div>


    <p id="status-wrapper">Status: <span id="status"></span></p>
    <p id="pgn-wrapper">PGN: <span id="pgn"></span></p>
    <div class="btn-wrapper">
      <input class="game-button" type="button" id="startBtn" value="Start" />
      <input class="game-button" type="button" id="clearBtn" value="Clear" />
      <input class="game-button" type="button" id="colorBtn" value="Flip" />
    </div>
  </div>
</template>

<script>
  const Chess = () => import('chess.js');
  import $ from 'jquery';
  import ChessBoard from 'chessboardjs'
  let game;
  game = new Chess();
  $(function() {
  var statusEl = $('#status');
  var fenEl = $('#fen');
  var pgnEl = $('#pgn');

  // do not pick up pieces if the game is over
  // only pick up pieces for the side to move
  var onDragStart = function(source, piece, position, orientation) {
    // Use position and orientation within the function
    console.log('Position:', position);
    console.log('Orientation:', orientation);

    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  }


  // var board = new ChessBoard('board', cfg);


  var onDrop = function(source, target) {
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    // illegal move
    if (move === null) return 'snapback';

    updateStatus();
  };

  // update the board position after the piece snap 
  // for castling, en passant, pawn promotion
  var onSnapEnd = function() {
    board.position(game.fen());
  };

  var updateStatus = function() {
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (game.in_draw() === true) {
      status = 'Game over, drawn position';
    }

    // game still on
    else {
      status = moveColor + ' to move';

      // check?
      if (game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }

    statusEl.html(status);
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());
  };

  var cfg = {
    snapbackSpeed: 550,
    appearSpeed: 1500,
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    pieceTheme: 'http://www.willangles.com/projects/chessboard/img/chesspieces/wikipedia/{piece}.png',
    onSnapEnd: onSnapEnd
  };

  var board = new ChessBoard('board', cfg);
  $(window).resize(board.resize);

  updateStatus();

  $('#startBtn').on('click', board.start);
  $('#clearBtn').on('click', board.clear);
  $('#colorBtn').on('click', board.flip);
  });
  export default {
    name: 'GamingPage',
    data() {
      return {
      }
    }
  }
</script>

<style>
  @import url(https://fonts.googleapis.com/css?family=Lato:100,900,300);
  * {
    font-family: 'Lato', Arial, Helvetica, sans-serif !important;
    color:#2E313F;
  }
  html {
    overflow:none;
  }
  body {
    background-color:#d89454;
    overflow:none;
  }
  p#status-wrapper {
    background-color:#756563;
    width:100%;
    padding:1em;
    font-weight:900;
    font-size:1.125em;
    position:absolute;
    top:-18px;
    left:0;
    color:#fffffa;
  }
  p#pgn-wrapper {
    font-weight:900;
    font-size:1.25em;
    max-width:600px;
    margin:0 auto;
    
  }
  span#pgn{
    font-size:0.85em;
    font-weight:300;
    color:#FFF;
  }
  .btn-wrapper {
    width:100%;
    max-width:600px;
    min-width:320px;
    margin:0 auto;
  }
  #startBtn, #clearBtn, #colorBtn {
    text-align:center;
    position:relative;
    font-size:1.78em;
    background:#756563;
    color:#fffffa;
    font-weight:900;  
    padding:0em;
    width:197px;  
    max-width:197px;
  }

  #board {
    width:100%;
    max-width:600px;
    min-width:320px;
    margin:3.75em auto 1.25em auto; 
  }
  .board-b72b1 {
    border: 15px outset #756563;
  }
  /* white square */
  .white-1e1d7 {
    background-color: #F2F4F1;
    color: #5a3336;
  }
  /* black square */
  .black-3c85d {
    background-color: #5A3336;
    color: #f2f4f1;
  }

  /* highlighted square */
  .highlight1-32417, .highlight2-9c5d2 {
    -webkit-box-shadow: inset 0 0 3px 3px rgba(209, 75, 45, 0.15);
    -moz-box-shadow: inset 0 0 3px 3px rgba(209, 75, 45, 0.15);
    box-shadow: inset 0 0 3px 3px rgba(209, 75, 45, 0.15);
  }
</style> -->

<template>
  <div>
    <div id="board"></div>

    <p id="status-wrapper">Status: <span id="status"></span></p>
    <p id="pgn-wrapper">PGN: <span id="pgn"></span></p>
    <div class="btn-wrapper">
      <input class="game-button" type="button" id="startBtn" value="Start" />
      <input class="game-button" type="button" id="clearBtn" value="Clear" />
      <input class="game-button" type="button" id="colorBtn" value="Flip" />
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import ChessBoard from 'chessboardjs'

export default {
  name: 'GamingPage',
  data() {
    return {}
  },
  async mounted() {
    try {
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

      var updateStatus = function () {
        var status = ''

        var moveColor = 'White'
        if (game.turn() === 'b') {
          moveColor = 'Black'
        }

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

      updateStatus()

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
