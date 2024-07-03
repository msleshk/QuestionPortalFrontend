import React, { useState, useEffect } from 'react';
import { Button, Table, Pagination, Container, Row, Col } from 'react-bootstrap';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from "axios";
import AnswerQuestionModal from './AnswerQuestionModal';
import 'bootstrap/dist/css/bootstrap.min.css';

const Answers = ({ onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
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

                const response = await axios.get(`http://localhost:8080/questions/forUser/${userId}`, {
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
            console.log('Subscribing to channel /topic/questions');
            client.subscribe('/topic/questions', message => {
                console.log('Received message:', message.body);
                const updatedQuestion = JSON.parse(message.body);
                setQuestions(prevQuestions => {
                    const existingQuestion = prevQuestions.find(q => q.id === updatedQuestion.id);
                    if (existingQuestion) {
                        return prevQuestions.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q));
                    } else {
                        return [...prevQuestions, updatedQuestion];
                    }
                });
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    const handleAnswer = question => {
        setCurrentQuestion(question);
        setShowAnswerModal(true);
    };

    const handleCloseAnswerModal = () => setShowAnswerModal(false);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    return (
        <Container>
            <Row className="align-items-center my-4">
                <Col>
                    <h2>Answer the question</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>From user</th>
                            <th>Question</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentQuestions.map(question => (
                            <tr key={question.id}>
                                <td>{question.fromUserEmail}</td>
                                <td>{question.question}</td>
                                <td>
                                    <Button variant="primary" onClick={() => handleAnswer(question)}>
                                        Answer
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

            {currentQuestion && (
                <AnswerQuestionModal
                    show={showAnswerModal}
                    handleClose={handleCloseAnswerModal}
                    question={currentQuestion}
                />
            )}
        </Container>
    );
};

export default Answers;
