import './index.css'
import React, { useState } from 'react';
import { SpinLoading, ProgressBar } from 'antd-mobile'
import { Image } from 'antd-mobile'
import { useContext } from 'react';
import { GlobalStateContext } from '../../../data/GlobalStateContext';
const Index = (props) => {
    const { state, updateState } = useContext(GlobalStateContext);
    const {
        senderName = '',
        text = '嗨，这是发送的消息。',
        data = '10:01 AM',
        type = 'sent',
        image = '',
        loading = false,
        percent = 0
    } = props;
    return (
        <div>

            <div className="chat-container">
                <div className={type === 'sent' ? "sent" : 'received'}>
                    {senderName === '' ? null : <div className="sender-name">你</div>}
                    {/* {image === '' ? null : <img src={image} alt="Compressed GIF"  />} */}
                    {image === '' ? null : <Image src={image} 
                    width={100} height={100}
                    fit='scale-down'
                    onContainerClick={() => {
                        updateState({ visibleImage: true, image: image });
                    }} />}
                    {/* {loading ? <SpinLoading /> : null} */}
                    {loading ? <ProgressBar percent={percent} /> : null}
                    <div className="message-text">{text}</div>
                    <div className="timestamp">{data}</div>
                </div>
            </div>

        </div>
    );
}

export default Index;
