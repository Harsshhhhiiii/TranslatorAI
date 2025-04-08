import React, { useState } from 'react';
import { Send, AttachFile } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './ChatInterface.module.css';

const ChatInterface = () => {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [previewURL, setPreviewURL] = useState(null);
    const [fullImageSrc, setFullImageSrc] = useState(null); // NEW

    const handleImageTranslation = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('https://translatorai.onrender.com/api/translate-image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Translation failed');
            }

            return data.translation;
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    };

    const handleSend = async () => {
        if ((message.trim() || selectedFile) && !isSending) {
            setIsSending(true);
            try {
                const userMessage = {
                    text: message.trim(),
                    file: selectedFile,
                    timestamp: new Date().toISOString(),
                    isUser: true,
                    isError: false
                };

                setMessages(prev => [...prev, userMessage]);

                let aiMessage = null;
                if (selectedFile) {
                    try {
                        const translation = await handleImageTranslation(selectedFile);
                        aiMessage = {
                            text: translation,
                            timestamp: new Date().toISOString(),
                            isUser: false,
                            isError: false
                        };
                    } catch (error) {
                        aiMessage = {
                            text: `⚠️ ${error.message}`,
                            timestamp: new Date().toISOString(),
                            isUser: false,
                            isError: true
                        };
                    }
                    setMessages(prev => [...prev, aiMessage]);
                }

                setMessage('');
                setSelectedFile(null);
                setPreviewURL(null);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewURL(URL.createObjectURL(file));
        }
    };

    const handleEditMessage = (newText, index) => {
        setMessages(prev => prev.map((msg, i) =>
            i === index ? { ...msg, text: newText } : msg
        ));
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.splitPane}>
                <div className={styles.leftPane}>
                    <div className={styles.paneHeader}>Your Messages</div>
                    <div className={styles.messagesContainer}>
                        {messages.filter(msg => msg.isUser).map((msg, index) => (
                            <div key={`user-${index}`} className={styles.messageContainer}>
                                <div className={`${styles.messageBubble} ${styles.userMessage}`}>
                                    {msg.file && (
                                        <div className={styles.messageMedia}>
                                            <img
                                                src={URL.createObjectURL(msg.file)}
                                                alt="attachment"
                                                className={styles.messageImage}
                                                onClick={() => setFullImageSrc(URL.createObjectURL(msg.file))} // NEW
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <div className={styles.imageOverlay}>📷 Image</div>
                                        </div>
                                    )}
                                    <div className={styles.messageContent}>
                                        {msg.text}
                                    </div>
                                    <span className={styles.timestamp}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.rightPane}>
                    <div className={styles.paneHeader}>AI Responses</div>
                    <div className={styles.messagesContainer}>
                        {messages.filter(msg => !msg.isUser).map((msg, index) => (
                            <div key={`ai-${index}`} className={styles.messageContainer}>
                                <div className={`${styles.messageBubble} ${msg.isError ? styles.errorMessage : styles.aiMessage}`}>
                                    <div
                                        className={styles.messageContent}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleEditMessage(e.target.textContent, index * 2 + 1)}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className={styles.timestamp}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.inputContainer}>
                {previewURL && (
                    <div className={styles.imagePreview}>
                        <img src={previewURL} alt="Preview" />
                        <button
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewURL(null);
                            }}
                            className={styles.removePreview}
                        >
                            ×
                        </button>
                    </div>
                )}

                <label className={styles.fileUpload}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        hidden
                    />
                    <AttachFile style={{ fontSize: '1.8rem', color: '#6366f1' }} />
                </label>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message or upload an image..."
                    className={styles.messageInput}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isSending}
                />

                <button
                    onClick={handleSend}
                    className={styles.sendButton}
                    disabled={isSending}
                >
                    {isSending ? (
                        <CircularProgress size={24} style={{ color: 'white' }} />
                    ) : (
                        <Send style={{ fontSize: '1.8rem', color: 'white' }} />
                    )}
                </button>
            </div>

            {/* Fullscreen image modal */}
            {fullImageSrc && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setFullImageSrc(null)}
                >
                    <img
                        src={fullImageSrc}
                        alt="Full View"
                        style={{
                            maxHeight: '90vh',
                            maxWidth: '90vw',
                            borderRadius: '10px',
                            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
