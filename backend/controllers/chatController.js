const Message = require("../models/Message");
const { getAllowedChatContacts, getChatAccess } = require("../services/chatAccessService");

exports.getContacts = async (req, res) => {
  try {
    const contacts = await getAllowedChatContacts(req.user);

    res.json({ contacts, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};

// get messages 
exports.getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const access = await getChatAccess(req.user, receiverId);

    if (!access.allowed) {
      return res.status(403).json({ message: access.reason, success: false });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json({ messages, success: true });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//create message
exports.createMessages = async (req, res) => {
  try {
    const { receiver, text } = req.body;
    const trimmedText = text?.trim();

    if (!receiver || !trimmedText) {
      return res.status(400).json({
        message: "Receiver and message text are required",
        success: false,
      });
    }

    const access = await getChatAccess(req.user, receiver);

    if (!access.allowed) {
      return res.status(403).json({ message: access.reason, success: false });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      text: trimmedText,
    });

    const io = req.app.get("io");

    io.to(receiver.toString()).emit("newMessage", message);

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
