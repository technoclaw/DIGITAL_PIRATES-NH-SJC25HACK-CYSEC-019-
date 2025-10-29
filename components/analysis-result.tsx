"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Variant = "success" | "warning" | "danger" | "info"

export function AnalysisResult({
  title,
  message,
  variant = "info",
}: {
  title: string
  message: string
  variant?: Variant
}) {
  const colorVar =
    variant === "success"
      ? "--color-success"
      : variant === "warning"
        ? "--color-warning"
        : variant === "danger"
          ? "--color-destructive"
          : "--color-primary"

  const fgVar =
    variant === "success"
      ? "--color-success-foreground"
      : variant === "warning"
        ? "--color-warning-foreground"
        : variant === "danger"
          ? "--color-destructive-foreground"
          : "--color-primary-foreground"

  return (
    <Card className="overflow-hidden">
      <div aria-hidden className="h-1 w-full" style={{ backgroundColor: `var(${colorVar})` }} />
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed">
        <p>{message}</p>
        <div
          className={cn("mt-3 inline-flex rounded px-2 py-1 text-xs")}
          style={{
            backgroundColor: `color-mix(in oklab, var(${colorVar}) 15%, transparent)`,
            color: `var(${fgVar})`,
            border: `1px solid color-mix(in oklab, var(${colorVar}) 45%, transparent)`,
          }}
        >
          {variant.toUpperCase()}
        </div>
      </CardContent>
    </Card>
  )
}
