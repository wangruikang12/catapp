import { createContext, useState } from 'react';

// 创建上下文
export const GlobalStateContext = createContext();

// 创建 Provider
export const GlobalStateProvider = ({ children  }) => {
    const [state, setState] = useState({
        // user: { name: 'Anonymous' },
        // chatrooms: [
        //     { id: 1, name: 'General', messages: [] },
        //     { id: 2, name: 'Random', messages: [] },
        // ],
        // currentChatroomId: 1,
        visibleCloseRightChat:false,
        chatId:"",
        image:null,
        visibleImage:false,
        messageBadge:false,
        friendBadge:false,
    });

    // 封装 setState 函数，以便可以传递一个更新函数
    const updateState = (updater:any) => {
        setState((prevState) => {
            const newState = typeof updater === 'function' ? updater(prevState) : updater;
            return { ...prevState, ...newState };
        });
    };

    return (
        <GlobalStateContext.Provider value={{ state, updateState }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

// 假设这是在某个子组件内
// const appendNameSuffix = () => {
//     updateState(prevState => ({
//         ...prevState,
//         user: { ...prevState.user, name: prevState.user.name + ' (Updated)' }
//     }));
// }

// 假设这是在另一个子组件内
// const switchToNextChatroom = () => {
//     const nextRoomId = (currentChatroomId + 1) % (chatrooms.length + 1); // 简单示例，实际逻辑可能更复杂
//     updateState({ currentChatroomId: nextRoomId });
// };

// 在消费者组件中使用React.memo
// 确保那些依赖于GlobalStateContext值且自身状态不变的组件仅在必要时重新渲染。可以通过React.memo来实现这一点：

// typescript
// import React, { useContext } from 'react';
// import { GlobalStateContext } from './your-context-file';

// const UserDisplay = () => {
//     const { state } = useContext(GlobalStateContext);
    
//     // 如果UserDisplay的渲染只依赖于state.user，React.memo将阻止不必要的渲染
//     return React.memo(() => (
//         <div>{state.user.name}</div>
//     ), (prevProps, nextProps) => prevProps.state.user === nextProps.state.user);
// };
// 确保异步操作或副作用在useEffect中执行
// 如果你在某个组件中基于GlobalStateContext的值执行异步操作（如API调用），确保这些操作在useEffect中进行，并恰当地指定依赖项：

// typescript
// import React, { useContext, useEffect } from 'react';
// import { GlobalStateContext } from './your-context-file';

// const ChatroomUpdater = () => {
//     const { state, updateState } = useContext(GlobalStateContext);

//     useEffect(() => {
//         // 假设我们在这里基于当前的chatroomId做一些异步更新
//         const fetchData = async () => {
//             // ...异步逻辑，可能涉及到updateState来更新消息列表等
//         };

//         fetchData();
//         // 注意：只有当currentChatroomId变化时才重新执行此effect
//     }, [state.currentChatroomId, updateState]);

//     // ...
// };
// 状态更新的类型安全
// 虽然不是直接的性能优化，但在大型项目中，为updateState的参数添加类型注解可以帮助提高代码的可读性和维护性，确保调用者传递正确的参数类型。

// typescript
// // 假设有一个类型定义文件types.ts
// type StateUpdater<T> = (prevState: T) => T;

// // 在GlobalStateProvider中
// const updateState: StateUpdater<typeof initialState> = (updater) => {
//     setState((prevState) => {
//         const newState = typeof updater === 'function' ? updater(prevState) : updater;
//         return { ...prevState, ...newState };
//     });
// };
// 以上建议是为了进一步提升应用的效率和可维护性，而原始代码的核心逻辑已经是按照React推荐的方式实现的。