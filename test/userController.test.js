import { expect } from 'chai'
import { verifyJWT } from '../middleware/auth.middleware.js'
import sinon from 'sinon'
import { User } from '../models/user.model.js'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { registerUser } from '../controllers/user.controller.js'
import { cloudinaryUtils } from '../utils/cloudinary.js'


describe('user controller',async()=>{

    before(async()=>{

        await mongoose.connect("mongodb+srv://sarang721:Sarang72100@cluster1.kq2sp.mongodb.net/videotube-test");
        await User.deleteMany({})
        await User.create({
            _id:"658f19d8a28674bcdaeec20c",
            userName:"test123",
            email:"test@123.com",
            fullName:"testName",
            avatar:"avatar.png",
            coverImage:"coverImage.png",
            watchHistory:[],
            refreshToken:"123erdss",
            password:"12345"
        })
    })

    after(async()=>{
        await User.deleteMany({})
    })

    it('User with email or username already exists',async()=>{

        const req = {
            body: sinon.stub().returnsThis()
        };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        }
        const next = sinon.spy();

        const userStub = sinon.stub(User, 'findOne').resolves({
            userName:"1234",
            email:"test@gmail.com"
        })

        await registerUser(req,res,next)
        expect(res.status.calledOnceWith(401)).to.be.true;
        //console.log(res.json.firstCall.args[0].statusCode)
        expect(res.json.firstCall.args[0].message).to.equal('User with email or username already exists')
        
        userStub.restore();

    })

    it('should display all fields are required',async()=>{

            const req = {
                body: {
                    fullName: "",
                    email: "",
                    userName: "",
                    password: ""
                }
            }

            const res = {
                status:sinon.stub().returnsThis(),
                json:sinon.stub()
            }
            
            const next = sinon.stub();

            await registerUser(req,res, next);
            expect(res.status.calledOnceWith(401)).to.be.true;
            expect(res.json.firstCall.args[0].message).to.equal('All fields are required')

    })


    it('should display Avatar is required',async()=>{

        const req = {
            body: {
                fullName: "test",
                email: "test",
                userName: "test",
                password: "test"
            },
            files: {
                avatar: null
            }
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        }

        const next = sinon.stub()

        const userStub = sinon.stub(User,'findOne').resolves(null)

        await registerUser(req,res,next);
        expect(res.status.calledOnceWith(401)).to.be.true;
        expect(res.json.firstCall.args[0].message).to.equal('Avatar is required')

        userStub.restore();

    })


    // //Using stubs
    it('should register user successfully',async()=>{

        const req = {
            body: {
                fullName: "test",
                email: "test@gmail.com",
                userName: "test",
                password: "test"
            },
            files: {
                avatar: [{ path: '/path/to/avatar.jpg' }],
                coverImage: [{ path: '/path/to/coverImage.jpg' }],
            },
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        }

        const next = sinon.spy();

        const uploadOnCloudinaryStub = sinon.stub().resolves({ url: '/path/to/cloudinary/image.jpg' });

        const orignalUploadOnCloudinary = cloudinaryUtils.uploadOnCloudinary;

        cloudinaryUtils.uploadOnCloudinary = uploadOnCloudinaryStub;

        const userStub = sinon.stub(User, 'findOne').resolves(null)

        const createUserStub = sinon.stub(User, 'create').resolves({
            fullName: "test",
            email: "test@gmail.com",
            userName: "test",
            password: "test",
            avatar:"12345",
            coverImage:"123456"
        })

        const createdUserStub = sinon.stub(User, 'findById').returns({
            select: sinon.stub().withArgs('-password -refreshToken').returns({
                fullName: "test",
                email: "test@gmail.com",
                userName: "test",
                password: "test",
                avatar:"12345",
                coverImage:"123456"
            })
        })

        await registerUser(req,res,next);

        sinon.assert.calledWith(uploadOnCloudinaryStub, '/path/to/avatar.jpg');
        sinon.assert.calledWith(uploadOnCloudinaryStub, '/path/to/coverImage.jpg');
        //console.log(res.json.firstCall)
        expect(res.status.calledOnceWith(201)).to.be.true;
        expect(res.json.firstCall.args[0].message).to.equal('User registered Successfully')

        cloudinaryUtils.uploadOnCloudinary = orignalUploadOnCloudinary
        userStub.restore();
        createUserStub.restore();
        createdUserStub.restore();

    })

    //using test database
    it('should register successfully 2',async()=>{

        const req = {
            body:{

                fullName: "test",
                email: "test@1234.com",
                userName: "test1234",
                password: "test"
            },
            files:{
                avatar: [{ path: '/path/to/avatar.jpg' }],
                coverImage: [{ path: '/path/to/coverImage.jpg' }],
            }

        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        }

        const next = sinon.spy();

        const uploadOnCloudinaryStub = sinon.stub().resolves({ 
            url: '/path/to/cloudinary/image.jpg' 
        });
        const orignalUploadOnCloudinary = cloudinaryUtils.uploadOnCloudinary;

        cloudinaryUtils.uploadOnCloudinary = uploadOnCloudinaryStub;

        await registerUser(req,res,next);

        expect(res.status.calledOnceWith(201)).to.be.true;
        expect(res.json.firstCall.args[0].message).to.equal('User registered Successfully')
        cloudinaryUtils.uploadOnCloudinary = orignalUploadOnCloudinary

    })

})