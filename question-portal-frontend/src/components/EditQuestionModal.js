import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const EditQuestionModal = ({ show, handleClose, questionId, handleSave }) => {
    const [question, setQuestion] = useState({
        question: '',
        answer: '',
        answerType: '',
        forUserEmail: '',
        fromUserEmail: '',
        options: []
    });
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

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const token = localStorage.getItem('jwt-token');
                const response = await axios.get(`http://localhost:8080/questions/${questionId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const fetchedQuestion = response.data;
                setQuestion({
                    ...fetchedQuestion,
                    answerType: mapAnswerTypeToDisplay(fetchedQuestion.answerType)
                });
            } catch (error) {
                console.error('Error fetching question:', error);
            }
        };

        if (show) {
            fetchQuestion();
        }
    }, [show, questionId]);

    const mapAnswerTypeToDisplay = (type) => {
        switch (type) {
            case 'SINGLE_LINE_TEXT':
                return 'Single line text';
            case 'RADIO_BUTTON':
                return 'Radio button';
            case 'COMBOBOX':
                return 'Combobox';
            case 'MULTI_LINE_TEXT':
                return 'Multi line text';
            case 'CHECKBOX':
                return 'Checkbox';
            case 'DATE':
                return 'Date';
            default:
                return '';
        }
    };

    const mapAnswerTypeToServer = (type) => {
        switch (type) {
            case 'Single line text':
                return 'SINGLE_LINE_TEXT';
            case 'Radio button':
                return 'RADIO_BUTTON';
            case 'Combobox':
                return 'COMBOBOX';
            case 'Multi line text':
                return 'MULTI_LINE_TEXT';
            case 'Checkbox':
                return 'CHECKBOX';
            case 'Date':
                return 'DATE';
            default:
                return '';
        }
    };

    const handleChange = (event, index) => {
        const { name, value } = event.target;
        if (name === 'addOption') {
            setQuestion(prevState => ({
                ...prevState,
                options: [...prevState.options, '']
            }));
        } else if (index !== undefined) {
            const newOptions = [...question.options];
            newOptions[index] = value;
            setQuestion(prevState => ({
                ...prevState,
                options: newOptions
            }));
        } else {
            setQuestion(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleRemoveOption = (index) => {
        const updatedOptions = question.options.filter((_, i) => i !== index);
        setQuestion(prevState => ({
            ...prevState,
            options: updatedOptions
        }));
    };

    const renderAnswerInput = () => {
        switch (question.answerType) {
            case 'Radio button':
                return (
                    <Form.Group controlId="formAnswerOptions">
                        <Form.Label>Options</Form.Label>
                        {question.options.map((option, index) => (
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
                return (
                    <Form.Group controlId="formAnswerOptions">
                        <Form.Label>Options</Form.Label>
                        {question.options.map((option, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <Form.Control
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleChange(e, index)}
                                    style={{ marginRight: '10px' }}
                                />
                                {question.options.length > 2 && (
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
                        {question.options.length < 10 && (
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

    const saveChanges = async () => {
        try {
            const token = localStorage.getItem('jwt-token');
            if (!token) {
                console.error('No JWT token found');
                return;
            }

            const updatedQuestion = {
                ...question,
                answerType: mapAnswerTypeToServer(question.answerType)
            };

            const response = await axios.put(`http://localhost:8080/questions/${questionId}`, updatedQuestion, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                handleSave();
            } else {
                console.error('Failed to update question:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error updating question:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit question</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formForUserEmail">
                        <Form.Label>For user</Form.Label>
                        <Form.Control
                            as="select"
                            name="forUserEmail"
                            value={question.forUserEmail}
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
                            value={question.question}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formAnswerType">
                        <Form.Label>Answer type</Form.Label>
                        <Form.Control
                            as="select"
                            name="answerType"
                            value={question.answerType}
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
                <Button variant="primary" onClick={saveChanges}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditQuestionModal;
