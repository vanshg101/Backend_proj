const asyncHandler =(requesrHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requesrHandler).catch((err)=>next(err))
    }
}

export {asyncHandler}


// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
        
//     }
// }