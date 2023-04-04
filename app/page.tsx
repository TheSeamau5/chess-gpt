'use client'
import { Chessboard } from 'react-chessboard'
import { Chess, Square } from 'chess.js'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

export default function Page() {
    const [game, setGame] = useState(new Chess())

    const moveMutation = useMutation({
        mutationFn: async ({
            sourceSquare,
            targetSquare,
        }: {
            sourceSquare: Square
            targetSquare: Square
        }) => {
            // User Makes Move
            const gameCopy = new Chess(game.fen())
            gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            })
            setGame(gameCopy)

            // AI Makes Move
            const response = await fetch('/api', {
                method: 'POST',
                body: JSON.stringify({
                    moves: gameCopy.history(),
                }),
            })

            const { move, board } = z
                .object({
                    move: z.string(),
                    board: z.string(),
                })
                .parse(await response.json())

            console.log(`AI Move: ${move}`)

            setGame((game) => {
                game.move(move)
                return game
            })
        },
    })

    return (
        <div>
            <Chessboard
                position={game.fen()}
                isDraggablePiece={({ piece }) => piece[0] == 'w'}
                onPieceDrop={(sourceSquare, targetSquare) => {
                    moveMutation.mutate({ sourceSquare, targetSquare })
                    return true
                }}
            />
        </div>
    )
}
