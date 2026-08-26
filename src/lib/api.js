const API_BASE=import.meta.env.VITE_API_BASE_URL||'/api/v1'
let sessionRefresher=null
export function setApiSessionRefresher(refresher){sessionRefresher=refresher}
const isSimulatedPayment=(path,method,body)=>method==='POST'&&(/\/wallet\/(demo-topup|requests\/[^/]+\/pay)/.test(path)||/\/sharing\/[^/]+\/join/.test(path)||(path==='/requests'&&body?.kind==='paid'))
export async function api(path,{token,body,_retried=false,...options}={}){
  const multipart=body instanceof FormData,simulated=isSimulatedPayment(path,options.method,body)
  if(simulated)window.dispatchEvent(new CustomEvent('tlucs:payment',{detail:{active:true}}))
  try{
    const response=await fetch(`${API_BASE}${path}`,{...options,headers:{...(multipart?{}:{'content-type':'application/json'}),...(token?{authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:multipart?body:JSON.stringify(body)})
    const data=await response.json().catch(()=>({}))
    if(response.status===401&&token&&sessionRefresher&&!_retried){const nextToken=await sessionRefresher();return api(path,{token:nextToken,body,_retried:true,...options})}
    if(!response.ok)throw Object.assign(new Error(data.error?.message||'Không thể kết nối TLUCS.'),{status:response.status,details:data.error})
    return data
  }finally{if(simulated)window.dispatchEvent(new CustomEvent('tlucs:payment',{detail:{active:false}}))}
}
export const apiBase=API_BASE
