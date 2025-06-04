import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faMagnifyingGlass, faPlus, faChevronLeft, faCircleChevronDown, faComment, faUserDoctor, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
export default function Sidebar({
    recentChats,
    selectedChat,
    searchHistory,
    setSearchHistory,
    fetchChatDetails,
    handleRemoveHistoryChat,
    handleEditLabelChatHistory,
    handleKeydownLabelHistory,
    createNewChat,
    labelChatHistoryRef,
}) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-header-left">
                    <span className="icon logo-icon">
                        <FontAwesomeIcon icon={faUserDoctor} />
                    </span>
                    <input
                        type="text"
                        value={searchHistory}
                        onChange={(e) => setSearchHistory(e.target.value)}
                        className="contents-input"
                        placeholder="Tìm kiếm đoạn chat"
                    />
                    <span className="icon item-icon">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </span>
                </div>
                <div className="sidebar-header-right">
                    <button
                        className="icon-button search-icon"
                        title="Thêm chat mới"
                        onClick={createNewChat}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            </div>
            <nav className="sidebar-nav">
                <section className="nav-section">
                    <div className="nav-section-header">
                        <h3>
                            <span className="icon item-icon">
                                <FontAwesomeIcon icon={faCircleChevronDown} />
                            </span>
                            Lịch sử
                        </h3>
                    </div>
                    <ul className="nav-list">
                        {recentChats.length > 0 ? (
                            recentChats
                                .filter((chat) => chat.summary.includes(searchHistory))
                                .map((chat) => (
                                    <li
                                        key={chat.idHistory}
                                        title={chat.summary}
                                        onClick={() => fetchChatDetails(chat.idHistory)}
                                        className={selectedChat === chat.idHistory ? "active" : ""}
                                    >
                                        <span className="icon item-icon">
                                            <FontAwesomeIcon icon={faComment} />
                                        </span>
                                        <span
                                            onKeyDown={(e) => handleKeydownLabelHistory(chat.idHistory, e)}
                                            style={{ padding: "6px" }}
                                            ref={(el) => (labelChatHistoryRef.current[chat.idHistory] = el)}
                                            suppressContentEditableWarning
                                            onBlur={e => {e.target.contentEditable = false;}}
                                        >
                                            {chat.summary?.length > 30
                                                ? `${chat.summary.substring(0, 30)}...`
                                                : chat.summary || "Không có tóm tắt"}
                                        </span>
                                        <div className="nav-list__icon">
                                            <span
                                                title="Xóa lịch sử chat"
                                                className="icon item-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveHistoryChat(chat.idHistory)
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </span>
                                            <span
                                                title="Chỉnh sửa tiêu đề"
                                                className="icon item-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditLabelChatHistory(chat.idHistory)
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </span>
                                        </div>
                                    </li>
                                ))
                        ) : (
                            <li>Không có lịch sử chat.</li>
                        )}
                    </ul>
                </section>
            </nav>
        </aside>
    );
}

// Component: Khu vực hiển thị tin nhắn
