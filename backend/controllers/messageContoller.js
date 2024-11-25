import {Conversation} from "../models/conversationModel.js"
import {Message} from "../models/messageModel.js";
export const sendMessage = async(req,res)=>{
    try {
        const senderID = req.id;
        const receiverID = req.params.id;
        const {textMessage:message} = req.body;
        let conversation = await Conversation.findOne({
            participants:{$all:[senderID,receiverID]}
        })
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderID,receiverID]
            })
        }
        const newMessage = await Message.create({
            senderID,
            receiverID,
            message
        })
        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        await Promise.all([conversation.save(),newMessage.save()])
        const receiverSocketId = getReceiverSocketId(receiverID);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage);
        }
        return res.status(201).json({
            success:true,
            newMessage
        })
    } catch (error) {
     console.log(error);
        
    }
}
export const getMessage = async(req,res)=>{
    try {
        const senderID = req.id;
        
        const receiverID = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all:[senderID,receiverID]}

        }).populate('messages');
        if(!conversation) {
            return res.status(200).json({
                success:true,
                message:[]
            })
        }
        return res.status(200).json({
            success:true,
            messages:conversation?.messages
        })
        
    } catch (error) {
        console.log();
        
    }
}