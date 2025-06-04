export const fetchChatHistory = async (token) => {
  const response = await fetch('http://localhost:8080/chat-history', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 403) {
    return { status: 403, data: [] };
  }
  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu lịch sử chat');
  }
  return { status: response.status, data: await response.json() };
};

export const deleteChatHistory = async (chatId, token) => {
  const response = await fetch(`http://localhost:8080/chat-history/${chatId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Lỗi khi xóa lịch sử chat');
  }
  return response.json();
};

export const createChatHistory = async (summary, token) => {
  const response = await fetch('http://localhost:8080/chat-history', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summary }),
  });
  if (!response.ok) {
    throw new Error('Lỗi khi tạo lịch sử chat mới');
  }
  return response.json();
};

export const updateChatHistory = async (chatId, summary, token) => {
  const response = await fetch(`http://localhost:8080/chat-history/${chatId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summary }),
  });
  if (!response.ok) {
    throw new Error('Lỗi khi cập nhật tóm tắt chat');
  }
  return response.json();
};

export const fetchChatDetails = async (chatId, token) => {
  const response = await fetch(`http://localhost:8080/question/${chatId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 403) {
    return { status: 403, data: [] };
  }
  if (!response.ok) {
    throw new Error('Lỗi khi lấy chi tiết chat');
  }
  return { status: response.status, data: await response.json() };
};

export const insertChatToDb = async (chatId, question, answer, token) => {
  const response = await fetch(`http://localhost:8080/question/${chatId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questiontext: question,
      responsetext: answer,
      idHistory: { idHistory: chatId },
    }),
  });
  if (!response.ok) {
    throw new Error('Lỗi khi lưu chat vào cơ sở dữ liệu');
  }
  return response.json();
};

export const checkValidToken = async (token) => {
  const response = await fetch('http://localhost:8080/auth/check', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 403) {
    return { status: 403, valid: false };
  }
  return { status: response.status, valid: true, data: await response.json() };
};

export const createSummary = async (input, token) => {
  const response = await fetch('http://localhost:5000/summarize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question: input, image: null }),
  });
  if (!response.ok) {
    throw new Error('Lỗi khi tạo tóm tắt');
  }
  const result = await response.json();
  return result.answer;
};

export const sendMessageToAI = async (input, file, token) => {
  const body = file
    ? JSON.stringify({
        question: input,
        image: {
          url: file.base64.split(',')[1],
          type: file.type,
        },
      })
    : JSON.stringify({ question: input, image: null });

  const response = await fetch('http://localhost:5000/generative_ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
  if (!response.ok) {
    throw new Error('Lỗi khi gửi tin nhắn đến AI');
  }
  return response.body.getReader();
};