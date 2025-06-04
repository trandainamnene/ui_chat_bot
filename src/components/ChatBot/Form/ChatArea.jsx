import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown from 'react-markdown';
const ChatArea = ({ messages, showScrollToBottom, scrollToBottom, chatAreaRef }) => (
    <>
        {showScrollToBottom && (
            <button
                className="scroll-to-bottom-button"
                onClick={scrollToBottom}
                title="Cuộn xuống cuối"
            >
                Xuống cuối đoạn chat <FontAwesomeIcon icon={faArrowDown} />
            </button>
        )}
        <div className="chat-area" ref={chatAreaRef}>
            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={msg.sender === "user" ? "initial-prompt-container" : "chat-response"}
                >
                    <p className={msg.sender === "user" ? "user-prompt-question" : "chat-response"}>
                        {msg.image && (
                            <img
                                src={msg.image}
                                alt="Uploaded"
                                style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", marginBottom: "8px" }}
                            />
                        )}
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </p>
                </div>
            ))}
        </div>
    </>
);

export default ChatArea;