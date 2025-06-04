import { faPaperclip , faTimes , faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ChatInput = ({
  input,
  setInput,
  isStreaming,
  selectedImage,
  handleFileChange,
  handleRemoveImage,
  handleSubmit,
  inputFileRef,
}) => (
  <div className="chat-input-area">
    <label htmlFor="img" className="icon-button file-button">
      <FontAwesomeIcon icon={faPaperclip} />
    </label>
    <input
      id="img"
      type="file"
      accept="image/png, image/jpeg"
      ref={inputFileRef}
      onChange={handleFileChange}
      style={{ display: "none" }}
    />
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input"
          placeholder="Hãy cung cấp triệu chứng bệnh nhân đang gặp phải hoặc các câu hỏi liên quan về y tế?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isStreaming}
        />
        {selectedImage && (
          <div className="image-preview">
            <img
              src={selectedImage}
              alt="Selected"
              style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "4px", marginTop: "8px" }}
            />
            <button
              type="button"
              className="icon-button remove-image"
              onClick={handleRemoveImage}
              style={{ marginLeft: "8px" }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="icon-button send-button"
        disabled={isStreaming || (!input.trim() && !selectedImage)}
      >
        {isStreaming ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Đang gửi...
          </>
        ) : (
          <FontAwesomeIcon icon={faPaperPlane} />
        )}
      </button>
    </form>
  </div>
);
export default ChatInput;