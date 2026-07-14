"use client";

import { type ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  type?: "line" | "bar" | "area";
  xAxisKey?: string;
  yAxisKey?: string;
  secondYAxisKey?: string;
  color?: string;
  secondColor?: string;
  height?: number;
  children?: ReactNode;
  className?: string;
}

const axisStyle = {
  tick: { fill: "#9CA3AF", fontSize: 11 },
  axisLine: false,
  tickLine: false,
} as const;

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface thin-border rounded-xl px-3.5 py-2.5 shadow-elevated">
      <p className="mb-1 text-xs font-medium text-on-surface-variant">{label as string}</p>
      {payload.map((entry, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color as string }}
          />
          <span className="text-on-surface font-semibold">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : String(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ChartCard({
  title,
  description,
  data,
  type = "line",
  xAxisKey = "name",
  yAxisKey = "value",
  secondYAxisKey,
  color = "#10B981",
  secondColor = "#059669",
  height = 280,
  children,
  className,
}: ChartCardProps) {
  const commonProps = {
    data,
    margin: { top: 5, right: 10, left: -15, bottom: 0 },
  };

  const gridStroke = "#E5E7EB";

  const renderChart = () => {
    const charts: Record<string, ReactNode> = {
      line: (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xAxisKey} {...axisStyle} />
          <YAxis {...axisStyle} />
          <Tooltip content={CustomTooltip} />
          <Line
            type="monotone"
            dataKey={yAxisKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: color }}
          />
          {secondYAxisKey && (
            <Line
              type="monotone"
              dataKey={secondYAxisKey}
              stroke={secondColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: secondColor }}
            />
          )}
        </LineChart>
      ),
      bar: (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xAxisKey} {...axisStyle} />
          <YAxis {...axisStyle} />
          <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(16,185,129,0.05)" }} />
          <Bar dataKey={yAxisKey} fill={color} radius={[4, 4, 0, 0]} />
          {secondYAxisKey && (
            <Bar dataKey={secondYAxisKey} fill={secondColor} radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      ),
      area: (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xAxisKey} {...axisStyle} />
          <YAxis {...axisStyle} />
          <Tooltip content={CustomTooltip} />
          <Area
            type="monotone"
            dataKey={yAxisKey}
            stroke={color}
            strokeWidth={2}
            fill="url(#areaGrad)"
          />
          {secondYAxisKey && (
            <Area
              type="monotone"
              dataKey={secondYAxisKey}
              stroke={secondColor}
              strokeWidth={2}
              fill="transparent"
            />
          )}
        </AreaChart>
      ),
    };
    return charts[type];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "bg-surface thin-border rounded-xl p-6",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="type-label-caps text-on-surface">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-on-surface-variant">{description}</p>
        )}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
      </div>
      {children}
    </motion.div>
  );
}
