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

    const handleImageTranslation = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://localhost:8080/api/translate-image', {
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
                // Add user message first
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
            <div className={styles.chatMessages}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.messageContainer} ${
                        msg.isUser ? styles.userContainer : styles.aiContainer
                    }`}>
                        <div className={`${styles.messageBubble} ${
                            msg.isError ? styles.errorMessage :
                            msg.isUser ? styles.userMessage : styles.aiMessage
                        }`}>
                            {msg.file && (
                                <div className={styles.messageMedia}>
                                    <img 
                                        src={URL.createObjectURL(msg.file)} 
                                        alt="attachment"
                                        className={styles.messageImage}
                                    />
                                    <div className={styles.imageOverlay}>📷 Image</div>
                                </div>
                            )}
                            <div 
                                className={styles.messageContent}
                                contentEditable={!msg.isUser}
                                suppressContentEditableWarning
                                onBlur={(e) => handleEditMessage(e.target.textContent, index)}
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
        </div>
    );
};

export default ChatInterface;