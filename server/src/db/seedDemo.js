import { database } from './connection.js'

const db=database();if(!db)throw new Error('Thiếu DATABASE_URL')
const client=await db.connect()
try{
  await client.query('begin')
  await client.query(`insert into users(id,email,real_name,display_name,account_kind,onboarding_completed,area_label) values
  ('10000000-0000-4000-8000-000000000001','demo@tlucs.local','Sinh viên Demo','Sinh viên Demo · Mô phỏng','university_student',true,'Quận 5'),
  ('10000000-0000-4000-8000-000000000002','minhanh@demo.tlucs.local','Nguyễn Minh Anh','Minh Anh · Mô phỏng','university_student',true,'Ký túc xá khu B'),
  ('10000000-0000-4000-8000-000000000003','quanghuy@demo.tlucs.local','Trần Quang Huy','Quang Huy · Mô phỏng','university_student',true,'Thủ Đức'),
  ('10000000-0000-4000-8000-000000000004','thuyduong@demo.tlucs.local','Lê Thùy Dương','Thùy Dương · Mô phỏng','university_student',true,'Quận 10'),
  ('10000000-0000-4000-8000-000000000005','baolam@demo.tlucs.local','Phạm Bảo Lâm','Bảo Lâm · Mô phỏng','alumni',true,'Bình Thạnh'),
  ('10000000-0000-4000-8000-000000000006','ngoclinh@demo.tlucs.local','Võ Ngọc Linh','Ngọc Linh · Mô phỏng','university_student',true,'Quận 3'),
  ('10000000-0000-4000-8000-000000000007','hoangnam@demo.tlucs.local','Đặng Hoàng Nam','Hoàng Nam · Mô phỏng','university_student',true,'Quận 5'),
  ('10000000-0000-4000-8000-000000000008','maichi@demo.tlucs.local','Bùi Mai Chi','Mai Chi · Mô phỏng','high_school_student',true,'Tân Phú')
  on conflict(id) do nothing`)
  await client.query(`insert into auth_accounts(user_id,provider,provider_account_id,provider_email) values('10000000-0000-4000-8000-000000000001','google','tlucs-demo-user','demo@tlucs.local') on conflict(provider,provider_account_id) do update set user_id=excluded.user_id`)
  await client.query(`insert into university_memberships(user_id,university_id,relation,verification_status,verified_at) select u.id,uni.id,case when u.account_kind='alumni' then 'alumni' else 'student' end,'approved',now() from users u cross join universities uni where u.id between '10000000-0000-4000-8000-000000000001' and '10000000-0000-4000-8000-000000000007' and uni.code='HCMUS' on conflict(user_id,university_id) do nothing`)
  await client.query(`update users set default_university_id=(select id from universities where code='HCMUS') where id between '10000000-0000-4000-8000-000000000001' and '10000000-0000-4000-8000-000000000007'`)
  await client.query(`insert into user_reputation_stats(user_id,completed_requests,rating_count,average_rating,punctuality_rate) select id,8+(row_number() over())::int,5+(row_number() over())::int,4.50+(row_number() over())*.04,.96 from users where email like '%@demo.tlucs.local' on conflict(user_id) do nothing`)
  await client.query(`insert into wallets(user_id,available_vnd) select id,case when email='demo@tlucs.local' then 1000000 else 350000 end from users where email='demo@tlucs.local' or email like '%@demo.tlucs.local' on conflict(user_id) do nothing`)

  await client.query(`insert into requests(id,author_id,university_id,course_id,kind,status,title,description,offered_description,amount_vnd,deposit_vnd,duration_minutes,delivery_mode,area_label,starts_at) values
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',(select id from universities where code='HCMUS'),(select id from courses where code='CSC14003'),'paid','open','[Mô phỏng] Hỏi kinh nghiệm học Cơ sở AI','Mình cần hỏi workload, cách chấm và kiến thức nên chuẩn bị trước khi đăng ký.',null,50000,5000,30,'online',null,now()+interval '2 hours'),
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003',(select id from universities where code='HCMUS'),(select id from courses where code='CSC10004'),'paid','open','[Mô phỏng] Ôn cây đỏ đen trước cuối kỳ','Cần hệ thống lại lý thuyết và luyện hai bài mẫu trong buổi trực tuyến.',null,120000,5000,90,'online',null,now()+interval '7 hours'),
  ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004',(select id from universities where code='HCMUS'),null,'free','open','[Mô phỏng] Nên chọn CLB nào năm nhất','Mình muốn nghe trải nghiệm thực tế về khối lượng hoạt động và cách cân bằng việc học.',null,null,0,30,'in_person','Cơ sở Nguyễn Văn Cừ',now()+interval '1 day'),
  ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000006',(select id from universities where code='HCMUS'),null,'exchange','open','[Mô phỏng] Đổi review CV lấy luyện speaking','Mình cần góp ý CV Data Intern và cách trình bày dự án cá nhân.','Mình có thể hỗ trợ luyện speaking tiếng Anh.',null,0,45,'online',null,now()+interval '30 hours'),
  ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000007',(select id from universities where code='HCMUS'),(select id from courses where code='MTH00030'),'free','open','[Mô phỏng] Xin kinh nghiệm học Xác suất','Mình bị hổng phần biến ngẫu nhiên và cần biết thứ tự ôn tập phù hợp.',null,null,0,30,'either','Thư viện HCMUS',now()+interval '40 hours')
  on conflict(id) do nothing`)
  await client.query(`update wallets w set available_vnd=available_vnd-r.deposit_vnd,pending_vnd=pending_vnd+r.deposit_vnd from requests r where w.user_id=r.author_id and r.id in ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002') and not exists(select 1 from transactions t where t.request_id=r.id)`)
  await client.query(`insert into transactions(request_id,payer_id,gross_vnd,deposit_vnd,remaining_vnd,status,held_at) select r.id,r.author_id,r.amount_vnd,r.deposit_vnd,r.amount_vnd-r.deposit_vnd,'held',now() from requests r where r.id in ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002') and not exists(select 1 from transactions t where t.request_id=r.id)`)
  await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) select t.id,t.payer_id,'debit',t.deposit_vnd,'request_deposit_hold' from transactions t where t.request_id in ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002') and not exists(select 1 from ledger_entries l where l.transaction_id=t.id and l.entry_type='request_deposit_hold')`)

  await client.query(`insert into posts(id,author_id,server_id,title,body,moderation_status,created_at) values
  ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000005',(select s.id from community_servers s join universities u on u.id=s.university_id where u.code='HCMUS'),'[Mô phỏng] Checklist đăng ký học phần','Mình tổng hợp các bước nên kiểm tra trước ngày mở cổng. Mời mọi người bổ sung kinh nghiệm.','published',now()-interval '3 hours'),
  ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000006',(select s.id from community_servers s join universities u on u.id=s.university_id where u.code='HCMUS'),'[Mô phỏng] Góc tìm bạn học Data','Mình muốn lập nhóm ba đến bốn bạn cùng học SQL và làm dự án nhỏ mỗi tuần.','published',now()-interval '1 hour') on conflict(id) do nothing`)
  await client.query(`insert into post_metrics(post_id,view_count,reaction_count,comment_count,trending_score) select id,120,18,6,82 from posts where id in ('30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002') on conflict(post_id) do nothing`)

  await client.query(`insert into sharing_posts(id,host_id,university_id,course_id,format,title,description,deliverables,content_format,content_extent,refund_terms,access_price_vnd,host_deposit_vnd,minimum_participants,capacity,registration_deadline,status,starts_at) values
  ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',(select id from universities where code='HCMUS'),(select id from courses where code='CSC14003'),'instant_unlock','[Mô phỏng] Cách mình ôn đạt 10 điểm Cơ sở AI','Bộ ghi chú cá nhân và checklist ôn tập theo từng chủ đề.','PDF ghi chú và checklist','PDF','18 trang','Hoàn tiền nếu không truy cập được hoặc sai mô tả.',10000,0,null,null,null,'published',null),
  ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000005',(select id from universities where code='HCMUS'),null,'scheduled_exchange','[Mô phỏng] Review lộ trình xin thực tập Data','Buổi trao đổi nhóm về CV, portfolio và cách tìm vị trí phù hợp.','Buổi trao đổi và checklist CV','Trực tuyến','60 phút','Hoàn tiền nếu buổi bị hủy.',5000,500,2,10,now()+interval '20 hours','published',now()+interval '1 day') on conflict(id) do nothing`)
  await client.query('commit')
  console.log('Đã seed dữ liệu mô phỏng TLUCS.')
}catch(error){await client.query('rollback');throw error}finally{client.release();await db.end()}
