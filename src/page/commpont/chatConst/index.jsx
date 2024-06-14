import React, { useState, useEffect, useRef } from 'react';
import { NavBar, Input, List, ImageViewer, Space } from 'antd-mobile'
import { List as VirtualizedList, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized' //引入虚拟滚动列表组件优化长列表
//状态中心数据
import { useContext } from 'react';
import imageCompression from 'browser-image-compression';
import { GlobalStateContext } from '../../../data/GlobalStateContext';
import { createUserDatabase } from '../../../tools/indexDB';
import { liveQuery } from 'dexie';
//长链接请求方法
import socket from '../../../tools/socket';

import ChatContainer from '../chat-container'; //引入聊天组件气泡框
import { v4 as uuidv4 } from 'uuid';
import { AddCircleOutline, VideoOutline } from 'antd-mobile-icons'

import SimpleVicode from '../SimpleVicode/index'
import VideoChat from '../VideoChat/VideoChat';
import ReactDOM from 'react-dom';



const Index = () => {

    const [data, setData] = useState([])
    const [value, setValue] = useState('')
    const [images, setImages] = useState(null);
    const listRef = useRef();//聊天框滚动
    const chatBody = useRef(null) //聊天内容 bady
    const imageRef = useRef(null)
    // 创建引用 上传
    const fileInputRef = useRef(null);
    const address = localStorage.getItem("Address")

    const { state, updateState } = useContext(GlobalStateContext);
    // chatId  state.chatId

    const [showVideoChat, setShowVideoChat] = useState(false);

    const handleVideoChatRequest = () => {
        //这里发送消息判断视频请求
        //弹出视频框
        // sendMsg
        // callStatus
        // setShowVideoChat(true);
        const msg = {
            frome: address,
            to: state.chatId,
            type: "videoChat",
            msg: "call",
            callId: uuidv4(),
            date: new Date().toISOString(),
        }
        socket.emit("sendMsg", msg)
        updateState({ callStatus: true, callInitiator: true })

    };

    const handleCloseVideoChat = () => {
        // setShowVideoChat(false);
        updateState({ callStatus: false, callInitiator: false })
    };

    useEffect(() => {
        if (listRef.current && data.length > 0) {
            listRef.current.scrollToRow(data.length - 1);
        }
        // console.log(data, "data");
    }, [data]);
    // useEffect(() => {
    //     setShowVideoChat(state.callStatus)
    // }, [state.callStatus]);

    useEffect(() => {
        // 构建一个 liveQuery 来订阅朋友列表的变化
        // db.messages.where({ chatId }).sortBy('date')).subscribe
        // createUserDatabase(address).chatMessages.toArray()).subscribe
        // console.log("state.chatId", state.chatId);
        console.log(address, "address", state);

        const subscription = liveQuery(() => createUserDatabase(address).chatMessages.where({ chatId: state.chatId }).sortBy('date')).subscribe(
            (newFriendsList) => {
                setData(newFriendsList);
            },
            (error) => {
                console.error('Failed to subscribe to friends updates:', error);
            }
        );

        // 当组件卸载时取消订阅
        return () => {
            subscription.unsubscribe();
        };
    }, [state.chatId]);

    const updateCompressionProgress = (messageId, progress) => {
        // 更新UI进度条或其他指示器
        // 例如，你可以更新数据库中的某个字段来表示进度
        // 或者直接操作DOM更新进度条（不推荐直接操作DOM）
        // console.log(data, "data");
        // console.log(`Compression Progress: ${progress}%`,"111111");
        // progress 是一个 0 到 100 之间的整数

        // 给这个更新最小的时间更新
        setData(res => {
            console.log(res, "res=====>");
            return res.map(item => {
                if (item.messageId === messageId) {
                    return {
                        ...item,
                        percent: progress
                    }
                } else {
                    return item
                }
            })
        })


    }
    //通过indexDB 监听数据变化
    const sendImage = async (file, msg) => {
        console.log(file, msg);
        const myUUID = uuidv4();
        // 创建加载中的消息对象
        let newMsgLoading = {
            ...msg,
            uuidv4: myUUID,
            image: null,
            loading: true, // 表示消息正在加载
        };
        // 添加加载中的消息到数据库，并保存生成的id
        let messageId;
        try {
            messageId = await createUserDatabase(address).chatMessages.add({ chatId: state.chatId, ...newMsgLoading, type: 'sent' });
            setImages(null);
            imageRef.current.value = '';
            console.log('message added');
            // console.log(`Loading message added with ID: ${messageId}`);
        } catch (error) {
            console.error('Failed to add loading message:', error);
            return;
        }
        console.log("开始压缩");
        // 压缩图片
        const compressedFile = await imageCompression(file, {
            maxSizeMB: 1, // (最大文件大小MB)
            maxWidthOrHeight: 1920, // (压缩后最大尺寸)
            useWebWorker: true,
            onProgress: (progress) => updateCompressionProgress(messageId, progress)
        });
        // 转换成Base64
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = () => {
            const base64data = reader.result;
            // 更新数据库中的消息状态
            //等待onProgress 执行完后1.5s执行其他
            setTimeout(async () => {
                try {
                    // 首先根据 uuidv4 获取 messageId
                    // const message = await createUserDatabase(address).chatMessages.where({ uuidv4: myUUID }).first();
                    // 如果消息存在，则更新它
                    if (messageId) {
                        await createUserDatabase(address).chatMessages.update(messageId, {
                            image: base64data,
                            loading: false, // 更新加载状态
                        });
                        // console.log('Message updated');
                        // 发送消息到服务端
                        socket.emit("sendMsg", { ...msg, image: base64data });
                    } else {
                        console.error('No message found with the given UUID');
                    }
                } catch (error) {
                    console.error('Failed to update message:', error);
                }
            }, 1500);

        };
    };

    //发送聊天函数
    const sendChat = async () => {
        // console.log(images);
        const msg = {
            // 私信类型
            type: "private",
            to: state.chatId,
            frome: address,
            text: value,
            data: new Date().toLocaleString()
        }
        // console.log("2222");
        if (value.trim() === '') {
            return;
        }
        try {
            await createUserDatabase(address).chatMessages.add({ chatId: state.chatId, ...msg, type: 'sent' });
            setValue('')
        } catch (error) {
            console.error('Failed to send message:', error);
        }
        socket.emit("sendMsg", msg)
        // 'sent'
        // console.log(value);
        // const newData = [...data, {
        //     type: 'sent',
        //     content: value,
        //     time: new Date().toLocaleString()
        // }];
        // setData(newData);
        // setValue('');
        // socket.emit("sendMsg", msg)           

    }


    // 触发隐藏的 file input 点击事件的函数
    const handleButtonClick = () => {
        imageRef.current.click();
    };

    // 处理文件选择
    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            // setImages(file)
            const msg = {
                // 私信类型
                type: "private",
                to: state.chatId,
                frome: address,
                text: "",
                data: new Date().toLocaleString()
            }
            sendImage(file, msg)
        }
    };
    //发送私信
    //   const sendPrivateMessage = async () => {
    //     if (sendValue) {
    //         const msg = {
    //             // 私信类型
    //             type: "private",
    //             frome: address,
    //             to: "0x1eE43E087aBE06bF491E935ec68E92800D93D375",
    //             text: sendValue,
    //             time: new Date().getTime()
    //         }
    //         // socket.emit("sendMsg", msg)
    //         // saveChatMessage(address, msg)
    //         //监听saveChatMessage保存数据成功后获取最新的数据库更新useContext
    //         // getChatMessages(address, (info) => {
    //         //     updateState({ indexDBchatMessages: info })
    //         // })
    //     }
    // };




    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 100 // 初始估算高度
    });
    // 手动实现防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    // 在组件外部创建防抖函数
    const debouncedMeasure = debounce((measure) => {
        measure();
    }, 1000); // 1000毫秒的防抖时间
    const rowRenderer = ({ index, key, parent, style }) => {
        const item = data[index];
        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}>
                {({ measure }) => (
                    // 假设每行是一个div，你可以在这里放置你的内容，并根据内容动态调整高度
                    <div style={style} onLoad={() => debouncedMeasure(measure)}>
                        <List.Item key={key}  >
                            <ChatContainer {...item} />
                        </List.Item>
                    </div>
                )}
            </CellMeasurer>
        )

    }
    return (
        <div>
            <div className="appHome">
                <div className="top">
                    <NavBar onBack={async () => {
                        // setVisibleCloseRightChat(false)
                        updateState({ visibleCloseRightChat: false });

                        await createUserDatabase(address).chatList.get({ id: state.chatId }).then(async item => {
                            if (item) {
                                // 更新记录
                                await createUserDatabase(address).chatList.put({ id: state.chatId, ...item, number: 0 }).then(() => {
                                    console.log("朋友信息已更新。");
                                }).catch(error => {
                                    console.error("更新失败: ", error);
                                });
                            }
                        }).catch(error => {
                            console.error("查询出错: ", error);
                        });
                    }}>聊天内容</NavBar>
                </div>
                <div className='body' style={{ display: "block" }} ref={chatBody}>
                    <ImageViewer.Multi
                        classNames={{
                            mask: 'customize-mask',
                            body: 'customize-body',
                        }}
                        images={[state.image]}
                        visible={state.visibleImage}
                        onClose={() => {
                            updateState({ visibleImage: false });
                        }}
                    />
                    <AutoSizer disableHeight>
                        {({
                            width
                        }) =>
                        (
                            <VirtualizedList
                                rowCount={data.length}
                                rowRenderer={rowRenderer}
                                ref={listRef}
                                // width={chatBody.current?.clientWidth}
                                width={width}
                                height={chatBody.current?.clientHeight}
                                rowHeight={cache.rowHeight}
                                deferredMeasurementCache={cache}
                                // overscanRowCount={50}
                                scrollToAlignment="end"
                                scrollToIndex={data.length - 1}
                            />
                        )
                        }
                    </AutoSizer>
                </div>
                <div className='bottom' style={{
                    display: "flex",
                    alignItems: "center"
                }}>
                    <Input
                        placeholder='请输入内容'
                        value={value}
                        onChange={val => {
                            setValue(val)
                        }}
                        style={{ height: '48px' }}
                        onEnterPress={sendChat}
                    />
                    <Space style={{ padding: "0 8px" }}>
                        <div onClick={handleButtonClick} >
                            <AddCircleOutline fontSize={24} />
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} ref={imageRef} />
                        </div>
                        <div onClick={handleVideoChatRequest}>
                            <VideoOutline fontSize={24} />
                        </div >
                    </Space>
                    {state.callStatus && ReactDOM.createPortal(
                        <VideoChat onClose={handleCloseVideoChat} />,
                        document.body
                    )}
                </div>
                {/* <SimpleVicode /> */}
            </div>
        </div>
    );
}

export default Index;
