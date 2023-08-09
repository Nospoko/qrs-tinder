import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import React, { useEffect, useState } from 'react';

interface Props {
  name: string;
  record: {
    key: string;
  };
  handleOnDelete: (key: string) => void;
  handleNameChange: (key: string, newName: string) => void;
  organizationNames: string[];
}

const EditableName: React.FC<Props> = ({
  name,
  record,
  handleOnDelete,
  handleNameChange,
  organizationNames,
}) => {
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [isNameTaken, setIsNameTaken] = useState(false);

  const toggleEditing = () => {
    setEditing(!editing);
    setEditedName(name);
    setIsNameTaken(false);
  };

  const handleNameInputChange = (e) => {
    const newName = e.target.value;

    const normalizedNewName = newName.trim().toLowerCase();
    const normalizedOrganizationNames = organizationNames.map((orgName) =>
      orgName.trim().toLowerCase(),
    );

    setEditedName(newName);
    setIsNameTaken(normalizedOrganizationNames.includes(normalizedNewName));
  };

  const handleSave = () => {
    if (name === editedName || isNameTaken || !editedName.trim()) {
      toggleEditing();
      return;
    }

    handleNameChange(record.key, editedName);
    toggleEditing();
  };

  const handleCancel = () => {
    setEditedName(name);
    toggleEditing();
  };

  const handleKeyDown = (e) => {
    if (editing && e.key === 'Escape') {
      handleCancel();
    }
  };

  useEffect(() => {
    if (editing) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (editing) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [editing]);

  return (
    <Space>
      {editing ? (
        <>
          <Input
            value={editedName}
            onChange={handleNameInputChange}
            onPressEnter={handleSave}
            onBlur={handleSave}
            autoFocus
          />

          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={isNameTaken}
          >
            Save
          </Button>

          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          {name}
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleEditing();
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            type="link"
            style={{
              color: 'red',
            }}
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleOnDelete(record.key);
            }}
          />
        </>
      )}
      {isNameTaken && <span style={{ color: 'red' }}>Name already exists</span>}
    </Space>
  );
};

export default EditableName;
