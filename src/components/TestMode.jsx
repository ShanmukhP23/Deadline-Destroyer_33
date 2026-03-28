import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineLightningBolt } from 'react-icons/hi';
import { generateMCQTest } from '../utils/geminiService';
import { useTopics } from '../context/TopicContext';

export default function TestMode({ topic, onClose }) {
    const { addTestScore } = useTopics();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState([]);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchQuestions() {
            setLoading(true);
            setError('');
            try {
                const data = await generateMCQTest(topic.title, topic.description);
                if (isMounted) {
                    setQuestions(data);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to generate quiz. Check your connection.');
                    setLoading(false);
                }
            }
        }
        
        fetchQuestions();
        
        return () => { isMounted = false; };
    }, [topic]);

    const handleOptionSelect = (index) => {
        if (selectedOption !== null) return; // prevent multiple clicks
        setSelectedOption(index);
        
        const isCorrect = index === questions[currentIndex].correctAnswer;
        if (isCorrect) setScore(s => s + 1);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            // End of test
            addTestScore(topic.id, score + (selectedOption === questions[currentIndex].correctAnswer ? 1 : 0));
            setShowResults(true);
        }
    };

    return (
        <div className="flashcard-overlay">
            <button className="flashcard-close" onClick={onClose} title="Close">
                <HiOutlineX />
            </button>

            <div className="flashcard-container" style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ textAlign: 'center', color: 'var(--text-secondary)' }}
                        >
                            <div className="ai-spin" style={{ fontSize: '3rem', color: 'var(--primary-400)', marginBottom: '16px' }}>
                                <HiOutlineLightningBolt />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-main)' }}>Generating Quiz...</h2>
                            <p>AI is reading your notes to create questions.</p>
                        </motion.div>
                    )}

                    {!loading && error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ textAlign: 'center' }}
                        >
                            <span style={{ fontSize: '3rem', marginBottom: '16px', display: 'inline-block' }}>⚠️</span>
                            <h2 style={{ marginBottom: '16px', color: 'var(--error)' }}>Error</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '24px' }}>
                                Close
                            </button>
                        </motion.div>
                    )}

                    {!loading && !error && !showResults && questions.length > 0 && (
                        <motion.div
                            key={`q-${currentIndex}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: '100%' }}
                        >
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <span className="badge badge-pending">Question {currentIndex + 1} of {questions.length}</span>
                            </div>
                            
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', textAlign: 'center', lineHeight: '1.4' }}>
                                {questions[currentIndex].question}
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                {questions[currentIndex].options.map((opt, i) => {
                                    const isSelected = selectedOption === i;
                                    const isCorrectOpt = questions[currentIndex].correctAnswer === i;
                                    let btnStyle = { textAlign: 'left', padding: '16px', fontSize: '1.05rem', justifyContent: 'flex-start' };
                                    let btnClass = 'btn btn-outline'; // default
                                    
                                    if (selectedOption !== null) {
                                        if (isCorrectOpt) {
                                            btnClass = 'btn btn-success'; // highlight correct
                                        } else if (isSelected && !isCorrectOpt) {
                                            btnClass = 'btn btn-error'; // highlight wrong
                                        } else {
                                            btnStyle.opacity = 0.5; // dim others
                                        }
                                    }

                                    return (
                                        <button 
                                            key={i} 
                                            className={btnClass}
                                            style={btnStyle}
                                            onClick={() => handleOptionSelect(i)}
                                            disabled={selectedOption !== null}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <span>{String.fromCharCode(65 + i)}. {opt}</span>
                                                {selectedOption !== null && isCorrectOpt && <HiOutlineCheckCircle style={{ fontSize: '1.5rem' }} />}
                                                {selectedOption !== null && isSelected && !isCorrectOpt && <HiOutlineXCircle style={{ fontSize: '1.5rem' }} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedOption !== null && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '32px', textAlign: 'center' }}
                                >
                                    <button className="btn btn-primary btn-lg" onClick={handleNext}>
                                        {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {showResults && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', width: '100%' }}
                        >
                            <span style={{ fontSize: '4rem', marginBottom: '16px', display: 'inline-block' }}>
                                {score >= 4 ? '🏆' : score >= 3 ? '👍' : '📚'}
                            </span>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                                {score} / {questions.length}
                            </h2>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                                {score === 5 ? 'Perfect score! You truly master this topic.' 
                                 : score >= 3 ? 'Good job! A little more revision and you will be perfect.'
                                 : 'Keep studying! This topic needs more active recall.'}
                            </p>
                            
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
                                Your score has been saved and will help your AI Coach monitor your learning pace.
                            </p>

                            <button className="btn btn-primary btn-lg" onClick={onClose}>
                                Finish & Return
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <style>{`
            .btn-error {
                background: rgba(239, 68, 68, 0.15) !important;
                border-color: var(--error-border) !important;
                color: var(--error) !important;
            }
            .btn-outline {
                background: var(--bg-card);
                border: 1px solid var(--border-glass);
                color: var(--text-main);
            }
            .btn-outline:hover:not(:disabled) {
                background: var(--bg-input);
                border-color: var(--primary-400);
            }
            `}</style>
        </div>
    );
}
