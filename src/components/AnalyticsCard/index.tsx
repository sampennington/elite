import React from 'react'
import { formatChange } from '@/lib/posthog'

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: number | null
  formatter?: (value: string | number) => string
  positiveIsGood?: boolean
}

export const AnalyticsCard = (props: AnalyticsCardProps) => {
  const { title, value, change, positiveIsGood, formatter } = props
  const formattedValue = formatter ? formatter(value) : value
  const changeData = formatChange(change || null)
  const isPositive = positiveIsGood ? changeData.isPositive : !changeData.isPositive

  return (
    <li>
      <div className="card" style={{ flexDirection: 'column' }}>
        <h3 className="card__title">{title}</h3>
        <div style={{ fontSize: '2rem' }}>{formattedValue}</div>
        {change !== undefined && (
          <div style={{ color: isPositive ? 'green' : 'red' }}>
            {changeData.text} from previous period
          </div>
        )}
      </div>
    </li>
  )
}
