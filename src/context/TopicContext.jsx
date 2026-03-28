import { createContext, useContext, useReducer, useEffect } from 'react';
import { getNextRevisionDate, generateId } from '../utils/spacedRepetition';

const TopicContext = createContext();

const STORAGE_PREFIX = 'recallx_topics_';

function getStorageKey(userId) {
    return userId ? `${STORAGE_PREFIX}${userId}` : 'recallx_topics';
}

function loadFromStorage(userId) {
    try {
        const stored = localStorage.getItem(getStorageKey(userId));
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveToStorage(topics, userId) {
    try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(topics));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

function createTopicReducer(userId) {
    return function topicReducer(state, action) {
        let newState;

        switch (action.type) {
            case 'ADD_TOPIC': {
                const now = new Date();
                const topic = {
                    id: generateId(),
                    title: action.payload.title,
                    description: action.payload.description || '',
                    tags: action.payload.tags || [],
                    flashcards: action.payload.flashcards || [],
                    createdDate: now.toISOString(),
                    revisionCount: 0,
                    nextRevisionDate: getNextRevisionDate(0, now),
                    revisions: [],
                };
                newState = [...state, topic];
                break;
            }

            case 'MARK_REVISED': {
                const now = new Date();
                newState = state.map((topic) => {
                    if (topic.id === action.payload.id) {
                        const newCount = topic.revisionCount + 1;
                        return {
                            ...topic,
                            revisionCount: newCount,
                            nextRevisionDate: getNextRevisionDate(newCount, now),
                            revisions: [...(topic.revisions || []), now.toISOString()],
                        };
                    }
                    return topic;
                });
                break;
            }

            case 'DELETE_TOPIC': {
                newState = state.filter((topic) => topic.id !== action.payload.id);
                break;
            }

            case 'UPDATE_TOPIC': {
                newState = state.map((topic) => {
                    if (topic.id === action.payload.id) {
                        return { ...topic, ...action.payload.updates };
                    }
                    return topic;
                });
                break;
            }

            case 'LOAD_TOPICS': {
                newState = action.payload;
                break;
            }

            default:
                return state;
        }

        saveToStorage(newState, userId);
        return newState;
    };
}

export function TopicProvider({ children, userId }) {
    const reducer = createTopicReducer(userId);
    const [topics, dispatch] = useReducer(reducer, userId, (uid) => loadFromStorage(uid));

    // Reload topics when userId changes
    useEffect(() => {
        const stored = loadFromStorage(userId);
        dispatch({ type: 'LOAD_TOPICS', payload: stored });
    }, [userId]);

    const addTopic = (topicData) => {
        dispatch({ type: 'ADD_TOPIC', payload: topicData });
    };

    const markRevised = (id) => {
        dispatch({ type: 'MARK_REVISED', payload: { id } });
    };

    const deleteTopic = (id) => {
        dispatch({ type: 'DELETE_TOPIC', payload: { id } });
    };

    const updateTopic = (id, updates) => {
        dispatch({ type: 'UPDATE_TOPIC', payload: { id, updates } });
    };

    return (
        <TopicContext.Provider value={{ topics, addTopic, markRevised, deleteTopic, updateTopic }}>
            {children}
        </TopicContext.Provider>
    );
}

export function useTopics() {
    const context = useContext(TopicContext);
    if (!context) {
        throw new Error('useTopics must be used within a TopicProvider');
    }
    return context;
}
