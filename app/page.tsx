'use client'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useState } from 'react'

export default function Page() {
    const [game, setGame] = useState(new Chess())

    return (
        <div>
            <Chessboard
                position={game.fen()}
                isDraggablePiece={({ piece }) => piece[0] == 'w'}
            />
        </div>
    )
}
