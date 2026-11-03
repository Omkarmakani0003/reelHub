class apiError extends Error{

     constructor(statusCode=400, message="Something went wrong", data=[], error=null, stack=null){
         super(message)
         this.statusCode = statusCode
         this.status = false
         this.data = data
         this.error = error

         if(stack){
            this.stack = stack
         }else{
            Error.captureStackTrace(this, this.constructor)
         }

     }

}

export default apiError