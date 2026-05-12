const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../Middlewares/auth");
const { validateEditFields } = require("../utils/validation");
const upload = require("../Middlewares/upload");

//profile API to get the profile details
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user);
});

profileRouter.post(
  "/profile/edit",
  userAuth,
  upload.single("photo"),
  async (req, res) => {
    try {
      console.log("API HIT");

      console.log(req.body);

      console.log(req.file);

      const loggedInUser = req.user;

      if (req.file) {
        loggedInUser.photoURL = req.file.path;
      }

      await loggedInUser.save();

      res.json({
        success: true,
        data: loggedInUser,
      });
    } catch (err) {
      console.log(err);

      res.status(400).send(err.message);
    }
  },
);

module.exports = profileRouter;
