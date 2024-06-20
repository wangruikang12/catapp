import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
//长链接请求方法
import socket from '../tools/socket';
import "./css/home.css"

//本地数据库方法
import { createUserDatabase } from '../tools/indexDB';

// import { saveChatMessage, updatePersonalInfo, savePersonalInfo, getPersonalInfo, getChatMessages } from '../tools/indexDB'

//状态中心数据
import { useContext } from 'react';
import { GlobalStateContext } from '../data/GlobalStateContext';

//引入标签栏 和标签徽章 导航栏 滑动区
import { Badge, TabBar, NavBar, Swiper, Input, InfiniteScroll, List, Form, Tag, Popover, Space, Toast, Popup, Button, Modal } from 'antd-mobile'
//icon 图标
import {
    AppOutline,
    MessageOutline,
    MessageFill,
    TeamOutline,
    UserOutline,
    AddCircleOutline,
    EyeInvisibleOutline,
    EyeOutline
} from 'antd-mobile-icons'


import ChatList from './commpont/chatList'; //引入聊天列表
import ChantFriend from './commpont/chantFriend'; //引入好友列表
import ChatConst from './commpont/chatConst'; //引入聊天常组件



const Home = () => {
    const swiperRef = useRef(null) // 获取 SwiperRef


    const [activeIndex, setActiveIndex] = useState(0) // 默认选中的标签索引

    const chatBody = useRef(null) //聊天内容 bady


    const [visible, setVisible] = useState(false)//助记词弹出框
    const [visible1, setVisible1] = useState(false)//助记词弹出框
    const [mnemonic, setMnemonic] = useState('') //助记词
    const [mnemonicPassword, setMnemonicPassword] = useState('')//密码
    //加密保存到地址
    const encryptedWallet = localStorage.getItem("encryptedWallet")
    const { state, updateState } = useContext(GlobalStateContext);

    const [visibleCloseRight, setVisibleCloseRight] = useState(false) //添加好友弹出层关闭
    // const [visibleCloseRightChat, setVisibleCloseRightChat] = useState(false) //聊天框弹出层关闭



    const [friendvalue, setFriendvalue] = useState("")
    const Online = localStorage.getItem('Online');
    //获取地址
    // const [address , setAddress] = useState("")
    const address = localStorage.getItem("Address")
    const userDb = createUserDatabase(address); //数据库实例获取
    //加密保存到地址
    // const encryptedWallet = localStorage.getItem("encryptedWallet")
    const navigate = useNavigate();
    //在线ID 
    const [id, setId] = useState([]);
    //监听 socket Online 
    useEffect(() => {
        socket.on('chat ID', (data) => {
            setId(data)
        });

        socket.on('sendMsg', async (msg) => {
            //处理私聊
            if (msg.type === "private") {
                //后期优化数据和处理逻辑
                // console.log("sendMsg", msg);
                try {
                    await userDb.chatMessages.add({ chatId: msg.frome, ...msg, type: 'received' });

                    await userDb.chatList.get({ id: msg.frome }).then(async item => {
                        if (item) {
                            // 更新记录
                            await userDb.chatList.put({ id: msg.frome, ...item, ...msg, number: item.number + 1 }).then(() => {
                                console.log("朋友信息已更新。");
                                updateState({ messageBadge: true });
                            }).catch(error => {
                                console.error("更新失败: ", error);
                            });
                        } else {
                            await userDb.chatList.add({ id: msg.frome, ...item, ...msg, number: 1 })
                            console.log("没有找到这位朋友。");
                        }
                    }).catch(error => {
                        console.error("查询出错: ", error);
                    });

                } catch (error) {
                    console.error('Failed to send message:', error);
                }
                // setMessages((res) => {
                //     return [...res, msg.text]
                // })
                // saveChatMessage(address, msg)

                // getChatMessages(address, (info) => {
                //     updateState({ indexDBchatMessages: info })
                // })
            }
            //处理聊天消息添加好友
            if (msg.type === "addFriend") {
                // console.log("addFriend",msg);
                //保存本地数据库
                let newInfo = {
                    id: msg.frome,
                    status: msg.status,
                    time: msg.time,
                    frome: msg.frome
                }
                try {
                    await userDb.friend.put(newInfo);
                    updateState({ friendBadge: true });
                    console.log('Personal info updated successfully!');
                } catch (error) {
                    console.error('Failed to update personal info:', error);
                }
            }
            //处理视频聊天
            if (msg.type === "videoChat") {
                // console.log("videoChat",msg);
                //保存本地数据库
                let newInfo = {
                    id: msg.frome,
                    status: msg.status,
                    time: msg.time,
                    frome: msg.frome
                }
                try {
                    updateState({ callStatus: true });
                } catch (error) {
                    // console.error('Failed to update personal info:', error);
                }
            }

        });
        if (!(Online === "true")) {
            navigate("/loning")
        }
        // updateState
        // 组件卸载时取消监听
        return () => {
            socket.off('sendMsg');
        };
    }, []);

    useEffect(() => {
        setTabs(res => {
            return res.map(item => {
                if (item.key === 'message') {
                    return {
                        ...item,
                        badge: state.messageBadge ? Badge.dot : null
                    }
                } else if (item.key === 'todo') {
                    return {
                        ...item,
                        badge: state.friendBadge ? Badge.dot : null
                    }
                }
                else {
                    return item
                }
            })

        })
    }, [state.messageBadge, state.friendBadge])
    //监听页面刷新
    window.onbeforeunload = function () {
        localStorage.setItem('Online', false);
    }


    //发送添加好友事件
    const addFriend = async () => {

        // 使用 getAddress 方法验证地址
        const isValidAddress = ethers.isAddress(friendvalue);
        if (!isValidAddress) {
            Toast.show({
                icon: 'fail',
                content: '地址无效',
            })
            return
        }
        Toast.show({
            icon: 'success',
            content: '发送成功等待⌛️对方同意',
        })
        const msg = {
            type: "addFriend",
            frome: address,
            to: friendvalue,
            text: "添加好友",
            time: new Date().getTime(),
            //“pending”表示等待批准，“accepted”表示好友请求已被接受，“declined”表示好友请求被拒绝，“blocked”表示其中一个用户阻止了另一个
            status: "pending"
        }
        socket.emit("sendMsg", msg) //发送添加好友事件

        //保存本地数据库
        let newInfo = {
            id: msg.to,
            status: msg.status,
            time: msg.time,
            frome: msg.frome
        }
        try {
            await userDb.friend.put(newInfo);
            console.log('Personal info updated successfully!');
        } catch (error) {
            console.error('Failed to update personal info:', error);
        }

        setFriendvalue('')
    };
    //底部标签栏展示样式
    const [tabs, setTabs] = useState([
        {

            key: 'message',
            title: '消息',
            icon: (active) =>
                active ? <MessageFill /> : <MessageOutline />,
            // badge: '99+',
        },
        {
            key: 'todo',
            title: '好友',
            icon: <TeamOutline />,
            // badge: '5',
        },
        {
            key: 'home',
            title: '在线',
            icon: <AppOutline />,
            // badge: Badge.dot,

        },
        {
            key: 'personalCenter',
            title: '我的',
            icon: <UserOutline />,
        },
    ])

    const actions = [
        { key: 'scan', text: '扫一扫' },
        { key: 'payment', text: '付钱/收钱' },
        { key: 'chatWell', text: '发起群聊' },
        { key: 'friend', text: '添加好友' },
    ]

    const NavBarRight = (
        <div style={{ fontSize: 24, paddingRight: 8 }} >
            <Space style={{ '--gap': '16px' }}>
                <Popover.Menu
                    actions={actions.map(action => ({
                        ...action,
                        icon: null,
                    }))}
                    mode='dark'
                    onAction={node => {
                        // Toast.show(`选择了 ${node.text}`)
                        if (node.key === 'friend') {
                            // setSwiperIndex(2)
                            // swiperRefOut.current?.swipeTo(2)
                            setVisibleCloseRight(true)
                        }
                    }}
                    placement='bottom-start'
                    trigger='click'
                >
                    {/* <Button>点我</Button> */}
                    <AddCircleOutline />
                </Popover.Menu>
            </Space>
        </div >
    )





    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;

        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Unable to copy text', err);
        }

        document.body.removeChild(textArea);
    };

    //点击复制
    const handleCopy = (text) => {
        // 尝试使用现代浏览器API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Text successfully copied to clipboard');
            }).catch(err => {
                console.error('Error in copying text: ', err);
                fallbackCopyTextToClipboard(text);
            });
        } else {
            // 使用后备方案
            fallbackCopyTextToClipboard(text);
        }

    };





    return (
        <div >
            <div className='appHome'>
                <div className="top">
                    <NavBar back={null} right={NavBarRight}>{tabs[activeIndex].title}</NavBar>
                </div>
                <div className="body" ref={chatBody}>
                    <Swiper
                        direction='horizontal'
                        loop
                        indicator={() => null}
                        ref={swiperRef}
                        defaultIndex={activeIndex}
                        onIndexChange={index => {
                            setActiveIndex(index)
                        }}
                    >
                        <Swiper.Item>
                            <div className="content" style={{ height: chatBody.current?.clientHeight, width: chatBody.current?.clientWidth }}>
                                <div style={{ width: "100%", height: "100%", padding: " 20px 0 0 0" }}>
                                    <ChatList />
                                </div>
                            </div>
                        </Swiper.Item>
                        <Swiper.Item>
                            <div className="content" style={{ height: chatBody.current?.clientHeight, width: chatBody.current?.clientWidth }}>
                                <ChantFriend />
                            </div>

                        </Swiper.Item>
                        <Swiper.Item>
                            <div className="content">
                                <div style={{ width: "100vw" }}>
                                    {
                                        id && id.map((item) => {
                                            return <div className='ellipsisF'>
                                                <div className="ellipsis" title="Click to copy">
                                                    {item}
                                                </div>
                                                <Tag color='primary' onClick={() => handleCopy(item)}>复制</Tag>
                                            </div>

                                        })
                                    }
                                </div>
                            </div>
                        </Swiper.Item>
                        <Swiper.Item>
                            <div className="content">
                                <div>
                                    <p>我的地址：{address}</p>
                                    <p>助记词：<EyeInvisibleOutline onClick={() => {
                                        setVisible(true)
                                    }} /></p>
                                </div>
                            </div>
                        </Swiper.Item>
                    </Swiper>
                </div>
                <div className='bottom'>
                    <TabBar activeKey={tabs[activeIndex].key}
                        onChange={key => {
                            const index = tabs.findIndex(item => item.key === key)
                            console.log(key);
                            if (key === 'message') {
                                updateState({ messageBadge: false });
                            }
                            if (key === 'todo') {
                                updateState({ friendBadge: false });
                            }
                            setActiveIndex(index)
                            swiperRef.current?.swipeTo(index)
                        }}
                    >
                        {tabs.map(item => (
                            <TabBar.Item key={item.key}
                                icon={item.icon} title={item.title}
                                badge={item.badge ? item.badge : null}
                            />
                        ))}
                    </TabBar>
                </div>
            </div>

            <Popup
                position='right'
                visible={state.visibleCloseRightChat}
                bodyStyle={{ width: "100%", height: "100%" }}
            >
                <ChatConst />
            </Popup>
            <Popup
                position='right'
                visible={visibleCloseRight}
                bodyStyle={{ width: "100%" }}
            >
                <div className="appHome">
                    <div className="top">
                        <NavBar onBack={() => {
                            setVisibleCloseRight(false)
                        }}>添加好友</NavBar>
                    </div>
                    <div className='body' >
                        <div style={{ width: "100%", height: "100%" }}>
                            <Space direction='vertical' style={{ '--gap': '24px', width: "100%", padding: "0 10px" }}>
                                <Input
                                    placeholder='请输入好友地址'
                                    value={friendvalue}
                                    onChange={val => {
                                        setFriendvalue(val)
                                    }}
                                    style={{ marginTop: '10px' }}
                                />
                                <Button color='primary' fill='solid' onClick={addFriend}>
                                    添加好友
                                </Button>
                            </Space>
                        </div>
                    </div>
                    <div className='bottom'>

                    </div>
                </div>
            </Popup>
            <Popup
                visible={visible}
                showCloseButton
                onMaskClick={() => {
                    setVisible(false)
                    setVisible1(false)
                    setMnemonicPassword("")
                    setMnemonic("")
                }}
                onClose={() => {
                    setVisible(false)
                    setVisible1(false)
                    setMnemonicPassword("")
                    setMnemonic("")
                }}

                bodyStyle={{ height: '40vh' }}
            >
                {mnemonic ? <div className="password">助记词：<p>{mnemonic}</p></div> :
                    <div> <div className="password">
                        <Input
                            className="input"
                            placeholder='请输入密码'
                            type={visible1 ? 'text' : 'password'}
                            value={mnemonicPassword}
                            onChange={(e) => {
                                setMnemonicPassword(e)
                            }}
                        />
                        <div className="eye">
                            {!visible1 ? (
                                <EyeInvisibleOutline onClick={() => setVisible1(true)} />
                            ) : (
                                <EyeOutline onClick={() => setVisible1(false)} />
                            )}
                        </div>
                    </div>
                        <Space>
                            <Button color='primary' fill='outline' onClick={async () => {

                                let decryptedWallet = null
                                try {
                                    decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, mnemonicPassword);
                                } catch (error) {
                                    // window.alert("密码错误")
                                    layer.msg('密码错误');
                                }
                                if (!decryptedWallet) return
                                setMnemonic(decryptedWallet.mnemonic.phrase)
                            }} >获取助记词</Button>
                        </Space>
                    </div>

                }
            </Popup>


        </div>
    );
}

export default Home;
