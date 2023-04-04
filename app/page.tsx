'use client'
import { Chessboard } from 'react-chessboard'
import { Chess, Square } from 'chess.js'
import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

// Stub OpenAI make a move
async function gpt4Move(game: Chess) {
    const possibleMoves = game.moves()
    console.log(possibleMoves)
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return
    const randomIndex = Math.floor(Math.random() * possibleMoves.length)
    return possibleMoves[randomIndex]
}

type MoveInput =
    | string
    | {
          from: string
          to: string
          promotion?: string | undefined
      }

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

            const { move } = z
                .object({
                    move: z.string(),
                })
                .parse(await response.json())

            console.log(`AI Move: ${move}`)

            setGame((game) => {
                game.move(move)
                return game
            })
        },
    })

    const makeAMove = useCallback((move: MoveInput, game: Chess) => {
        const gameCopy = new Chess(game.fen())
        gameCopy.move(move)
        setGame(gameCopy)
        return // null if the move was illegal, the move object if the move was legal
    }, [])

    const onPieceDrop = useCallback(
        (sourceSquare: Square, targetSquare: Square) => {
            // Make the user move
            const gameCopy = new Chess(game.fen())
            gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            })
            setGame(gameCopy)

            setTimeout(async () => {
                const responseMove = await gpt4Move(gameCopy)
                if (typeof responseMove !== 'undefined') {
                    makeAMove(responseMove, gameCopy)
                }
            }, 200)
            return true
        },
        [game, makeAMove],
    )

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
