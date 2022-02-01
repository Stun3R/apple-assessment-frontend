import { Card } from 'antd'
import { Pie } from '@ant-design/charts'
import PropTypes from 'prop-types'

const StatsCard = ({ title, data, loading }) => {
  const config = {
    autoFit: true,
    appendPadding: 0,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  }

  return (
    <Card
      title={title}
      bodyStyle={{ padding: loading ? '24px' : '8px 0' }}
      loading={loading}
    >
      <Pie className="charts" {...config} />
    </Card>
  )
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({ type: PropTypes.string, value: PropTypes.number })
  ),
  loading: PropTypes.bool,
}

StatsCard.defaultTypes = {
  data: [],
  loading: false,
}

export default StatsCard
