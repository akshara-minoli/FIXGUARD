import prisma from "../config/prisma.js";import {AppError} from "../utils/app-error.js";
export function createNotification(data){return prisma.notification.upsert({where:{eventKey:data.eventKey},update:{},create:data});}
export function listNotifications(userId,status){return prisma.notification.findMany({where:{userId,...(status?{isRead:status==="read"}:{})},orderBy:{createdAt:"desc"},take:200});}
export function unreadCount(userId){return prisma.notification.count({where:{userId,isRead:false}});}
export async function getNotification(userId,id){const notification=await prisma.notification.findFirst({where:{id,userId}});if(!notification)throw new AppError("Notification not found",404);return notification;}
export async function markRead(userId,id){const result=await prisma.notification.updateMany({where:{id,userId},data:{isRead:true,readAt:new Date()}});if(!result.count)throw new AppError("Notification not found",404);return prisma.notification.findUnique({where:{id}});}
export async function markAllRead(userId){const result=await prisma.notification.updateMany({where:{userId,isRead:false},data:{isRead:true,readAt:new Date()}});return result.count;}
