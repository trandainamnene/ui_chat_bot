import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot , faMagnifyingGlass , faPlus, faChevronLeft, faCircleChevronDown, faComment,} from '@fortawesome/free-solid-svg-icons'
export default function Sidebar({setShowLogin , showLogin , recentChats , setRecentChats , selectedChat , setSelectedChat}) {
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowLogin(true);
      }

      fetch("http://localhost:8080/chat-history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status === 403) {
            setShowLogin(true);
            return [];
          }
          if (!response.ok) {
            throw new Error("Lỗi khi lấy dữ liệu lịch sử chat");
          }
          return response.json();
        })
        .then((data) => {
          setRecentChats(data);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy lịch sử chat:", error);
          setRecentChats([]);
        });
    }, [showLogin]);

    return <aside className="sidebar">
        <div className="sidebar-header">
            <div className="sidebar-header-left">
                <span className="icon logo-icon">
                    <FontAwesomeIcon icon={faRobot} />
                </span>
                <input type="text" className="contents-input" placeholder="Content..." />
                <span className="icon item-icon">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
            </div>
            <div className="sidebar-header-right">
                <button className="icon-button search-icon">
                    <FontAwesomeIcon icon={faPlus} />
                </button>
                <button className="icon-button plus-icon">
                    <span className="icon item-icon">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </span>
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
                        History
                    </h3>
                    <a href="#" className="view-all">View all</a>
                </div>
                <ul className="nav-list">
                    {recentChats.length > 0 ? (
                        recentChats.map((chat) => (
                            <li key={chat.idHistory} onClick={() => { fetchChatDetails(chat.idHistory) }} className={selectedChat == chat.idHistory ? "active" : ""}>
                                <span className="icon item-icon">
                                    <FontAwesomeIcon icon={faComment} />
                                </span>
                                {chat.summary && chat.summary.length > 30
                                    ? `${chat.summary.substring(0, 30)}...`
                                    : chat.summary || "Không có tóm tắt"}
                            </li>
                        ))
                    ) : (
                        <li>Không có lịch sử chat.</li>
                    )}
                </ul>
            </section>
        </nav>
        <div className="sidebar-footer">
            <a href="#" className="nav-item upgrade-link">
                <span className="icon item-icon">[UP]</span>
                Upgrade plan for more access to new mo...
            </a>
        </div>
    </aside>;
}