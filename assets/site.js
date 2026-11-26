// Every Call Covered site: app links, the call player, the transfer demo and the cost calculator.
// No dependencies, no tracking, nothing is sent anywhere.
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // ---- The app's address lives in one place: <meta name="ecc-app-url"> in index.html. ----
  const appUrl = $('meta[name="ecc-app-url"]')?.content;
  if (appUrl) $$("a[data-app]").forEach(a => { a.href = appUrl; });

  // ---- Header rule once the page scrolls ----
  const head = $(".site-head");
  const onScroll = () => head?.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Menu (below 900px) ----
  const menuBtn = $(".menu-btn"), menu = $("#menu");
  if (menuBtn && menu) {
    const setMenu = open => { menu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); };
    menuBtn.addEventListener("click", () => setMenu(menu.hidden));
    menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  }

  // ---- The overnight log arrives row by row, once ----
  const log = $("#log");
  if (log) requestAnimationFrame(() => log.classList.add("in"));

  // ---- Cost calculator (prices from the app's plans.ts) ----
  const PRICES = {
    personal: { monthly: 11.99, included: 0, perMinute: 0.45 },
    business: { monthly: 65, included: 150, perMinute: 0.39 },
    growth: { monthly: 119, included: 400, perMinute: 0.39 },
  };
  const money = n => "$" + n.toFixed(2);
  const range = $("#minutes");
  if (range) {
    const out = $("#minutes-out");
    const render = () => {
      const m = Number(range.value);
      out.textContent = m.toLocaleString("en-US");
      range.style.setProperty("--fill", (m / Number(range.max)) * 100 + "%");
      const totals = {};
      for (const [id, p] of Object.entries(PRICES)) {
        const over = Math.max(0, m - p.included);
        totals[id] = p.monthly + over * p.perMinute;
        const li = $(`[data-plan="${id}"]`);
        $(".v", li).textContent = money(totals[id]);
        $(".why", li).textContent = id === "personal"
          ? (m ? `$11.99 plus ${m} minutes of credit` : "$11.99, no calls")
          : over ? `${over} minutes past the ${p.included} included` : `Inside the ${p.included} included`;
      }
      const best = totals.business <= totals.growth ? "business" : "growth";
      $$("#totals li").forEach(li => {
        const on = li.dataset.plan === best;
        li.classList.toggle("best", on);
        if (on) $(".why", li).insertAdjacentHTML("afterbegin", '<span class="best-note">Lower of the two business plans. </span>');
      });
    };
    range.addEventListener("input", render);
    render();
  }

  // ---- Transfer demo: the Live calls card, warm or blind ----
  const xfer = $("#xfer-actions");
  if (xfer) {
    const status = $("#xfer-status"), on = $("#xfer-on");
    let timer = 0;
    const btn = (label, cls, fn) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "app-btn " + cls; b.textContent = label; b.addEventListener("click", fn);
      return b;
    };
    const set = (text, onCall, buttons) => {
      clearTimeout(timer);
      status.textContent = text; on.textContent = onCall;
      xfer.replaceChildren(...buttons);
    };
    const start = () => set("Pass this call to Nina Brooks.", "On the call: Ana Rivera, on the app", [
      btn("Warm transfer", "", warm), btn("Blind transfer", "outline", blind),
    ]);
    const again = () => btn("Start over", "outline", start);
    const warm = () => set("Ana Rivera is talking to Nina Brooks. The caller is on hold.", "On the call: Ana Rivera, on the app", [
      btn("Complete transfer", "", () => set("Done. Nina Brooks has the caller, and Ana is off the call.", "On the call: Nina Brooks, on the app", [again()])),
      btn("Cancel transfer", "outline", () => set("Canceled. The caller is back with Ana Rivera.", "On the call: Ana Rivera, on the app", [again()])),
    ]);
    const blind = () => {
      set("Ringing Nina Brooks on the app and her phone. Ana is off the call.", "Ringing Nina Brooks", [again()]);
      timer = setTimeout(() => set("Nina Brooks answered on the app.", "On the call: Nina Brooks, on the app", [again()]), 1600);
    };
    start();
  }

  // ---- The call player ----
  const player = $("#player");
  if (!player) return;

  const BIZ_NAV = ["Today", "Inbox", "Live calls", "Phone", "Calls", "Repairs", "Team chat", "Settings"];
  const ME_NAV = ["Today", "Calls", "Contacts", "Connections", "Settings", "Billing"];

  const liveCard = (num, state) => {
    if (state === "idle") return `<div class="panel"><p class="lead pending">No live calls right now.</p></div>`;
    const ended = state === "ended";
    const tag = state === "ringing" ? `<span class="tag"><span class="dot"></span>Ringing</span>`
      : `<span class="tag ok"><span class="dot"></span>Live</span>`;
    if (ended) return "";
    return `<div class="panel live-card">
      <div class="top"><span class="who"><svg aria-hidden="true"><use href="#i-user"/></svg><span class="caller-num">${num}</span></span>
      <span class="right"><span class="num" data-clock>0:00</span>${tag}</span></div>
      <p class="meta"><svg aria-hidden="true"><use href="#i-phone"/></svg>${state === "ringing" ? "Incoming call" : "On the call: your receptionist"}</p></div>`;
  };

  const inboxRow = r => `<div class="panel inbox-row${r.alarm ? " alarm" : ""}${r.isNew ? " arrive" : ""}">
      <div class="top"><span class="name">${r.name}</span><span class="when">${r.when}</span></div>
      <p class="desc">${r.desc}</p>
      <div class="tags">${r.tags.map((t, i) => `<span class="tag ${t[1] || ""}"${r.isNew ? ` style="animation:arrive .45s ${0.25 + i * 0.18}s var(--ease-out) both"` : ""}>${t[0]}</span>`).join("")}</div>
      ${r.extra || ""}
      ${r.actions ? `<div class="app-actions">${r.actions.map(([label, note], i) => `<button type="button" class="app-btn${i ? " outline" : ""}" data-note="${esc(note)}">${label}</button>`).join("")}</div><p class="app-note" aria-live="polite"></p>` : ""}
    </div>`;

  const ROBERT = { name: "Robert Hayes", when: "Nov 22, 8:50 AM", desc: "Dryer runs but no heat.", tags: [["Needs confirmation"], ["Whirlpool"], ["Mornings"]] };
  const LINDA = { name: "Linda Chen", when: "Nov 24, 7:16 PM", desc: "Bosch dishwasher isn't draining. Water left in the bottom after every cycle.", tags: [["Needs confirmation"], ["Bosch"], ["27 Birch Lane"], ["Thursday morning"]] };

  const inboxPage = (live, rows, count) => `
    <div class="app-title"><div><h3>Inbox</h3><p class="sub">Calls to return and requests to confirm.</p></div></div>
    ${live}
    <p class="app-crumb">${count} repair request${count === 1 ? "" : "s"} to confirm. Confirming never texts the customer.</p>
    ${rows.map(inboxRow).join("")}`;

  const tiles = screened => `<div class="tiles">
      <div><b>3</b><span>Messages</span></div>
      <div><b class="${screened > 1 ? "fresh-num" : ""}">${screened}</b><span>Screened out</span></div>
      <div><b>1</b><span>Got through</span></div>
      <div><b>0</b><span>Urgent</span></div></div>`;
  const meRows = `
    <div class="mini-row"><span class="n">Dave Patel</span><span class="tag">Message</span><span class="d">Saturday works, but can dinner move to 7? He has the kids until 6.</span></div>
    <div class="mini-row"><span class="n">Maya Kim</span><span class="tag ok">Always rings</span><span class="d">On your always-ring list. Your phone rang.</span></div>`;
  const todayPage = (screened, newRow) => `
    <div class="app-title"><div><h3>Today</h3><p class="sub">What your assistant handled since midnight.</p></div></div>
    ${tiles(screened)}
    <div class="panel calls-today"><h4>Calls today</h4>${newRow || ""}${meRows}</div>`;

  const SCENARIOS = {
    repair: {
      biz: "Rivera Appliance", nav: BIZ_NAV, navOn: "Inbox", lineName: "Rivera Appliance", lineSub: "Your business line", answeredBy: "Answered by your receptionist",
      num: "(781) 555-0123",
      chapters: ["Rings", "Answers in your name", "Hears the problem", "Takes the address", "Offers a time", "Lands in your app"],
      steps: [
        { t: 0, ch: 0, ring: true },
        { t: 2, ch: 1, who: "r", text: "Thanks for calling Rivera Appliance. This call is recorded. How can I help?" },
        { t: 6, ch: 2, who: "c", text: "Hi, my [[Bosch dishwasher isn't draining]]. There's water sitting in the bottom after every cycle." },
        { t: 13, ch: 3, who: "r", text: "Sorry about that. I can get a technician out to look at it. What's the address?" },
        { t: 19, ch: 3, who: "c", text: "[[27 Birch Lane]] in Springfield." },
        { t: 23, ch: 4, who: "r", text: "Got it, 27 Birch Lane. Is a morning or an afternoon better for you?" },
        { t: 28, ch: 4, who: "c", text: "[[Thursday morning]] would be great." },
        { t: 31, ch: 4, who: "r", text: "I have that down for Thursday morning. The office will confirm the visit with you." },
        { t: 36, ch: 4, who: "c", text: "Perfect, thanks." },
        { t: 38, ch: 5, end: true },
      ],
      during: state => inboxPage(liveCard("(781) 555-0123", state), [ROBERT], 1),
      after: () => inboxPage("", [{
        ...LINDA, isNew: true,
        actions: [
          ["Confirm", "In your app, this confirms the visit. Linda isn't texted."],
          ["Edit", "In your app, this lets you change any detail first."],
          ["Assign", "In your app, this picks the technician."],
          ["Decline", "In your app, this declines the request."],
        ],
      }, ROBERT], 2),
    },
    emergency: {
      biz: "Rivera Appliance", nav: BIZ_NAV, navOn: "Inbox", lineName: "Rivera Appliance", lineSub: "Your business line, after hours", answeredBy: "Answered by your receptionist",
      num: "(781) 555-0105",
      chapters: ["Rings", "Answers in your name", "Hears an emergency", "Safety step first", "Checks it's happening now", "Takes the details", "Calls your on-call person"],
      steps: [
        { t: 0, ch: 0, ring: true },
        { t: 2, ch: 1, who: "r", text: "Thanks for calling Rivera Appliance. This call is recorded. How can I help?" },
        { t: 5, ch: 2, who: "c", text: "My [[washer's leaking all over the laundry room floor]]. It won't stop." },
        { t: 10, ch: 3, who: "r", text: "If you can safely reach the shut-off valve behind the washer, turn it clockwise to stop the water. If you can't reach it, leave the area." },
        { t: 19, ch: 3, who: "c", text: "I [[can't get to it]]. It's wedged against the wall." },
        { t: 22, ch: 4, who: "r", text: "Just to be sure: is water coming out right now?" },
        { t: 25, ch: 4, who: "c", text: "Yes, right now." },
        { t: 27, ch: 5, who: "r", text: "Thanks. What's your name, a good callback number, and the address?" },
        { t: 31, ch: 5, who: "c", text: "[[Carlos Romero]]. [[781-555-0105]]. [[14 Elm Street]]." },
        { t: 37, ch: 5, who: "r", text: "Carlos, that's 7-8-1, 5-5-5, 0-1-0-5, at 14 Elm Street. I'm alerting our on-call person now." },
        { t: 45, ch: 5, who: "c", text: "Thank you." },
        { t: 47, ch: 6, end: true },
        { t: 48, ch: 6, sys: "Calling <strong>Ana Rivera</strong>, first on call" },
        { t: 62, ch: 6, sys: "Ana Rivera pressed 1 and is calling Carlos back" },
      ],
      during: state => inboxPage(liveCard("(781) 555-0105", state), [{ ...LINDA, tags: [["Needs confirmation"], ["Bosch"], ["Thursday morning"]] }], 1),
      after: () => inboxPage("", [{
        name: "Carlos Romero", when: "Nov 24, 10:12 PM", alarm: true, isNew: true,
        desc: "Washer leaking onto the laundry room floor. He couldn't reach the shut-off valve.",
        tags: [["Emergency", "alarm"], ["14 Elm Street"]],
        extra: `<ul class="oncall" aria-label="On-call list">
          <li><span class="p">Ana Rivera</span><span class="s">Called at 10:13 PM</span><span class="tag ok">Pressed 1</span></li>
          <li><span class="p">Marcus Lee</span><span class="s">Next on the list</span><span class="tag">Not needed</span></li></ul>`,
        actions: [
          ["Call (781) 555-0105", "In your app, this calls Carlos from your business number."],
          ["Open the call", "In your app, this opens the transcript and recording."],
        ],
      }, { ...LINDA, tags: [["Needs confirmation"], ["Bosch"], ["Thursday morning"]] }], 1),
    },
    scam: {
      biz: "Grace Kim", nav: ME_NAV, navOn: "Today", lineName: "Grace Kim", lineSub: "Your phone, Personal plan", answeredBy: "Answered by your assistant",
      num: "(857) 555-0190",
      chapters: ["Rings", "Answers as your assistant", "Asks which company", "Spots the scam", "Ends the call", "Notes it for you"],
      steps: [
        { t: 0, ch: 0, ring: true },
        { t: 2, ch: 1, who: "r", text: "Hi, you've reached Grace Kim's assistant. This call may be recorded. Grace can't pick up right now. Who's calling?" },
        { t: 9, ch: 1, who: "c", text: "This is the vehicle service department. Your [[car warranty is about to expire]]." },
        { t: 13, ch: 2, who: "r", text: "Which company are you calling from?" },
        { t: 15, ch: 3, who: "c", text: "The warranty center. I just need the [[card number on file]] to renew it today." },
        { t: 20, ch: 4, who: "r", text: "I can't take payment details. If Grace needs anything, she'll contact her dealer directly. Goodbye." },
        { t: 26, ch: 5, end: true },
      ],
      during: () => todayPage(1),
      after: () => todayPage(2, `<div class="landing arrive">
          <div class="mini-row"><span class="n num">(857) 555-0190</span><span class="tag warn">Suspected scam</span><span class="d">Said your car warranty is expiring and asked for your card number. Your assistant ended the call.</span></div>
          <div class="scam-box"><h4><svg aria-hidden="true"><use href="#i-shield"/></svg>This looks like a scam</h4>
            <p>Don't call back on a number this caller gave. If you already paid them, call your bank or card company and ask for a chargeback.</p>
            <div class="app-actions"><button type="button" class="app-btn outline" data-note="In your app, this number would now be turned away.">Add to "Never answer"</button></div>
            <p class="app-note" aria-live="polite"></p></div></div>`),
    },
  };

  // Elements
  const line = $("#line"), lineState = $("#line-state"), lineWho = $("#line-who"), lineNum = $("#line-num");
  const clock = $("#clock"), transcript = $("#transcript"), appMain = $("#app-main"), appNav = $("#app-nav");
  const appBiz = $("#app-biz"), appBizTop = $("#app-biz-top"), progress = $("#progress"), chaptersEl = $("#chapters");
  const playBtn = $("#play"), announce = $("#announce"), stage = $("#stage");
  const tabs = $$('[role="tab"]', player);

  let sc = SCENARIOS.repair, scId = "repair";
  let token = 0, stepIndex = 0, status = "idle", started = false, bubble = null;
  const total = () => sc.steps.find(s => s.end).t;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const setClock = s => {
    clock.textContent = fmt(s);
    const cardClock = $("[data-clock]", appMain);
    if (cardClock) cardClock.textContent = fmt(s);
    progress.style.width = Math.min(100, (s / total()) * 100) + "%";
  };

  const setPlayButton = mode => {
    status = mode;
    const map = { idle: ["i-play", "Play"], playing: ["i-pause", "Pause"], paused: ["i-play", "Resume"], ended: ["i-replay", "Play again"] };
    const [icon, label] = map[mode];
    playBtn.innerHTML = `<svg aria-hidden="true"><use href="#${icon}"/></svg><span>${label}</span>`;
  };

  const setLine = state => {
    line.dataset.state = state;
    lineState.textContent = { idle: "Waiting for a call", ringing: "Ringing", live: "On the call", ended: "Call ended" }[state];
    if (state === "idle") { lineWho.textContent = sc.lineName; lineNum.textContent = sc.lineSub; }
    else { lineWho.textContent = state === "ringing" ? "Incoming call" : sc.answeredBy; lineNum.textContent = sc.num; }
    if (state !== "live") delete line.dataset.speaking;
  };

  const setApp = (html, animate) => {
    appMain.innerHTML = html;
    if (!animate) $$(".arrive", appMain).forEach(el => el.classList.remove("arrive"));
  };

  const setChapter = ch => {
    $$("button", chaptersEl).forEach((b, i) => {
      if (i === ch) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.classList.toggle("done", i < ch);
    });
    const current = $$("button", chaptersEl)[ch];
    if (current && chaptersEl.scrollWidth > chaptersEl.clientWidth) {
      chaptersEl.scrollTo({ left: current.parentElement.offsetLeft - 8, behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
  };

  // "Hi, my [[Bosch dishwasher]] is..." -> words, each marked as part of a key phrase or not
  const words = text => {
    const out = [];
    text.split(/(\[\[.*?\]\])/).forEach(seg => {
      if (!seg) return;
      const key = seg.startsWith("[[");
      seg.replace(/^\[\[|\]\]$/g, "").split(/(\s+)/).forEach(w => { if (w) out.push({ w, key }); });
    });
    return out;
  };
  const html = (list, n) => {
    let s = "", open = false;
    list.slice(0, n).forEach(({ w, key }) => {
      if (key && !open) { s += '<span class="k">'; open = true; }
      if (!key && open) { s += "</span>"; open = false; }
      s += esc(w);
    });
    return s + (open ? "</span>" : "");
  };

  const addBubble = step => {
    const el = document.createElement("div");
    if (step.sys) {
      el.className = "msg sys";
      el.innerHTML = `<p>${step.sys}</p>`;
    } else {
      el.className = "msg " + step.who;
      el.innerHTML = `<span class="who">${step.who === "r" ? "Receptionist" : "Caller"}, ${fmt(step.t)}</span><p></p>`;
      if (sc === SCENARIOS.scam && step.who === "r") el.firstElementChild.textContent = `Your assistant, ${fmt(step.t)}`;
    }
    transcript.append(el);
    transcript.scrollTop = transcript.scrollHeight;
    return el;
  };

  const instant = step => {
    if (step.ring) { setLine("ringing"); setApp(sc.during("ringing")); return; }
    if (step.end) { finish(false); return; }
    if (line.dataset.state !== "live" && !step.sys) { setLine("live"); setApp(sc.during("live")); }
    const el = addBubble(step);
    if (!step.sys) $("p", el).innerHTML = html(words(step.text), Infinity);
  };

  const finish = animate => {
    setLine("ended");
    transcript.classList.add("resolved");
    requestAnimationFrame(() => { transcript.scrollTop = transcript.scrollHeight; });
    setApp(sc.after(), animate);
    announce.textContent = "The call ended and landed in the app.";
  };

  async function play(step, tok) {
    const next = sc.steps[sc.steps.indexOf(step) + 1];
    const span = next ? next.t - step.t : 0;
    const alive = () => tok === token;
    setChapter(step.ch);
    if (step.ring) {
      setLine("ringing"); setApp(sc.during("ringing"), true); setClock(0);
      announce.textContent = "The phone rings.";
      await sleep(1600);
      return;
    }
    if (step.end) {
      setClock(step.t); finish(true);
      await sleep(900);
      return;
    }
    if (step.sys) {
      bubble = addBubble(step);
      await sleep(1700);
      return;
    }
    if (line.dataset.state !== "live") { setLine("live"); setApp(sc.during("live"), true); }
    bubble = addBubble(step);
    const p = $("p", bubble);
    const list = words(step.text);
    const quick = reduceMotion.matches;
    if (step.who === "r" && !quick) {
      p.classList.add("typing"); p.innerHTML = "<i></i><i></i><i></i>";
      await sleep(650);
      if (!alive()) return;
      p.classList.remove("typing");
    }
    line.dataset.speaking = step.who;
    const perWord = step.who === "r" ? 95 : 115;
    const n = list.length;
    if (quick) {
      p.innerHTML = html(list, n);
      setClock(next ? next.t : step.t);
      await sleep(Math.min(2600, 600 + n * 70));
    } else {
      for (let i = 1; i <= n; i++) {
        if (!alive()) return;
        p.innerHTML = html(list, i);
        setClock(step.t + (span * i) / n);
        transcript.scrollTop = transcript.scrollHeight;
        await sleep(list[i - 1].w.trim() ? perWord : 0);
      }
    }
    delete line.dataset.speaking;
    await sleep(380);
  }

  async function run(from) {
    const tok = ++token;
    started = true;
    setPlayButton("playing");
    for (stepIndex = from; stepIndex < sc.steps.length; stepIndex++) {
      bubble = null;
      await play(sc.steps[stepIndex], tok);
      if (tok !== token) return;
    }
    setPlayButton("ended");
    setChapter(sc.chapters.length - 1);
    progress.style.width = "100%";
  }

  const reset = () => {
    token++;
    transcript.innerHTML = "";
    transcript.classList.remove("resolved");
    setLine("idle");
    setClock(0);
    setApp(sc.during("idle"));
    setChapter(-1);
    stepIndex = 0;
    setPlayButton("idle");
  };

  // Show everything up to the first step of a chapter, then play on from there
  const jump = ch => {
    reset();
    const first = sc.steps.findIndex(s => s.ch === ch);
    sc.steps.slice(0, first).forEach(instant);
    setClock(sc.steps[first].t);
    run(first);
  };

  // The whole call at once (reduced motion, before anything plays)
  const showAll = () => {
    reset();
    sc.steps.forEach(instant);
    setClock(total());
    setChapter(sc.chapters.length - 1);
    progress.style.width = "100%";
    setPlayButton("ended");
  };

  const load = (id, autoplay) => {
    scId = id; sc = SCENARIOS[id];
    tabs.forEach(t => {
      const on = t.dataset.scenario === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) stage.setAttribute("aria-labelledby", t.id);
    });
    appBiz.innerHTML = appBizTop.innerHTML = `${esc(sc.biz)}<small>Every Call Covered</small>`;
    appNav.innerHTML = sc.nav.map(n => `<li${n === sc.navOn ? ' class="on"' : ""}>${n}</li>`).join("");
    chaptersEl.innerHTML = sc.chapters.map((label, i) => {
      const t = sc.steps.find(s => s.ch === i).t;
      return `<li><button type="button" data-ch="${i}"><span class="t">${fmt(t)}</span><span class="l">${label}</span></button></li>`;
    }).join("");
    reset();
    if (autoplay && !reduceMotion.matches) run(0);
    else if (reduceMotion.matches) showAll();
  };

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => load(t.dataset.scenario, true));
    t.addEventListener("keydown", e => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      load(next.dataset.scenario, true);
    });
  });

  playBtn.addEventListener("click", () => {
    if (status === "playing") {
      token++;
      if (bubble && !bubble.classList.contains("sys") && stepIndex < sc.steps.length) bubble.remove();
      delete line.dataset.speaking;
      setPlayButton("paused");
    } else if (status === "paused") {
      run(stepIndex);
    } else {
      reset();
      run(0);
    }
  });

  chaptersEl.addEventListener("click", e => {
    const b = e.target.closest("button[data-ch]");
    if (b) jump(Number(b.dataset.ch));
  });

  $("#to-app").addEventListener("click", () => {
    $("#app").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  });

  appMain.addEventListener("click", e => {
    const b = e.target.closest("button[data-note]");
    if (!b) return;
    const note = b.closest(".panel, .scam-box")?.querySelector(".app-note");
    if (note) note.textContent = b.dataset.note;
  });

  load("repair", false);
  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { io.disconnect(); run(0); }
    }, { threshold: 0.35 });
    io.observe(stage);
  }
})();
