import { useEffect, useReducer, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Divider,
  Layout,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Tooltip,
  Table,
  Tag,
} from 'antd'
import { PlusOutlined, SyncOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { api } from '../../helpers'
import './index.scss'
import { ProjectModal, StatsCard } from '../../components'

const { Content } = Layout

const PAGE_SIZE = 5

const initialState = {
  loading: false,
  projects: [],
  params: {
    current: 1,
    pageSize: PAGE_SIZE,
    orderBy: '-created_timestamp',
  },
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_LOADING':
      return {
        ...state,
        loading: true,
        projects: [],
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        projects: action.payload.data,
        params: {
          ...state.params,
          ...action.payload.meta,
        },
      }
    case 'FETCH_PARAMS':
      return {
        ...state,
        params: {
          ...state.params,
          ...action.payload.params,
        },
      }
    default:
      throw new Error()
  }
}

const HomePage = () => {
  /**
   * Modal creation states
   */
  const [modalVisible, setModalVisible] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState({
    title: null,
    category: null,
    assigned_to: null,
  })
  /**
   * Table states
   */
  const [state, dispatch] = useReducer(reducer, initialState)
  const [assignees, setAssignees] = useState([])
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  /**
   * Retrieve projects with params and change the state
   */
  const loadProjects = async (params) => {
    dispatch({ type: 'FETCH_LOADING' })
    const results = await api.find('projects', {
      ...params,
    })
    dispatch({ type: 'FETCH_SUCCESS', payload: results })
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
    setCategoriesLoading(true)
    const results = await api.find('categories')
    setCategories(results.data)
    setCategoriesLoading(false)
  }

  /**
   * Delete project and reload projects with saved params
   */
  const deleteProject = async (title, id) => {
    try {
      await api.delete('projects', id)
      await loadProjects(state.params)
      await loadCategories()
      message.success(`Project "${title}" deleted`)
    } catch (error) {
      message.error(`Could not delete project "${title}"`)
    }
  }

  /**
   * Create/Update project and reload the table
   */
  const handleProjectModal = async (values) => {
    setModalLoading(true)
    const hide = message.loading(
      `${selectedProject ? 'Update' : 'Creation'} in progress...`
    )
    try {
      /**
       * Check if we edit or create a project
       */
      if (selectedProject.title) {
        await api.update('projects', selectedProject.id, values)
        await loadProjects(state.params)
        await loadCategories()
        setSelectedProject(null)
      } else {
        await api.create('projects', values)
        handleReload()
      }
      setModalVisible(false)
      setModalLoading(false)
      hide()
      message.success(`Project ${selectedProject ? 'updated' : 'created'}!`)
    } catch (err) {
      hide()
      message.error(
        `Could not ${selectedProject ? 'update' : 'create'} project`
      )
      setModalLoading(false)
    }
  }

  /**
   * Define table columns
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
      filters: categories.map(({ name }) => ({ text: name, value: name })),
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
          <a
            href="#edit"
            onClick={() => {
              setSelectedProject(record)
              setModalVisible(true)
            }}
          >
            Edit
          </a>
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
    loadProjects({ pageSize: PAGE_SIZE, orderBy: '-created_timestamp' })
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
      params.orderBy = '-created_timestamp'
    }

    if (filters.assigned_to) params.assigned_to = filters.assigned_to[0]

    if (filters.category) params.category = filters.category[0]

    /**
     * Save params for project reloading after deletion
     */
    dispatch({ type: 'FETCH_PARAMS', payload: { params } })
    await loadProjects(params)
  }

  const handleReload = async () => {
    await loadProjects({ pageSize: PAGE_SIZE, orderBy: '-created_timestamp' })
    await loadAssignees()
    await loadCategories()
  }

  return (
    <Layout>
      <PageHeader
        ghost={false}
        title="Projects manager"
        extra={[
          <Tooltip key="2" title="Reload">
            <Button
              loading={state.loading}
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
        <>
          <ProjectModal
            visible={modalVisible}
            loading={modalLoading}
            selectedProject={selectedProject}
            onSubmit={handleProjectModal}
            onCancel={() => setModalVisible(false)}
          />
          <Card>
            <Table
              rowKey={(record) => record.id}
              columns={columns}
              dataSource={state.projects}
              pagination={state.params}
              loading={state.loading}
              onChange={handleTableChange}
            />
          </Card>
        </>
        <Row className="layout-row">
          <Col xs={24} sm={24} md={14} lg={12} xl={8}>
            <StatsCard
              loading={categoriesLoading}
              title="Breakdown of projects by category"
              data={categories.map(({ name, projects }) => ({
                type: name,
                value: projects,
              }))}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

export default HomePage
