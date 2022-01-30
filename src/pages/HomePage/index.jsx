import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Divider,
  Layout,
  message,
  PageHeader,
  Popconfirm,
  Tooltip,
  Table,
  Tag,
} from 'antd'
import { PlusOutlined, SyncOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { api } from '../../helpers'
import './index.scss'

const { Content } = Layout

const PAGE_SIZE = 5

const HomePage = () => {
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [assignees, setAssignees] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
  })

  const loadProjects = async (params) => {
    setLoading(true)
    const results = await api.find('projects', {
      ...params,
    })
    setProjects(results.data)
    setPagination(results.meta)
    setLoading(false)
  }

  const loadAssignees = async () => {
    const results = await api.find('assignees')
    const assignees = results.data.map(({ id, nickname }) => ({
      text: nickname,
      value: id,
    }))
    assignees.unshift({ text: 'None', value: null })
    setAssignees(assignees)
  }

  const loadCategories = async () => {
    const results = await api.find('categories')
    setCategories(
      results.data.map(({ category }) => ({ text: category, value: category }))
    )
  }

  const deleteProject = async (title, id) => {
    await api.delete('projects', id)
    await loadProjects({ pageSize: PAGE_SIZE })
    message.success(`Project "${title}" deleted`, 2)
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      filters: categories,
      filterMultiple: false,
      render: (category) => (
        <Tag color="geekblue">{category.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Assigned to',
      dataIndex: 'assigned_to',
      filters: assignees,
      filterMultiple: false,
      render: (assigned_to) => (assigned_to ? assigned_to : 'None'),
    },
    {
      title: 'Creation date',
      dataIndex: 'created_timestamp',
      sorter: true,
      render: (date) => dayjs(date).format('YYYY/MM/DD'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <>
          <a href="#edit">Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this project?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteProject(record.title, record.id)}
          >
            <a href="#delete">Delete</a>
          </Popconfirm>
        </>
      ),
    },
  ]

  useEffect(() => {
    loadProjects({ pageSize: PAGE_SIZE })
    loadAssignees()
    loadCategories()
  }, [])

  const handleTableChange = async (pagination, filters, sorter) => {
    const params = {
      pageSize: pagination.pageSize,
      current: pagination.current,
    }
    if (sorter.order) {
      params.orderBy = `${sorter.order === 'descend' ? '-' : ''}${sorter.field}`
    }
    if (filters.assigned_to) params.assigned_to = filters.assigned_to[0]

    if (filters.category) params.category = filters.category[0]

    await loadProjects(params)
  }

  const handleReload = async () => {
    setReload(true)
    await loadProjects({ pageSize: PAGE_SIZE })
    setReload(false)
  }

  return (
    <Layout>
      <PageHeader
        ghost={false}
        title="Projects manager"
        extra={[
          <Tooltip key="2" title="Reload">
            <Button
              loading={reload}
              onClick={handleReload}
              icon={<SyncOutlined />}
            />
          </Tooltip>,
          <Button key="1" icon={<PlusOutlined />} type="primary">
            Create a project
          </Button>,
        ]}
      />
      <Content className="layout-content">
        <Card>
          <Table
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={projects}
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </Card>
      </Content>
    </Layout>
  )
}

export default HomePage
