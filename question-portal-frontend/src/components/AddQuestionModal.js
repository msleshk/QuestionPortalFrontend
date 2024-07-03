import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const AddQuestionModal = ({ show, handleClose, handleChange, handleSave, newQuestion, setNewQuestion }) => {
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const currentUserEmail = localStorage.getItem('email');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('jwt-token');
                if (!token) {
                    setErrorMessage('No JWT token found');
                    return;
                }

                const response = await axios.get('http://localhost:8080/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const filteredUsers = response.data.filter(user => user.email !== currentUserEmail);
                setUsers(filteredUsers);
                setErrorMessage('');
            } catch (error) {
                setErrorMessage(`Error fetching users: ${error.response?.data?.message || error.message}`);
            }
        };

        if (currentUserEmail) {
            fetchUsers();
        }
    }, [currentUserEmail]);

    const handleRemoveOption = (index) => {
        const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
        setNewQuestion(prevState => ({
            ...prevState,
            options: updatedOptions
        }));
    };

    const handleAddOption = () => {
        setNewQuestion(prevState => ({
            ...prevState,
            options: [...prevState.options, '']
        }));
    };

    const handleOptionChange = (event, index) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = event.target.value;
        setNewQuestion(prevState => ({
            ...prevState,
            options: newOptions
        }));
    };

    const renderAnswerInput = () => {
        switch (newQuestion.answerType) {
            case 'Radio button':
            case 'Checkbox':
            case 'Combobox':
                if (!newQuestion.options || newQuestion.options.length === 0) {
                    setNewQuestion(prevState => ({
                        ...prevState,
                        options: ['']
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
                                    onChange={(e) => handleOptionChange(e, index)}
                                    style={{ marginRight: '10px' }}
                                />
                                {newQuestion.options.length > 1 && (
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
                            <Button onClick={handleAddOption} style={{ marginTop: '10px' }}>
                                Add Option
                            </Button>
                        )}
                    </Form.Group>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('jwt-token');
            if (!token) {
                setErrorMessage('No JWT token found');
                return;
            }

            await handleSave();
            setErrorMessage(''); // Clear error message on successful save
        } catch (error) {
            setErrorMessage(`Error adding question: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add question</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
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
                <Button variant="primary" onClick={handleSubmit}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddQuestionModal;
