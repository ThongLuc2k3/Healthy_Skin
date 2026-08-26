import { database } from './connection.js'
const db=database();if(!db)throw new Error('Thiếu DATABASE_URL')
await db.query(`INSERT INTO universities(code,name,slug,is_pilot) VALUES
('HCMUS','Trường Đại học Khoa học Tự nhiên – ĐHQG TP.HCM','hcmus',true),
('HCMUT','Trường Đại học Bách khoa – ĐHQG TP.HCM','hcmut',false),
('UEL','Trường Đại học Kinh tế – Luật – ĐHQG TP.HCM','uel',false),
('HCMIU','Trường Đại học Quốc tế – ĐHQG TP.HCM','hcmiu',false),
('USSH','Trường Đại học Khoa học Xã hội và Nhân văn – ĐHQG TP.HCM','ussh',false)
ON CONFLICT(code) DO UPDATE SET name=excluded.name,is_pilot=excluded.is_pilot`)
await db.query(`INSERT INTO topics(slug,name,category) VALUES
('mon-hoc','Môn học và ôn tập','hoc-tap'),('giang-vien','Kinh nghiệm giảng viên','hoc-tap'),
('nganh-hoc','Ngành học và lộ trình','dinh-huong'),('nghien-cuu','Nghiên cứu khoa học','dinh-huong'),
('thuc-tap','Thực tập và nghề nghiệp','nghe-nghiep'),('hoc-bong','Học bổng','co-hoi'),
('cau-lac-bo','Câu lạc bộ và hoạt động','doi-song'),('ky-tuc-xa','Ký túc xá và nhà trọ','doi-song'),
('thu-tuc','Thủ tục sinh viên','doi-song'),('tuyen-sinh','Tuyển sinh và chọn trường','tuyen-sinh')
ON CONFLICT(slug) DO UPDATE SET name=excluded.name,category=excluded.category`)
await db.query(`INSERT INTO faculties(university_id,name)
SELECT id,'Công nghệ thông tin' FROM universities WHERE code='HCMUS'
UNION ALL SELECT id,'Toán – Tin học' FROM universities WHERE code='HCMUS'
UNION ALL SELECT id,'Điện tử – Viễn thông' FROM universities WHERE code='HCMUS'
ON CONFLICT(university_id,name) DO NOTHING`)
await db.query(`INSERT INTO courses(university_id,faculty_id,code,name)
SELECT u.id,f.id,v.code,v.name FROM universities u
JOIN faculties f ON f.university_id=u.id
JOIN (VALUES
('Công nghệ thông tin','CSC10001','Nhập môn lập trình'),
('Công nghệ thông tin','CSC10004','Cấu trúc dữ liệu và giải thuật'),
('Công nghệ thông tin','CSC14003','Cơ sở trí tuệ nhân tạo'),
('Toán – Tin học','MTH00001','Toán cơ sở'),
('Toán – Tin học','MTH00030','Xác suất và thống kê'),
('Điện tử – Viễn thông','ETT00001','Nhập môn điện tử – viễn thông')
) AS v(faculty_name,code,name) ON v.faculty_name=f.name
WHERE u.code='HCMUS' ON CONFLICT(university_id,code) DO UPDATE SET name=excluded.name`)
await db.query(`INSERT INTO community_servers(university_id,name,slug)
SELECT id,'Cộng đồng '||code,slug FROM universities
ON CONFLICT(university_id) DO UPDATE SET name=excluded.name`)
await db.query(`INSERT INTO channels(server_id,name,slug,description,kind,is_default,position)
SELECT s.id,v.name,v.slug,v.description,'chat',true,v.position FROM community_servers s
CROSS JOIN (VALUES
('Chung','chung','Trò chuyện chung trong trường',0),
('Hỏi môn học','hoi-mon-hoc','Hỏi đáp về môn học và đăng ký học phần',1),
('Đời sống sinh viên','doi-song-sinh-vien','Đời sống trong và quanh trường',2),
('Nhà trọ – ký túc xá','nha-tro-ky-tuc-xa','Trao đổi chỗ ở an toàn',3),
('Thực tập – việc làm','thuc-tap-viec-lam','Cơ hội và kinh nghiệm nghề nghiệp',4),
('Hoạt động – câu lạc bộ','hoat-dong-cau-lac-bo','Câu lạc bộ, cuộc thi và sự kiện',5)
) AS v(name,slug,description,position)
ON CONFLICT(server_id,slug) DO UPDATE SET name=excluded.name,description=excluded.description,position=excluded.position`)
await db.end();console.log('Đã seed danh mục trường TLUCS')
