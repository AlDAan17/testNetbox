import React, {useEffect, useRef, useState} from 'react';
import {Table, Input, InputNumber, Popconfirm, Form} from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import Button from "antd/es/button";

const EditableCell = ({
                        editing,
                        dataIndex,
                        title,
                        inputType,
                        record,
                        index,
                        children,
                        ...restProps
                      }) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
      <td {...restProps}>
        {editing ? (
            <Form.Item
                name={dataIndex}
                style={{
                  margin: 0,
                }}
                rules={[
                  {
                    required: true,
                    message: `Please Input ${title}!`,
                  },
                ]}
            >
              {inputNode}
            </Form.Item>
        ) : (
            children
        )}
      </td>
  );
};


function App() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [inputEl, setInputEl] = useState([]);
  const [idDel, setIdDel] = useState(0);
  const [editingKey, setEditingKey] = useState('');

  const dataSource = data.map((el, i) =>{
    return {
      key: el[0].value,
      name:el[1].value,
      age: el[2].value,
      phone: el[3].value,
      email: el[4].value,
    }
  })

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      email: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  async function somePut(index) {
    let respons;
    try {
      respons = await fetch('https://frontend-test.netbox.ru/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: idDel,
          name: data[index][1].value,
          age: data[index][2].value,
          phone: data[index][3].value,
          email: data[index][4].value,
        }),
      });
    } catch (err) {
      console.log('deleteErr', err);
    }
  }
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => {
        return key === item[0].value
      });

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  useEffect(() => {
    async function someData() {
      let respons;
      try {
        respons = await fetch('https://frontend-test.netbox.ru/');
      } catch (err) {
        console.log('startErr', err);
      }
      const result = await respons.json();
      setData(() => result);
    }
    someData();
    const arr = [];
    data.forEach(() => {
      arr.push(false);
    });
    setInputEl(arr);
  }, []);

  useEffect(() => {
    async function someDel() {
      let respons;
      try {
        respons = await fetch('https://frontend-test.netbox.ru/', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: idDel }),
        });
      } catch (err) {
        console.log('deleteErr', err);
      }
      const newData = data.filter((el) => el[0].value !== idDel);
      setData(newData);
    }
    // что бы не сработал в первый раз
    if (idDel) {
      someDel();
    }
  }, [idDel]);

  const columns = [
    {
      title: 'Id',
      dataIndex: 'key',
      sorter: {
        compare: (a, b) => a.key - b.key,
        multiple: 2,
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      editable: true,
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
        multiple: 2,
      },
    },
    {
      title: 'Age',
      dataIndex: 'age',
      sorter: {
        compare: (a, b) => a.age - b.age,
        multiple: 3,
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      sorter: {
        compare: (a, b) => a.phone.replace(/-/g,"").localeCompare(b.phone.replace(/-/g,"")),
        multiple: 1,
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: {
        compare: (a, b) => a.email.localeCompare(b.email),
        multiple: 1,
      },
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'action',

      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
            <span>
            <a
                onClick={() => save(record.key)}
                style={{
                  marginRight: 40,
                }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
            <>
              <a disabled={editingKey !== ''} onClick={() => edit(record)}>
                Edit
              </a>
              <Button type="text" danger style={{marginLeft: 30}}
                      onClick={() => setIdDel(record.key)}>Delete</Button>
            </>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
      <Form form={form} component={false}>
        <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={mergedColumns}
            dataSource={dataSource}
            pagination={{
            onChange: cancel,
            }}/>
            <p className="counter">Строк в таблице: {dataSource.length}</p>
      </Form>
  );
}

export default App;
