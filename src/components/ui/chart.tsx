"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip as RechartsTooltip, TooltipProps } from "recharts";

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    formatter?: (value: any) => string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}

interface ChartTooltipProps extends Partial<TooltipProps<any, any>> {
  content?: React.ReactNode;
}

export function ChartTooltip({
  cursor = true,
  content,
  ...props
}: ChartTooltipProps) {
  return (
    <RechartsTooltip
      cursor={cursor}
      content={content as React.ReactNode}
      {...props}
    />
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color?: string;
    payload: {
      [key: string]: any;
    };
  }>;
  label?: string;
  formatter?: (value: number) => string;
  nameKey?: string;
  hideLabel?: boolean;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  nameKey,
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && label && (
        <div className="text-xs font-medium">{label}</div>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1 text-xs">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />
              <span className="font-medium">
                {nameKey ? item.payload[nameKey] : item.name}:
              </span>
            </div>
            <div className="text-xs font-medium">
              {formatter
                ? formatter(item.value)
                : typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
