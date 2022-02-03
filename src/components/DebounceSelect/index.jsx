import { useState, useMemo, useRef } from 'react'
import { debounce } from 'lodash'
import { Select, Spin } from 'antd'
import PropTypes from 'prop-types'

const DebounceSelect = ({
  fetchOptions,
  fetchOnFocus,
  debounceTimeout = 250,
  allowNull,
  ...props
}) => {
  const [fetching, setFetching] = useState(false)
  const defaultOptions = allowNull ? [{ label: 'None', value: null }] : []
  const [options, setOptions] = useState(defaultOptions)
  const fetchRef = useRef(0)

  /**
   * Make fetchOptions function debounce and set options
   */
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setOptions([])
      setFetching(true)
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return
        }
        /**
         * Create new entity if not found
         */
        if (newOptions.length === 0)
          newOptions.push({ label: `Create "${value}"`, value })
        setOptions(newOptions)
        setFetching(false)
      })
    }

    return debounce(loadOptions, debounceTimeout)
  }, [fetchOptions, debounceTimeout])

  return (
    <Select
      filterOption={false}
      showSearch={true}
      onSearch={debounceFetcher}
      onFocus={fetchOnFocus ? debounceFetcher : () => {}}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  )
}

DebounceSelect.propsTypes = {
  fetchOptions: PropTypes.func.isRequired,
  fetchOnFocus: PropTypes.bool,
  allowNull: PropTypes.bool,
  debounceTimeout: PropTypes.number,
}

DebounceSelect.defaultProps = {
  fetchOnFocus: false,
  allowNull: false,
  debounceTimeout: 250,
}

export default DebounceSelect
