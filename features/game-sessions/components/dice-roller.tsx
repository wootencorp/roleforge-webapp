'use client'

import { useState } from 'react'
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus, Minus, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useSessionDice } from '../hooks/use-sessions'
import { COMMON_DICE, COMMON_ROLLS, validateDiceExpression, formatDiceResult } from '../lib/dice-utils'
import { getErrorMessage } from '@/shared/lib/utils'

interface DiceRollerProps {
  sessionId: string
}

export function DiceRoller({ sessionId }: DiceRollerProps) {
  const [expression, setExpression] = useState('1d20')
  const [modifier, setModifier] = useState(0)
  const [advantage, setAdvantage] = useState<'normal' | 'advantage' | 'disadvantage'>('normal')
  const [purpose, setPurpose] = useState('')
  const [error, setError] = useState('')
  const [rolling, setRolling] = useState(false)

  const { rolls, roll } = useSessionDice(sessionId)

  const handleRoll = async () => {
    try {
      setError('')
      setRolling(true)

      const validation = validateDiceExpression(expression)
      if (!validation.isValid) {
        setError(validation.error || 'Invalid dice expression')
        return
      }

      await roll(expression, {
        modifier,
        advantage,
        purpose: purpose.trim() || undefined,
      })

      // Clear purpose after rolling
      setPurpose('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setRolling(false)
    }
  }

  const addToExpression = (dice: string) => {
    if (!expression || expression === '0') {
      setExpression(dice)
    } else {
      setExpression(prev => prev + '+' + dice)
    }
  }

  const clearExpression = () => {
    setExpression('')
    setModifier(0)
    setAdvantage('normal')
    setPurpose('')
    setError('')
  }

  const recentRolls = rolls.slice(-5).reverse()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-3">
        <h3 className="font-semibold">Dice Roller</h3>
        <p className="text-xs text-muted-foreground">
          Roll dice and share results with the party
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Quick Dice */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Dice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {COMMON_DICE.map((dice) => (
                <Button
                  key={dice.expression}
                  variant="outline"
                  size="sm"
                  onClick={() => addToExpression(dice.expression)}
                  className="text-xs"
                >
                  {dice.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Rolls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Common Rolls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {COMMON_ROLLS.map((commonRoll) => (
              <Button
                key={commonRoll.label}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExpression(commonRoll.expression)
                  setPurpose(commonRoll.label)
                }}
                className="w-full justify-start text-xs"
              >
                <span className="font-mono mr-2">{commonRoll.expression}</span>
                {commonRoll.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Custom Roll */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Custom Roll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Expression Input */}
            <div className="space-y-2">
              <Label htmlFor="expression">Dice Expression</Label>
              <div className="flex space-x-2">
                <Input
                  id="expression"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g., 2d6+3, 1d20, 4d6"
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearExpression}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
            </div>

            {/* Modifier */}
            <div className="space-y-2">
              <Label htmlFor="modifier">Modifier</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setModifier(prev => prev - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="modifier"
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setModifier(prev => prev + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Advantage/Disadvantage */}
            <div className="space-y-2">
              <Label>Advantage/Disadvantage</Label>
              <Select value={advantage} onValueChange={(value: any) => setAdvantage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="advantage">Advantage</SelectItem>
                  <SelectItem value="disadvantage">Disadvantage</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only applies to d20 rolls
              </p>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (Optional)</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Attack roll, Saving throw"
              />
            </div>

            {/* Roll Button */}
            <Button
              onClick={handleRoll}
              disabled={!expression.trim() || rolling}
              loading={rolling}
              className="w-full"
            >
              <Dice6 className="mr-2 h-4 w-4" />
              Roll Dice
            </Button>
          </CardContent>
        </Card>

        {/* Recent Rolls */}
        {recentRolls.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Rolls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentRolls.map((diceRoll) => (
                <div
                  key={diceRoll.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{diceRoll.expression}</span>
                      {diceRoll.advantage !== 'normal' && (
                        <Badge variant="outline" className="text-xs">
                          {diceRoll.advantage}
                        </Badge>
                      )}
                    </div>
                    {diceRoll.purpose && (
                      <p className="text-xs text-muted-foreground truncate">
                        {diceRoll.purpose}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{diceRoll.result}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(diceRoll.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

