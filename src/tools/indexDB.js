// db.js
import Dexie from 'dexie';

export function createUserDatabase(userId) {
  const db = new Dexie(`${userId}_db`);
  
  db.version(1).stores({
    personalInfo: 'id', // 假设个人信息有 id, name, email 字段,
    friend:'id',
    chatMessages: '++messageId,chatId,text,date,uuidv4', // 消息数据结构示例，
   //聊天列表
    chatList:'id',
    
  });
  
  return db;
}
