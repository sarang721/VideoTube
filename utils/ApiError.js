class ApiError{

    constructor(statusCode, message)
    {   
        this.statusCode=statusCode;
        this.success=false;
        this.message=message
    }

}

export {ApiError}