import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../tools/socket';
import "./css/home.css"
import { saveChatMessage, updatePersonalInfo, savePersonalInfo, getPersonalInfo } from '../tools/indexDB'
import { mergeArraysByKey } from '../uatis/index'

import { useContext } from 'react';
import { GlobalStateContext } from '../data/GlobalStateContext';





const Home = () => {
    const { state } = useContext(GlobalStateContext);

    const Online = localStorage.getItem('Online');
    //获取地址
    // const [address , setAddress] = useState("")
    const address = localStorage.getItem("Address")

    //加密保存到地址
    // const encryptedWallet = localStorage.getItem("encryptedWallet")
    const navigate = useNavigate();
    //在线ID 
    // const [id, setId] = useState([]);
    const [messages, setMessages] = useState([]);
    const [sendValue, setSendValue] = useState('');
    //添加好友的地址
    const [addres, setAddres] = useState('');
    //存储好友信息数据
    const [friends, setFriends] = useState([]);
    //监听 socket Online 
    useEffect(() => {
        // socket.on('chat ID', (data) => {
        //     setId(data)
        // });
        console.log(state,"statestate");
        socket.on('sendMsg', (msg) => {
            //处理私聊
            if (msg.type === "private") {
                //后期优化数据和处理逻辑
                setMessages((res) => {
                    return [...res, msg.text]
                })
                saveChatMessage(address, msg)
            }
            //处理聊天消息添加好友
            if (msg.type === "addFriend") {
                getPersonalInfo(address, function (data) {
                    let AddressData = data.map(item => {
                        if (item.id == address) {
                            return item
                        }
                    }
                    )
                    if (AddressData[0].friendArr) {
                        //复杂数组合并 相同数据取新数据
                        updatePersonalInfo(address, { id: address, friendArr: mergeArraysByKey("freindId", AddressData[0].friendArr, [{ ...msg, freindId: msg.frome }]) })
                        //设置数据原
                        setFriends(mergeArraysByKey("freindId", AddressData[0].friendArr, [{ ...msg, freindId: msg.frome }]))
                    } else {
                        updatePersonalInfo(address, { id: address, friendArr: [{ ...msg, freindId: msg.frome }] })
                        //设置数据原
                        setFriends([{ ...msg, freindId: msg.frome }])
                    }
                })

            }

        });
        if (!(Online === "true")) {
            navigate("/loning")
        }
    }, []);

    //监听页面刷新
    window.onbeforeunload = function () {
        localStorage.setItem('Online', false);
    }

    //发送私信
    const sendPrivateMessage = async () => {
        if (sendValue) {
            const msg = {
                // 私信类型
                type: "private",
                frome: address,
                to: "0x1eE43E087aBE06bF491E935ec68E92800D93D375",
                text: sendValue,
                time: new Date().getTime()
            }
            socket.emit("sendMsg", msg)
            saveChatMessage(address, msg)
        }
    };

    //发送添加好友事件
    const addFriend = () => {
        // 判断是否是好友
        const isFriend = friends.some(item => {
            return item.freindId === item.freindId && item.status === "accepted"
        })
        if (!addres && !isFriend) return // 判断是否输入地址和是否是好友 
        const msg = {
            type: "addFriend",
            frome: address,
            to: addres,
            text: "添加好友",
            time: new Date().getTime(),
            //“pending”表示等待批准，“accepted”表示好友请求已被接受，“declined”表示好友请求被拒绝，“blocked”表示其中一个用户阻止了另一个
            status: "pending"
        }
        socket.emit("sendMsg", msg) //发送添加好友事件
        //本地数据库保存数据
        getPersonalInfo(address, function (data) {
            let AddressData = data.map(item => {
                if (item.id == address) {
                    return item
                }
            }
            )
            if (AddressData[0].friendArr) {
                //复杂数组合并 相同数据取新数据
                updatePersonalInfo(address, { id: address, friendArr: mergeArraysByKey("freindId", AddressData[0].friendArr, [{ ...msg, freindId: msg.to }]) })
                //设置数据原
                setFriends(mergeArraysByKey("freindId", AddressData[0].friendArr, [{ ...msg, freindId: msg.to }]))
            } else {
                updatePersonalInfo(address, { id: address, friendArr: [{ ...msg, freindId: msg.to }] })
                //设置数据原
                setFriends([{ ...msg, freindId: msg.to }])
            }
        })
        //弹窗展示已发送好友请
    };
    //注意：选项卡 依赖 element 模块，否则无法进行功能性操作
    layui.use('element', function () {
        let element = layui.element;
        console.log(element, "element", layui.element);
        //一些事件
        element.on('tab(demo)', function (data) {
            console.log(data);
        });
        //…
    });
    return (
        <div>
            {/* 页面主要结构 */}
            <div className="layui-tab" lay-filter="demo" style={{display:"flex"}}>
                <ul className="layui-tab-title" style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <li className="layui-this"><i
                        className="layui-icon layui-icon-reply-fill"
                        style={{ fontSize: "30px", color: "#1E9FFF" }}
                    ></i></li>
                    <li><i
                        className="layui-icon   layui-icon-friends"
                        style={{ fontSize: "30px", color: "#1E9FFF" }}
                    ></i>
                    </li>
                    <li><i
                        className='layui-icon layui-icon-user'
                        style={{ fontSize: "30px", color: "#1E9FFF" }}
                    ></i></li>
                    {/* <li>商品管理</li> */}
                    {/* <li>订单管理</li> */}
                </ul>
                <div className="layui-tab-content">
                    <div className="layui-tab-item layui-show">
                        {/* 聊天列表 */}
                        <div className="layui-tab-item layui-show">
                            1
                        </div>
                        {/* 聊天输入框 聊天展示 */}
                        <div className="layui-tab-item layui-show">
                            2
                        </div>
                    </div>
                    <div className="layui-tab-item">
                        {/* 添加好友功能 */}
                        <div className="layui-form-item">
                            <div className="layui-input-block">
                                <input type="text" required
                                    lay-verify="required"
                                    placeholder="请输入好友地址"
                                    autocomplete="off"
                                    className="layui-input"
                                    value={addres}
                                    onChange={(e) => setAddres(e.target.value)}
                                />
                            </div>
                            <div className="layui-input-block">
                                <button className="layui-btn" onClick={addFriend}>添加好友</button>
                            </div>
                        </div>
                        {/* 好友展示 */}
                        <div className="layui-card id-card">
                            <div className="layui-card-header">好友列表</div>
                            {friends && friends.map(item => {
                                console.log(item, item.frome !== address, item.frome === address, item.frome, address)
                                return <div key={item.freindId} className="layui-card-header">
                                    {item.freindId}
                                    {item.status === "pending" &&
                                        item.frome !== address ?
                                        <><button className="layui-btn layui-btn-radius layui-btn-normal" onClick={() => { }}>同意</button>
                                            <button className="layui-btn layui-btn-radius layui-btn-primary" onClick={() => { }}>拒绝</button></>
                                        : <div>等待同意中~</div>}
                                </div>
                            })}
                            { }
                        </div>
                    </div>
                    <div className="layui-tab-item">
                        <div>地址：{address} </div>
                        <div>助记词</div>
                        <div>密钥</div>
                    </div>
                    {/* <div className="layui-tab-item">内容4</div> */}
                    {/* <div className="layui-tab-item">内容5</div> */}
                </div>
            </div>
            {/* <h4>本人地址：{address ? address : null}</h4> */}
            {/* <div className="layui-card id-card">
                {id && id.map(item => <div key={item} className="layui-card-header">{item}</div>)}
            </div> */}

            {/* <pre className="layui-code">
                {id}
            </pre> */}

            {/* <ul style={{ maxHeight: "200px", overflow: "auto" }} >
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
            <input
                type="text"
                className='layui-input'
                value={sendValue}
                onChange={(e) => setSendValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        sendPrivateMessage();
                        setSendValue('')
                    }
                }}
            /> */}
        </div>
    );
}

export default Home;
