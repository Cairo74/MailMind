"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface EmailCategoryChartProps {
  data: {
    trabalho: number
    promocoes: number
    financeiro: number
    spam: number
    pessoal: number
  }
}

const COLORS = {
  trabalho: "#6C63FF", // Primary purple
  promocoes: "#60A5FA", // Blue
  financeiro: "#4ADE80", // Green
  spam: "#F87171", // Red
  pessoal: "#FBBF24", // Yellow
}

const CATEGORY_LABELS = {
  trabalho: "Trabalho",
  promocoes: "Promoções",
  financeiro: "Financeiro",
  spam: "Spam",
  pessoal: "Pessoal",
}

export function EmailCategoryChart({ data }: EmailCategoryChartProps) {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
    value,
    color: COLORS[key as keyof typeof COLORS],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      return (
        <motion.div
          className="bg-background border border-border rounded-lg p-3 shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} e-mails ({((data.value / total) * 100).toFixed(1)}%)
          </p>
        </motion.div>
      )
    }
    return null
  }

  const AnimatedPie = ({ data, ...props }: any) => {
    return <Pie {...props} data={data} animationBegin={0} animationDuration={1500} animationEasing="ease-out" />
  }

  return (
    <motion.div
      className="h-[300px]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <AnimatedPie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </AnimatedPie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <motion.span
                style={{ color: entry.color }}
                className="text-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {value}
              </motion.span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
