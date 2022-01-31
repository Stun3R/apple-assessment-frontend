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
import { CreateProjectModal } from '../../components'

const { Content } = Layout

const PAGE_SIZE = 5

const HomePage = () => {
  /**
   * Modal creation states
   */
  const [modalVisible, setModalVisible] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  /**
   * Table states
   */
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [assignees, setAssignees] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
  })

  /**
   * Retrieve projects with params and change the state
   */
  const loadProjects = async (params) => {
    setLoading(true)
    setProjects([])
    const results = await api.find('projects', {
      ...params,
    })
    setProjects(results.data)
    setPagination(results.meta)
    setLoading(false)
  }

  /**
   * Retrieve all assignees for filter by them
   */
  const loadAssignees = async () => {
    const results = await api.find('assignees')
    const assignees = results.data.map(({ id, nickname }) => ({
      text: nickname,
      value: id,
    }))
    assignees.unshift({ text: 'None', value: null })
    setAssignees(assignees)
  }

  /**
   * Retrieve all categories for filter by them
   */
  const loadCategories = async () => {
    const results = await api.find('categories')
    setCategories(
      results.data.map(({ category }) => ({ text: category, value: category }))
    )
  }

  /**
   * Delete project, // TODO: load again with current params
   */
  const deleteProject = async (title, id) => {
    await api.delete('projects', id)
    await loadProjects({ pageSize: PAGE_SIZE })
    message.success(`Project "${title}" deleted`, 2)
  }

  /**
   * Create project and reload the table
   */
  const createProject = async (values) => {
    setModalLoading(true)
    const hide = message.loading('Creation in progress...')
    try {
      await api.create('projects', values)
      hide()
      message.success('Project created!')
      setModalVisible(false)
      setModalLoading(false)
      await loadProjects({ pageSize: PAGE_SIZE })
    } catch (err) {
      hide()
      message.error('Could not create project')
      setModalLoading(false)
    }
  }

  /**
   * define table columns
   */
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
      render: (assigned_to) => (assigned_to ? assigned_to.nickname : 'None'),
    },
    {
      title: 'Creation date',
      dataIndex: 'created_timestamp',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (date) => dayjs(date).format('YYYY/MM/DD HH:mm:ss'),
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
    loadProjects({ pageSize: PAGE_SIZE, orderBy: 'created_timestamp' })
    loadAssignees()
    loadCategories()
  }, [])

  /**
   * Table onChange handler to paginate, filter & sort
   */
  const handleTableChange = async (pagination, filters, sorter) => {
    const params = {
      pageSize: pagination.pageSize,
      current: pagination.current,
    }
    if (sorter.order) {
      params.orderBy = `${sorter.order === 'descend' ? '-' : ''}${sorter.field}`
    } else {
      params.orderBy = 'created_timestamp'
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
          <Button
            key="1"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setModalVisible(true)}
          >
            Create a project
          </Button>,
        ]}
      />
      <Content className="layout-content">
        <CreateProjectModal
          visible={modalVisible}
          loading={modalLoading}
          onSubmit={createProject}
          onCancel={() => setModalVisible(false)}
        />
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
