"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

type DraftableInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange"
> & {
  value: string
}

export function DraftableInput({
  value,
  onFocus,
  onBlur,
  ...props
}: DraftableInputProps) {
  const [draft, setDraft] = React.useState(value)
  const [focused, setFocused] = React.useState(false)

  return (
    <Input
      {...props}
      value={focused ? draft : value}
      onFocus={(e) => {
        setFocused(true)
        setDraft(value)
        onFocus?.(e)
      }}
      onChange={(e) => {
        setDraft(e.target.value)
      }}
      onBlur={(e) => {
        setFocused(false)
        onBlur?.(e)
      }}
    />
  )
}