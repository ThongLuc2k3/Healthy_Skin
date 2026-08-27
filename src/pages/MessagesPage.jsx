import { useEffect, useRef, useState } from "react";
import { LockKeyhole, Mic, Phone, Search, Send, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
const demoRooms=[{id:"demo-chat-presentation",demo:true,request_title:"[Mô phỏng] Luyện thuyết trình đồ án",last_message:{body:"Bạn gửi slide trước để mình xem nhé."},messages:[{id:"d1",sender_id:"peer-demo",body:"Chào bạn, mình là Tuấn Anh. Tối nay mình luyện phần mở đầu trước nhé."},{id:"d2",sender_id:"me",body:"Được nha, mình sẽ gửi slide lúc 7 giờ."},{id:"d3",sender_id:"peer-demo",body:"Bạn gửi slide trước để mình xem nhé."}]},{id:"demo-chat-sql",demo:true,request_title:"[Mô phỏng] Cùng luyện SQL và Python",last_message:{body:"Mình đã chuẩn bị 5 bài SQL rồi."},messages:[{id:"d4",sender_id:"peer-demo",body:"Mình đã chuẩn bị 5 bài SQL từ dễ đến khó rồi."},{id:"d5",sender_id:"me",body:"Hay quá, mình chuẩn bị notebook Python để trao đổi lại nhé."}]}];
export default function MessagesPage() {
  const { session, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const ws = useRef(null);
  useEffect(() => {
    if (!session) return;
    api("/conversations", { token: session.accessToken })
      .then((x) => {
        const combined=[...x.data,...demoRooms];setRooms(combined);setActive(combined[0] || null);
      })
      .catch((e) => setError(e.message));
  }, [session]);
  useEffect(() => {
    if (!session || !active) return;
    if(active.demo){setMessages(active.messages.map(message=>({...message,sender_id:message.sender_id==="me"?user.id:message.sender_id})));return}
    api(`/conversations/${active.id}/messages`, { token: session.accessToken })
      .then((x) => setMessages(x.data))
      .catch((e) => setError(e.message));
    const base =
      import.meta.env.VITE_WS_BASE_URL ||
      `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`;
    const socket = new WebSocket(
      `${base}?token=${encodeURIComponent(session.accessToken)}`,
    );
    ws.current = socket;
    socket.onopen = () =>
      socket.send(
        JSON.stringify({ type: "subscribe", conversationId: active.id }),
      );
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "message")
        setMessages((list) =>
          list.some((x) => x.id === payload.data.id)
            ? list
            : [...list, payload.data],
        );
    };
    return () => socket.close();
  }, [session, active, user?.id]);
  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    if(active.demo){const text=body.trim();setBody("");setMessages(list=>[...list,{id:`local-${Date.now()}`,sender_id:user.id,body:text}]);window.setTimeout(()=>setMessages(list=>[...list,{id:`reply-${Date.now()}`,sender_id:"peer-demo",body:"Mình nhận được rồi nhé. Đây là phản hồi mô phỏng, bạn có thể tiếp tục thử nhắn tin."}]),700);return}
    try {
      const { data } = await api(`/conversations/${active.id}/messages`, {
        method: "POST",
        token: session.accessToken,
        body: { kind: "text", body },
      });
      setMessages((list) =>
        list.some((x) => x.id === data.id) ? list : [...list, data],
      );
      setBody("");
    } catch (e) {
      setError(e.message);
    }
  }
  if (!session)
    return (
      <div className="page py-24 text-center">
        <h1 className="text-3xl font-black">Đăng nhập để xem tin nhắn</h1>
        <Link to="/login" className="btn-primary mt-6">
          Đăng nhập
        </Link>
      </div>
    );
  return (
    <div className="page py-8">
      <div className="grid min-h-[650px] overflow-hidden rounded-3xl border bg-white md:grid-cols-[320px_1fr]">
        <aside className="border-r">
          <div className="p-5">
            <h1 className="text-2xl font-black">Tin nhắn</h1>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3">
              <Search size={17} />
              <input
                className="w-full bg-transparent py-2.5 outline-none"
                placeholder="Tìm cuộc trò chuyện"
              />
            </div>
          </div>
          {rooms.length ? (
            rooms.map((room) => (
              <button
                onClick={() => setActive(room)}
                className={`flex w-full gap-3 border-t p-4 text-left ${active?.id === room.id ? "bg-blue-50" : ""}`}
                key={room.id}
              >
                <span className="h-11 w-11 rounded-full bg-blue-200" />
                <span>
                  <b className="text-sm">
                    {room.request_title || "Phòng giao dịch"}
                  </b>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                    {room.last_message?.body || "Bắt đầu cuộc trò chuyện"}
                  </p>
                </span>
              </button>
            ))
          ) : (
            <p className="p-6 text-sm text-slate-400">
              Phòng riêng sẽ xuất hiện sau khi bạn ghép một yêu cầu.
            </p>
          )}
        </aside>
        <section className="flex flex-col">
          {active ? (
            <>
              <header className="flex h-18 items-center justify-between border-b px-5">
                <div>
                  <b>{active.request_title || "Phòng giao dịch"}</b>
                  <p className="text-xs text-green-600">{active.demo?"Hội thoại mô phỏng":"Kết nối realtime"}</p>
                </div>
                <div className="flex gap-3">
                  <button title="Mô phỏng gọi thoại">
                    <Phone size={19} />
                  </button>
                  <button title="Mô phỏng gọi video">
                    <Video size={19} />
                  </button>
                </div>
              </header>
              <div className="border-b bg-amber-50 px-5 py-3 text-xs text-amber-800">
                <span className="flex items-center gap-2">
                  <LockKeyhole size={15} /> {active.demo?"Phòng thử nghiệm, không gửi đến người thật":"Phòng riêng được bảo vệ bởi TLUCS"}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-end gap-3 overflow-y-auto p-6">
                {messages.map((message) => (
                  <div
                    className={`max-w-md rounded-2xl p-3 text-sm ${message.sender_id === user.id ? "ml-auto rounded-br-sm bg-[#2D5BFF] text-white" : "rounded-bl-sm bg-slate-100"}`}
                    key={message.id}
                  >
                    {message.body}
                  </div>
                ))}
              </div>
              <form className="border-t p-4" onSubmit={send}>
                <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4">
                  <button type="button">
                    <Mic size={18} />
                  </button>
                  <input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-transparent py-3 outline-none"
                    placeholder="Nhập tin nhắn..."
                  />
                  <button className="text-[#2D5BFF]">
                    <Send size={19} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-slate-400">
              Chọn một cuộc trò chuyện để bắt đầu.
            </div>
          )}
          {error && (
            <p className="bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}
        </section>
      </div>
    </div>
  );
}
