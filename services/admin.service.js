const User = require("../models/user.model");

module.exports.users = async function (req, res, next) {
    try {
        let user = await User.findById(req.payload._id);
        if (user.permission === 2) {
            let users = await User.find({ _id: { $ne: req.payload._id } });
            res.send({ status: true, data: users });
        } else {
            res.send({ status: false, message: 'Permission Denied' });
        }
    } catch (err) {
        console.log(err.message);
        res.send({ status: false, message: err.message });
    }
}