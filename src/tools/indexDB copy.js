import { generateSecureMessageId } from '../uatis/index';
/**
 * 使用给定的数据库名称打开数据库。
 *
 * @param {string} dbName - 要打开的数据库的名称。
 * @returns {IDBDatabase|undefined} 若数据库成功打开，返回IDBDatabase对象，
 * 否则在发生错误时不会返回任何内容。
 */
function getDb(dbName) {
    // 尝试使用给定的名称打开数据库

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
/**
 * 创建一个以用户ID命名的数据库，并定义其结构。
 * @param {string} userId 用户的唯一标识符，用于生成数据库名称。
 */
function createDatabase(userId) {
    console.log(userId,"userIduserIduserIduserId");
    // 生成数据库名称和指定版本
    const dbName = `${userId}_db`;
    const dbVersion = 1;

    // 尝试打开或创建指定名称和版本的数据库
    const request = indexedDB.open(dbName, dbVersion);

    // 监听数据库升级需要的事件，此时会创建或修改对象仓库
    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        // 创建用于存储个人信息的对象仓库，以'id'作为键路径
        db.createObjectStore('personalInfo', { keyPath: 'id' });

        // 创建用于存储聊天记录的对象仓库，以'messageId'作为键路径
        db.createObjectStore('chatMessages', { keyPath: 'messageId' });
    };

    // 监听数据库创建成功的事件，并打印日志
    request.onsuccess = function (event) {
        console.log('Database created successfully:', dbName);
    };

    // 监听数据库创建失败的事件，并打印错误日志
    request.onerror = function (event) {
        console.error('Error creating database:', event.target.error);
    };
}


/**
 * 保存用户个人信息到数据库
 * @param {string} userId 用户ID，用于构建数据库名称
 * @param {Object} info 包含用户个人信息的对象
 * 该函数不返回任何内容
 */
function savePersonalInfo(userId, info) {
    // 构造特定于用户ID的数据库名称
    const dbName = `${userId}_db`;
   
    getDb(dbName).then((db) => {
         // 获取或创建名为userId_db的数据库，并开启一个读写事务
    const transaction = db.transaction(['personalInfo'], 'readwrite');
    // 获取事务中的personalInfo对象存储
    const store = transaction.objectStore('personalInfo');
    // 将用户信息添加到personalInfo对象存储中
    const request = store.add(info);

    // 成功添加信息时的处理逻辑
    request.onsuccess = function () {
        console.log('Personal info saved successfully');
    };

    // 添加信息失败时的处理逻辑
    request.onerror = function () {
        console.error('Error saving personal info');
    };

    }).catch((error) => {
        console.error('Error getting database:', error);
    });

}

/**
 * 保存聊天消息到用户特定的数据库中。
 * @param {string} userId 用户ID，用于创建和访问特定用户的数据库。
 * @param {Object} message 要保存的聊天消息对象。
 * 该函数不返回任何内容。
 */
function saveChatMessage(userId, message) {
    // 生成用户特定的数据库名称
    const dbName = `${userId}_db`;

    // 尝试获取或创建用户特定的数据库
    getDb(dbName).then((db) => {
        // 开启一个事务，用于读写聊天消息
        const transaction = db.transaction(['chatMessages'], 'readwrite');
        
        // 获取聊天消息的对象存储
        const store = transaction.objectStore('chatMessages');
        
        // 添加消息到存储，生成唯一的messageId并合并到消息对象中
        const request = store.add({ messageId: generateSecureMessageId(), ...message });

        // 成功添加消息时的处理逻辑
        request.onsuccess = () => {
            console.log('Personal info saved successfully');
        };

        // 添加消息失败时的处理逻辑
        request.onerror = () => {
            console.error('Error saving personal info');
        };
    }).catch((error) => {
        // 处理获取数据库时发生的错误
        console.error('Error opening database:', error);
    });
}



/**
 * 根据用户ID从IndexedDB中获取个人基本信息。
 * @param {string} userId 用户的唯一标识符。
 * @param {Function} callback 获取个人基本信息后的回调函数，接收一个参数，即获取到的个人基本信息数组。
 */
function getPersonalInfo(userId, callback) {
    // 构造数据库名称，基于用户ID
    const dbName = `${userId}_db`;
    // 尝试打开IndexedDB数据库
    const request = indexedDB.open(dbName);

    request.onsuccess = function (event) {
        // 成功打开数据库后的处理
        const db = event.target.result;
        // 创建一个只读事务，作用于'personalInfo'对象存储区
        const transaction = db.transaction(['personalInfo'], 'readonly');
        // 获取'personalInfo'对象存储区的引用
        const store = transaction.objectStore('personalInfo');
        // 发起获取所有个人基本信息的请求
        const getAllRequest = store.getAll(); // 假设我们想获取所有个人信息记录

        getAllRequest.onsuccess = function () {
            // 成功获取个人基本信息后的处理，将结果通过回调函数返回
            callback(getAllRequest.result); // 把数据传给回调函数处理
        };

        // 获取个人基本信息请求失败时的错误处理
        getAllRequest.onerror = function (event) {
            console.error('Error fetching personal info:', event.target.error);
        };
    };

    // 打开数据库请求失败时的错误处理
    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    };
    // const dbName = `${userId}_db`;
    // const request = indexedDB.open(dbName);

    // request.onsuccess = function (event) {
    //     const db = event.target.result;
    //     const transaction = db.transaction(['personalInfo'], 'readonly');
    //     const store = transaction.objectStore('personalInfo');
    //     const getAllRequest = store.getAll();

    //     getAllRequest.onsuccess = function () {
    //         callback(getAllRequest.result);
    //     };

    //     getAllRequest.onerror = function (event) {
    //         console.error('Error fetching personal info:', event.target.error);
    //     };
    // };

    // request.onerror = function (event) {
    //     console.error('Error opening database:', event.target.error);
    // };



    // getDb(dbName /*, dbVersion */)
    // .then(db => {
    //     const transaction = db.transaction(['personalInfo'], 'readonly');
    //     const store = transaction.objectStore('personalInfo');
    //     const getAllRequest = store.getAll();
    //     console.log(getAllRequest,"getAllRequest");

    //     getAllRequest.onsuccess = function() {
    //         callback(getAllRequest.result);
    //     };
        
    //     getAllRequest.onerror = function(event) {
    //         console.error('Error fetching personal info:', event.target.error);
    //     };
        
    //     // 当事务完成时关闭数据库
    //     transaction.oncomplete = function() {
    //         db.close();
    //     };
    // })
    // .catch(error => {
    //     console.error(error);
    // });
}


/**
 * 获取指定用户的聊天消息。
 * @param {string} userId 用户ID。
 * @param {function} callback 获取消息后的回调函数，接收一个参数，参数为获取到的聊天消息数组。
 */
function getChatMessages(userId, callback) {
    // 构造数据库名称
    const dbName = `${userId}_db`;
    // 尝试打开IndexedDB数据库
    const request = indexedDB.open(dbName);

    request.onsuccess = function (event) {
        const db = event.target.result;
        // 创建只读事务，访问'chatMessages'对象存储
        const transaction = db.transaction(['chatMessages'], 'readonly');
        const store = transaction.objectStore('chatMessages');
        // 从'chatMessages'对象存储中获取所有消息
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = function () {
            // 成功获取后，调用回调函数传递消息数组
            callback(getAllRequest.result);
        };

        getAllRequest.onerror = function (event) {
            // 处理获取消息时的错误
            console.error('Error fetching chat messages:', event.target.error);
        };
    };

    request.onerror = function (event) {
        // 处理打开数据库时的错误
        console.error('Error opening database:', event.target.error);
    };
}



/**
 * 更新用户个人资料信息。
 * @param {string} userId 用户ID，用于构建数据库名称。
 * @param {Object} updatedInfo 包含需要更新的信息的对象，其中`id`属性用于定位特定的个人资料信息。
 * 不返回任何值，操作成功会在控制台打印更新成功信息，出错则打印错误信息。
 */
function updatePersonalInfo(userId, updatedInfo) {
    // 构造数据库名称，并尝试打开IndexedDB数据库。
    const dbName = `${userId}_db`;
    // const request = indexedDB.open(dbName);

    // request.onsuccess = function (event) {
    //     const db = event.target.result;
    //     // 开启一个读写事务，作用于'personalInfo'对象存储区。
    //     const transaction = db.transaction(['personalInfo'], 'readwrite');
    //     const store = transaction.objectStore('personalInfo');
    //     // 根据`updatedInfo`中的id获取现有的个人资料信息。
    //     const getRequest = store.get(updatedInfo.id);

    //     getRequest.onsuccess = function () {
    //         const data = getRequest.result;
    //         // 遍历`updatedInfo`对象，将所有属性更新到获取的个人资料信息中。
    //         Object.keys(updatedInfo).forEach(key => {
    //             data[key] = updatedInfo[key];
    //         });
    //         // 将更新后的个人资料信息放回存储。
    //         const putRequest = store.put(data);

    //         putRequest.onsuccess = function () {
    //             // 更新成功，打印成功消息。
    //             console.log('Personal info updated successfully');
    //         };

    //         putRequest.onerror = function (event) {
    //             // 处理更新操作失败。
    //             console.error('Error updating personal info:', event.target.error);
    //         };
    //     };

    //     getRequest.onerror = function (event) {
    //         // 处理获取个人资料信息失败。
    //         console.error('Error fetching personal info for update:', event.target.error);
    //     };
    // };

    // request.onerror = function (event) {
    //     // 处理打开数据库失败。
    //     console.error('Error opening database:', event.target.error);
    // };
    //这个方法改为getDb(dbName) 获取后

    getDb(dbName).then(db => {
        const transaction = db.transaction(['personalInfo'], 'readwrite');
        const store = transaction.objectStore('personalInfo');
        
        const getRequest = store.get(updatedInfo.id);
        
        getRequest.onsuccess = function () {
            const data = getRequest.result;
            Object.keys(updatedInfo).forEach(key => {
                data[key] = updatedInfo[key];
            });
            
            const putRequest = store.put(data);
            
            putRequest.onsuccess = function () {
                console.log('Personal info updated successfully');
            };
            
            putRequest.onerror = function (event) {
                console.error('Error updating personal info:', event.target.error);
            };
        };
        
        getRequest.onerror = function (event) {
            console.error('Error fetching personal info for update:', event.target.error);
        };

        // Handle transaction complete event
        transaction.oncomplete = function() {
            db.close();
        };
        
    }).catch(error => {
        console.error(error);
    });
    
}


export {
    createDatabase,
    savePersonalInfo,
    saveChatMessage,
    getPersonalInfo,
    getChatMessages,
    updatePersonalInfo
}