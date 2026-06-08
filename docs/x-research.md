# X Developer Platform และ X API สำหรับระบบการตลาดและอัตโนมัติ

เอกสารทางการของ X ตอนนี้ชี้ชัดว่าแพลตฟอร์มนี้ถูกออกแบบให้ใช้กับงานอ่านข้อมูลสาธารณะ, ค้นหาโพสต์, วิเคราะห์เทรนด์, ดูข้อมูลผู้ใช้, ส่งโพสต์, ส่งและอ่าน DM, ทำงานกับ Lists และ Spaces, อัปโหลดสื่อ, รับ event แบบ real-time, ตรวจ usage, และต่อยอดเป็น dashboard หรือ agent ได้ โดยมีทั้งเอกสารสำหรับคนเขียนโค้ด, machine-readable contract ผ่าน OpenAPI, และ resource สำหรับ AI agent เช่น `llms.txt`, `llms-full.txt`, `skill.md`, Docs MCP, และ XMCP สำหรับเรียก endpoint โดยตรงจากเครื่องมือที่รองรับ MCP. citeturn12view9turn19view3turn18view0turn18view3turn18view5

ถ้าสรุปแบบใช้งานจริงที่สุด: X API เหมาะกับระบบการตลาดที่ต้อง “ฟังเสียงตลาด → ดึงข้อมูล → วิเคราะห์ → สร้างคอนเทนต์ → โพสต์ → วัดการใช้งาน → คุมต้นทุน → คุม policy” ในวงจรเดียว ส่วนการต่อยอดเป็นระบบ agent ทำได้ดีเพราะ X ให้ทั้ง OpenAPI spec, SDK ทางการ, Docs MCP และ XMCP ซึ่งลดงานเขียน adapter เองลงมาก. citeturn19view3turn18view5turn18view8turn33search3

## แพลตฟอร์มนี้ทำอะไรได้บ้าง

สิ่งที่ทำได้จากเอกสารทางการ แบ่งเป็นกลุ่มงานหลักดังนี้: อ่านและค้นหาโพสต์, ดึงข้อมูลผู้ใช้, สร้างและจัดการโพสต์, ทำ search แบบ recent และ full archive, ดู trend ตาม location, อัปโหลด media, ส่งและอ่าน DM, จัดการ Lists และ Spaces, รับ event ผ่าน webhooks หรือ activity stream, และตรวจ usage แบบ programmatic. ฝั่งเอกสารยังมี SDK ทางการสำหรับ Python และ TypeScript/JavaScript เพื่อให้เริ่มได้เร็วขึ้น. citeturn19view3turn26search7turn33search0turn33search8turn9view3

สำหรับงาน agent โดยตรง เอกสารฝั่ง AI ของ X มีบทบาทแยกชัดเจนมาก: `llms.txt` ใช้เป็นสารบัญเอกสาร, `llms-full.txt` ใช้โหลดเอกสารรวมทั้งชุด, `skill.md` ใช้อธิบาย action/inputs/constraints ให้ agent เข้าใจ capability แบบ structured, Docs MCP ใช้ค้นและอ่าน docs ระหว่างทำงาน, และ XMCP ใช้แปลง OpenAPI เป็น callable tools สำหรับ agent. ถ้าคุณจะทำ “ระบบผู้ช่วยการตลาด” จริง ชุดนี้คือฐานที่ดีที่สุดจากเอกสารทางการเอง. citeturn18view0turn18view1turn18view2turn18view5turn18view8

## การเข้าถึง ราคา และของที่ฟรี

จาก docs ปัจจุบัน ฝั่ง **X API มาตรฐาน** ใช้โมเดล **pay-per-usage** แบบซื้อเครดิตล่วงหน้าใน Developer Console, ถูกหักตามการเรียกใช้งาน, ไม่มี subscription หรือ minimum spend, และต้องดูราคาปัจจุบันต่อ endpoint ใน Developer Console เป็นหลัก เอกสารยังระบุว่า pay-per-usage plan มี monthly cap ที่ **2 ล้าน Post reads** และถ้าต้องการมากกว่านี้ให้พิจารณา Enterprise. citeturn12view0turn12view2turn12view3turn12view5turn12view8

ฝั่ง **Enterprise** ให้ทุกอย่างที่มีใน pay-per-use แล้วเพิ่มของที่ระดับองค์กรต้องใช้ เช่น full firehose, language-specific volume streams, likes streams, Powerstream, engagement metrics, Account Activity, filtered stream ที่รองรับกฎมากขึ้น, custom/elevated rate limits, monthly cap แบบ custom หรือ unlimited, และ dedicated account manager. ถ้าระบบของคุณต้องวิ่งหนัก, ต้องการ realtime volume สูง, หรืออยากมี support ระดับองค์กร อันนี้คือเส้นทางตรงสุด. citeturn13view5turn32search3

สิ่งที่ถือว่า **ใช้ฟรีตามเอกสารที่ตรวจเจอแน่ ๆ** คือ “ทรัพยากรเอกสารและเครื่องมือสำหรับพัฒนา” ได้แก่ docs, `llms.txt`, `llms-full.txt`, `skill.md`, Docs MCP, OpenAPI spec, changelog, forum, และ SDK ทางการ ส่วนเอกสารที่ผมตรวจรอบนี้ **ไม่ได้ระบุ free API data tier แบบเหมารวม** สำหรับการใช้งานข้อมูลจริง จึงไม่ควรตีความว่า endpoint มาตรฐานทั้งหมดใช้ฟรี. สำหรับ endpoint ที่มีคำว่า “All developers” ในหน้าคู่มือ ให้ตีความว่าเป็นเรื่อง availability ของ feature; ส่วนราคาจริงให้ยึด Developer Console ตามที่ docs ระบุเอง. citeturn18view0turn18view5turn12view2turn34search2turn33search6

มี **special case** ที่ควรรู้ก่อนออกแบบระบบ คือ `GET /2/users/personalized_trends` ต้องมี **User Access Tokens via OAuth 2.0 PKCE** และยังต้องมี **Premium User Subscription** ตามหน้า docs ของ endpoint นี้เอง ไม่ใช่แค่มี app กับ token อย่างเดียว. citeturn26search2turn26search5

## Endpoint สำคัญที่ควรเอาไปสร้างระบบ

ตารางนี้คัด “endpoint แกน” ที่เหมาะกับระบบการตลาด, dashboard และ automation ก่อน โดยใช้ path/description จากเอกสารทางการเป็นหลัก

| หมวด | Endpoint | ใช้ทำอะไร | การเข้าถึงที่ docs ระบุ | หมายเหตุ auth สั้น ๆ | อ้างอิง |
|---|---|---|---|---|---|
| Users | `GET /2/users/by/username/{username}` | ดูโปรไฟล์จาก username | X API standard | ใช้ Bearer token ได้ | citeturn8search0turn10view0 |
| Users | `GET /2/users/search` | ค้นหาผู้ใช้ด้วย query | X API standard | Bearer token | citeturn38search0turn38search3 |
| Users | `GET /2/users/me` | ดูข้อมูลผู้ใช้ที่ล็อกอิน | X API standard | **User Context only** | citeturn38search1turn38search10 |
| Users | `GET /2/users/{id}/following` | ดูบัญชีที่ผู้ใช้นี้ follow | X API standard | read scope ฝั่ง user context เมื่อเป็นข้อมูลผู้ใช้ที่ล็อกอิน | citeturn38search2turn38search8 |
| Posts | `GET /2/tweets/{id}` | ดูโพสต์ตาม ID | X API standard | app-only หรือ user context ได้ตาม mapping | citeturn21search3turn22view0 |
| Posts | `POST /2/tweets` | สร้างหรือแก้โพสต์ | X API standard | ต้อง user context สำหรับการโพสต์ | citeturn8search1turn10view2turn22view0 |
| Posts | `GET /2/users/{id}/tweets` | timeline ของเจ้าของบัญชี | X API standard | read | citeturn21search4turn22view0 |
| Search | `GET /2/tweets/search/recent` | ค้นหาโพสต์ย้อนหลัง 7 วัน | **All developers** | app-only และ user context ได้ | citeturn20search3turn32search0turn22view0 |
| Search | `GET /2/tweets/search/all` | ค้นหา full archive ย้อนหลังถึงปี 2006 | **Pay-per-use, Enterprise** | quickstart ปัจจุบันระบุ app-only | citeturn21search0turn32search0turn32search2 |
| Search | `GET /2/tweets/counts/recent` | นับจำนวนโพสต์ย้อนหลัง 7 วัน | **All developers** | เหมาะทำ trend gauge | citeturn21search1turn21search0 |
| Search | `GET /2/tweets/counts/all` | นับจำนวนโพสต์จาก full archive | **Pay-per-use, Enterprise** | เหมาะทำ historical trend | citeturn21search1turn21search0 |
| Search | `POST /2/tweets/search/stream/rules` | เพิ่ม/ลบกฎให้ filtered stream | X API / Enterprise comparison ระบุ Enterprise rule cap สูงกว่า | เหมาะ realtime monitor | citeturn23view0turn13view5 |
| Search | `GET /2/tweets/search/stream` | รับโพสต์แบบ near real-time | X API / Enterprise | ใช้แทน polling เมื่อต้องฟังสด | citeturn23view0turn19view1 |
| Trends | `GET /2/trends/by/woeid/{woeid}` | trend ตาม location | X API standard | ใช้ Bearer token | citeturn26search1turn26search4 |
| Trends | `GET /2/users/personalized_trends` | trend แบบ personalized ของผู้ใช้ | Premium User Subscription | ต้อง OAuth 2.0 PKCE user access | citeturn26search2turn26search5 |
| Media | `POST /2/media/upload/initialize` | เริ่มอัปโหลดสื่อแบบ chunked | X API standard | media upload flow | citeturn27search4turn27search0 |
| Media | `POST /2/media/upload/{id}/finalize` | ปิดงานอัปโหลดสื่อ | X API standard | ใช้หลัง append ครบ | citeturn27search8 |
| Media | `GET /2/media/upload` | ตรวจสถานะการประมวลผล media | X API standard | endpoint นี้ใช้ query `command=STATUS` | citeturn27search2 |
| Media | `GET /2/media/{media_key}` | ดูรายละเอียด media | X API standard | read media metadata | citeturn27search3 |
| Direct Messages | `GET /2/dm_events` | ดู DM events ล่าสุดของผู้ใช้ | X API standard | **User Access Token** | citeturn25search0turn25search2turn25search16 |
| Direct Messages | `POST /2/dm_conversations` | สร้างบทสนทนา DM ใหม่ | X API standard | user context | citeturn39search10turn39search14 |
| Direct Messages | `POST /2/dm_conversations/with/{participant_id}/messages` | ส่ง DM แบบ one-to-one | X API standard | user context | citeturn39search0turn39search14 |
| Direct Messages | `POST /2/dm_conversations/{dm_conversation_id}/messages` | ส่งข้อความใน conversation เดิม | X API standard | user context | citeturn39search4turn39search10 |
| Direct Messages | `DELETE /2/dm_events/{id}` | ลบ DM event สำหรับตัวเอง | X API standard | user context | citeturn39search15turn39search10 |
| Lists | `GET /2/lists/{id}` | ดูรายละเอียด list | X API standard | read | citeturn21search11turn22view0 |
| Lists | `GET /2/lists/{id}/tweets` | ดึงโพสต์ใน list | X API standard | read | citeturn21search5turn23view0 |
| Lists | `POST /2/lists` | สร้าง list | X API standard | user context + list scopes | citeturn23view0 |
| Spaces | `GET /2/spaces/search` | ค้นหา live/scheduled Spaces | X API standard | read | citeturn8search2turn10view4turn23view0 |
| Spaces | `GET /2/spaces/{id}` | ดู Space ตาม ID | X API standard | read | citeturn23view0 |
| Spaces | `GET /2/spaces/by/creator_ids` | หา Space จากผู้สร้าง | X API standard | read | citeturn23view0 |
| Webhooks | `POST /2/webhooks` | สร้าง webhook config | X API standard | ใช้กับ event delivery | citeturn28search1turn28search10 |
| Webhooks | `GET /2/webhooks` | ดู webhook configs | X API standard | ใช้เช็กสถานะ config | citeturn28search6 |
| Webhooks | `PUT /2/webhooks/{webhook_id}` | validate webhook | X API standard | ใช้กับ CRC/validation flow | citeturn28search7turn28search4 |
| Webhooks | `POST /2/webhooks/replay` | ขอ replay events ย้อนหลัง | X API standard | ย้อน event ได้สูงสุด 24 ชม. ตาม docs | citeturn21search0turn28search2 |
| Webhooks | `GET /2/tweets/search/webhooks` | ดู stream links ของ filtered stream | Enterprise docs และ llms-full ชี้ path เดียวกัน | ใช้คู่กับ filtered stream webhook flow | citeturn31search2turn21search0 |
| Webhooks | `POST /2/tweets/search/webhooks/{webhook_id}` | ผูก filtered stream กับ webhook | llms-full ระบุ path นี้ชัด | ใช้ส่ง filtered stream เข้าปลายทาง webhook | citeturn21search0 |
| Usage | `GET /2/usage/tweets` | ดู usage ของ Posts แบบ programmatic | X API standard | เหมาะทำ budget monitor | citeturn8search3turn10view5turn13view0 |
| Billing | Developer Console | ซื้อเครดิต ดูราคา ดู balance และ cost ต่อ endpoint | Console เท่านั้นในชุด docs ที่ตรวจ | ไม่มี billing REST endpoint สาธารณะครบชุดในแหล่งที่รีวิวรอบนี้ | citeturn34search2turn12view2turn12view3 |

## Authentication และ Security ที่ต้องเข้าใจก่อนเขียนโค้ด

**Bearer Token แบบ app-only** ใช้สำหรับเรียกข้อมูลที่เปิดสาธารณะบน X และกิน rate limit แบบ **per-app** ไม่ผูกกับผู้ใช้รายคน เอกสาร auth overview ระบุชัดว่า app-only access token ใช้เข้าถึงข้อมูลที่ publicly available; เอกสาร rate limits ก็แยก per-app ออกจาก per-user ชัดเจน. งานที่ตรงกับวิธีนี้คือ post lookup, user lookup, recent search และ full-archive search ตามคู่มือปัจจุบันของ search quickstart. citeturn6view3turn11view7turn32search2

**OAuth 1.0a User Context** ใช้เมื่อแอปต้องเข้าถึงข้อมูลส่วนตัวของบัญชีหรือ “ทำ action ในนามผู้ใช้” เช่น โพสต์, follow, like, retweet, DM หรือเข้าถึง protected content ตามสิทธิ์ที่ผู้ใช้อนุญาต. ถ้าคุณจะทำระบบโพสต์อัตโนมัติหรือกล่องข้อความลูกค้า วิธีนี้ยังสำคัญมาก. citeturn6view2turn22view0

**OAuth 2.0 Authorization Code Flow with PKCE** ก็เป็น user context เหมือนกัน แต่ให้การคุม scope แบบละเอียดกว่า รองรับหลายอุปกรณ์ และเป็นเส้นทางที่ docs ใช้กับ user access token สมัยใหม่ โดย access token มีอายุ default **2 ชั่วโมง** เว้นแต่จะขอ `offline.access` เพื่อรับ refresh token เพิ่ม และ callback URL ต้อง **exact match** กับที่ตั้งไว้ใน Developer Console. citeturn6view4turn37view0turn37view3

ความต่างแบบจำง่ายคือ **app-only = อ่านข้อมูลสาธารณะในนามแอป**, ส่วน **user context = อ่าน/เขียนในนามผู้ใช้** และผูกกับ scope ของผู้ใช้นั้น เช่น endpoint `/2/users/me` ใช้ได้เฉพาะ user context; app-only จะ error. ถ้าระบบของคุณมี dashboard แบบ “เชื่อมบัญชีลูกค้าแล้วโพสต์แทน”, ฐานคิดต้องเป็น user context ตั้งแต่วันแรก. citeturn38search10turn22view0turn11view7

เรื่อง Security เอกสารของ X ชัดมาก: API requests ต้องใช้ HTTPS, ห้ามเอา key/token ไปไว้ใน client-side code, logs หรือ repo, ต้องเก็บ credential ใน environment variables, rotate เป็นระยะ, ขอ scope เท่าที่จำเป็น, เก็บ user tokens แบบ encrypted at rest, และต้องใช้ `state` ใน OAuth flow เพื่อกัน CSRF. ถ้า credential หลุด ให้ regenerate ใน Console ทันที ซึ่งจะทำให้ credential เก่าใช้ไม่ได้. citeturn14view1turn14view0turn14view2turn14view5

โครง `.env` ที่ควรเริ่มแบบปลอดภัยมีประมาณนี้ โดย **เก็บไว้หลังบ้านเท่านั้น** และใช้ placeholder เท่านั้นตามที่คุณกำหนด:

```env
X_API_KEY=YOUR_X_API_KEY
X_API_SECRET=YOUR_X_API_SECRET
X_BEARER_TOKEN=YOUR_X_BEARER_TOKEN
X_CLIENT_ID=YOUR_X_CLIENT_ID
X_CLIENT_SECRET=YOUR_X_CLIENT_SECRET
X_CALLBACK_URL=https://your-domain.com/oauth/x/callback
```

แนวทางนี้สอดคล้องกับ best practice เรื่อง environment variables, callback URL registration และการไม่เปิดเผย secret ฝั่ง frontend. citeturn14view0turn14view1turn35search5

## Rate Limit และการรับมือ error

X ระบุชัดว่า rate limit ทำงานเป็นราย endpoint, หน้าต่างเวลามักเป็น 15 นาทีหรือ 24 ชั่วโมง, และแยก **per-user** ออกจาก **per-app** คุณดูสถานะปัจจุบันได้จาก header `x-rate-limit-limit`, `x-rate-limit-remaining`, และ `x-rate-limit-reset`. ถ้าเกินจะโดน 429 จนกว่าหน้าต่างจะ reset. citeturn11view7turn11view0turn11view1

ตัวอย่าง rate limit ที่มีประโยชน์กับงานการตลาด: user lookup และ search users อยู่ที่ **300/15min ต่อ app** และ **900/15min ต่อ user**; trends by WOEID อยู่ที่ **75/15min ต่อ app**; personalized trends มีทั้ง 24 ชั่วโมงและ 15 นาที; DM lookup อยู่ที่ **15/15min ต่อ user**; การส่ง DM มีเพดานทั้ง **15/15min** และ **1,440/24hrs** ฝั่ง user; activity stream อยู่ที่ **450/15min** พร้อม note เรื่อง **2 connections** และ **250 posts/sec**. citeturn38search6turn26search9turn39search12turn31search7

ถ้าโดน **429** วิธีแก้ตรงจุดคือ: อ่าน `x-rate-limit-reset`, รอจนถึงเวลานั้นก่อน retry, ใช้ exponential backoff, cache response ที่ใช้ซ้ำ, และกระจายคำขอออกตลอด window แทนการยิงถี่ในช่วงสั้น ๆ เอกสารยังแนะนำให้ใช้ **filtered stream แทน polling** เมื่อเป็นงาน realtime. ที่สำคัญคือ rate limits กับ billing แยกกัน คุณอาจ “ไม่ติด limit แต่ยังเสียเครดิต” หรือ “ติด limit โดยไม่เกิดค่าใช้จ่ายเพิ่ม” ได้. citeturn11view1turn11view2turn11view3turn11view5

fast checklist สำหรับ error ที่ต้องรู้จาก docs คือ:  
**401** = auth ไม่ถูกหรือไม่มี credential, ให้เช็ก method auth, credential ที่ regenerate ไปแล้ว, รูปแบบ `Authorization` header, และ OAuth 1.0a signature ถ้าใช้อยู่; **403** = auth ผ่านแต่สิทธิ์ไม่พอ, endpoint ต้องการ enrollment/scope เพิ่ม หรือ resource private/protected; **429** = rate limit หรือ usage cap exceeded. ฝั่ง error body ให้ดู `type`, `title`, `detail` เพราะ X ส่ง structured error มาให้ parse ต่อได้. citeturn36view0turn36view1turn36view2turn36view4

## Policy และข้อห้ามที่เสี่ยงโดนแบน

แนวทำได้จาก developer guidelines คือระบบที่ให้คุณค่าแท้จริงและไม่กวนผู้ใช้ เช่น บัญชีอัตโนมัติที่โพสต์ scheduled content แบบข่าว, สภาพอากาศ, quote, alert สาธารณะ, หรือ RSS updates ในนามผู้ใช้; ระบบตอบกลับ @mentions ที่ผู้ใช้เริ่มก่อน; utility ที่ผู้ใช้เรียกใช้เอง; และ customer-support automation ที่ผู้ใช้เป็นฝ่าย mention/DM/opt-in เอง พร้อม opt-out ชัดเจน. citeturn15view3turn15view5turn15view6turn17view4

สิ่งที่เสี่ยงหนักและเอกสารพูดตรงมากคือ: โพสต์เนื้อหาเหมือนกันข้ามหลายบัญชี, เกาะ trend เพื่อเอายอดมองเห็น, auto-reply แบบ unsolicited, bulk DM หรือ unsolicited @mentions, auto-like/bulk-like/ขาย likes, ซ่อนความเป็นบอต, ทำหลายแอปเพื่อ use case เดียว, พยายามเลี่ยง rate limit, scrape หรือ browser automation, และใช้ข้อมูล X ไป train AI/ML models โดยไม่ได้อยู่ในข้อยกเว้นที่ X ระบุ. การฝ่าฝืนอาจนำไปสู่ app suspension, API revocation หรือ permanent ban. citeturn15view0turn15view3turn15view4turn15view7turn15view8turn17view0

ถ้าจะทำระบบ automation จริง มี 4 ข้อที่ต้องใส่ตั้งแต่ต้น:  
หนึ่ง บัญชีอัตโนมัติต้องเปิด label “Automated”, เปิดเผยผู้ดูแลใน bio, และเชื่อมกับ human-managed account; สอง ถ้าผู้ใช้บอก “stop” ต้องหยุดทันที; สาม การส่ง DM ควรเกิดหลังผู้ใช้ DM มาก่อน; สี่ หากเป็น **AI-generated replies** docs ระบุว่าต้องมี **prior approval from X**. จุดนี้สำคัญมากสำหรับระบบ agent ตอบกลับอัตโนมัติ. citeturn15view1turn15view6

ด้าน privacy และ data handling เอกสาร policy ระบุชัดว่าต้องเคารพ reasonable expectation of privacy, ต้องมี privacy policy ที่ชัด, ต้องได้ **express and informed consent** ก่อนทำ action ในนามผู้ใช้, ก่อนเก็บ non-public data อย่าง DMs, ก่อนแชร์ protected content, และก่อนทำ off-X matching ระหว่างข้อมูล X กับ identifier นอกแพลตฟอร์ม. ถ้าคุณเก็บ X Content ไว้นอกแพลตฟอร์ม ต้องลบหรืออัปเดตภายใน **24 ชั่วโมง** เมื่อ X หรือเจ้าของเนื้อหาขอ หรือเมื่อ content ถูกลบ/เปลี่ยนสถานะบน X. citeturn16view1turn16view3turn16view0turn16view2turn17view2

## Architecture ระบบครบวงจรที่ควรเริ่ม

สถาปัตยกรรมที่เหมาะกับงานคุณคือ **backend-first** แล้วค่อยมี dashboard ข้างหน้า เพราะ docs ของ X ห้ามเอา secret ไปไว้ใน client-side code, แนะนำให้เก็บ credentials/tokens ใน env หรือ secure store, และให้ encrypt user tokens at rest. นี่ทำให้ “frontend เรียก X API ตรง” ไม่ใช่แนวเริ่มต้นที่ปลอดภัย. citeturn14view1turn14view0turn14view5

โครงสร้างที่แนะนำ:

```text
Frontend Dashboard
  └─ Next.js / React
       └─ เรียก Backend API ของเราเท่านั้น

Backend API
  └─ Node.js/Next API routes หรือ FastAPI
       ├─ OAuth callback
       ├─ X API client
       ├─ Policy guard
       ├─ Rate-limit middleware
       ├─ Usage monitor
       └─ Error normalizer

Workers / Jobs
  └─ Queue + Scheduler
       ├─ recent search jobs
       ├─ trend snapshots
       ├─ scheduled posting
       ├─ DM processing
       └─ retry / backoff jobs

Data layer
  └─ PostgreSQL
       ├─ users / connected accounts
       ├─ encrypted tokens
       ├─ post drafts / schedules
       ├─ trend snapshots
       ├─ logs / audit
       └─ rate-limit snapshots

Observability
  └─ structured logs + alerts
       ├─ x-rate-limit headers
       ├─ 401 / 403 / 429 spikes
       ├─ /2/usage/tweets budget alerts
       └─ webhook / stream health
```

เหตุผลของแบบนี้ตรงกับ docs เกือบทุกจุด: Developer Console ใช้จัดการ apps/credentials/billing, `GET /2/usage/tweets` ใช้ monitor การใช้เครดิต, rate-limit headers ใช้คุมการยิง request, security docs บังคับให้ secrets อยู่หลังบ้าน, และ MCP/OpenAPI ใช้ต่อยอด agent layer ได้ในภายหลัง. ถ้าจะเพิ่ม agent ให้แยกเป็น layer ที่เรียก backend tools ของคุณเอง ไม่ควรปล่อยให้ agent ถือสิทธิ์ “โพสต์/ลบ/DM” ทุกอย่างแบบไม่จำกัด ให้ใช้ allow-list แบบเดียวกับแนวคิดของ XMCP. citeturn34search2turn13view0turn11view0turn18view5turn35search5

เรื่อง stack ผมแนะนำแบบนี้:

| ตัวเลือก | เหมาะกับใคร | จุดแข็ง | จุดที่ควรระวัง | อ้างอิง |
|---|---|---|---|---|
| Node.js + Next.js | คนที่อยากได้ dashboard + OAuth + backend API ในโปรเจกต์เดียว | ใช้ TypeScript SDK ทางการได้ตรง, ทำ dashboard เร็ว, API routes และหน้าเว็บอยู่ที่เดียว | อย่าเก็บ secret ใน frontend; ให้ใช้ server routes เท่านั้น | citeturn33search3turn33search1turn14view1 |
| Python + FastAPI | คนที่อยากโฟกัส analytics, workers, automation pipeline, data processing | มี Python SDK ทางการและ async support, เหมาะกับ job workers และ analysis | UI dashboard ต้องแยกอีกชั้นถ้าจะทำเว็บสวย ๆ | citeturn33search8turn33search0 |

ถ้าถามว่า **ควรเริ่มแบบไหนก่อน** สำหรับมือใหม่และเป้าหมาย “dashboard + การตลาด + automation” ผมแนะนำเริ่ม **Node.js + Next.js ก่อน** แล้วค่อยเพิ่ม worker ภาษา Python ทีหลังเมื่อเริ่มทำ analytics หนักขึ้น นี่เป็นคำแนะนำเชิง implementation ของผม โดยยึดบนข้อเท็จจริงว่า X มี TypeScript SDK และ Python SDK อย่างเป็นทางการทั้งคู่. citeturn33search3turn33search8

## Roadmap แบบลงมือทำได้ในเจ็ดวัน

แนวทางนี้ตั้งให้ “จบการทดลองใช้งานจริง” ภายใน 7 วัน โดยยึดงานที่ docs บอกว่าต้องมีแน่ ๆ คือ Developer Console, app, credentials, OAuth callback, usage monitor, security และ official SDKs. citeturn34search2turn34search8turn35search4turn13view0turn14view0

| วัน | เป้าหมาย | สิ่งที่ต้องทำ | เสร็จเมื่อ | อ้างอิง |
|---|---|---|---|---|
| วันแรก | ตั้งค่า Developer Console | สมัคร developer account, สร้าง app, generate credentials, จด callback URL, เปิด auth ที่ต้องใช้, ตั้ง budget ใน Console | มี `X_API_KEY`, `X_API_SECRET`, `X_BEARER_TOKEN`, และ app พร้อมใช้งาน | citeturn34search0turn34search2turn34search8 |
| วันที่สอง | ทดสอบ API แรก | ลอง `GET /2/users/by/username/{username}` และ `GET /2/tweets/search/recent` ด้วย Postman หรือ SDK | ได้ response JSON จริงจาก X API | citeturn8search0turn20search3turn33search6 |
| วันที่สาม | ทำ backend | สร้าง route ฝั่ง server สำหรับ user lookup, recent search, create post แบบ draft, และ usage monitor | frontend เรียก backend ได้ โดย backend เป็นคนเรียก X API | citeturn14view1turn8search3turn10view5 |
| วันที่สี่ | ทำ dashboard | หน้า search, หน้า trend snapshot, หน้า schedule draft, หน้า usage/rate-limit | ดูผลค้นหาและ usage ผ่านหน้าเว็บได้ | citeturn26search4turn13view0turn11view0 |
| วันที่ห้า | ทำ OAuth | เพิ่ม OAuth 2.0 PKCE callback, state check, exact callback match, เก็บ token แบบ encrypted | ผู้ใช้กด connect account แล้วใช้ `/2/users/me` ได้ | citeturn37view0turn14view2turn38search10 |
| วันที่หก | ทำ error และ rate-limit guard | parse `type/title/detail`, คุม 401/403/429, backoff, cache, usage alerts | ระบบ retry ได้อย่างปลอดภัยและไม่ยิงรัว | citeturn36view0turn36view2turn11view1turn11view2 |
| วันที่เจ็ด | deploy และ test จริง | deploy backend/frontend, ทดสอบ create post, recent search, schedule, logs, revoke/refresh token | ระบบใช้งานจริงขั้นต่ำได้ | citeturn10view2turn37view5turn37view3 |

**Checklist ก่อนเริ่มเขียนโค้ด**

| รายการ | ต้องมีไหม | อ้างอิง |
|---|---|---|
| Developer account และ app | ต้องมี | citeturn34search0turn34search8 |
| เก็บ credentials ให้ปลอดภัยตั้งแต่วันแรก | ต้องมี | citeturn14view0turn14view1 |
| callback URL ที่ match เป๊ะ | ต้องมี | citeturn37view0 |
| เลือก auth flow ให้ตรง use case | ต้องมี | citeturn6view2turn6view4turn38search10 |
| usage monitor ผ่าน `/2/usage/tweets` | แนะนำมาก | citeturn8search3turn13view0 |
| rate-limit monitor จาก headers | แนะนำมาก | citeturn11view0 |
| policy guard สำหรับ automation/DM/replies | แนะนำมาก | citeturn15view1turn15view6turn17view0 |
| log โดยไม่เก็บ secret | ต้องมี | citeturn14view7 |
| database สำหรับ tokens/jobs/audit | แนะนำมาก | citeturn14view0turn17view1 |
| queue/scheduler สำหรับโพสต์และ search jobs | แนะนำมาก | citeturn11view2turn11view3 |

**Checklist ตรวจ error เร็ว**

| อาการ | เช็กทันที | สาเหตุที่พบบ่อย | อ้างอิง |
|---|---|---|---|
| 401 | auth method, header, credential ที่ regenerate ไปแล้ว | ใช้ token ผิดชนิด หรือ credential หมดผล | citeturn36view0 |
| 403 | endpoint access, scopes, protected/private resource | auth ผ่านแต่สิทธิ์ไม่พอ | citeturn36view1 |
| 429 | `x-rate-limit-reset`, backoff, cache, spread requests | ยิงเกิน rate limit หรือ usage cap | citeturn36view2turn11view1 |
| OAuth callback error | callback URL ต้อง exact match, state ต้องตรง, code ต้องแลกให้ทัน | `state` mismatch, callback ไม่ตรง, auth code หมดอายุ | citeturn37view0turn14view2turn37view1 |
| token หมดอายุ | ดูว่าใช้ PKCE หรือไม่, ขอ `offline.access`, refresh ผ่าน `/2/oauth2/token` | access token default 2 ชั่วโมงถ้าไม่ได้ขอ refresh token | citeturn37view3turn37view4turn37view5 |

**Open questions และข้อจำกัดที่ควรรู้ก่อนลง production**  
มีจุดหนึ่งใน docs ที่ควรเช็กก่อนล็อก requirement คือเอกสาร **Search introduction/quickstart ปัจจุบัน** ระบุว่า full-archive search เปิดให้ **pay-per-use และ Enterprise**, แต่หน้า **authentication mapping** ยังมีข้อความเก่าที่พูดถึง Academic Research อยู่ ดังนั้นตอนเปิดใช้งานจริงให้ยึดหน้า endpoint/guide ปัจจุบันและสถานะใน Developer Console เป็นตัวตัดสินสุดท้าย. นอกจากนี้ billing ฝั่ง programmatic ที่ผมยืนยันได้จากเอกสารชุดนี้คือ `GET /2/usage/tweets`; ส่วนราคาปัจจุบันต่อ endpoint และ credit balance ให้ดูใน Developer Console โดยตรง. citeturn32search0turn32search2turn32search1turn34search2turn12view2