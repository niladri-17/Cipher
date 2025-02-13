const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// ✅ Without asyncHandler (Manual Error Handling)
// app.get('/users', async (req, res, next) => {
//     try {
//         const users = await User.find();
//         res.json(users);
//     } catch (err) {
//         next(err);  // Manually forwarding the error
//     }
// });

// ✅ With asyncHandler (Automated Error Handling)
// app.get('/users', asyncHandler(async (req, res, next) => {
//     const users = await User.find();
//     res.json(users);
// }));
// 🔥 No need for try-catch, and errors automatically get passed to next(err)!

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
