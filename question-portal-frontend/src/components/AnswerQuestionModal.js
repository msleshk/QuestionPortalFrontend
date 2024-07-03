import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AnswerQuestionModal = ({ show, handleClose, question }) => {
    const [answer, setAnswer] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (['RADIO_BUTTON', 'COMBOBOX'].includes(question.answerType)) {
            setAnswer(question.answer || '');
        } else if (question.answerType === 'CHECKBOX') {
            setSelectedOptions(question.answer ? question.answer.split(', ') : []);
        } else {
            setAnswer(question.answer || '');
        }
        setErrorMessage(''); // Clear any previous error messages when question changes
    }, [question]);

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('jwt-token');
            if (!token) {
                setErrorMessage('No JWT token found');
                return;
            }

            const response = await axios.patch(`http://localhost:8080/questions/answer/${question.id}`, {
                id: question.id,
                question: question.question,
                answer: question.answerType === 'CHECKBOX' ? selectedOptions.join(', ') : answer,
                answerType: question.answerType,
                fromUserEmail: question.fromUserEmail,
                forUserEmail: question.forUserEmail,
                options: question.options
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log('Answer submitted successfully');
                handleClose();
            } else {
                setErrorMessage(`Failed to submit answer: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            setErrorMessage(`Error submitting answer: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleCheckboxChange = (option) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(item => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    const renderAnswerField = () => {
        switch (question.answerType) {
            case 'SINGLE_LINE_TEXT':
                return (
                    <Form.Group>
                        <Form.Label>Answer</Form.Label>
                        <Form.Control
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                    </Form.Group>
                );
            case 'MULTI_LINE_TEXT':
                return (
                    <Form.Group>
                        <Form.Label>Answer</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                    </Form.Group>
                );
            case 'RADIO_BUTTON':
                return (
                    <Form.Group>
                        {question.options.map((option, index) => (
                            <Form.Check
                                key={index}
                                type="radio"
                                label={option}
                                name="radioOptions"
                                value={option}
                                checked={answer === option}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        ))}
                    </Form.Group>
                );
            case 'COMBOBOX':
                return (
                    <Form.Group>
                        <Form.Label>Answer</Form.Label>
                        <Form.Control
                            as="select"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        >
                            {question.options.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                );
            case 'CHECKBOX':
                return (
                    <Form.Group>
                        {question.options.map((option, index) => (
                            <Form.Check
                                key={index}
                                type="checkbox"
                                label={option}
                                checked={selectedOptions.includes(option)}
                                onChange={() => handleCheckboxChange(option)}
                            />
                        ))}
                    </Form.Group>
                );
            case 'DATE':
                return (
                    <Form.Group>
                        <Form.Label>Select Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                    </Form.Group>
                );
            default:
                return null;
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Answer the question</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                <Form>
                    <Form.Group>
                        <Form.Label>From user</Form.Label>
                        <Form.Control type="text" readOnly value={question.fromUserEmail} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Question</Form.Label>
                        <Form.Control as="textarea" rows={3} readOnly value={question.question} />
                    </Form.Group>
                    {renderAnswerField()}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AnswerQuestionModal;
