// core/services/socket.service.ts
import { Server as SocketServer, Socket } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../../modules/auth/auth.interface';
import { Logger } from '../utils';

interface UserSocket {
  socketId: string;
  userId: string;
}

class SocketService {
  private io: SocketServer | null = null;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  public initialize(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket: Socket) => {
      Logger.info(`Socket connected: ${socket.id}`);

      // Xử lý khi user kết nối và gửi thông tin xác thực
      socket.on('user:connect', ({ userId, token }: { userId: string; token: string }) => {
        try {
          // Xác thực token
          const verified = jwt.verify(token, process.env.JWT_TOKEN_SECRET!) as DataStoredInToken;
          
          if (verified.id === userId) {
            // Xóa socket cũ nếu user đã kết nối từ device khác
            const oldSocketId = this.userSockets.get(userId);
            if (oldSocketId && oldSocketId !== socket.id) {
              this.socketUsers.delete(oldSocketId);
              Logger.info(` User ${userId} reconnected. Removed old socket ${oldSocketId}`);
            }

            // Lưu mapping mới
            this.userSockets.set(userId, socket.id);
            this.socketUsers.set(socket.id, userId);

            Logger.info(` User authenticated: ${userId} with socket ${socket.id}`);

            // Gửi danh sách users online cho tất cả clients
            this.broadcastOnlineUsers();
          }
        } catch (error) {
          Logger.error(` Socket authentication failed: ${error}`);
          socket.emit('auth:error', { message: 'Invalid token' });
          socket.disconnect();
        }
      });

      // Xử lý khi gửi tin nhắn
      socket.on('message:send', (data: { 
        to: string; 
        from: string; 
        message: string;
        chatId: string;
      }) => {
        const recipientSocketId = this.userSockets.get(data.to);
        
        if (recipientSocketId) {
          // Gửi tin nhắn real-time cho người nhận
          this.io?.to(recipientSocketId).emit('message:receive', {
            from: data.from,
            message: data.message,
            chatId: data.chatId,
            timestamp: new Date()
          });
          
          Logger.info(` Message sent from ${data.from} to ${data.to}`);
        }
      });

      // Xử lý khi user typing
      socket.on('typing:start', (data: { to: string; from: string }) => {
        const recipientSocketId = this.userSockets.get(data.to);
        if (recipientSocketId) {
          this.io?.to(recipientSocketId).emit('typing:receive', {
            from: data.from,
            isTyping: true
          });
        }
      });

      socket.on('typing:stop', (data: { to: string; from: string }) => {
        const recipientSocketId = this.userSockets.get(data.to);
        if (recipientSocketId) {
          this.io?.to(recipientSocketId).emit('typing:receive', {
            from: data.from,
            isTyping: false
          });
        }
      });

      // Xử lý khi socket disconnect
      socket.on('disconnect', () => {
        const userId = this.socketUsers.get(socket.id);
        
        if (userId) {
          this.userSockets.delete(userId);
          this.socketUsers.delete(socket.id);
          
          Logger.info(` User ${userId} disconnected (socket ${socket.id})`);
          
          // Broadcast lại danh sách online users
          this.broadcastOnlineUsers();
        }
      });
    });

    Logger.info('Socket.IO initialized');
  }

  // Broadcast danh sách users online
  private broadcastOnlineUsers() {
    if (!this.io) return;

    const onlineUserIds = Array.from(this.userSockets.keys());
    this.io.emit('users:online', onlineUserIds);
    
    Logger.info(` Broadcasted online users: [${onlineUserIds.join(', ')}]`);
  }

  // Lấy danh sách users online
  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Kiểm tra user có online không
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Gửi event đến một user cụ thể
  public emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }




  
   //Gửi thông báo kết bạn real-time đến người nhận
  public notifyFriendRequest(receiverId: string, requestData: {
    _id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string | null;
    mutual: number;
  }) {
    this.emitToUser(receiverId, 'friend:request:received', requestData);
  }

//thông báo chấp nhận
  public notifyFriendRequestAccepted(senderId: string, accepterData: {
    userId: string;
    name: string;
    avatar: string | null;
  }) {
    this.emitToUser(senderId, 'friend:request:accepted', accepterData);
  }

//thông báo từ chối
  public notifyFriendRequestRejected(senderId: string, rejecterId: string) {
    this.emitToUser(senderId, 'friend:request:rejected', { userId: rejecterId });
  }

 //thông báo huỷ
  public notifyFriendRequestCancelled(receiverId: string, requestId: string) {
    this.emitToUser(receiverId, 'friend:request:cancelled', { requestId });
  }

  //thông báo xoá bạn
  public notifyFriendRemoved(userId: string, removerId: string) {
    this.emitToUser(userId, 'friend:removed', { userId: removerId });
  }

  public getIO(): SocketServer | null {
    return this.io;
  }
}

export default new SocketService();