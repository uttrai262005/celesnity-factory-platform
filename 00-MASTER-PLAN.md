# MASTER PLAN — Celesnity Software Track (Factory Data & Production Line Platform)

Deadline: **Chủ nhật 6/9/2026, 11:00 AM ICT** — còn 6 ngày kể từ hôm nay (31/8).

## Nguyên tắc chủ đạo

Đây là Spec-driven Development, không phải vibe coding. Thứ tự bắt buộc:

1. **Kiến trúc trước, code sau.** Toàn bộ 6 file context bên dưới phải viết xong và đọc lại 1 lượt trước khi mở Cursor gõ dòng code đầu tiên.
2. **Codex luôn đọc `AGENTS.md` đầu tiên** mỗi phiên làm việc → nó trỏ tới 6 file trong `context/`.
3. **Mỗi feature = 1 spec file** trong `context/specs/`. Không code tính năng nào mà chưa có spec.
4. **Sau mỗi unit**: cập nhật `progress-tracker.md`, chạy verify checklist, rồi mới sang unit tiếp theo.
5. Khi Cursor đi lệch hướng → sửa **spec** hoặc **progress-tracker**, không sửa tay code rồi bỏ qua spec.

## Vì sao chọn kiến trúc thế này

Đề bài không cho repo thật, chỉ nói "use existing Celesnity repositories and architecture". Cách xử lý an toàn nhất: **tự dựng một bộ khung kiến trúc hợp lý theo đúng stack đề yêu cầu** (NestJS 11 + Next.js 16 + Postgres + Docker Compose + Mosquitto), rồi ghi rõ trong bài nộp giả định nào mình đã đặt ra. Giám khảo đánh giá tư duy quyết định, không đánh giá việc đoán đúng repo nội bộ của họ.

## Lịch 6 ngày (áp dụng "toàn thời gian đến hạn")

| Ngày | Trọng tâm | Unit tương ứng |
|---|---|---|
| **Ngày 1 (T2 31/8)** | Viết xong 6 file context + build plan + spec Unit 1-3. Setup monorepo, Docker Compose skeleton. | Setup + Unit 01, 02 |
| **Ngày 2 (T3 1/9)** | Application API fixture + collector (pagination/timeout/retry) | Unit 03, 04 |
| **Ngày 3 (T4 2/9)** | Data crawler (supplier page + anti-loop) + Database connector (schema discovery) | Unit 05, 06 |
| **Ngày 4 (T5 3/9)** | Normalization pipeline + provenance + state machine (PLANNED/IN_PROGRESS/BLOCKED/COMPLETED) | Unit 07, 08 |
| **Ngày 5 (T6 4/9)** | Frontend: Data Sources UI + Production Lines UI + management actions (block/resume/note) | Unit 09, 10 |
| **Ngày 6 (T7 5/9)** | MQTT (nếu còn thời gian, optional), test toàn bộ, viết README + architecture writeup, quay demo nếu cần, buffer bug | Unit 11 (optional) + Polish |
| **Sáng CN 6/9** | Review lần cuối, nộp form trước 11:00 AM | — |

Nguyên tắc buffer: **Ngày 6 là ngày đệm**, không nhồi feature mới. Nếu tới hết Ngày 5 mà core flow (API → normalize → production view) chưa chạy end-to-end, cắt MQTT và cắt bớt UI polish ngay, không tiếc.

## Ưu tiên khi thiếu thời gian (đề bài nói rõ: "we value a complete, reliable vertical slice more than a large number of features")

Thứ tự cắt giảm nếu cháy thời gian, cắt từ dưới lên:
1. MQTT (luôn optional, cắt đầu tiên)
2. Data crawler (giữ lại tối thiểu — 1 nguồn đơn giản, không cần chống loop phức tạp)
3. UI polish (giữ layout thô, bỏ styling đẹp)
4. Management actions (block/resume/note) — giữ ít nhất "block" hoạt động được
5. **Không bao giờ cắt**: Application API collector, Database connector, normalization, state machine, Production Lines view — đây là xương sống chứng minh "vertical slice hoàn chỉnh".

## Cấu trúc thư mục hoàn chỉnh

```
celesnity-factory-platform/
├── AGENTS.md                       ← entry point cho Codex
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── code-standards.md
│   ├── ai-workflow-rules.md
│   ├── ui-context.md
│   ├── progress-tracker.md
│   └── specs/
│       ├── 00-build-plan.md
│       ├── 01-monorepo-setup.md
│       ├── 02-docker-compose-skeleton.md
│       ├── 03-application-api-fixture.md
│       ├── 04-application-api-collector.md
│       ├── 05-supplier-crawler.md
│       ├── 06-database-connector.md
│       ├── 07-normalization-pipeline.md
│       ├── 08-production-state-machine.md
│       ├── 09-data-sources-ui.md
│       ├── 10-production-lines-ui.md
│       └── 11-mqtt-optional.md
├── apps/
│   ├── api/           (NestJS 11)
│   └── web/            (Next.js 16)
├── fixtures/
│   ├── application-api/
│   ├── supplier-portal/
│   └── production-db/
└── docker-compose.yml
```

## Nộp bài — checklist cuối cùng

- [ ] Link repository (public hoặc cấp quyền eric@celesnity.com)
- [ ] README: cách chạy `docker compose up`, cách seed fixture, cách demo 6 bước
- [ ] Architecture writeup ngắn (đề AI track yêu cầu 1 trang, nhưng nên có tương tự cho Software để giải thích trade-off — không bắt buộc nhưng nên làm để tăng điểm "reasoning")
- [ ] Ghi rõ giả định: "Không có repo Celesnity thật nên tự dựng kiến trúc theo đúng stack yêu cầu"
- [ ] Test chạy được, `npm run build` pass ở cả 2 app
- [ ] Nộp form: https://forms.gle/Ef4r2EDptSwnduJN8 trước 11:00 AM 6/9
