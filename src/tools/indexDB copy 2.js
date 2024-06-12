import Dexie from 'dexie';
import { generateSecureMessageId } from '../uatis/index';
class MyDatabase extends Dexie {
    constructor(userId) {
        super(`${userId}_db`);
        this.version(1).stores({
            personalInfo: 'id',
            chatMessages: '++messageId, &id',
        });
        this.personalInfo = this.table('personalInfo');
        this.chatMessages = this.table('chatMessages');
    }
}
function savePersonalInfo(userId, info) {
    const db = new MyDatabase(userId);
    db.personalInfo.add(info).then(() => {
        console.log('Personal info saved successfully');
    }).catch((error) => {
        console.error('Error saving personal info', error);
    });
}

function saveChatMessage(userId, message) {
    const db = new MyDatabase(userId);
    // 假设 generateSecureMessageId 已被其他逻辑处理
    message.messageId = generateSecureMessageId();
    db.chatMessages.add(message).then(() => {
        console.log('Chat message saved successfully');
    }).catch((error) => {
        console.error('Error saving chat message', error);
    });
}
function getChatMessages(userId, callback) {
    const db = new MyDatabase(userId);
    db.chatMessages.toArray().then((messages) => {
        callback(messages);
    }).catch((error) => {
        console.error('Error fetching chat messages', error);
    });
}
function updatePersonalInfo(userId, updatedInfo) {
    const db = new MyDatabase(userId);
    db.personalInfo.update(updatedInfo.id, updatedInfo).then((updated) => {
        if (updated) {
            console.log('Personal info updated successfully');
        } else {
            console.log('Personal info not found');
        }
    }).catch((error) => {
        console.error('Error updating personal info', error);
    });
}
/**
 * 获取用户的个人信息。
 * @param {string} userId 用户的唯一标识符。
 * @param {Function} callback 获取个人信息后的回调函数，接收一个参数，即获取到的个人信息数组。
 */
function getPersonalInfo(userId, callback) {
    const db = new MyDatabase(userId);
    db.personalInfo.toArray()
        .then((info) => {
            callback(info);
        })
        .catch((error) => {
            console.error('Error fetching personal info:', error);
        });
}

export {
    // createDatabase, // 注意: Dexie 自动处理数据库的创建
    savePersonalInfo,
    saveChatMessage,
    getPersonalInfo,
    getChatMessages,
    updatePersonalInfo
};
