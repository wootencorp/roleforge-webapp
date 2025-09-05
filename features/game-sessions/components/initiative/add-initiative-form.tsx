'use client'

import { useState } from 'react'
import { Plus, Dice6, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { rollDice } from '../../lib/dice-utils'

interface AddInitiativeFormProps {
  onAdd: (entry: {
    name: string
    initiative: number
    hitPoints: { current: number; max: number; temp: number }
    type: 'player' | 'npc'
    armorClass?: number
  }) => void
  onCancel: () => void
}

export function AddInitiativeForm({ onAdd, onCancel }: AddInitiativeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    initiative: '',
    currentHP: '',
    maxHP: '',
    tempHP: '0',
    type: 'npc' as 'player' | 'npc',
    armorClass: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.initiative) return

    onAdd({
      name: formData.name.trim(),
      initiative: parseInt(formData.initiative),
      hitPoints: {
        current: parseInt(formData.currentHP) || 1,
        max: parseInt(formData.maxHP) || 1,
        temp: parseInt(formData.tempHP) || 0
      },
      type: formData.type,
      armorClass: formData.armorClass ? parseInt(formData.armorClass) : undefined
    })

    // Reset form
    setFormData({
      name: '',
      initiative: '',
      currentHP: '',
      maxHP: '',
      tempHP: '0',
      type: 'npc',
      armorClass: ''
    })
  }

  const rollInitiative = () => {
    const roll = rollDice('1d20')
    setFormData(prev => ({ ...prev, initiative: roll.total.toString() }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Add to Initiative</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Character/NPC name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'player' | 'npc') => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player Character</SelectItem>
                  <SelectItem value="npc">NPC/Monster</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initiative">Initiative</Label>
              <div className="flex space-x-2">
                <Input
                  id="initiative"
                  type="number"
                  value={formData.initiative}
                  onChange={(e) => handleInputChange('initiative', e.target.value)}
                  placeholder="0"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={rollInitiative}
                  title="Roll d20"
                >
                  <Dice6 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxHP">Max HP</Label>
              <Input
                id="maxHP"
                type="number"
                value={formData.maxHP}
                onChange={(e) => handleInputChange('maxHP', e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="armorClass">AC</Label>
              <Input
                id="armorClass"
                type="number"
                value={formData.armorClass}
                onChange={(e) => handleInputChange('armorClass', e.target.value)}
                placeholder="10"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentHP">Current HP</Label>
              <Input
                id="currentHP"
                type="number"
                value={formData.currentHP}
                onChange={(e) => handleInputChange('currentHP', e.target.value)}
                placeholder={formData.maxHP || "1"}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempHP">Temp HP</Label>
              <Input
                id="tempHP"
                type="number"
                value={formData.tempHP}
                onChange={(e) => handleInputChange('tempHP', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add to Initiative
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

