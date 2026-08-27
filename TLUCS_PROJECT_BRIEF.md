# TLUCS: Mô tả dự án, vấn đề, giải pháp và đổi mới sáng tạo

> Đây là bản thảo chiến lược để tiếp tục phản biện. Những nhận định chưa có khảo sát được ghi là **giả thuyết cần kiểm chứng**, không trình bày như kết luận thị trường.

## 1. Tóm tắt dự án

**TLUCS: Trusted Local University Community Space** là nền tảng cộng đồng đa trường, nơi một người có thể vừa đăng điều mình cần, vừa nhận điều mình có khả năng hỗ trợ trong toàn bộ đời sống đại học.

TLUCS không định vị là nền tảng gia sư, không chỉ là diễn đàn và cũng không chỉ là chợ dịch vụ. Sản phẩm kết hợp:

- Cộng đồng chung và server riêng theo trường.
- Bảng yêu cầu miễn phí, trao đổi lợi ích hoặc trả phí nhỏ.
- Ghép người theo đúng trường, môn/chủ đề, trải nghiệm, lịch và mức xác minh.
- Phòng chat/lịch riêng sau khi ghép.
- Bảng chia sẻ để chủ động cung cấp thông tin, tài liệu hoặc buổi trao đổi hữu ích.
- Cơ chế uy tín, giữ tiền, đánh giá, báo cáo và kiểm duyệt.

HCMUS là thị trường khởi động, nhưng kiến trúc sản phẩm hỗ trợ nhiều trường ngay từ đầu.

**Định vị ngắn:**

> TLUCS biến những nhu cầu nhỏ, cụ thể và giàu ngữ cảnh trong đời sống đại học thành các kết nối có thể tìm thấy, có người cam kết phản hồi và có cơ chế tạo niềm tin.

## 2. Vấn đề lớn TLUCS hướng đến

Vấn đề không đơn thuần là “sinh viên thiếu gia sư”. Vấn đề rộng hơn là **nguồn lực trong cộng đồng đại học tồn tại nhưng bị phân mảnh, khó tìm đúng người, khó đánh giá độ phù hợp và thiếu cơ chế khiến một người sẵn sàng dành thời gian cho nhu cầu của người khác**.

### 2.1. Thông tin có nhưng thiếu đúng ngữ cảnh

Internet có kiến thức chung; group trường có bài viết và tài liệu; bạn bè có trải nghiệm cá nhân. Tuy nhiên, nhiều quyết định chỉ có giá trị khi gắn với bối cảnh cụ thể:

- Đúng trường, khoa, khóa hoặc chương trình.
- Đúng môn, giảng viên, cách chấm và lối trình bày được yêu cầu.
- Đúng kỳ học hoặc thời điểm hiện tại.
- Đúng người đã thật sự trải qua việc đó.

Ví dụ “học Cơ sở AI thế nào” khác với “học Cơ sở AI tại HCMUS, với cách tổ chức và đánh giá của lớp cụ thể, cần chuẩn bị gì”. Tương tự, kinh nghiệm chọn CLB, tìm trọ, làm thủ tục, xin học bổng hoặc ứng tuyển thực tập cũng phụ thuộc mạnh vào bối cảnh địa phương.

### 2.2. Kênh cộng đồng hiện tại tối ưu cho đăng tin, chưa tối ưu cho một kết quả có cam kết

Đăng bài trong group có thể được trả lời nhiều, ít hoặc không được duyệt. Bình luận có thể mâu thuẫn, khó biết người trả lời đã trải qua đúng bối cảnh nào. Nhắn riêng thì người hỏi ngại làm phiền; người được hỏi không có nghĩa vụ phản hồi nhanh hoặc trả lời hàng chục câu hỏi liên tiếp.

Đây không phải lỗi của cộng đồng. Một người có thiện chí vẫn có giới hạn thời gian. Khoảng trống là thiếu một cơ chế để nói rõ:

- Tôi đang cần gì.
- Tôi cần trong bao lâu và vào lúc nào.
- Tôi chấp nhận miễn phí, trao đổi hoặc gửi một khoản nhỏ để người kia dành thời gian.
- Người nhận đã đồng ý với phạm vi đó.

### 2.3. Nhu cầu nhỏ đang nằm giữa “hỏi miễn phí” và “thuê dịch vụ chuyên nghiệp”

Nhiều nhu cầu chỉ cần 15–60 phút: hỏi kinh nghiệm chọn môn, xem CV, giải thích một chỗ mắc, hướng dẫn thủ tục, chia sẻ cách tìm trọ, review CLB hoặc chuẩn bị phỏng vấn. Chúng quá nhỏ để thuê một dịch vụ chuyên nghiệp nhưng đủ tốn công để người lạ không muốn hỗ trợ vô điều kiện.

Khoản 1.000–20.000đ hoặc một trao đổi lợi ích không nhất thiết là “mua câu trả lời”. Nó có thể là **tín hiệu cam kết thời gian**: người hỏi được quyền hỏi rõ trong phạm vi đã thống nhất; người nhận có động lực dành một khoảng thời gian cụ thể.

Đây là giả thuyết trung tâm cần được kiểm chứng bằng hành vi thật, không chỉ bằng ý kiến.

### 2.4. Sinh viên mới và người ít quan hệ chịu bất lợi lớn hơn

Người đã học lâu thường có bạn bè, anh chị khóa trên và kinh nghiệm tìm nguồn. Sinh viên năm đầu, người hướng nội, người chuyển ngành hoặc học sinh THPT chưa có “social capital” đó. Họ dễ:

- Tự mò và bỏ sót kinh nghiệm quan trọng.
- Chọn đại vì sát hạn đăng ký.
- Ngại hỏi nhiều vì sợ làm phiền.
- Nghe lời khuyên không rõ nguồn hoặc không đúng bối cảnh.
- Chịu chi phí cơ hội về điểm số, thời gian, tín chỉ hoặc tiền học.

### 2.5. Nguồn lực sinh viên chưa được kích hoạt hiệu quả

Trong mỗi trường đã có người từng vượt qua đúng vấn đề: học môn đó, làm thủ tục đó, ở khu trọ đó, tham gia CLB đó hoặc xin được cơ hội đó. Nhưng kiến thức trải nghiệm thường:

- Nằm trong trí nhớ cá nhân hoặc chat riêng.
- Chỉ lưu hành trong nhóm quan hệ nhỏ.
- Không được chuẩn hóa thành hồ sơ có thể tìm kiếm.
- Không tạo được uy tín tích lũy hay thu nhập nhỏ.

TLUCS đặt giả thuyết rằng sinh viên có thể vừa là người cần, vừa là người giúp. Tiền và giá trị có thể quay vòng trong cộng đồng thay vì chia cố định thành “khách hàng” và “chuyên gia”.

### 2.6. Đời sống đại học bị chia thành nhiều kênh rời rạc

Một sinh viên hiện có thể phải dùng group Facebook cho thông báo, Messenger/Zalo để hỏi riêng, Discord cho nhóm học, chợ gia sư cho học thêm, drive để tìm tài liệu, group trọ cho chỗ ở và nhiều form khác nhau cho hoạt động. Việc phân mảnh làm mất lịch sử uy tín, ngữ cảnh trường và khả năng chuyển một thảo luận công khai thành một kết nối có trách nhiệm.

## 3. Giải pháp của TLUCS

### 3.1. Một danh tính, nhiều vai trò

Không có hai phía cố định “người mua” và “chuyên gia”. Mỗi tài khoản có thể:

- Đăng yêu cầu hôm nay.
- Nhận yêu cầu phù hợp vào ngày mai.
- Thảo luận miễn phí trong server trường.
- Chia sẻ một tài liệu hoặc buổi trao đổi.
- Tích lũy uy tín từ hành vi thực tế.

### 3.2. Ba cơ chế tạo kết nối

1. **Miễn phí:** giữ tinh thần tương trợ và tiếp cận cho người không muốn trả tiền.
2. **Trao đổi:** hai bên ghi rõ “Tôi cần” và “Tôi có thể giúp”.
3. **Trả phí nhỏ:** dùng tiền như tín hiệu cam kết thời gian, không mặc định biến mọi tương tác thành dịch vụ.

### 3.3. Ghép theo ngữ cảnh địa phương

TLUCS ưu tiên trường, môn/chủ đề, trải nghiệm đã xác minh, lịch rảnh, khu vực và uy tín. Khớp đủ điều kiện có thể nhận ngay; gần khớp vào hàng đợi để người đăng chọn.

### 3.4. Từ bài đăng đến một kết quả có cấu trúc

Sau khi ghép, hệ thống tạo phòng chat, lịch, địa điểm/link họp, check-in, xác nhận hoàn tất và đánh giá. Với giao dịch trả phí, tiền được giữ và chỉ giải ngân sau khi hoàn tất hoặc hết thời gian bảo đảm mà không có tranh chấp.

### 3.5. Hai lớp cộng đồng bổ trợ nhau

- **Diễn đàn/server:** phù hợp với câu hỏi nhẹ, thảo luận rộng, thông tin miễn phí và xây cộng đồng.
- **Bảng yêu cầu/Bảng chia sẻ:** phù hợp khi cần đúng người, thời gian cụ thể, cam kết phản hồi hoặc quyền truy cập có điều kiện.

TLUCS không loại bỏ group miễn phí; nó bổ sung một “đường chuyển đổi” từ khám phá công khai sang kết nối có trách nhiệm.

## 4. Nhóm người dùng và tình huống sử dụng

| Nhóm | Nhu cầu tiêu biểu |
| --- | --- |
| Sinh viên năm đầu | Chọn môn, hiểu thủ tục, CLB, cách học, chỗ ở, hòa nhập |
| Sinh viên đang học | Mắc nội dung môn, ôn thi, kinh nghiệm giảng viên, nhóm học |
| Sinh viên cuối khóa | CV, portfolio, thực tập, khóa luận, tuyển dụng |
| Sinh viên giỏi/đã trải qua | Chia sẻ kinh nghiệm, giúp cộng đồng, kiếm thu nhập nhỏ |
| Cựu sinh viên | Hướng nghiệp, mentoring ngắn, kết nối lại với trường |
| Học sinh THPT | Hỏi người trong trường về ngành, môi trường và tuyển sinh |
| CLB/đoàn khoa/nhóm học thuật | Mở buổi chia sẻ, ôn tập, tuyển thành viên và tạo kênh chính thống |

## 5. Giá trị cốt lõi

### Với người cần hỗ trợ

- Tìm đúng người thay vì hỏi ngẫu nhiên.
- Biết bối cảnh, xác minh và uy tín của người hỗ trợ.
- Chọn miễn phí, trao đổi hoặc trả phí theo khả năng.
- Có phạm vi, thời gian và trách nhiệm rõ ràng.
- Giảm ngại làm phiền khi hai bên đã chủ động đồng ý.

### Với người hỗ trợ

- Biến trải nghiệm đã có thành giá trị cho người khác.
- Chọn yêu cầu phù hợp với khả năng và lịch rảnh.
- Xây uy tín có thể dùng cho các hoạt động sau này.
- Có thu nhập nhỏ hoặc nhận lại giá trị trao đổi.

### Với cộng đồng/trường

- Kích hoạt tri thức đang phân tán giữa các khóa.
- Nhìn thấy nhu cầu lặp lại để tổ chức hoạt động phù hợp.
- Tạo kênh bổ trợ cho CLB, đoàn khoa và nhóm học thuật.
- Có công cụ xác minh, moderation và báo cáo tập trung hơn.

## 6. Doanh thu và tính bền vững

### Mô hình MVP đã chọn

- TLUCS thu **1% trên phần giao dịch được giải ngân thành công**.
- Diễn đàn, server trường, chat cộng đồng và yêu cầu miễn phí không thu phí.
- Không thu tiền chỉ vì đăng ký tài khoản hoặc đọc nội dung công khai.
- MVP dùng ví và thanh toán mô phỏng; tiền thật chỉ triển khai sau đánh giá pháp lý và tích hợp đối tác được cấp phép.

### Dòng tiền minh họa

Một phiên 50.000đ hoàn tất:

- Người nhận: 49.500đ.
- TLUCS: 500đ.

Một lượt mở khóa 10.000đ hoàn tất:

- Người chia sẻ: 9.900đ.
- TLUCS: 100đ.

### Nhận định thẳng về 1%

Phí 1% giúp giảm ma sát và phù hợp tinh thần cộng đồng, nhưng **chưa có bằng chứng rằng đủ duy trì hạ tầng, kiểm duyệt, tranh chấp, thanh toán và hỗ trợ người dùng**. Đây có thể là mô hình doanh thu của MVP, chưa chắc là mô hình kinh doanh cuối cùng.

Sau khi có dữ liệu, có thể nghiên cứu nhưng không mặc định áp dụng:

- Phí xử lý cố định rất nhỏ cho giao dịch trả phí.
- Phí rút tiền hoặc phí từ đối tác thanh toán theo chi phí thực tế.
- Công cụ quản trị/analytics cho tổ chức trường hoặc CLB.
- Tài trợ học bổng/sự kiện minh bạch.
- Gói xác minh nhanh hoặc tính năng nâng cao không làm giảm quyền tiếp cận cơ bản.

Mọi phương án phải tránh biến TLUCS thành chợ quảng cáo hoặc làm nội dung miễn phí bị bóp để ép trả tiền.

## 7. Đối thủ, giải pháp thay thế và khoảng trống

TLUCS hiện chưa có bằng chứng đủ để tuyên bố “không có đối thủ”. Cách chính xác hơn là: **các kênh hiện tại giải quyết từng phần, còn TLUCS thử kết hợp cộng đồng địa phương, yêu cầu có cam kết và giao dịch nhỏ trong cùng một hệ thống uy tín**.

| Nhóm thay thế | Điểm mạnh | Khoảng trống TLUCS muốn giải quyết |
| --- | --- | --- |
| Facebook Group/page/confession | Đông người, miễn phí, đã có cộng đồng; Facebook hỗ trợ group và community chat | Phản hồi không cam kết; hồ sơ trải nghiệm khó chuẩn hóa; bài có thể trôi/chờ duyệt; khó chuyển thành lịch, escrow và đánh giá theo phiên |
| Zalo/Messenger/chat riêng | Nhanh khi đã biết đúng người; thân thuộc | Phải có quan hệ trước; ngại làm phiền; thông tin và uy tín không tìm kiếm được; không có marketplace/matching |
| Discord server | Kênh chủ đề, chat cộng đồng, voice và file tốt | Phụ thuộc từng server; không mặc định có xác minh trường–môn, matching yêu cầu, escrow và uy tín liên phiên |
| Drive/group tài liệu | Miễn phí, hữu ích cho nội dung tĩnh | Tài liệu không thay thế trao đổi nhiều câu hỏi, kinh nghiệm ngầm hoặc bối cảnh giảng viên/lớp |
| Buổi ôn của đoàn khoa/CLB | Tin cậy, rẻ hoặc miễn phí, phục vụ số đông | Không bao phủ mọi môn/thời điểm; khó cá nhân hóa; không xử lý toàn bộ nhu cầu phi học thuật |
| Q&A/AI/khóa học online | Phản hồi nhanh, kiến thức rộng, dễ mở rộng | Có thể không theo đúng chương trình, cách trình bày và trải nghiệm địa phương; thiếu người thật đã trải qua bối cảnh cụ thể |
| Nền tảng gia sư như Superprof | Hồ sơ người dạy, đánh giá, học online/trực tiếp; người dạy chủ động đăng dịch vụ | Thường định vị dạy kèm và kỹ năng; chưa tập trung vào yêu cầu nhỏ, đúng trường–môn và toàn bộ đời sống đại học |
| Quan hệ bạn bè/anh chị khóa trên | Tin cậy, giàu ngữ cảnh, thường miễn phí | Không công bằng với người ít quan hệ; khó mở rộng; người được hỏi dễ quá tải |

Nguồn tham khảo tính năng, không phải bằng chứng rằng TLUCS đã thắng cạnh tranh: [Facebook Groups](https://about.fb.com/news/2022/06/features-to-find-and-connect-with-facebook-groups/), [Discord Community Servers](https://docs.discord.com/developers/platform/community-servers), [Superprof](https://www.superprof.com/how-it-works.html).

## 8. Khoảng trống thị trường được giả thuyết

TLUCS nhắm vào giao điểm chưa được phục vụ trọn vẹn:

```text
Ngữ cảnh đúng trường/môn/chủ đề
            +
Nhu cầu nhỏ và có thời hạn
            +
Cam kết phản hồi rõ ràng
            +
Miễn phí / trao đổi / phí nhỏ
            +
Uy tín tích lũy và xác minh
            +
Cộng đồng công khai + phòng riêng sau ghép
```

Không phải mọi nhu cầu đều cần TLUCS. Nếu tài liệu miễn phí hoặc group đã giải quyết tốt, người dùng nên tiếp tục dùng chúng. TLUCS có giá trị nhất khi câu hỏi cần ngữ cảnh sâu, nhiều lượt trao đổi, đúng thời điểm hoặc một người cụ thể cam kết dành thời gian.

## 9. Điểm đổi mới sáng tạo

### 9.1. “Micro-commitment marketplace”, không phải chợ gia sư

Đơn vị giá trị không nhất thiết là một buổi dạy. Nó có thể là 15–30 phút dành riêng để trả lời một chuỗi câu hỏi, một lần review, một kinh nghiệm địa phương hoặc một việc nhỏ trong đời sống đại học.

### 9.2. Ba cơ chế giá trị cùng tồn tại

Miễn phí, trao đổi và trả phí nằm trên cùng một bảng tin. Người dùng không bị buộc trở thành khách hàng; họ chọn cơ chế phù hợp với nhu cầu và có thể đổi vai theo thời gian.

### 9.3. Trust graph theo ngữ cảnh đại học

Niềm tin không chỉ là số sao chung. Nó được xây từ quan hệ trường, môn đã học, bằng chứng tùy chọn, lịch sử hoàn tất, đúng giờ và đánh giá gắn với từng loại tương tác.

### 9.4. Ghép “đúng cộng đồng” trước “đúng chuyên môn chung”

Một người biết kiến thức chưa chắc biết bối cảnh. TLUCS ưu tiên trải nghiệm địa phương, rồi mới dùng các yếu tố còn lại để ghép.

### 9.5. Kinh tế tuần hoàn quy mô nhỏ trong sinh viên

Người dùng có thể kiếm 50.000đ từ những điều mình biết rồi dùng chính số đó để hỏi một việc khác. Giá trị và tiền quay vòng trong cùng cộng đồng; ranh giới người cung cấp/người tiêu dùng trở nên linh hoạt.

### 9.6. Kết hợp community layer và transaction layer

Thảo luận miễn phí giúp khám phá và xây quan hệ. Khi cần cam kết cao hơn, nội dung có thể chuyển thành yêu cầu có lịch, phòng riêng, escrow và đánh giá mà không rời hệ sinh thái.

### 9.7. Bảng chia sẻ đảo chiều Bảng yêu cầu

Bảng yêu cầu bắt đầu từ nhu cầu. Bảng chia sẻ bắt đầu từ nguồn lực sẵn có. Hai hướng giúp thị trường hình thành cung–cầu thay vì chờ một phía đăng trước.

## 10. Phản biện cần thừa nhận

### “Đã có tài liệu miễn phí, tại sao phải trả?”

Đúng với nhiều tình huống. TLUCS không nên bán lại thứ đã có miễn phí. Giá trị trả phí chỉ hợp lý khi cần giải thích, cá nhân hóa, nhiều lượt hỏi đáp, đúng bối cảnh hoặc cam kết thời gian. Cần đo xem tỷ lệ nhu cầu này có đủ lớn hay không.

### “Đoàn khoa/CLB đã mở buổi ôn rất rẻ”

Đây vừa là cạnh tranh vừa là đối tác tiềm năng. TLUCS có thể giúp họ đăng lịch, tìm nhu cầu và tổ chức cộng đồng. Khoảng trống chỉ tồn tại ở môn/thời điểm/nhu cầu mà hoạt động tập thể chưa bao phủ.

### “Sinh viên không muốn trả tiền”

Sản phẩm vẫn có miễn phí và trao đổi. Nhưng willingness-to-pay ở mức 1k–20k phải được kiểm chứng bằng giao dịch thật; câu trả lời khảo sát “có” chưa đủ.

### “1% không đủ sống”

Có khả năng cao ở giai đoạn đầu. Mục tiêu ban đầu là kiểm chứng giá trị và hành vi, không chứng minh lợi nhuận lớn. Tuy nhiên, một dự án muốn tồn tại vẫn phải tìm unit economics hợp lý sau pilot.

### “Thông tin về giảng viên mang tính chủ quan”

Cần tách trải nghiệm cá nhân khỏi sự thật, yêu cầu nêu bối cảnh, tổng hợp nhiều nguồn, cấm công kích và cho phép báo cáo. Không nên biến TLUCS thành nơi chấm điểm con người thiếu kiểm chứng.

### “Nhu cầu quá rộng sẽ làm marketplace loãng”

Đúng. Tầm nhìn có thể rộng nhưng chiến lược khởi động phải hẹp. HCMUS và một vài nhóm môn/chủ đề là wedge để tạo mật độ; chỉ mở rộng khi chỉ số chứng minh.

## 11. Giả thuyết cần kiểm chứng

1. Một tỷ lệ đáng kể sinh viên có nhu cầu cần đúng người trong trường, không chỉ cần kiến thức chung.
2. Ngại làm phiền và thiếu cam kết phản hồi là vấn đề đủ lớn để thay đổi hành vi.
3. Khoản phí nhỏ làm tăng chất lượng/cường độ phản hồi mà không phá tinh thần cộng đồng.
4. Có đủ sinh viên sẵn sàng nhận yêu cầu với giá nhỏ hoặc trao đổi lợi ích.
5. Một người sẽ thực sự đổi vai giữa người cần và người giúp.
6. Hồ sơ xác minh và uy tín làm người dùng tin quyết định hơn bình luận ẩn danh.
7. Nhu cầu phi học thuật đủ thường xuyên để hỗ trợ tầm nhìn “toàn bộ đời sống đại học”.
8. 1% có thể tạo doanh thu có ý nghĩa khi quy mô tăng, hoặc cần mô hình bổ sung.

## 12. Câu hỏi cần người sáng lập bổ sung

### Về vấn đề

1. Ngoài học tập, ba tình huống đau nhất bạn từng chứng kiến trong đời sống đại học là gì?
2. Người gặp vấn đề là năm mấy, khoa nào, tần suất bao nhiêu và hậu quả cụ thể ra sao?
3. Có ví dụ nào người dùng đã thử group/chat/Google nhưng vẫn thất bại không?
4. Vấn đề nào xảy ra hàng tuần, vấn đề nào chỉ theo mùa đăng ký hoặc mùa thi?
5. “Ngại làm phiền” là nguyên nhân chính hay chỉ là biểu hiện của việc không biết đúng người?

### Về người hỗ trợ

6. Ngoài tiền, họ nhận được gì: uy tín, quan hệ, portfolio, điểm rèn luyện hay cảm giác đóng góp?
7. Mức giá tối thiểu nào khiến họ sẵn sàng dành 30 phút?
8. Họ sợ rủi ro gì nhất: tốn thời gian, bị hỏi quá phạm vi, bị đánh giá oan hay lộ danh tính?

### Về phạm vi khởi động

9. Ba use case đầu tiên cần tạo mật độ là gì?
10. Nên khởi động theo khoa, theo môn khó hay theo nhóm sinh viên năm nhất?
11. Nhu cầu nào tuyệt đối không đưa vào pilot đầu dù thuộc tầm nhìn dài hạn?

### Về cạnh tranh và hành vi hiện tại

12. HCMUS hiện có những group/page/drive/CLB nào giải quyết tốt từng phần?
13. Điểm nào người dùng sẽ không rời các kênh đó để sang TLUCS?
14. TLUCS nên tích hợp/hợp tác với kênh hiện hữu thay vì thay thế bằng cách nào?

### Về doanh thu

15. Mục tiêu của 1% là nguyên tắc cộng đồng, chiến lược thâm nhập hay mô hình vĩnh viễn?
16. Ai trả chi phí moderation và tranh chấp khi giao dịch chỉ 1.000–5.000đ?
17. Có chấp nhận tài trợ từ trường/CLB/doanh nghiệp nếu không ảnh hưởng trung lập không?

### Về bằng chứng

18. Hiện đã có bao nhiêu cuộc phỏng vấn ngoài nhóm bạn thân?
19. Có dữ liệu nào về số bài không được trả lời, thời gian phản hồi hoặc tỷ lệ câu trả lời sai ngữ cảnh không?
20. Trước buổi trình bày tháng 9, bằng chứng nhỏ nhất nào có thể thu được: survey, landing test, 10 phiên concierge hay danh sách chờ?

## 13. Tuyên bố đề xuất khi thuyết trình

Không nên nói:

> Thị trường không có đối thủ và sinh viên chắc chắn sẽ trả tiền để hỏi.

Nên nói:

> Sinh viên hiện ghép nhiều kênh để giải quyết đời sống đại học, nhưng vẫn có những nhu cầu nhỏ, giàu bối cảnh và có thời hạn chưa được phục vụ ổn định. TLUCS thử nghiệm một mô hình kết hợp cộng đồng theo trường với yêu cầu miễn phí, trao đổi hoặc trả phí nhỏ, nhằm biến tri thức phân tán giữa sinh viên thành những kết nối có thể tìm thấy, có cam kết và có uy tín. HCMUS là nơi kiểm chứng giả thuyết trước khi mở rộng đa trường.

