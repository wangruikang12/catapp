import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/loning.css"
import socket from '../tools/socket';
import { ethers } from 'ethers';
// import { savePersonalInfo } from '../tools/indexDB'
// import createUserDatabase from '../tools/indexDB'

// createDatabase
const Loning = () => {
    const navigate = useNavigate();
    //密码强度
    const [password, setPassword] = useState("");
    //获取地址
    const address = localStorage.getItem("Address")
    //助记词
    const [mnemonic, setMnemonic] = useState("");
    //助记词登录
    const [mnemonicLogin, setMnemonicLogin] = useState(false);
    //保存地址
    let walletAddress = ""
    //加密保存到地址
    const encryptedWallet = localStorage.getItem("encryptedWallet")

    // 密码输入变化
    const changePassword = (e) => {
        setPassword(e.target.value)
    }
    //密码强度校验
    const checkPasswordStrength = (password) => {
        // 密码长度至少为8个字符
        if (password.length < 8) {
            return '密码太短，至少需要8个字符。';
        }
        // 检查是否包含大写字母、小写字母、数字和特殊字符
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // 至少包含三种类型的字符
        let charTypes = 0;
        if (hasUpperCase) charTypes++;
        if (hasLowerCase) charTypes++;
        if (hasNumber) charTypes++;
        if (hasSpecialChar) charTypes++;

        if (charTypes < 3) {
            return '密码应至少包含大写字母、小写字母、数字和特殊字符中的三种。';
        }
        // 如果通过了所有检查，返回密码强度为强
        return '密码强度：强';
    }
    //注册登录
    const createWallet = async () => {
        // 创建一个随机的钱包实例，包括助记词
        const wallet = ethers.Wallet.createRandom();

        // 获取钱包的助记词
        const mnemonic = wallet.mnemonic.phrase;

        // 获取钱包的私钥
        const privateKey = wallet.privateKey;

        // 获取钱包的公开地址
        const address = wallet.address;
        // walletAddress = address
        console.log(`Mnemonic: ${mnemonic}`);
        console.log(`Private Key: ${privateKey}`);
        console.log(`Address: ${address}`);
        //保存到本地加密保存
        const encryptedWallet = await wallet.encrypt(password);
        // console.log(encryptedWallet);
        //保存到本地存储
        localStorage.setItem('encryptedWallet', encryptedWallet);
        localStorage.setItem('Address', address);

        return {
            mnemonic,
            privateKey,
            address
        }
        //解密获取地址 助记词 密钥
        // const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
        // //获取助记词
        // console.log(decryptedWallet.mnemonic.phrase);
        // console.log(decryptedWallet.privateKey);
        // console.log(decryptedWallet.address);
        // console.log("++++++++======+++++++s")
        //   // 通过助记词 重置密码
        //   const mnemonics = `suit satisfy practice outside barely force rural foam hawk insane mansion lock`
        //   const newPasswords = "222222";
        //   // 从助记词创建钱包
        //   const wallets = ethers.Wallet.fromPhrase(mnemonics);
        //   const encryptedJsons = await wallets.encrypt(newPasswords);
        //   // 输出钱包地址
        //   console.log('Wallet address:', wallets.address,encryptedJsons,wallets);
        //  //解密获取地址 助记词 密钥
        //  const decryptedWallets = await ethers.Wallet.fromEncryptedJson(encryptedJsons, newPasswords)
    };

    const submit = async (event) => {
        //打断默认提交
        event.preventDefault();
        if (checkPasswordStrength(password) === "密码强度：强") {
            // let getaddress = address ? address : walletAddress
            let obg
            //提交内容
            try {
                obg = await createWallet();
                // console.log(address, "address", walletAddress);
                // 创建数据库
                // createUserDatabase(address)
                //创建数据库
                // createDatabase(walletAddress)
                //保存个人信息
                // savePersonalInfo(walletAddress, { id: walletAddress })
            } catch {
            }

            // chat ID
            localStorage.setItem('Online', true);
            console.log('chat ID',obg);
            socket.emit('chat ID', obg.address);
            navigate('/')
            //提交成功页面跳转
            // setTimeout(() => {
   
            // }, 1000)
            // navigate('/')
            // 跳转页面
        }
    }
    const submitOnlin = async (event) => {
        //打断默认提交
        event.preventDefault();
        let decryptedWallet = null
        try {
            decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
        } catch (error) {
            // window.alert("密码错误")
            layer.msg('密码错误');
        }
        if (!decryptedWallet) return
        localStorage.setItem('Address', decryptedWallet.address);
        socket.emit('chat ID', decryptedWallet.address);
        localStorage.setItem('Online', true);
        //提交成功页面跳转
        navigate('/')
    }
    //助记词登录
    const mnemonicLogisubm = async (event) => {
        event.preventDefault();
        if (checkPasswordStrength(password) === "密码强度：强" && mnemonic) {
            //   // 从助记词创建钱包
            const wallets = ethers.Wallet.fromPhrase(mnemonic);
            const encryptedJsons = await wallets.encrypt(password);
            console.log(encryptedJsons);
            localStorage.setItem('encryptedWallet', encryptedJsons);
            localStorage.setItem('Address', wallets.address);
            socket.emit('chat ID', wallets.address)
            localStorage.setItem('Online', true);
            //提交成功页面跳转
            navigate('/')

        }
    }

    return (
        <div className="loning">
            <div className='loningdiv'>
                <form className="layui-form" action="">
                    {mnemonicLogin ? <div className="layui-form-item">
                        <label className="layui-form-label">助记词字符串</label>
                        <div className="layui-input-block">
                            <input type="text" name="title" required
                                lay-verify="required" placeholder="请输入标题"
                                autocomplete="off" className="layui-input"
                                value={mnemonic}
                                onChange={(e) => {
                                    setMnemonic(e.target.value)
                                }}
                            />
                        </div>
                    </div> : null}
                    {
                        address && !mnemonicLogin ? <div className="layui-form-item">
                            用户地址 :{address}
                        </div> : null
                    }
                    <div className="layui-form-item">
                        <label className="layui-form-label">密码</label>
                        <div className="layui-input-inline">
                            <input type="password"
                                name="password"
                                required lay-verify="required"
                                placeholder="请输入密码"
                                autoComplete="off"
                                className="layui-input"
                                value={password}
                                onChange={changePassword}
                            />
                        </div>
                    </div>
                    {
                    address && !mnemonicLogin? null : 
                    password ? <div className="layui-form-mid layui-word-aux">{checkPasswordStrength(password)}</div> : null
                    }
                    <div className="layui-form-item">
                        <div className="layui-input-block">
                            {!mnemonicLogin ? <button onClick={address ? submitOnlin : submit} className="layui-btn" >{address ? "登录" : "注册登录"}</button> : null}
                            <button onClick={!mnemonicLogin ? () => { setMnemonicLogin(true)} : mnemonicLogisubm} type="reset" className="layui-btn layui-btn-primary">助记词登录</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    );
}

export default Loning;
