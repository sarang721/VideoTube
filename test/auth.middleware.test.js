import { expect } from 'chai'
import { verifyJWT } from '../middleware/auth.middleware.js'
import sinon from 'sinon'
import { User } from '../models/user.model.js'
import jwt from 'jsonwebtoken'

describe('Auth middleware',()=>{
    it("should return unauthorized request if token is not there",async()=>{

        const req={
            header: sinon.stub().returns(null)
        }

        //or

        // const req={
        //     header: ()=>{
        //         return null
        //     }
        // }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(), 
        }

        //returnsThis() is used when you want the stub to return the stub itself, 
        //which is often useful in method chaining scenarios. 
        //returns(value) is used when you want the stub to 
        //return a specific value when called.

        // OR 
        //   const res = {
        //     status: sinon.stub().returnsThis(),
        //     json: sinon.stub().returns(
        //         {
        //             "statusCode": undefined,
        //             "data": "",
        //             "message": ""
        //         }
        //     ),
        //   };

    await verifyJWT(req,res,()=>{});
    expect(res.status.calledOnceWith(401)).to.be.true;
    const apiErrorArg = res.json.firstCall.args[0];
    expect(apiErrorArg.statusCode).to.equal(401);   
    expect(apiErrorArg.message).to.equal('Unauthorized request');

    })


    it("should call next function when authentication is successfull",async()=>{

        const req={
            header: sinon.stub().returns("Bearer gufett6yef78wefewfqa")
        }

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(), 
        }

        const nextStub = sinon.stub();

        const jwtStub = sinon.stub(jwt,'verify').returns({
            _id:"12348u8u9344"
        })

        const userStub = sinon.stub(User,'findById')
        .resolves({
            _id:"userId",
        })

        const result = await verifyJWT(req, res, nextStub);
        //console.log(req.user)
        expect(req.user).to.exist;
        sinon.assert.calledOnce(nextStub);

        jwtStub.restore();
        userStub.restore();
    })

    // it('should pass with a valid token and user found', async () => {
    //     const req = {
    //       cookies: { accessToken: 'validToken' },
    //     };
    //     const res = {};
    //     const next = sinon.spy();
    
    //     const userStub = sinon.stub(User, 'findById').resolves({ _id: 'userId' });
    
    
    //     await verifyJWT(req, res, next);
    
    //     expect(userStub.calledOnce).to.be.true;
    //     expect(jwtVerifyStub.calledOnce).to.be.true;
    //     expect(req.user).to.exist;
    //     expect(next.calledOnce).to.be.true;
    
    //     userStub.restore();
    //     jwtVerifyStub.restore();
    //   });

})