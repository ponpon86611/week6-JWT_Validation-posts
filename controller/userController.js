const User = require('../models/userModel');
const resHandler = require('../services/resHandler');
const appError = require('../services/appError');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');

const generateSendJWT= (user, statusCode, res)=>{
    // 產生 JWT token
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRES_DAY
    });
    
    user.password = undefined;
    res.status(statusCode).json({
      status: 'success',
      user:{
        token,
        name: user.name
      }
    });
}

const userController = {
    //註冊
    async signUp(req, res, next) {
        let {name, email, password} = req.body;
        /**歸納步驟
         * 1.驗證註冊頁面欄位是否都有填寫(換言之不可為空)
         * 2.第一步驗證通過後，再來驗證格式是否符合
         * 3.第二部驗證通過後，要建立新的user到資料庫中，密碼不可為明碼
         */
        console.log('L:33 signUP start ...');
        if( !name  || name.trim() === '' || !email || email.trim() === '' || !password || password.trim() === '') {
            return appError(400, '欄位未正確填寫，不可以為空', next);
        }

        if(!validator.isEmail(email)) {
            return appError(400, 'email 格式不正確，請填寫正確 email', next);
        }

        if(!validator.isLength(password, {min: 8})) {
            return appError(400, '密碼至少需要 8 碼', next);
        }

        name = name.trim();
        email = email.trim();
        password = password.trim();

        password = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            password,
            name
        });
        //註冊完成會進入產生token為設計為註冊後將幫使用者登入，故產生token，若設計為註冊後依然要使用者自行登入則不需要產生token
        generateSendJWT(user, 201, res);
    },
    //登入
    async signIn(req, res, next) {
        let {email, password} = req.body;

        if(!email || email.trim() === '' || !password || password.trim() === '') {
            return appError(400, '欄位未正確填寫，不可以為空', next);
        }

        if(!validator.isEmail(email)) {
            return appError(400, 'email 格式不正確，請填寫正確 email', next);
        }

        const user = await User.findOne({email}).select('+password');
        if(!user) {
            return appError(400, '帳號或密碼錯誤', next);
        }

        const auth = await bcrypt.compare(password, user.password);
        if(!auth) {
            return appError(400, '帳號或密碼錯誤', next);
        }
        generateSendJWT(user, 201, res);
    }
}

module.exports = userController;