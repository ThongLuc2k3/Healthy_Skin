import crypto from "node:crypto";
import { database } from "../db/connection.js";
import {
  requestPolicy,
  validateDuration,
  validatePaidAmount,
  validateRequestStart,
} from "../config/policies.js";
import { screenText } from "./moderationService.js";
import { attachPayee, holdPaidRequest } from "./walletService.js";
import { createRequestConversation } from "./conversationService.js";

export const demoRequests = [
  {
    id: "demo-ai",
    kind: "paid",
    status: "open",
    title: "Cần hỏi kinh nghiệm học môn AI với thầy Minh",
    description: "Muốn hỏi workload, cách chấm và kiến thức cần chuẩn bị.",
    university_code: "HCMUS",
    university_name: "HCMUS",
    course_name: "Trí tuệ nhân tạo",
    duration_minutes: 30,
    amount_vnd: 50000,
    starts_at: new Date(Date.now() + 2 * 3600000).toISOString(),
    delivery_mode: "online",
    area_label: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-dsa",
    kind: "paid",
    status: "open",
    title: "Ôn gấp cây đỏ đen trước cuối kỳ",
    description: "Cần hệ thống lại lý thuyết và luyện một số bài.",
    university_code: "HCMUS",
    university_name: "HCMUS",
    course_name: "Cấu trúc dữ liệu",
    duration_minutes: 120,
    amount_vnd: 200000,
    starts_at: new Date(Date.now() + 8 * 3600000).toISOString(),
    delivery_mode: "online",
    area_label: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-career",
    kind: "exchange",
    status: "open",
    title: "Đổi review CV lấy hỗ trợ tiếng Anh",
    description: "Mình cần góp ý CV Data Intern.",
    offered_description: "Mình có thể hỗ trợ luyện speaking.",
    university_code: "HCMUS",
    university_name: "HCMUS",
    course_name: "Thực tập",
    duration_minutes: 45,
    amount_vnd: null,
    starts_at: new Date(Date.now() + 24 * 3600000).toISOString(),
    delivery_mode: "online",
    area_label: null,
    created_at: new Date().toISOString(),
  },
];
export const demoApplications = [];

export function validateRequestInput(input = {}, now = new Date()) {
  const errors = {};
  if (!["free", "paid", "exchange"].includes(input.kind))
    errors.kind = "Loại yêu cầu không hợp lệ.";
  if (
    typeof input.title !== "string" ||
    input.title.trim().length < 10 ||
    input.title.trim().length > 120
  )
    errors.title = "Tiêu đề cần từ 10 đến 120 ký tự.";
  if (
    typeof input.description !== "string" ||
    input.description.trim().length < 20 ||
    input.description.trim().length > 3000
  )
    errors.description = "Mô tả cần từ 20 đến 3.000 ký tự.";
  const start = validateRequestStart(input.startsAt, now);
  if (!start.valid) errors.startsAt = start.code;
  const duration = validateDuration(Number(input.durationMinutes));
  if (!duration.valid) errors.durationMinutes = duration.code;
  if (input.kind === "paid") {
    const amount = validatePaidAmount(Number(input.amountVnd));
    if (!amount.valid) errors.amountVnd = amount.code;
  }
  if (
    input.kind === "exchange" &&
    (!input.offeredDescription || input.offeredDescription.trim().length < 10)
  )
    errors.offeredDescription = "Mô tả điều bạn có thể giúp.";
  if (!["online", "in_person", "either"].includes(input.deliveryMode))
    errors.deliveryMode = "Hình thức không hợp lệ.";
  if (
    input.deliveryMode !== "online" &&
    (!input.areaLabel || input.areaLabel.trim().length < 2)
  )
    errors.areaLabel = "Vui lòng chọn khu vực công khai.";
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warning: duration.warning,
  };
}

export async function listRequests(filters = {}) {
  const db = database();
  if (!db) {
    return demoRequests.filter(
      (x) =>
        x.status === "open" &&
        (!filters.kind || x.kind === filters.kind) &&
        (!filters.q ||
          (x.title + x.description + x.course_name)
            .toLowerCase()
            .includes(filters.q.toLowerCase())),
    );
  }
  const values = [];
  const where = [`r.status='open'`];
  if (filters.kind) {
    values.push(filters.kind);
    where.push(`r.kind=$${values.length}`);
  }
  if (filters.universityId) {
    values.push(filters.universityId);
    where.push(`r.university_id=$${values.length}`);
  }
  if (filters.q) {
    values.push(`%${filters.q}%`);
    where.push(
      `(r.title ILIKE $${values.length} OR r.description ILIKE $${values.length} OR r.course_name ILIKE $${values.length} OR c.name ILIKE $${values.length})`,
    );
  }
  const { rows } = await db.query(
    `select r.*,u.code university_code,u.name university_name,coalesce(r.course_name,c.name) course_name from requests r left join universities u on u.id=r.university_id left join courses c on c.id=r.course_id where ${where.join(" and ")} order by r.created_at desc limit 60`,
    values,
  );
  return rows;
}

export async function createRequest(userId, input) {
  const validation = validateRequestInput(input);
  if (!validation.valid)
    throw Object.assign(new Error("Yêu cầu chưa hợp lệ."), {
      status: 422,
      code: "VALIDATION_ERROR",
      fields: validation.errors,
    });
  const moderation = screenText(input);
  const status = moderation.outcome === "publish" ? "open" : "moderation";
  const record = {
    id: crypto.randomUUID(),
    author_id: userId,
    kind: input.kind,
    status,
    title: input.title.trim(),
    description: input.description.trim(),
    offered_description: input.offeredDescription?.trim() || null,
    university_id: input.universityId || null,
    university_name: input.universityName || "HCMUS",
    course_name: input.courseName?.trim() || null,
    amount_vnd: input.kind === "paid" ? Number(input.amountVnd) : null,
    deposit_vnd: input.kind === "paid" ? requestPolicy.paidDepositVnd : 0,
    duration_minutes: Number(input.durationMinutes),
    delivery_mode: input.deliveryMode,
    area_label: input.areaLabel?.trim() || null,
    latitude_blurred: Number.isFinite(Number(input.latitudeBlurred))
      ? Number(input.latitudeBlurred)
      : null,
    longitude_blurred: Number.isFinite(Number(input.longitudeBlurred))
      ? Number(input.longitudeBlurred)
      : null,
    starts_at: new Date(input.startsAt).toISOString(),
    require_verified_university: Boolean(input.requireVerifiedUniversity),
    created_at: new Date().toISOString(),
  };
  const db = database();
  if (!db) {
    if (input.kind === "paid")
      await holdPaidRequest({
        userId,
        requestId: record.id,
        grossVnd: record.amount_vnd,
        depositVnd: record.deposit_vnd,
      });
    demoRequests.unshift(record);
    return { ...record, moderation };
  }
  const client = await db.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      `insert into requests(author_id,university_id,course_id,course_name,kind,status,title,description,offered_description,amount_vnd,deposit_vnd,duration_minutes,delivery_mode,area_label,latitude_blurred,longitude_blurred,starts_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) returning *`,
      [
        userId,
        input.universityId || null,
        input.courseId || null,
        record.course_name,
        input.kind,
        status,
        record.title,
        record.description,
        record.offered_description,
        record.amount_vnd,
        record.deposit_vnd,
        record.duration_minutes,
        record.delivery_mode,
        record.area_label,
        record.latitude_blurred,
        record.longitude_blurred,
        record.starts_at,
      ],
    );
    if (input.requireVerifiedUniversity)
      await client.query(
        `insert into request_requirements(request_id,key,value,required) values($1,'verified_university',$2,true)`,
        [rows[0].id, JSON.stringify(true)],
      );
    const run = await client.query(
      `insert into moderation_runs(target_type,target_id,rules_version,outcome,confidence) values('request',$1,$2,$3,$4) returning id`,
      [
        rows[0].id,
        moderation.rulesVersion,
        moderation.outcome,
        moderation.outcome === "publish" ? 1 : 0.8,
      ],
    );
    for (const finding of moderation.findings)
      await client.query(
        "insert into moderation_findings(run_id,source,code,severity) values($1,$2,$3,$4)",
        [run.rows[0].id, finding.source, finding.code, finding.severity],
      );
    if (input.kind === "paid")
      await holdPaidRequest({
        client,
        userId,
        requestId: rows[0].id,
        grossVnd: record.amount_vnd,
        depositVnd: record.deposit_vnd,
      });
    await client.query("commit");
    return { ...rows[0], moderation };
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

export async function acceptRequest(requestId, userId) {
  const db = database();
  if (!db) {
    const request = demoRequests.find((x) => x.id === requestId);
    if (!request || request.status !== "open")
      throw Object.assign(
        new Error("Yêu cầu vừa được ghép hoặc không còn mở."),
        { status: 409, code: "REQUEST_UNAVAILABLE" },
      );
    if (request.author_id === userId)
      throw Object.assign(
        new Error("Bạn không thể nhận yêu cầu của chính mình."),
        { status: 409, code: "SELF_MATCH" },
      );
    if (request.require_verified_university) {
      const application = {
        id: crypto.randomUUID(),
        request_id: requestId,
        applicant_id: userId,
        match_score: 90,
        missing_requirements: ["verified_university"],
        status: "queued",
        created_at: new Date().toISOString(),
      };
      demoApplications.push(application);
      return { mode: "queue", application };
    }
    request.status = "matched";
    const match = {
      id: crypto.randomUUID(),
      request_id: requestId,
      receiver_id: userId,
      exact_match: true,
      matched_at: new Date().toISOString(),
    };
    demoApplications.push(match);
    await attachPayee(requestId, userId);
    const conversation = await createRequestConversation({
      requestId,
      authorId: request.author_id,
      receiverId: userId,
    });
    return { mode: "instant", match, conversation };
  }
  const client = await db.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      "select * from requests where id=$1 for update",
      [requestId],
    );
    const request = rows[0];
    if (!request || request.status !== "open")
      throw Object.assign(
        new Error("Yêu cầu vừa được ghép hoặc không còn mở."),
        { status: 409, code: "REQUEST_UNAVAILABLE" },
      );
    if (request.author_id === userId)
      throw Object.assign(
        new Error("Bạn không thể nhận yêu cầu của chính mình."),
        { status: 409, code: "SELF_MATCH" },
      );
    const missing = [];
    const reqs = await client.query(
      "select key,value,required from request_requirements where request_id=$1",
      [requestId],
    );
    for (const requirement of reqs.rows) {
      if (requirement.required && requirement.key === "verified_university") {
        const membership = await client.query(
          `select 1 from university_memberships where user_id=$1 and university_id=$2 and verification_status='approved'`,
          [userId, request.university_id],
        );
        if (!membership.rowCount) missing.push("verified_university");
      }
    }
    if (missing.length) {
      const { rows: apps } = await client.query(
        `insert into applications(request_id,applicant_id,match_score,missing_requirements,status) values($1,$2,$3,$4,'queued') on conflict(request_id,applicant_id) do update set match_score=excluded.match_score,missing_requirements=excluded.missing_requirements returning *`,
        [requestId, userId, 90, JSON.stringify(missing)],
      );
      await client.query("commit");
      return { mode: "queue", application: apps[0] };
    }
    const { rows: matches } = await client.query(
      "insert into matches(request_id,receiver_id,exact_match) values($1,$2,true) returning *",
      [requestId, userId],
    );
    await client.query(`update requests set status='matched' where id=$1`, [
      requestId,
    ]);
    await attachPayee(requestId, userId, client);
    const conversation = await createRequestConversation({
      requestId,
      authorId: request.author_id,
      receiverId: userId,
      client,
    });
    await client.query("commit");
    return { mode: "instant", match: matches[0], conversation };
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

export async function listAuthoredRequests(userId) {
  const db = database();
  if (!db)
    return demoRequests
      .filter((x) => x.author_id === userId)
      .map((request) => ({
        ...request,
        applications: demoApplications.filter(
          (x) => x.request_id === request.id && x.status === "queued",
        ),
      }));
  const { rows } = await db.query(
    `select r.*,coalesce((select json_agg(json_build_object('id',a.id,'applicant_id',a.applicant_id,'display_name',u.display_name,'match_score',a.match_score,'missing_requirements',a.missing_requirements,'status',a.status,'created_at',a.created_at) order by a.created_at) from applications a join users u on u.id=a.applicant_id where a.request_id=r.id and a.status='queued'),'[]') applications from requests r where r.author_id=$1 order by r.created_at desc`,
    [userId],
  );
  return rows;
}

export async function selectApplication(userId, requestId, applicationId) {
  const db = database();
  if (!db) {
    const request = demoRequests.find(
        (x) =>
          x.id === requestId && x.author_id === userId && x.status === "open",
      ),
      application = demoApplications.find(
        (x) =>
          x.id === applicationId &&
          x.request_id === requestId &&
          x.status === "queued",
      );
    if (!request || !application)
      throw Object.assign(
        new Error("Ứng viên hoặc yêu cầu không còn khả dụng."),
        { status: 409 },
      );
    application.status = "accepted";
    request.status = "matched";
    const match = {
      id: crypto.randomUUID(),
      request_id: requestId,
      receiver_id: application.applicant_id,
      exact_match: false,
      matched_at: new Date().toISOString(),
    };
    demoApplications.push(match);
    await attachPayee(requestId, match.receiver_id);
    return {
      match,
      conversation: await createRequestConversation({
        requestId,
        authorId: userId,
        receiverId: match.receiver_id,
      }),
    };
  }
  const client = await db.connect();
  try {
    await client.query("begin");
    const request = (
      await client.query(
        "select * from requests where id=$1 and author_id=$2 for update",
        [requestId, userId],
      )
    ).rows[0];
    const application = (
      await client.query(
        `select * from applications where id=$1 and request_id=$2 and status='queued' for update`,
        [applicationId, requestId],
      )
    ).rows[0];
    if (!request || request.status !== "open" || !application)
      throw Object.assign(
        new Error("Ứng viên hoặc yêu cầu không còn khả dụng."),
        { status: 409 },
      );
    const match = (
      await client.query(
        "insert into matches(request_id,receiver_id,exact_match) values($1,$2,false) returning *",
        [requestId, application.applicant_id],
      )
    ).rows[0];
    await client.query(
      `update applications set status=case when id=$2 then 'accepted'::application_status else 'rejected'::application_status end where request_id=$1 and status='queued'`,
      [requestId, applicationId],
    );
    await client.query(`update requests set status='matched' where id=$1`, [
      requestId,
    ]);
    await attachPayee(requestId, application.applicant_id, client);
    const conversation = await createRequestConversation({
      requestId,
      authorId: userId,
      receiverId: application.applicant_id,
      client,
    });
    await client.query("commit");
    return { match, conversation };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
