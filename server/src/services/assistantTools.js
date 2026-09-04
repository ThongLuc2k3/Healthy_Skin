import { globalSearch } from './searchService.js'
import { createRequest, acceptRequest, listAuthoredRequests, listRequests, selectApplication } from './requestService.js'
import { cancelSharingParticipation, cancelSharingPost, confirmSharingAccess, createSharingPostChecked, joinSharingPost, listSharingPosts, openSharingDispute, reviewSharing } from './sharingService.js'
import { demoTopup, demoWithdraw, getWallet, payRemaining, releaseTransaction } from './walletService.js'
import { checkIn, completeSession, listMySessions, openRequestDispute, reportNoShow, reviewSession } from './sessionService.js'
import { addComment, createPost, listComments, listPosts, react, reactComment, sendCommentGift, sendGift, toggleCollection } from './forumService.js'
import { listNotifications, readNotification } from './notificationService.js'
import { listConversations, listMessages, sendMessage } from './conversationService.js'
import { listChannelMessages, listServers, proposeChannel, sendChannelMessage } from './communityService.js'
import { blockUser, listChatRequests, listPeople, requestChat, respondChatRequest } from './socialService.js'
import { createReport, submitVerification } from './operationsService.js'
import { getUser, updateBasicProfile } from './authService.js'
import { searchKnowledge } from './knowledgeService.js'

const object = (properties = {}, required = []) => ({ type: 'OBJECT', properties, ...(required.length ? { required } : {}) })
const string = description => ({ type: 'STRING', ...(description ? { description } : {}) })
const integer = description => ({ type: 'INTEGER', ...(description ? { description } : {}) })

export const ASSISTANT_TOOL_SCHEMAS = [
  { name: 'search_tlucs', description: 'Tìm đồng thời yêu cầu, bài chia sẻ, diễn đàn, server, người dùng và môn học.', parameters: object({ query: string(), universityId: string() }, ['query']) },
  { name: 'search_requests', description: 'Tìm yêu cầu hỗ trợ đang có.', parameters: object({ query: string(), kind: { type: 'STRING', enum: ['free','paid','exchange'] }, universityId: string() }) },
  { name: 'search_sharing_posts', description: 'Tìm tài liệu hoặc buổi chia sẻ.', parameters: object({ query: string(), format: { type: 'STRING', enum: ['instant_unlock','scheduled_exchange'] }, universityId: string() }) },
  { name: 'search_people', description: 'Tìm thành viên phù hợp.', parameters: object({ query: string(), universityId: string() }) },
  { name: 'search_tlucs_knowledge', description: 'Tìm tài liệu RAG chính sách và hướng dẫn TLUCS, chỉ trả kết quả khớp từ 85%.', parameters: object({ query: string(), limit: integer() }, ['query']) },
  { name: 'get_my_profile', description: 'Đọc hồ sơ tài khoản hiện tại.', parameters: object() },
  { name: 'get_my_wallet', description: 'Đọc số dư và sổ cái ví.', parameters: object() },
  { name: 'list_my_requests', description: 'Liệt kê yêu cầu do tôi đăng và ứng viên.', parameters: object() },
  { name: 'list_my_sessions', description: 'Liệt kê phiên hỗ trợ của tôi.', parameters: object() },
  { name: 'list_my_notifications', description: 'Liệt kê thông báo gần đây.', parameters: object() },
  { name: 'list_my_conversations', description: 'Liệt kê phòng trò chuyện của tôi.', parameters: object() },
  { name: 'list_my_chat_requests', description: 'Liệt kê lời mời trò chuyện đang chờ.', parameters: object() },
  { name: 'list_community_servers', description: 'Liệt kê server cộng đồng trường.', parameters: object() },
  { name: 'list_forum_posts', description: 'Đọc bài diễn đàn mới hoặc nổi bật.', parameters: object({ query: string(), feed: { type: 'STRING', enum: ['latest','trending'] }, universityId: string() }) },
  { name: 'list_forum_comments', description: 'Đọc bình luận của một bài.', parameters: object({ postId: string() }, ['postId']) },
  { name: 'list_conversation_messages', description: 'Đọc tin nhắn trong phòng mà người dùng có quyền.', parameters: object({ conversationId: string() }, ['conversationId']) },
  { name: 'list_channel_messages', description: 'Đọc tin nhắn một kênh cộng đồng.', parameters: object({ channelId: string() }, ['channelId']) },
  { name: 'create_request', description: 'Đăng yêu cầu hỗ trợ mới; cần xác nhận.', parameters: object({ kind: { type:'STRING',enum:['free','paid','exchange'] }, universityId:string(), courseName:string(), title:string(), description:string(), durationMinutes:integer(), startsAt:string(), amountVnd:integer(), offeredDescription:string(), deliveryMode:{type:'STRING',enum:['online']} }, ['kind','title','description','durationMinutes','startsAt']) },
  { name: 'accept_request', description: 'Nhận một yêu cầu; cần xác nhận.', parameters: object({ requestId:string() }, ['requestId']) },
  { name: 'select_request_application', description: 'Chọn ứng viên cho yêu cầu của tôi; cần xác nhận.', parameters: object({ requestId:string(), applicationId:string() }, ['requestId','applicationId']) },
  { name: 'create_sharing_post', description: 'Đăng tài liệu hoặc buổi chia sẻ; cần xác nhận.', parameters: object({ format:{type:'STRING',enum:['instant_unlock','scheduled_exchange']}, title:string(), description:string(), accessPriceVnd:integer(), deliverables:string(), contentFormat:string(), contentExtent:string(), refundTerms:string(), startsAt:string(), capacity:integer(), minimumParticipants:integer(), universityId:string() }, ['format','title','description','accessPriceVnd']) },
  { name: 'join_sharing_post', description: 'Tham gia hoặc mở khóa bài chia sẻ; có thể giữ tiền mô phỏng, cần xác nhận.', parameters: object({ postId:string() }, ['postId']) },
  { name: 'confirm_sharing_access', description: 'Xác nhận đã nhận đúng nội dung chia sẻ; cần xác nhận.', parameters: object({ postId:string() }, ['postId']) },
  { name: 'cancel_sharing_participation', description: 'Hủy tham gia bài chia sẻ; cần xác nhận.', parameters: object({ postId:string() }, ['postId']) },
  { name: 'cancel_sharing_post', description: 'Hủy bài chia sẻ do tôi đăng; cần xác nhận.', parameters: object({ postId:string(), reason:string() }, ['postId']) },
  { name: 'update_profile', description: 'Cập nhật tên hiển thị hoặc khu vực; cần xác nhận.', parameters: object({ displayName:string(), areaLabel:string() }) },
  { name: 'wallet_topup', description: 'Nạp ví mô phỏng; cần xác nhận.', parameters: object({ amountVnd:integer() }, ['amountVnd']) },
  { name: 'wallet_withdraw', description: 'Rút ví mô phỏng; cần xác nhận.', parameters: object({ amountVnd:integer() }, ['amountVnd']) },
  { name: 'pay_request_remaining', description: 'Thanh toán phần còn lại của yêu cầu trả phí; cần xác nhận.', parameters: object({ requestId:string() }, ['requestId']) },
  { name: 'release_request_payment', description: 'Xác nhận giải ngân yêu cầu; cần xác nhận.', parameters: object({ requestId:string() }, ['requestId']) },
  { name: 'check_in_session', description: 'Check-in phiên hỗ trợ; cần xác nhận.', parameters: object({ requestId:string(), eventType:string(), note:string() }, ['requestId']) },
  { name: 'complete_session', description: 'Xác nhận hoàn tất phiên; cần xác nhận.', parameters: object({ requestId:string() }, ['requestId']) },
  { name: 'review_session', description: 'Đánh giá phiên; cần xác nhận.', parameters: object({ requestId:string(), rating:integer(), comment:string() }, ['requestId','rating']) },
  { name: 'report_no_show', description: 'Báo một bên vắng mặt; cần xác nhận.', parameters: object({ requestId:string(), absentParty:string(), note:string() }, ['requestId','absentParty']) },
  { name: 'open_request_dispute', description: 'Mở tranh chấp yêu cầu; cần xác nhận.', parameters: object({ requestId:string(), type:string(), reason:string() }, ['requestId','type','reason']) },
  { name: 'open_sharing_dispute', description: 'Mở tranh chấp bài chia sẻ; cần xác nhận.', parameters: object({ postId:string(), type:string(), reason:string() }, ['postId','type','reason']) },
  { name: 'review_sharing', description: 'Đánh giá một bài hoặc buổi chia sẻ đã tham gia; cần xác nhận.', parameters: object({ postId:string(), rating:integer(), comment:string() }, ['postId','rating']) },
  { name: 'create_forum_post', description: 'Đăng bài diễn đàn; cần xác nhận.', parameters: object({ serverId:string(), title:string(), body:string(), keywords:{type:'ARRAY',items:string()} }, ['title','body','keywords']) },
  { name: 'add_forum_comment', description: 'Bình luận hoặc trả lời bình luận; cần xác nhận.', parameters: object({ postId:string(), body:string(), parentId:string() }, ['postId','body']) },
  { name: 'react_forum_post', description: 'Bày tỏ cảm xúc với bài viết; cần xác nhận.', parameters: object({ postId:string(), reaction:string() }, ['postId']) },
  { name: 'react_forum_comment', description: 'Bày tỏ cảm xúc với bình luận; cần xác nhận.', parameters: object({ commentId:string(), reaction:string() }, ['commentId']) },
  { name: 'save_forum_post', description: 'Lưu hoặc bỏ lưu bài viết; cần xác nhận.', parameters: object({ postId:string() }, ['postId']) },
  { name: 'follow_forum_post', description: 'Theo dõi hoặc bỏ theo dõi bài; cần xác nhận.', parameters: object({ postId:string() }, ['postId']) },
  { name: 'gift_forum_post', description: 'Tặng tiền mô phỏng cho bài; cần xác nhận.', parameters: object({ postId:string(), amountVnd:integer() }, ['postId','amountVnd']) },
  { name: 'gift_forum_comment', description: 'Tặng tiền mô phỏng cho bình luận; cần xác nhận.', parameters: object({ commentId:string(), amountVnd:integer() }, ['commentId','amountVnd']) },
  { name: 'send_conversation_message', description: 'Gửi tin nhắn phòng riêng; cần xác nhận.', parameters: object({ conversationId:string(), body:string() }, ['conversationId','body']) },
  { name: 'send_channel_message', description: 'Gửi tin nhắn kênh cộng đồng; cần xác nhận.', parameters: object({ channelId:string(), body:string() }, ['channelId','body']) },
  { name: 'request_direct_chat', description: 'Gửi lời mời trò chuyện tới thành viên; cần xác nhận.', parameters: object({ recipientId:string(), introMessage:string() }, ['recipientId','introMessage']) },
  { name: 'respond_chat_request', description: 'Chấp nhận hoặc từ chối lời mời chat; cần xác nhận.', parameters: object({ requestId:string(), decision:{type:'STRING',enum:['accepted','declined']} }, ['requestId','decision']) },
  { name: 'block_user', description: 'Chặn một thành viên và hủy lời mời chat liên quan; cần xác nhận.', parameters: object({ blockedId:string() }, ['blockedId']) },
  { name: 'mark_notification_read', description: 'Đánh dấu thông báo đã đọc.', parameters: object({ notificationId:string() }, ['notificationId']) },
  { name: 'propose_community_channel', description: 'Đề xuất kênh mới; cần xác nhận.', parameters: object({ serverId:string(), name:string(), description:string() }, ['serverId','name']) },
  { name: 'submit_verification', description: 'Gửi yêu cầu xác minh bằng URL bằng chứng đã tải lên; cần xác nhận.', parameters: object({ universityId:string(), evidenceType:{ type:'STRING',enum:['student_email','student_card','transcript','other'] }, evidenceUrl:string() }, ['evidenceType','evidenceUrl']) },
  { name: 'create_report', description: 'Gửi báo cáo hoặc yêu cầu hỗ trợ; cần xác nhận.', parameters: object({ targetType:string(), targetId:string(), reason:string() }, ['targetType','targetId','reason']) },
]

export const READ_ASSISTANT_TOOLS = new Set(ASSISTANT_TOOL_SCHEMAS.slice(0, 17).map(tool => tool.name))
export const MUTATING_ASSISTANT_TOOLS = new Set(ASSISTANT_TOOL_SCHEMAS.slice(17).map(tool => tool.name))

export async function executeAssistantTool(name, args = {}, { userId, universityId } = {}) {
  switch (name) {
    case 'search_tlucs': return globalSearch(args.query, userId, args.universityId || universityId)
    case 'search_requests': return (await listRequests({ q: args.query, kind: args.kind, universityId: args.universityId || universityId })).slice(0, 8)
    case 'search_sharing_posts': return (await listSharingPosts({ q: args.query, format: args.format, universityId: args.universityId || universityId })).slice(0, 8)
    case 'search_people': return (await listPeople(userId, { q: args.query, universityId: args.universityId || universityId })).slice(0, 8)
    case 'search_tlucs_knowledge': return searchKnowledge(args.query, args.limit)
    case 'get_my_profile': return getUser(userId)
    case 'get_my_wallet': return getWallet(userId)
    case 'list_my_requests': return listAuthoredRequests(userId)
    case 'list_my_sessions': return listMySessions(userId)
    case 'list_my_notifications': return listNotifications(userId)
    case 'list_my_conversations': return listConversations(userId)
    case 'list_my_chat_requests': return listChatRequests(userId)
    case 'list_community_servers': return listServers()
    case 'list_forum_posts': return (await listPosts({ q: args.query, feed: args.feed, universityId: args.universityId || universityId })).slice(0, 10)
    case 'list_forum_comments': return listComments(args.postId)
    case 'list_conversation_messages': return listMessages(userId, args.conversationId)
    case 'list_channel_messages': return listChannelMessages(userId, args.channelId)
    case 'create_request': return createRequest(userId, { deliveryMode: 'online', ...args })
    case 'accept_request': return acceptRequest(args.requestId, userId)
    case 'select_request_application': return selectApplication(userId, args.requestId, args.applicationId)
    case 'create_sharing_post': return createSharingPostChecked(userId, args)
    case 'join_sharing_post': return joinSharingPost(userId, args.postId)
    case 'confirm_sharing_access': return confirmSharingAccess(userId, args.postId)
    case 'cancel_sharing_participation': return cancelSharingParticipation(userId, args.postId)
    case 'cancel_sharing_post': return cancelSharingPost(userId, args.postId, args.reason)
    case 'update_profile': return updateBasicProfile(userId, args)
    case 'wallet_topup': return demoTopup(userId, Number(args.amountVnd))
    case 'wallet_withdraw': return demoWithdraw(userId, Number(args.amountVnd))
    case 'pay_request_remaining': return payRemaining(userId, args.requestId)
    case 'release_request_payment': return releaseTransaction(args.requestId, userId)
    case 'check_in_session': return checkIn(userId, args.requestId, args.eventType || 'check_in', args.note || '')
    case 'complete_session': return completeSession(userId, args.requestId)
    case 'review_session': return reviewSession(userId, args.requestId, args)
    case 'report_no_show': return reportNoShow(userId, args.requestId, args)
    case 'open_request_dispute': return openRequestDispute(userId, args.requestId, args)
    case 'open_sharing_dispute': return openSharingDispute(userId, args.postId, args)
    case 'review_sharing': return reviewSharing(userId, args.postId, args)
    case 'create_forum_post': return createPost(userId, args)
    case 'add_forum_comment': return addComment(userId, args.postId, args)
    case 'react_forum_post': return react(userId, args.postId, args.reaction)
    case 'react_forum_comment': return reactComment(userId, args.commentId, args.reaction)
    case 'save_forum_post': return toggleCollection(userId, args.postId, 'save')
    case 'follow_forum_post': return toggleCollection(userId, args.postId, 'follow')
    case 'gift_forum_post': return sendGift(userId, args.postId, Number(args.amountVnd))
    case 'gift_forum_comment': return sendCommentGift(userId, args.commentId, Number(args.amountVnd))
    case 'send_conversation_message': return sendMessage(userId, args.conversationId, { body: args.body })
    case 'send_channel_message': return sendChannelMessage(userId, args.channelId, { body: args.body })
    case 'request_direct_chat': return requestChat(userId, args.recipientId, args.introMessage)
    case 'respond_chat_request': return respondChatRequest(userId, args.requestId, args.decision)
    case 'block_user': return blockUser(userId, args.blockedId)
    case 'mark_notification_read': return readNotification(userId, args.notificationId)
    case 'propose_community_channel': return proposeChannel(userId, args.serverId, args)
    case 'submit_verification': return submitVerification(userId, args)
    case 'create_report': return createReport(userId, args)
    default: throw Object.assign(new Error('Tool Agent không được hỗ trợ.'), { status: 422 })
  }
}
