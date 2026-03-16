class TicTacToe {
    constructor() {
        this.board = Array(3).fill(null).map(() => Array(3).fill(null));
        this.currentPlayer = 'X';
        this.winner = null;
    }

    makeMove(row, col) {
        if (this.board[row][col] === null && this.winner === null) {
            this.board[row][col] = this.currentPlayer;

            if (this.checkWinner()) {
                this.winner = this.currentPlayer;
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            }

            return true; // Move was valid
        }

        return false; // Move was invalid
    }

    checkWinner() {
        // Check rows, columns, and diagonals for a winner
        for (let i = 0; i < 3; i++) {
            if (
                this.board[i][0] &&
                this.board[i][0] === this.board[i][1] &&
                this.board[i][1] === this.board[i][2]
            ) {
                return true;
            }

            if (
                this.board[0][i] &&
                this.board[0][i] === this.board[1][i] &&
                this.board[1][i] === this.board[2][i]
            ) {
                return true;
            }
        }

        if (
            this.board[0][0] &&
            this.board[0][0] === this.board[1][1] &&
            this.board[1][1] === this.board[2][2]
        ) {
            return true;
        }

        if (
            this.board[0][2] &&
            this.board[0][2] === this.board[1][1] &&
            this.board[1][1] === this.board[2][0]
        ) {
            return true;
        }

        return false;
    }

    checkDraw() {
        return this.board.flat().every(cell => cell !== null) && this.winner === null;
    }

    reset() {
        this.board = Array(3).fill(null).map(() => Array(3).fill(null));
        this.currentPlayer = 'X';
        this.winner = null;
    }
}


module.exports = {
    TicTacToe  
};