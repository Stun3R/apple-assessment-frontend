import PropTypes from 'prop-types'
import { Form, Input, Modal } from 'antd'
import { DebounceSelect } from '../'
import { api } from '../../helpers'

const fetchOptions = async (entity, keys, search) => {
  return api
    .find(entity, {
      q: typeof search === 'string' ? search : null,
    })
    .then(({ data }) =>
      data.map((item) => ({ label: item[keys.label], value: item[keys.value] }))
    )
}

const CreateProjectModal = ({ visible, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm()

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit(values)
        form.resetFields()
      })
      .catch((info) => {})
  }

  return (
    <Modal
      title="Project"
      visible={visible}
      onOk={handleOk}
      okText="Create"
      onCancel={onCancel}
      getContainer={false}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ assigned_to: null }}
      >
        <Form.Item
          name="title"
          label="Title"
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please input the title of project!',
            },
            {
              max: 20,
              message: 'Too many characters (max: 20)',
            },
          ]}
        >
          <Input placeholder="Project's title" />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please chose a category for this project!',
            },
          ]}
        >
          <DebounceSelect
            placeholder="Select a category"
            fetchOptions={(e) =>
              fetchOptions(
                'categories',
                { label: 'category', value: 'category' },
                e
              )
            }
          />
        </Form.Item>
        <Form.Item name="assigned_to" label="Assigned to">
          <DebounceSelect
            placeholder="Assigned the project to someone"
            allowNull={true}
            fetchOptions={(e) =>
              fetchOptions('assignees', { label: 'nickname', value: 'id' }, e)
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

CreateProjectModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

CreateProjectModal.defaultProps = {
  visible: false,
  loading: false,
}

export default CreateProjectModal
