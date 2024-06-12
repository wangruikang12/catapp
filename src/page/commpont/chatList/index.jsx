import React, { useRef, useState, useEffect } from 'react'
import { Dialog, List, SwipeAction, Toast, Space, Button, Image, Badge } from 'antd-mobile'
import { MoreOutline } from 'antd-mobile-icons'
// import {
//     DragDropContext,
//     Draggable,
//     Droppable,
//     // DropResult,
// } from 'react-beautiful-dnd'
//状态中心数据
import { useContext } from 'react';
//获取聊天内容通过GlobalStateContext
import { GlobalStateContext } from '../../../data/GlobalStateContext';

import { createUserDatabase } from '../../../tools/indexDB';
import { liveQuery } from 'dexie';
import './index.css'



export default () => {
    const refs = useRef([])
    const { state ,updateState} = useContext(GlobalStateContext);
    const [items, setItems] = useState([])
    const address = localStorage.getItem("Address")


    useEffect(() => {
        // 构建一个 liveQuery 来订阅朋友列表的变化
        // db.messages.where({ chatId }).sortBy('date')).subscribe
        // createUserDatabase(address).chatMessages.toArray()).subscribe
        // console.log("state.chatId", state.chatId);
        // console.log();
        const subscription = liveQuery(() => createUserDatabase(address).chatList.toArray()).subscribe(
            (newFriendsList) => {
                setItems(newFriendsList);
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
    useEffect(() => {
        // 构建一个 liveQuery 来订阅朋友列表的变化
        createUserDatabase(address).chatList.toArray().then((res) => {
            setItems(res);
        });
    }, []);


    const onClick = (item) => {
        // console.log(item);
        updateState({ visibleCloseRightChat: true, chatId: item})
    };

    return (
        <>
            {/* <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='droppable'>
                    {droppableProvided => (
                        <div ref={droppableProvided.innerRef}>
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                opacity: snapshot.isDragging ? 0.8 : 1,
                                            }}
                                        >
                                            <SwipeAction
                                                ref={(ref) => (refs.current[index] = ref)}
                                                closeOnAction={false}
                                                closeOnTouchOutside={false}
                                                rightActions={[
                                                    {
                                                        key: 'delete',
                                                        text: '删除',
                                                        color: 'danger',
                                                        onClick: async () => {
                                                            await Dialog.confirm({
                                                                content: '确定要删除吗？',
                                                            })
                                                            refs.current[index]?.close();
                                                        },
                                                    },
                                                ]}
                                            >
                                                <List.Item
                                                    key={item?.name ? item.name : item.id}
                                                    prefix={
                                                        <Badge content={item.number > 0 ? item.number : null}>
                                                            <Image
                                                                src={item.avatar}
                                                                style={{ borderRadius: 20 }}
                                                                fit='cover'
                                                                width={40}
                                                                height={40}
                                                            />
                                                        </Badge>

                                                    }
                                                    description={item.id}
                                                >
                                                    {item.text}
                                                </List.Item>
                                            </SwipeAction>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {droppableProvided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext> */}
            <List >
                {items.map((item, index) => (
                    <SwipeAction
                        key={index}
                        ref={(ref) => (refs.current[index] = ref)}
                        closeOnAction={false}
                        closeOnTouchOutside={false}
                        rightActions={[
                            {
                                key: 'delete',
                                text: '删除',
                                color: 'danger',
                                onClick: async () => {
                                    await Dialog.confirm({
                                        content: '确定要删除吗？',
                                    })
                                    refs.current[index]?.close();
                                },
                            },
                        ]}
                    >
                        <List.Item
                            prefix={
                                <Badge content={item.number > 0 ? item.number : null}>
                                    <Image
                                        src={item.avatar}
                                        style={{ borderRadius: 20 }}
                                        fit='cover'
                                        width={40}
                                        height={40}
                                        onClick={()=>onClick(item.id)}
                                    />
                                </Badge>
                            }
                            description={item.text ? item.text : "——"}
                            extra={<div><MoreOutline onClick={() => { refs.current[index]?.show() }} /></div>}
                        >
                            {/* <div className='listFriend'>
                            </div> */}
                            <div onClick={()=>onClick(item.id)}>{item.id}</div>
                        </List.Item>
                    </SwipeAction>
                ))

                }
            </List>
        </>
    )
}
