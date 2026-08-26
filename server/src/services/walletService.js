import crypto from 'node:crypto'
import { database } from '../db/connection.js'
import { calculatePlatformFee } from '../config/policies.js'

const memoryWallets=new Map();const memoryTransactions=new Map();const memoryLedger=[]
const walletFor=id=>{if(!memoryWallets.has(id))memoryWallets.set(id,{user_id:id,available_vnd:0,pending_vnd:0});return memoryWallets.get(id)}
const entry=(userId,transactionId,direction,amountVnd,entryType)=>memoryLedger.unshift({id:crypto.randomUUID(),user_id:userId,transaction_id:transactionId,direction,amount_vnd:amountVnd,entry_type:entryType,created_at:new Date().toISOString()})

export async function getWallet(userId){const db=database();if(!db)return {...walletFor(userId),entries:memoryLedger.filter(x=>x.user_id===userId).slice(0,50)};await db.query('insert into wallets(user_id) values($1) on conflict do nothing',[userId]);const [wallet,entries]=await Promise.all([db.query('select * from wallets where user_id=$1',[userId]),db.query('select * from ledger_entries where user_id=$1 order by created_at desc limit 50',[userId])]);return {...wallet.rows[0],entries:entries.rows}}
export async function demoTopup(userId,amountVnd){if(!Number.isInteger(amountVnd)||amountVnd<10000||amountVnd>1000000)throw Object.assign(new Error('Số tiền demo phải từ 10.000đ đến 1.000.000đ.'),{status:422,code:'INVALID_DEMO_TOPUP'});const db=database();if(!db){const wallet=walletFor(userId);wallet.available_vnd+=amountVnd;entry(userId,null,'credit',amountVnd,'demo_topup');return wallet}const client=await db.connect();try{await client.query('begin');await client.query('insert into wallets(user_id,available_vnd) values($1,$2) on conflict(user_id) do update set available_vnd=wallets.available_vnd+$2,updated_at=now()',[userId,amountVnd]);await client.query(`insert into ledger_entries(user_id,direction,amount_vnd,entry_type) values($1,'credit',$2,'demo_topup')`,[userId,amountVnd]);await client.query('commit');return (await client.query('select * from wallets where user_id=$1',[userId])).rows[0]}catch(e){await client.query('rollback');throw e}finally{client.release()}}
export async function holdPaidRequest({client,userId,requestId,grossVnd,depositVnd}){if(!client){const wallet=walletFor(userId);if(wallet.available_vnd<depositVnd)throw Object.assign(new Error('Số dư ví không đủ để giữ cọc.'),{status:402,code:'INSUFFICIENT_BALANCE'});wallet.available_vnd-=depositVnd;wallet.pending_vnd+=depositVnd;const tx={id:crypto.randomUUID(),request_id:requestId,payer_id:userId,payee_id:null,gross_vnd:grossVnd,deposit_vnd:depositVnd,remaining_vnd:grossVnd-depositVnd,status:'held',held_vnd:depositVnd,created_at:new Date().toISOString()};memoryTransactions.set(requestId,tx);entry(userId,tx.id,'debit',depositVnd,'request_deposit_hold');return tx}await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[userId]);const wallet=await client.query('select * from wallets where user_id=$1 for update',[userId]);if(Number(wallet.rows[0].available_vnd)<depositVnd)throw Object.assign(new Error('Số dư ví không đủ để giữ cọc.'),{status:402,code:'INSUFFICIENT_BALANCE'});const {rows}=await client.query(`insert into transactions(request_id,payer_id,gross_vnd,deposit_vnd,remaining_vnd,status,held_at) values($1,$2,$3,$4,$5,'held',now()) returning *`,[requestId,userId,grossVnd,depositVnd,grossVnd-depositVnd]);await client.query('update wallets set available_vnd=available_vnd-$2,pending_vnd=pending_vnd+$2,updated_at=now() where user_id=$1',[userId,depositVnd]);await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'debit',$3,'request_deposit_hold')`,[rows[0].id,userId,depositVnd]);return rows[0]}
export async function attachPayee(requestId,payeeId,client=null){if(!client){const tx=memoryTransactions.get(requestId);if(tx)tx.payee_id=payeeId;return tx}return (await client.query('update transactions set payee_id=$2,payment_due_at=(select starts_at - interval \'30 minutes\' from requests where id=$1) where request_id=$1 returning *',[requestId,payeeId])).rows[0]}
export async function payRemaining(userId,requestId){const db=database();if(!db){const tx=memoryTransactions.get(requestId);if(!tx||tx.payer_id!==userId)throw Object.assign(new Error('Không tìm thấy giao dịch.'),{status:404});if(tx.status!=='held'||tx.held_vnd!==tx.deposit_vnd)throw Object.assign(new Error('Giao dịch không thể thanh toán.'),{status:409});const wallet=walletFor(userId);if(wallet.available_vnd<tx.remaining_vnd)throw Object.assign(new Error('Số dư ví không đủ.'),{status:402,code:'INSUFFICIENT_BALANCE'});wallet.available_vnd-=tx.remaining_vnd;wallet.pending_vnd+=tx.remaining_vnd;tx.held_vnd=tx.gross_vnd;tx.fully_paid_at=new Date().toISOString();tx.release_after=new Date(Date.now()+12*3600000).toISOString();entry(userId,tx.id,'debit',tx.remaining_vnd,'request_remaining_hold');return tx}const client=await db.connect();try{await client.query('begin');const tx=(await client.query('select * from transactions where request_id=$1 and payer_id=$2 for update',[requestId,userId])).rows[0];if(!tx||tx.status!=='held')throw Object.assign(new Error('Giao dịch không thể thanh toán.'),{status:409});const held=await client.query(`select coalesce(sum(amount_vnd),0) amount from ledger_entries where transaction_id=$1 and entry_type in ('request_deposit_hold','request_remaining_hold')`,[tx.id]);const remaining=Number(tx.gross_vnd)-Number(held.rows[0].amount);const wallet=(await client.query('select * from wallets where user_id=$1 for update',[userId])).rows[0];if(Number(wallet.available_vnd)<remaining)throw Object.assign(new Error('Số dư ví không đủ.'),{status:402,code:'INSUFFICIENT_BALANCE'});await client.query('update wallets set available_vnd=available_vnd-$2,pending_vnd=pending_vnd+$2,updated_at=now() where user_id=$1',[userId,remaining]);await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'debit',$3,'request_remaining_hold')`,[tx.id,userId,remaining]);await client.query(`update transactions set release_after=(select starts_at+(duration_minutes||' minutes')::interval+interval '12 hours' from requests where id=$1) where id=$2`,[requestId,tx.id]);await client.query('commit');return {...tx,held_vnd:Number(tx.gross_vnd)}}catch(e){await client.query('rollback');throw e}finally{client.release()}}

export async function releaseDueRequestTransactions(){
  const db=database();if(!db)return [];const {rows}=await db.query(`select request_id,payer_id from transactions where request_id is not null and status='held' and release_after<=now()`);const released=[];for(const row of rows){try{released.push(await releaseTransaction(row.request_id,row.payer_id))}catch(error){if(error.status!==409)throw error}}return released
}
export async function cancelOverdueRequestPayments(){
  const db=database();if(!db)return []
  const {rows}=await db.query(`select t.id from transactions t where t.request_id is not null and t.status='held' and t.payee_id is not null and t.payment_due_at<=now() and not exists(select 1 from ledger_entries l where l.transaction_id=t.id and l.entry_type='request_remaining_hold')`)
  const cancelled=[]
  for(const row of rows){const client=await db.connect();try{await client.query('begin');const tx=(await client.query(`select * from transactions where id=$1 and status='held' for update`,[row.id])).rows[0];if(!tx){await client.query('rollback');continue}const deposit=Number(tx.deposit_vnd),fee=calculatePlatformFee(deposit),payout=deposit-fee;await client.query('update wallets set pending_vnd=pending_vnd-$2 where user_id=$1',[tx.payer_id,deposit]);await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[tx.payee_id]);await client.query('update wallets set available_vnd=available_vnd+$2 where user_id=$1',[tx.payee_id,payout]);await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'credit',$3,'request_payment_deadline_compensation')`,[tx.id,tx.payee_id,payout]);await client.query(`update transactions set status='cancelled',fee_vnd=$2,completed_at=now() where id=$1`,[tx.id,fee]);await client.query(`update requests set status='cancelled' where id=$1`,[tx.request_id]);await client.query(`update appointments set status='cancelled',completed_at=now() where request_id=$1`,[tx.request_id]);await client.query('commit');cancelled.push(tx.request_id)}catch(error){await client.query('rollback');throw error}finally{client.release()}}
  return cancelled
}
export async function freezeRequestTransaction(requestId,userId){
  const db=database();if(!db){const tx=memoryTransactions.get(requestId);if(!tx||![tx.payer_id,tx.payee_id].includes(userId)||tx.status!=='held')throw Object.assign(new Error('Giao dịch không thể tranh chấp.'),{status:409});tx.status='disputed';return tx}
  const {rows}=await db.query(`update transactions set status='disputed' where request_id=$1 and status='held' and (payer_id=$2 or payee_id=$2) returning *`,[requestId,userId]);if(!rows[0])throw Object.assign(new Error('Giao dịch không thể tranh chấp.'),{status:409});await db.query(`update requests set status='disputed' where id=$1`,[requestId]);return rows[0]
}
export async function releaseTransaction(requestId,actorId){const db=database();if(!db){const tx=memoryTransactions.get(requestId);if(!tx||!tx.payee_id)throw Object.assign(new Error('Giao dịch chưa sẵn sàng giải ngân.'),{status:409});if(tx.payer_id!==actorId)throw Object.assign(new Error('Chỉ người đăng được xác nhận hoàn tất.'),{status:403});if(tx.held_vnd!==tx.gross_vnd)throw Object.assign(new Error('Giao dịch chưa thanh toán đủ.'),{status:409});const fee=calculatePlatformFee(tx.gross_vnd);walletFor(tx.payer_id).pending_vnd-=tx.gross_vnd;walletFor(tx.payee_id).available_vnd+=tx.gross_vnd-fee;entry(tx.payee_id,tx.id,'credit',tx.gross_vnd-fee,'request_payout');tx.fee_vnd=fee;tx.status='released';tx.completed_at=new Date().toISOString();return tx}const client=await db.connect();try{await client.query('begin');const tx=(await client.query('select * from transactions where request_id=$1 for update',[requestId])).rows[0];if(!tx||tx.payer_id!==actorId)throw Object.assign(new Error('Bạn không thể xác nhận giao dịch này.'),{status:403});const held=await client.query(`select coalesce(sum(amount_vnd),0) amount from ledger_entries where transaction_id=$1 and entry_type in ('request_deposit_hold','request_remaining_hold')`,[tx.id]);if(Number(held.rows[0].amount)!==Number(tx.gross_vnd))throw Object.assign(new Error('Giao dịch chưa thanh toán đủ.'),{status:409});const fee=calculatePlatformFee(Number(tx.gross_vnd));const payout=Number(tx.gross_vnd)-fee;await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[tx.payee_id]);await client.query('update wallets set pending_vnd=pending_vnd-$2,updated_at=now() where user_id=$1',[tx.payer_id,tx.gross_vnd]);await client.query('update wallets set available_vnd=available_vnd+$2,updated_at=now() where user_id=$1',[tx.payee_id,payout]);await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'credit',$3,'request_payout')`,[tx.id,tx.payee_id,payout]);const result=(await client.query(`update transactions set fee_vnd=$2,status='released',completed_at=now() where id=$1 returning *`,[tx.id,fee])).rows[0];await client.query(`update requests set status='completed' where id=$1`,[requestId]);await client.query('commit');return result}catch(e){await client.query('rollback');throw e}finally{client.release()}}

export async function holdSharingAccess({client,buyerId,hostId,sharingPostId,amountVnd}){if(amountVnd===0)return null;if(!client){const wallet=walletFor(buyerId);if(wallet.available_vnd<amountVnd)throw Object.assign(new Error('Số dư ví không đủ để mở bài chia sẻ.'),{status:402,code:'INSUFFICIENT_BALANCE'});wallet.available_vnd-=amountVnd;wallet.pending_vnd+=amountVnd;const tx={id:crypto.randomUUID(),sharing_post_id:sharingPostId,payer_id:buyerId,payee_id:hostId,gross_vnd:amountVnd,deposit_vnd:0,remaining_vnd:amountVnd,status:'held',held_vnd:amountVnd,created_at:new Date().toISOString()};memoryTransactions.set(`share:${sharingPostId}:${buyerId}`,tx);entry(buyerId,tx.id,'debit',amountVnd,'sharing_access_hold');return tx}await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[buyerId]);const wallet=(await client.query('select * from wallets where user_id=$1 for update',[buyerId])).rows[0];if(Number(wallet.available_vnd)<amountVnd)throw Object.assign(new Error('Số dư ví không đủ để mở bài chia sẻ.'),{status:402,code:'INSUFFICIENT_BALANCE'});const tx=(await client.query(`insert into transactions(sharing_post_id,payer_id,payee_id,gross_vnd,deposit_vnd,remaining_vnd,status,held_at,release_after) values($1,$2,$3,$4,0,$4,'held',now(),now()+interval '12 hours') returning *`,[sharingPostId,buyerId,hostId,amountVnd])).rows[0];await client.query('update wallets set available_vnd=available_vnd-$2,pending_vnd=pending_vnd+$2,updated_at=now() where user_id=$1',[buyerId,amountVnd]);await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'debit',$3,'sharing_access_hold')`,[tx.id,buyerId,amountVnd]);return tx}

export async function holdSharingHostDeposit({client,hostId,sharingPostId:_sharingPostId,amountVnd}){if(amountVnd===0)return;if(!client){const wallet=walletFor(hostId);if(wallet.available_vnd<amountVnd)throw Object.assign(new Error('Số dư ví không đủ để giữ cọc chủ bài.'),{status:402,code:'INSUFFICIENT_BALANCE'});wallet.available_vnd-=amountVnd;wallet.pending_vnd+=amountVnd;entry(hostId,null,'debit',amountVnd,'sharing_host_deposit_hold');return}await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[hostId]);const wallet=(await client.query('select * from wallets where user_id=$1 for update',[hostId])).rows[0];if(Number(wallet.available_vnd)<amountVnd)throw Object.assign(new Error('Số dư ví không đủ để giữ cọc chủ bài.'),{status:402,code:'INSUFFICIENT_BALANCE'});await client.query('update wallets set available_vnd=available_vnd-$2,pending_vnd=pending_vnd+$2,updated_at=now() where user_id=$1',[hostId,amountVnd]);await client.query(`insert into ledger_entries(user_id,direction,amount_vnd,entry_type) values($1,'debit',$2,'sharing_host_deposit_hold')`,[hostId,amountVnd])}

export async function releaseSharingAccess(sharingPostId, buyerId) {
  const db = database()
  if (!db) {
    const tx = memoryTransactions.get(`share:${sharingPostId}:${buyerId}`)
    if (!tx || tx.status !== 'held') {
      throw Object.assign(new Error('Giao dịch chia sẻ không thể giải ngân.'), { status: 409 })
    }
    const fee = calculatePlatformFee(tx.gross_vnd)
    walletFor(buyerId).pending_vnd -= tx.gross_vnd
    walletFor(tx.payee_id).available_vnd += tx.gross_vnd - fee
    entry(tx.payee_id, tx.id, 'credit', tx.gross_vnd - fee, 'sharing_payout')
    tx.fee_vnd = fee
    tx.status = 'released'
    tx.completed_at = new Date().toISOString()
    return tx
  }

  const client = await db.connect()
  try {
    await client.query('begin')
    const tx = (await client.query(
      `select * from transactions where sharing_post_id=$1 and payer_id=$2 for update`,
      [sharingPostId, buyerId],
    )).rows[0]
    if (!tx || tx.status !== 'held') {
      throw Object.assign(new Error('Giao dịch chia sẻ không thể giải ngân.'), { status: 409 })
    }
    const gross = Number(tx.gross_vnd)
    const fee = calculatePlatformFee(gross)
    const payout = gross - fee
    await client.query('insert into wallets(user_id) values($1) on conflict do nothing', [tx.payee_id])
    await client.query(
      'update wallets set pending_vnd=pending_vnd-$2,updated_at=now() where user_id=$1',
      [buyerId, gross],
    )
    await client.query(
      'update wallets set available_vnd=available_vnd+$2,updated_at=now() where user_id=$1',
      [tx.payee_id, payout],
    )
    await client.query(
      `insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'credit',$3,'sharing_payout')`,
      [tx.id, tx.payee_id, payout],
    )
    const result = (await client.query(
      `update transactions set fee_vnd=$2,status='released',completed_at=now() where id=$1 returning *`,
      [tx.id, fee],
    )).rows[0]
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function freezeSharingAccess(sharingPostId, buyerId) {
  const db = database()
  if (!db) {
    const tx = memoryTransactions.get(`share:${sharingPostId}:${buyerId}`)
    if (!tx || tx.status !== 'held') {
      throw Object.assign(new Error('Giao dịch không còn trong thời gian bảo đảm.'), { status: 409 })
    }
    tx.status = 'disputed'
    return tx
  }
  const { rows } = await db.query(
    `update transactions set status='disputed' where sharing_post_id=$1 and payer_id=$2 and status='held' returning *`,
    [sharingPostId, buyerId],
  )
  if (!rows[0]) {
    throw Object.assign(new Error('Giao dịch không còn trong thời gian bảo đảm.'), { status: 409 })
  }
  return rows[0]
}

export async function settleRequestNoShow(requestId, reporterId, absentParty) {
  if (!['author', 'receiver'].includes(absentParty)) throw Object.assign(new Error('Bên vắng mặt không hợp lệ.'), { status:422 })
  const db = database()
  if (!db) {
    const tx = memoryTransactions.get(requestId)
    if (!tx || ![tx.payer_id, tx.payee_id].includes(reporterId) || tx.status !== 'held') throw Object.assign(new Error('Giao dịch không thể xử lý vắng mặt.'), { status:409 })
    if (tx.held_vnd !== tx.gross_vnd) throw Object.assign(new Error('Giao dịch chưa được thanh toán đầy đủ.'), { status:409 })
    const payer = walletFor(tx.payer_id)
    payer.pending_vnd -= tx.gross_vnd
    if (absentParty === 'receiver') {
      payer.available_vnd += tx.gross_vnd
      entry(tx.payer_id, tx.id, 'credit', tx.gross_vnd, 'request_no_show_refund')
      tx.status = 'refunded'
    } else {
      const refund = Math.floor(tx.gross_vnd / 2)
      const compensation = tx.gross_vnd - refund
      const fee = calculatePlatformFee(compensation)
      payer.available_vnd += refund
      walletFor(tx.payee_id).available_vnd += compensation - fee
      entry(tx.payer_id, tx.id, 'credit', refund, 'request_partial_refund')
      entry(tx.payee_id, tx.id, 'credit', compensation - fee, 'request_no_show_compensation')
      tx.fee_vnd = fee
      tx.status = 'partially_refunded'
    }
    tx.completed_at = new Date().toISOString()
    return tx
  }
  const client = await db.connect()
  try {
    await client.query('begin')
    const tx = (await client.query('select * from transactions where request_id=$1 for update',[requestId])).rows[0]
    if (!tx || ![tx.payer_id,tx.payee_id].includes(reporterId) || tx.status !== 'held') throw Object.assign(new Error('Giao dịch không thể xử lý vắng mặt.'),{status:409})
    const held = Number((await client.query(`select coalesce(sum(amount_vnd),0) amount from ledger_entries where transaction_id=$1 and entry_type in ('request_deposit_hold','request_remaining_hold')`,[tx.id])).rows[0].amount)
    if (held !== Number(tx.gross_vnd)) throw Object.assign(new Error('Giao dịch chưa được thanh toán đầy đủ.'),{status:409})
    const gross=Number(tx.gross_vnd)
    await client.query('update wallets set pending_vnd=pending_vnd-$2 where user_id=$1',[tx.payer_id,gross])
    let status='refunded',fee=0
    if(absentParty==='receiver'){
      await client.query('update wallets set available_vnd=available_vnd+$2 where user_id=$1',[tx.payer_id,gross])
      await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'credit',$3,'request_no_show_refund')`,[tx.id,tx.payer_id,gross])
    }else{
      const refund=Math.floor(gross/2),compensation=gross-refund;fee=calculatePlatformFee(compensation)
      await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[tx.payee_id])
      await client.query('update wallets set available_vnd=available_vnd+$2 where user_id=$1',[tx.payer_id,refund])
      await client.query('update wallets set available_vnd=available_vnd+$2 where user_id=$1',[tx.payee_id,compensation-fee])
      await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'credit',$3,'request_partial_refund'),($1,$4,'credit',$5,'request_no_show_compensation')`,[tx.id,tx.payer_id,refund,tx.payee_id,compensation-fee])
      status='partially_refunded'
    }
    const result=(await client.query('update transactions set status=$2,fee_vnd=$3,completed_at=now() where id=$1 returning *',[tx.id,status,fee])).rows[0]
    await client.query(`update requests set status='cancelled' where id=$1`,[requestId])
    await client.query(`update appointments set status='cancelled',completed_at=now() where request_id=$1`,[requestId])
    await client.query('commit')
    return result
  } catch(error) { await client.query('rollback');throw error } finally { client.release() }
}

export async function refundSharingAccess(sharingPostId,buyerId,refundRate=1){
  const rate=Math.max(0,Math.min(1,Number(refundRate)));const db=database()
  if(!db){const tx=memoryTransactions.get(`share:${sharingPostId}:${buyerId}`);if(!tx||tx.status!=='held')return null;const gross=tx.gross_vnd,refund=Math.floor(gross*rate),compensation=gross-refund,fee=calculatePlatformFee(compensation);walletFor(buyerId).pending_vnd-=gross;walletFor(buyerId).available_vnd+=refund;if(refund)entry(buyerId,tx.id,'credit',refund,'sharing_refund');if(compensation){walletFor(tx.payee_id).available_vnd+=compensation-fee;entry(tx.payee_id,tx.id,'credit',compensation-fee,'sharing_cancellation_compensation')}tx.fee_vnd=fee;tx.status=refund===gross?'refunded':refund?'partially_refunded':'released';tx.completed_at=new Date().toISOString();return {...tx,refunded_vnd:refund,host_compensation_vnd:compensation-fee}}
  const client=await db.connect();try{await client.query('begin');const tx=(await client.query('select * from transactions where sharing_post_id=$1 and payer_id=$2 for update',[sharingPostId,buyerId])).rows[0];if(!tx||tx.status!=='held'){await client.query('rollback');return null}const gross=Number(tx.gross_vnd),refund=Math.floor(gross*rate),compensation=gross-refund,fee=calculatePlatformFee(compensation);await client.query('update wallets set pending_vnd=pending_vnd-$2,available_vnd=available_vnd+$3 where user_id=$1',[buyerId,gross,refund]);if(refund)await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'credit',$3,'sharing_refund')`,[tx.id,buyerId,refund]);if(compensation){await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[tx.payee_id]);await client.query('update wallets set available_vnd=available_vnd+$2 where user_id=$1',[tx.payee_id,compensation-fee]);await client.query(`insert into ledger_entries(transaction_id,user_id,direction,amount_vnd,entry_type) values($1,$2,'credit',$3,'sharing_cancellation_compensation')`,[tx.id,tx.payee_id,compensation-fee])}const status=refund===gross?'refunded':refund?'partially_refunded':'released';const result=(await client.query('update transactions set status=$2,fee_vnd=$3,completed_at=now() where id=$1 returning *',[tx.id,status,fee])).rows[0];await client.query('commit');return {...result,refunded_vnd:refund,host_compensation_vnd:compensation-fee}}catch(error){await client.query('rollback');throw error}finally{client.release()}
}

export async function distributeSharingHostDeposit(hostId,sharingPostId,amountVnd,recipientIds){
  if(!amountVnd)return [];if(!recipientIds.length){const db=database();if(!db){walletFor(hostId).pending_vnd-=amountVnd;walletFor(hostId).available_vnd+=amountVnd;entry(hostId,null,'credit',amountVnd,'sharing_host_deposit_return');return []}await db.query('update wallets set pending_vnd=pending_vnd-$2,available_vnd=available_vnd+$2 where user_id=$1',[hostId,amountVnd]);await db.query(`insert into ledger_entries(user_id,direction,amount_vnd,entry_type) values($1,'credit',$2,'sharing_host_deposit_return')`,[hostId,amountVnd]);return []}const fee=calculatePlatformFee(amountVnd),net=amountVnd-fee,each=Math.floor(net/recipientIds.length),remainder=net%recipientIds.length;const distributions=recipientIds.map((id,index)=>({recipientId:id,amountVnd:each+(index<remainder?1:0)}));const db=database()
  if(!db){walletFor(hostId).pending_vnd-=amountVnd;for(const item of distributions){walletFor(item.recipientId).available_vnd+=item.amountVnd;entry(item.recipientId,null,'credit',item.amountVnd,'sharing_host_deposit_compensation')}return distributions}
  const client=await db.connect();try{await client.query('begin');await client.query('update wallets set pending_vnd=pending_vnd-$2 where user_id=$1',[hostId,amountVnd]);for(const item of distributions){await client.query('insert into wallets(user_id) values($1) on conflict do nothing',[item.recipientId]);await client.query('update wallets set available_vnd=available_vnd+$2 where user_id=$1',[item.recipientId,item.amountVnd]);const ledger=(await client.query(`insert into ledger_entries(user_id,direction,amount_vnd,entry_type) values($1,'credit',$2,'sharing_host_deposit_compensation') returning id`,[item.recipientId,item.amountVnd])).rows[0];await client.query('insert into sharing_cancellation_distributions(sharing_post_id,recipient_id,amount_vnd,ledger_entry_id) values($1,$2,$3,$4) on conflict do nothing',[sharingPostId,item.recipientId,item.amountVnd,ledger.id])}await client.query('commit');return distributions}catch(error){await client.query('rollback');throw error}finally{client.release()}
}
