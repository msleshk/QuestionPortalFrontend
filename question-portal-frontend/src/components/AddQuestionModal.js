import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const AddQuestionModal = ({ show, handleClose, handleChange, handleSave, newQuestion, setNewQuestion }) => {
    const [users, setUsers] = useState([]);
    const currentUserEmail = localStorage.getItem('email');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('jwt-token');
                const response = await axios.get('http://localhost:8080/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const filteredUsers = response.data.filter(user => user.email !== currentUserEmail);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (currentUserEmail) {
            fetchUsers();
        }
    }, [currentUserEmail]);

    const handleRemoveOption = (index) => {
        const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
        handleChange({ target: { name: 'options', value: updatedOptions } });
    };

    const renderAnswerInput = () => {
        switch (newQuestion.answerType) {
            case 'Radio button':
                if (!newQuestion.options || newQuestion.options.length < 2) {
                    setNewQuestion(prevState => ({
                        ...prevState,
                        options: ['', '']
                    }));
                }
                return (
                    <Form.Group controlId="formAnswerOptions">
                        <Form.Label>Options</Form.Label>
                        {newQuestion.options.map((option, index) => (
                            <Form.Control
                                key={index}
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleChange(e, index)}
                                style={{ marginBottom: '10px' }}
                            />
                        ))}
                    </Form.Group>
                );
            case 'Combobox':
                if (!newQuestion.options || newQuestion.options.length < 2) {
                    setNewQuestion(prevState => ({
                        ...prevState,
                        options: ['', '']
                    }));
                }
                return (
                    <Form.Group controlId="formAnswerOptions">
                        <Form.Label>Options</Form.Label>
                        {newQuestion.options.map((option, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <Form.Control
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleChange(e, index)}
                                    style={{ marginRight: '10px' }}
                                />
                                {newQuestion.options.length > 2 && (
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemoveOption(index)}
                                        style={{ width: '80px' }}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ))}
                        {newQuestion.options.length < 10 && (
                            <Button onClick={() => handleChange({ target: { name: 'addOption' } })} style={{ marginTop: '10px' }}>
                                Add Option
                            </Button>
                        )}
                    </Form.Group>
                );
            default:
                return null;
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add question</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formForUserEmail">
                        <Form.Label>For user</Form.Label>
                        <Form.Control
                            as="select"
                            name="forUserEmail"
                            value={newQuestion.forUserEmail}
                            onChange={handleChange}
                        >
                            <option value="">Select user</option>
                            {users.map(user => (
                                <option key={user.email} value={user.email}>
                                    {user.email}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formQuestion">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter question"
                            name="question"
                            value={newQuestion.question}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formAnswerType">
                        <Form.Label>Answer type</Form.Label>
                        <Form.Control
                            as="select"
                            name="answerType"
                            value={newQuestion.answerType}
                            onChange={handleChange}
                        >
                            <option value="">Select answer type</option>
                            <option value="Single line text">Single line text</option>
                            <option value="Radio button">Radio button</option>
                            <option value="Combobox">Combobox</option>
                            <option value="Multi line text">Multi line text</option>
                            <option value="Checkbox">Checkbox</option>
                            <option value="Date">Date</option>
                        </Form.Control>
                    </Form.Group>
                    {renderAnswerInput()}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddQuestionModal;


