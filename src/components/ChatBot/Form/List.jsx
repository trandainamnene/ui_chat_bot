import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const chatHistory = [
    {
        id: 1,
        timestamp: '2025-05-08 14:30',
        summary: 'TEST.',
    },
    {
        id: 2,
        timestamp: '2025-05-08 15:10',
        summary: 'TEST',
    },
    {
        id: 3,
        timestamp: '2025-05-08 16:45',
        summary: 'TEST',
    },
];

function onClick(e) {
    console.log(
        {
            id: 3,
            timestamp: '2025-05-08 16:45',
            summary: 'Tạo UI hiển thị lịch sử chat.',
        }
    )
}

function List() {
    return (
        <div className="container mt-5">
            <h3 className="mb-4">Lịch sử trò chuyện</h3>
            <ul className="list-group">
                {chatHistory.map((chat) => (
                    <li key={chat.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                            <strong>{chat.summary}</strong>
                            <small className="text-muted">{chat.timestamp}</small>
                        </div>
                    </li>
                ))}
            </ul>
            <button onClick={onClick}>Add</button>
        </div>
    );
}

export default List;