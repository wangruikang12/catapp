import React, { useState, useEffect, useContext } from 'react';
import { IndexBar, Button, Popup, List, Space, Badge } from 'antd-mobile';
//长链接请求方法
import socket from '../../../tools/socket';
//状态中心数据
// import { useContext } from 'react';
import { GlobalStateContext } from '../../../data/GlobalStateContext';
import { createUserDatabase } from '../../../tools/indexDB';
import { liveQuery } from 'dexie';


// indexDBFriend

// const friends = [
//   { name: 'Alice', index: 'A' },
//   { name: 'Bob', index: 'B' },
//   { name: 'Charlie', index: 'C' },
//   // ... 更多好友
// ];

const IndexBarExample = () => {
  const [visible4, setVisible4] = useState(false)
  const { state, updateState } = useContext(GlobalStateContext);
  const [friends, setFriends] = useState([]);
  const address = localStorage.getItem("Address")
 

  useEffect(() => {
    // 构建一个 liveQuery 来订阅朋友列表的变化
    const subscription = liveQuery(() => createUserDatabase(address).friend.toArray()).subscribe(
      (newFriendsList) => {
        setFriends(newFriendsList);
      },
      (error) => {
        console.error('Failed to subscribe to friends updates:', error);
      }
    );

    // 当组件卸载时取消订阅
    return () => {
      subscription.unsubscribe();
    };
  }, []);


  //新盆友徽标
  const content = () => {
    let rest = []
    if (!friends) return
    rest = friends.filter(item => {
      return item.status === "pending" && item.frome !== address
    })
    // Badge.dot
    return rest ? rest.length > 0 ? rest.length.toString() : null : null
    // return null
  }





  return (
    < div style={{ display: "flex", width: "100%", height: "100%", flexDirection: "column" }}>
      <div style={{
        marginTop: "10px", display: "flex",
        justifyContent: "center"
      }}>
        <Badge content={content()}
        >
          <Button
            onClick={() => {
              setVisible4(true)
            }}
            style={{ width: "90vw" }}
          >
            新朋友
          </Button>
        </Badge>
      </div>
      <IndexBar style={{ width: "100%", height: "100%" }}>
        {/* 索引列表 */}
        {friends.map((friend,index) => (
          friend.status === "accepted" && <IndexBar.Panel
            key={friend.id}
            index=""
          // title={friend.id}
          >
            {/* 这里可以放置好友的详细信息或其他内容 */}
            <div onClick={async () => {
              updateState({ visibleCloseRightChat: true, chatId: friend.id })
              await createUserDatabase(address).chatList.get({ id: friend.id }).then(async item => {
                if (item) {
                } else {
                  await createUserDatabase(address).chatList.add({ id: friend.id ,number:0})
                }
              }).catch(error => {
                console.error("查询出错: ", error);
              });
            }}>{friend.id}</div>
          </IndexBar.Panel>
        ))}
      </IndexBar>
      <Popup
        visible={visible4}
        showCloseButton
        onClose={() => {
          setVisible4(false)
        }}
        position='right'
        bodyStyle={{ width: '100vw' }}
      >
        {/* 等待同意或者发送完等待中的好友数据 */}
        <List header='等待处理好友' style={{ marginTop: "30px" }}>
          {friends && friends.map((item) => {
            if (item.status === "pending") {
              return <List.Item key={item.id}> <div>
                {item.id}
                {item.status === "pending" &&
                  item.frome !== address ?
                  <><Space><Button onClick={async () => {
                    const msg = {
                      type: "addFriend",
                      frome: address,
                      to: item.id,
                      text: "添加好友",
                      time: new Date().getTime(),
                      //“pending”表示等待批准，“accepted”表示好友请求已被接受，“declined”表示好友请求被拒绝，“blocked”表示其中一个用户阻止了另一个
                      status: "accepted"
                    }
                    let newInfo = {
                      id: msg.to,
                      status: msg.status,
                      time: msg.time,
                      frome: msg.frome
                    }
                    try {
                      await createUserDatabase(address).friend.put(newInfo);
                      console.log('Personal info updated successfully!');
                    } catch (error) {
                      console.error('Failed to update personal info:', error);
                    }

                    socket.emit("sendMsg", msg) //发送添加好友事件
                  }}>同意</Button>
                    <Button onClick={async () => {
                      const msg = {
                        type: "addFriend",
                        frome: address,
                        to: item.id,
                        text: "添加好友",
                        time: new Date().getTime(),
                        //“pending”表示等待批准，“accepted”表示好友请求已被接受，“declined”表示好友请求被拒绝，“blocked”表示其中一个用户阻止了另一个
                        status: "declined"
                      }
                      let newInfo = {
                        id: msg.to,
                        status: msg.status,
                        time: msg.time,
                        frome: msg.frome
                      }
                      try {
                        await createUserDatabase(address).friend.put(newInfo);
                        console.log('Personal info updated successfully!');
                      } catch (error) {
                        console.error('Failed to update personal info:', error);
                      }

                      socket.emit("sendMsg", msg) //发送添加好友事件
                    }}>拒绝</Button>
                  </Space></>
                  : <div>等待同意中~</div>
                }
              </div>
              </List.Item>
            }

          })}
        </List>

      </Popup>

    </div>


  );
};

export default IndexBarExample;
