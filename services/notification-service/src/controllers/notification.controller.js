import * as notifications from "../services/notification.service.js";import {createSchema,idSchema,listSchema} from "../validators/notification.validator.js";
export async function create(request,response){const notification=await notifications.createNotification(createSchema.parse(request.body));response.status(201).json({success:true,notification});}
export async function list(request,response){const {status}=listSchema.parse(request.query);response.json({success:true,notifications:await notifications.listNotifications(request.auth.userId,status)});}
export async function count(request,response){const count=await notifications.unreadCount(request.auth.userId);response.json({success:true,count,unreadCount:count});}
export async function detail(request,response){const {id}=idSchema.parse(request.params);response.json({success:true,notification:await notifications.getNotification(request.auth.userId,id)});}
export async function read(request,response){const {id}=idSchema.parse(request.params);response.json({success:true,notification:await notifications.markRead(request.auth.userId,id)});}
export async function readAll(request,response){response.json({success:true,updatedCount:await notifications.markAllRead(request.auth.userId)});}
