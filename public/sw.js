self.addEventListener('push',event=>{event.waitUntil(self.registration.showNotification('TLUCS',{body:'Bạn có cập nhật mới trong cộng đồng.',icon:'/tlucs-mark.svg',badge:'/tlucs-mark.svg',data:{url:'/thong-bao'}}))})
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.openWindow(event.notification.data?.url||'/thong-bao'))})
