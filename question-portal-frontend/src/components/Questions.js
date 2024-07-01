import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Button, Table, Pagination, Container, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AddQuestionModal from './AddQuestionModal';
import EditQuestionModal from './EditQuestionModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";

const Questions = ({ onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        answer: '',
        answerType: '',
        forUserEmail: '',
        fromUserEmail: '',
        options: []
    });
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const questionsPerPage = 3;

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const userId = localStorage.getItem('id');
                if (!userId) {
                    throw new Error('User ID not found in localStorage');
                }

                const token = localStorage.getItem('jwt-token');
                if (!token) {
                    console.error('No JWT token found');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/questions/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    const data = response.data;
                    setQuestions(data);
                } else {
                    throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
                setQuestions([]);
            }
        };

        fetchQuestions();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: str => console.log(str),
        });

        client.onConnect = () => {
            console.log('Connected to WebSocket');
            client.subscribe('/user/queue/questions', message => {
                const updatedQuestion = JSON.parse(message.body);
                setQuestions(prevQuestions =>
                    prevQuestions.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q))
                );
            });
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    const handleEdit = id => {
        setCurrentQuestionId(id);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('jwt-token');
            if (!token) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.delete(`http://localhost:8080/questions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
            } else {
                console.error('Failed to delete question:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleCloseEditModal = () => setShowEditModal(false);

    const handleChange = (event, index) => {
        const { name, value } = event.target;
        if (name === 'addOption') {
            setNewQuestion(prevState => ({
                ...prevState,
                options: [...prevState.options, '']
            }));
        } else if (index !== undefined) {
            const newOptions = [...newQuestion.options];
            newOptions[index] = value;
            setNewQuestion(prevState => ({
                ...prevState,
                options: newOptions
            }));
        } else {
            setNewQuestion(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('jwt-token');
            if (!token) {
                console.error('No JWT token found');
                return;
            }

            const userEmail = localStorage.getItem('email');

            const answerTypeMapping = {
                'Single line text': 'SINGLE_LINE_TEXT',
                'Radio button': 'RADIO_BUTTON',
                'Combobox': 'COMBOBOX',
                'Multi line text': 'MULTI_LINE_TEXT',
                'Checkbox': 'CHECKBOX',
                'Date': 'DATE'
            };

            const response = await axios.post('http://localhost:8080/questions/add', {
                question: newQuestion.question,
                answer: newQuestion.answer,
                answerType: answerTypeMapping[newQuestion.answerType],
                forUserEmail: newQuestion.forUserEmail,
                fromUserEmail: userEmail,
                options: newQuestion.options
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const data = response.data;
                setQuestions(prevQuestions => [...prevQuestions, data]);
                handleCloseAddModal();
            } else {
                console.error('Failed to save question:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    return (
        <Container>
            <Row className="align-items-center my-4">
                <Col>
                    <h2>Your questions</h2>
                </Col>
                <Col className="text-right">
                    <Button variant="primary" className="mb-2" onClick={handleShowAddModal} style={{ float: 'right' }}>
                        <FaPlus /> Add question
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>For user</th>
                            <th>Question</th>
                            <th>Answer type</th>
                            <th>Answer</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentQuestions.map(question => (
                            <tr key={question.id}>
                                <td>{question.forUserEmail}</td>
                                <td>{question.question}</td>
                                <td>{question.answerType}</td>
                                <td>{question.answer}</td>
                                <td>
                                    <Button variant="warning" onClick={() => handleEdit(question.id)}>
                                        <FaEdit />
                                    </Button>{' '}
                                    <Button variant="danger" onClick={() => handleDelete(question.id)}>
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {[...Array(Math.ceil(questions.length / questionsPerPage)).keys()].map(pageNumber => (
                            <Pagination.Item key={pageNumber + 1} active={pageNumber + 1 === currentPage} onClick={() => handlePageChange(pageNumber + 1)}>
                                {pageNumber + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button onClick={onClose} className="mt-3">Close</Button>
                </Col>
            </Row>

            <AddQuestionModal
                show={showAddModal}
                handleClose={handleCloseAddModal}
                handleChange={handleChange}
                handleSave={handleSave}
                newQuestion={newQuestion}
                setNewQuestion={setNewQuestion}
            />

            <EditQuestionModal
                show={showEditModal}
                handleClose={handleCloseEditModal}
                questionId={currentQuestionId}
                handleSave={handleCloseEditModal}
            />
        </Container>
    );
};

export default Questions;
