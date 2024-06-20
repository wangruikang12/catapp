import { createContext, useState } from 'react';

// 创建上下文
export const GlobalStateContext = createContext();

// 创建 Provider
export const GlobalStateProvider = ({ children  }) => {
    const [state, setState] = useState({
        visibleCloseRightChat:false,
        chatId:"",
        image:null,
        visibleImage:false,
        messageBadge:false,
        friendBadge:false,
        //通话状态
        callStatus:false,
        //是否是通话发起人
        callInitiator:false,
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
