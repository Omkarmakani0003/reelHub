
const asyncHandler = (requestHandle) => (req,res,next)=>{
    Promise.resolve(requestHandle(req,res,next)).catch(next)
}

export default asyncHandler